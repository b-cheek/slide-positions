import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { PlotModel } from "../plotting/parsing/utils";
import { Note } from "../plotting/processing/types/note";
import { MidiNumber } from "../plotting";
import {
  getNoteConfigs,
  getViterbiSlidePath,
} from "../plotting/processing/utils/slideCalculation";

type NoteConfig = ReturnType<typeof getNoteConfigs>[number];
type Group = d3.Selection<SVGGElement, unknown, null, undefined>;
type Root = d3.Selection<SVGSVGElement, unknown, null, undefined>;

const X_AXIS_LABEL = "Slide Position";
const Y_AXIS_LABEL = "Note";
const MARGIN = { top: 40, right: 90, bottom: 40, left: 90 };
const HOVER_RADIUS = 22;
const PATH_STEP_MS = 400;

interface D3ScatterPlotProps {
  model: PlotModel;
  viewOptions?: {
    showNoteLabels: boolean;
    showOptimalSlidePath: boolean;
  };
  width?: number;
  height?: number;
}

interface ChartContext {
  svg: Group;
  x: d3.ScaleLinear<number, number>;
  y: d3.ScaleLinear<number, number>;
  color: d3.ScaleOrdinal<string, string>;
  model: PlotModel;
  innerWidth: number;
  innerHeight: number;
}

export function D3ScatterPlot({
  model,
  viewOptions = { showNoteLabels: true, showOptimalSlidePath: false },
  width = 800,
  height = 600,
}: D3ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  // Only animate the slide path the moment it's switched on, not on every render
  const wasPathVisible = useRef(viewOptions.showOptimalSlidePath);

  useEffect(() => {
    if (!svgRef.current) return;

    const noteConfigs = model.notes.flatMap((note) =>
      getNoteConfigs(model.trombone, note, model.player),
    );

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const scales = createScales(noteConfigs, model, innerWidth, innerHeight);
    if (!scales) return;
    const { x, y, color, tuningNames } = scales;

    const svgRoot: Root = d3.select(svgRef.current);
    svgRoot.selectAll("*").remove();
    svgRoot.attr("width", width).attr("height", height);

    renderDefs(svgRoot);
    renderTitle(svgRoot, model.title, width);

    const svg: Group = svgRoot
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const ctx: ChartContext = {
      svg,
      x,
      y,
      color,
      model,
      innerWidth,
      innerHeight,
    };

    renderAxes(ctx, computeSlidePositionTicks(model));

    // Path layer added before the points layer so lines sit underneath the nodes
    const pathLayer: Group = svg
      .append("g")
      .attr("class", "optimal-path")
      .style("pointer-events", "none");
    const pointsLayer: Group = svg
      .append("g")
      .attr("class", "points")
      .style("isolation", "isolate");

    if (viewOptions.showOptimalSlidePath) {
      const path = getViterbiSlidePath(
        noteConfigs,
        model.player,
        model.trombone,
      );
      const animate = !wasPathVisible.current;
      renderOptimalPath(ctx, pathLayer, path, animate);
    }

    const bentNotes = noteConfigs.filter((d) => d.lipBendCents > 0);
    const nonLipNotes = noteConfigs
      .filter((d) => d.lipBendCents === 0)
      .reverse();

    renderPoints(ctx, pointsLayer, nonLipNotes, bentNotes);
    if (viewOptions.showNoteLabels) renderNoteLabels(ctx, noteConfigs);
    renderLegend(svgRoot, ctx, tuningNames, bentNotes.length > 0, width);

    if (tooltipRef.current) {
      setupHoverInteractivity(
        ctx,
        pointsLayer,
        noteConfigs,
        tooltipRef.current,
      );
    }

    applyGlobalStyles(svgRoot);

    wasPathVisible.current = viewOptions.showOptimalSlidePath;
  }, [model, viewOptions, width, height]);

  return (
    <div>
      <svg ref={svgRef} style={{ display: "block", margin: "0 auto" }} />
      <div
        ref={tooltipRef}
        style={{
          position: "fixed",
          display: "none",
          pointerEvents: "none",
          padding: "10px 12px",
          borderRadius: 12,
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          border: "1px solid var(--mantine-color-default-border)",
          fontFamily: "var(--mantine-font-family)",
          color: "var(--mantine-color-text)",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      />
    </div>
  );
}

// --- Data helpers -----------------------------------------------------

function createScales(
  noteConfigs: NoteConfig[],
  model: PlotModel,
  innerWidth: number,
  innerHeight: number,
) {
  const [xMin, xMax] = d3.extent(noteConfigs, (d) => d.graphPoint[0]);
  const [yMin, yMax] = d3.extent(noteConfigs, (d) => d.graphPoint[1]);
  if (
    xMin === undefined ||
    xMax === undefined ||
    yMin === undefined ||
    yMax === undefined
  ) {
    return null;
  }

  const x = d3
    .scaleLinear()
    .domain([
      Math.min(xMin, 0),
      Math.max(xMax, model.trombone.slideLength as number),
    ])
    .range([0, innerWidth]);

  const y = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]);

  const tuningNames = Array.from(
    new Set(model.trombone.tunings.map((t) => t.name)),
  );
  const color = d3
    .scaleOrdinal<string, string>()
    .domain(tuningNames)
    .range(d3.schemeCategory10);

  return { x, y, color, tuningNames };
}

// Slide positions are spaced a semitone apart starting from the player's first-position distance
function computeSlidePositionTicks(model: PlotModel) {
  const openTuning = model.trombone.tunings[0];
  const semitone = 2 ** (1 / 12);
  const maxLength = (
    openTuning.length + (model.trombone.slideLength as number)
  ).toPrecision(12);

  const posLengths: number[] = [];
  for (
    let length = openTuning.length + model.player.firstPosDistance;
    length.toPrecision(12) <= maxLength;
    length *= semitone
  ) {
    posLengths.push(length - openTuning.length);
  }

  const posLengthToPos: Record<number, number> = {};
  posLengths.forEach((len, i) => (posLengthToPos[len] = i + 1));

  return { posLengths, posLengthToPos };
}

function formatNumber(value: number, decimals = 2) {
  return (+value.toFixed(decimals)).toString();
}

// --- Static chrome (defs, title) --------------------------------------

function renderDefs(svgRoot: Root) {
  const defs = svgRoot.append("defs");

  defs
    .append("marker")
    .attr("id", "optimal-slide-arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 10)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .style("fill", "var(--mantine-color-teal-8)");

  const asterisk = d3.symbol().type(d3.symbolAsterisk);
  defs
    .append("path")
    .attr("id", "lip-bend-symbol")
    .attr("d", asterisk.size(50)());
  defs
    .append("path")
    .attr("id", "lip-bend-symbol-large")
    .attr("d", asterisk.size(120)());
}

function renderTitle(svgRoot: Root, title: string, width: number) {
  svgRoot
    .append("text")
    .attr("x", width / 2)
    .attr("y", 15)
    .style("text-anchor", "middle")
    .style("fill", "var(--mantine-color-text)")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(title);
}

// --- Axes & grid --------------------------------------------------------

function renderAxes(
  ctx: ChartContext,
  ticks: { posLengths: number[]; posLengthToPos: Record<number, number> },
) {
  const { svg, x, y, model, innerWidth, innerHeight } = ctx;
  const { posLengths, posLengthToPos } = ticks;

  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues(posLengths)
        .tickFormat((d) => String(posLengthToPos[+d])),
    );

  xAxis
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", 40)
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .text(X_AXIS_LABEL);

  const yAxis = svg.append("g").call(
    d3
      .axisLeft(y)
      .tickValues(y.ticks().filter(Number.isInteger))
      .tickFormat((d) => Note.fromMidiNum(+d as MidiNumber).name),
  );

  yAxis
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -innerHeight / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .text(Y_AXIS_LABEL);

  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues(posLengths)
        .tickFormat(() => "")
        .tickSize(-innerHeight),
    )
    .call((g) => g.select(".domain").remove())
    .selectAll("line")
    .style("stroke", "var(--mantine-color-default-border)")
    .style("stroke-opacity", 0.7)
    .style("stroke-dasharray", "3,3");

  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${innerHeight + 6})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues([model.trombone.slideLength as number])
        .tickFormat(() => "All the way out")
        .tickSize(-(innerHeight + 6)),
    )
    .call((g) => {
      g.select(".domain").remove();
      g.select(".tick text").style("text-anchor", "start");
    });
}

// --- Optimal slide path ---------------------------------------------------

// The whole SVG is rebuilt from scratch every render (see `svgRoot.selectAll("*").remove()`
// above), so there's never a persisted "update" selection here — every segment is freshly
// entered. A plain join is enough; no need for the enter/update/exit ceremony.
function renderOptimalPath(
  ctx: ChartContext,
  pathLayer: Group,
  path: NoteConfig[],
  animate: boolean,
) {
  const { x, y } = ctx;

  const segments = pathLayer
    .selectAll<SVGPathElement, NoteConfig>("path.optimal-path-segment")
    .data(path.slice(1))
    .join("path")
    .attr("class", "optimal-path-segment")
    .attr("d", (d, i) => pathSegmentD(x, y, path[i], d))
    .style("fill", "none")
    .style("stroke", "var(--mantine-color-teal-8)")
    .style("stroke-width", 1.5)
    .style("stroke-opacity", 0.6);

  if (animate) {
    animateSegments(segments);
  } else {
    segments
      .style("marker-end", "url(#optimal-slide-arrow)")
      .attr("stroke-dasharray", "none")
      .attr("stroke-dashoffset", 0);
  }
}

// Straight line between two nodes, shortened slightly so it doesn't overlap the endpoint marker
function pathSegmentD(
  x: d3.ScaleLinear<number, number>,
  y: d3.ScaleLinear<number, number>,
  from: NoteConfig,
  to: NoteConfig,
) {
  const x1 = x(from.graphPoint[0]);
  const y1 = y(from.graphPoint[1]);
  const x2 = x(to.graphPoint[0]);
  const y2 = y(to.graphPoint[1]);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);

  const padding = 3;
  if (dist <= padding * 2) return "";

  const endX = x2 - (dx / dist) * padding;
  const endY = y2 - (dy / dist) * padding;
  return `M${x1},${y1}L${endX},${endY}`;
}

function animateSegments(
  segments: d3.Selection<SVGPathElement, NoteConfig, SVGGElement, unknown>,
) {
  segments
    .attr("stroke-dasharray", function () {
      const length = this.getTotalLength();
      return `${length} ${length}`;
    })
    .attr("stroke-dashoffset", function () {
      return this.getTotalLength();
    })
    .transition()
    .duration(PATH_STEP_MS)
    .delay((_, i) => i * PATH_STEP_MS)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .on("end", function () {
      d3.select(this).style("marker-end", "url(#optimal-slide-arrow)");
    });
}

// --- Points & labels ------------------------------------------------------

function renderPoints(
  ctx: ChartContext,
  pointsLayer: Group,
  nonLipNotes: NoteConfig[],
  bentNotes: NoteConfig[],
) {
  const { svg, x, y, color, model } = ctx;

  svg
    .selectAll("line.lip-bend")
    .data(bentNotes)
    .join("line")
    .attr("class", "lip-bend")
    .attr("x1", () => x(model.trombone.slideLength as number))
    .attr("y1", (d) => y(d.graphPoint[1]))
    .attr("x2", (d) => x(d.graphPoint[0]))
    .attr("y2", (d) => y(d.graphPoint[1]))
    .style("stroke", "red")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "4,4")
    .style("pointer-events", "none");

  pointsLayer
    .selectAll("circle.point")
    .data(nonLipNotes)
    .join("circle")
    .attr("class", "point")
    .attr("cx", (d) => x(d.graphPoint[0]))
    .attr("cy", (d) => y(d.graphPoint[1]))
    .attr("r", 3)
    .style("fill", (d) => color(d.tuning.name))
    .style("mix-blend-mode", "color");

  svg
    .selectAll("use.lip-bend-point")
    .data(bentNotes)
    .join("use")
    .attr("class", "lip-bend-point")
    .attr("href", "#lip-bend-symbol")
    .attr(
      "transform",
      (d) => `translate(${x(d.graphPoint[0])}, ${y(d.graphPoint[1])})`,
    )
    .style("stroke", (d) => color(d.tuning.name))
    .style("pointer-events", "none")
    .style("fill", "none");
}

function renderNoteLabels(ctx: ChartContext, noteConfigs: NoteConfig[]) {
  const { svg, x, y, color } = ctx;
  const yTicks = y.ticks();

  const isOverlapping = (d: NoteConfig) =>
    noteConfigs.some(
      (other) =>
        other !== d &&
        other.graphPoint[1] === d.graphPoint[1] &&
        x(other.graphPoint[0]) < x(d.graphPoint[0]) &&
        Math.abs(x(other.graphPoint[0]) - x(d.graphPoint[0])) < 30,
    );

  const isNearAxis = (d: NoteConfig) =>
    x(d.graphPoint[0]) < 30 && yTicks.some((tick) => d.graphPoint[1] === tick);

  const visibleLabels = noteConfigs.filter(
    (d) => !isOverlapping(d) && !isNearAxis(d),
  );

  svg
    .append("g")
    .attr("class", "note-labels")
    .selectAll("text.note-label")
    .data(visibleLabels)
    .join("text")
    .attr("class", "note-label")
    .attr("x", (d) => x(d.graphPoint[0]) - 6)
    .attr("y", (d) => y(d.graphPoint[1]) + (d.lipBendCents > 0 ? -6 : 0))
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "10px")
    .style("fill", (d) => color(d.tuning.name))
    .style("pointer-events", "none")
    .text((d) => d.note.name);
}

// --- Hover / tooltip --------------------------------------------------

function setupHoverInteractivity(
  ctx: ChartContext,
  pointsLayer: Group,
  noteConfigs: NoteConfig[],
  tooltipEl: HTMLDivElement,
) {
  const { x, y, color, model, innerWidth, innerHeight } = ctx;
  const tooltip = d3.select(tooltipEl);

  const hoverPoint = pointsLayer.append("circle").style("display", "none");
  const hoverLipBend = pointsLayer
    .append("use")
    .attr("href", "#lip-bend-symbol-large")
    .style("display", "none")
    .style("fill", "none");

  const resetHover = () => {
    hoverPoint.style("display", "none");
    hoverLipBend.style("display", "none");
  };

  const highlightHover = (note: NoteConfig) => {
    resetHover();
    if (note.lipBendCents === 0) {
      hoverPoint
        .style("display", "block")
        .attr("cx", x(note.graphPoint[0]))
        .attr("cy", y(note.graphPoint[1]))
        .attr("r", 6)
        .style("fill", color(note.tuning.name));
    } else {
      hoverLipBend
        .style("display", "block")
        .attr(
          "transform",
          `translate(${x(note.graphPoint[0])}, ${y(note.graphPoint[1])})`,
        )
        .style("stroke", color(note.tuning.name));
    }
  };

  const describeSlidePosition = (note: NoteConfig) => {
    if (note.lipBendCents !== 0) return "All the way out";

    const position = formatNumber(note.getSlidePosition(model.player));
    if (note.tuning === model.trombone.tunings[0]) return position;

    const openPosition = formatNumber(
      note.getOpenPosition(model.player, model.trombone),
    );
    return `${position}${note.tuning.name.split(" ")[0]} (${openPosition})`;
  };

  const delaunay = d3.Delaunay.from(
    noteConfigs,
    (d) => x(d.graphPoint[0]),
    (d) => y(d.graphPoint[1]),
  );

  pointsLayer
    .append("rect")
    .attr("x", -HOVER_RADIUS / 2)
    .attr("y", -HOVER_RADIUS / 2)
    .attr("width", innerWidth + HOVER_RADIUS)
    .attr("height", innerHeight + HOVER_RADIUS)
    .style("fill", "transparent")
    .style("pointer-events", "all")
    .on("mousemove", (event: MouseEvent) => {
      const [mouseX, mouseY] = d3.pointer(event);
      const note = noteConfigs[delaunay.find(mouseX, mouseY)];
      const distance = note
        ? Math.hypot(
            mouseX - x(note.graphPoint[0]),
            mouseY - y(note.graphPoint[1]),
          )
        : Infinity;

      if (!note || distance > HOVER_RADIUS) {
        tooltip.style("display", "none");
        resetHover();
        return;
      }

      tooltip
        .style("left", `${event.clientX + 10}px`)
        .style("top", `${event.clientY + 10}px`)
        .style("display", "block").html(`
          <div>${note.note.name}</div>
          <div>Slide position: ${describeSlidePosition(note)}</div>
          <div>Tuning: ${note.tuning.name}</div>
          <div>Partial: ${note.partial}</div>
        `);

      highlightHover(note);
    })
    .on("mouseleave", () => {
      tooltip.style("display", "none");
      resetHover();
    });
}

// --- Legend -------------------------------------------------------------

function renderLegend(
  svgRoot: Root,
  ctx: ChartContext,
  tuningNames: string[],
  hasLipBend: boolean,
  width: number,
) {
  const { color } = ctx;
  const legendX = width - MARGIN.right + 20;
  const legendY = MARGIN.top + 5;
  const legend = svgRoot.append("g").attr("class", "legend");

  const items = legend
    .selectAll("g.legend-item")
    .data(tuningNames)
    .join("g")
    .attr("class", "legend-item")
    .attr("transform", (_, i) => `translate(${legendX}, ${legendY + i * 18})`);

  items
    .append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("y", -10)
    .style("fill", color);
  items
    .append("text")
    .attr("x", 16)
    .attr("y", 0)
    .style("alignment-baseline", "middle")
    .style("font-size", "12px")
    .text((d) => d);

  if (!hasLipBend) return;

  const lipBendItem = legend
    .append("g")
    .attr(
      "transform",
      `translate(${legendX}, ${legendY + tuningNames.length * 18})`,
    );

  lipBendItem
    .append("use")
    .attr("href", "#lip-bend-symbol-large")
    .attr("transform", "translate(6, -4)")
    .style("stroke", "red")
    .style("fill", "none");

  lipBendItem
    .append("text")
    .attr("x", 16)
    .attr("y", 0)
    .style("alignment-baseline", "middle")
    .style("font-size", "12px")
    .text("Lip bent");
}

// --- Global styling ----------------------------------------------------

function applyGlobalStyles(svgRoot: Root) {
  svgRoot
    .selectAll(".domain, .tick line")
    .style("stroke", "var(--mantine-color-default-border)");
  svgRoot
    .selectAll("text, .tick text")
    .style("font-family", "var(--mantine-font-family)")
    .style("fill", "var(--mantine-color-text)");
  svgRoot.selectAll(".tick text").style("font-size", "12px");
}
