import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { PlotModel } from "../plotting/parsing/utils";
import { Note } from "../plotting/processing/types/note";
import { MidiNumber } from "../plotting";
import {
  getNoteConfigs,
  getViterbiSlidePath,
} from "../plotting/processing/utils/slideCalculation";

const X_AXIS_LABEL = "Slide Position";
const Y_AXIS_LABEL = "Note";

interface D3ScatterPlotProps {
  model: PlotModel;
  viewOptions?: {
    showNoteLabels: boolean;
    showOptimalSlidePath: boolean;
  };
  width?: number;
  height?: number;
}

export function D3ScatterPlot({
  model,
  viewOptions = { showNoteLabels: true, showOptimalSlidePath: false },
  width = 800,
  height = 600,
}: D3ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  // Track previous state of the slide path checkbox to prevent re-animating on unrelated renders
  const prevShowSlidePathRef = useRef(viewOptions.showOptimalSlidePath);

  useEffect(() => {
    // Determine if the checkbox was JUST turned on
    const shouldAnimatePath =
      viewOptions.showOptimalSlidePath && !prevShowSlidePathRef.current;

    // --- 1. Data Computation ---
    const noteConfigs = model.notes.flatMap((note) =>
      getNoteConfigs(model.trombone, note, model.player),
    );

    const optimalSlidePath = viewOptions.showOptimalSlidePath
      ? getViterbiSlidePath(noteConfigs, model.player, model.trombone)
      : [];

    const openTuning = model.trombone.tunings[0];
    const semiToneOffset = 2 ** (1 / 12);
    let posLen = openTuning.length + model.player.firstPosDistance;
    const posLengths: number[] = [];

    while (
      posLen.toPrecision(12) <=
      (openTuning.length + model.trombone.slideLength).toPrecision(12)
    ) {
      posLengths.push(posLen - openTuning.length);
      posLen *= semiToneOffset;
    }

    const posLengthToPos: Record<number, number> = {};
    posLengths.forEach((len, i) => (posLengthToPos[len] = i + 1));

    // --- 2. Chart Setup & Scales ---
    const xMargin = 90;
    const yMargin = 40;
    const innerWidth = width - xMargin * 2;
    const innerHeight = height - yMargin * 2;

    const xExtent = d3.extent(noteConfigs, (d) => d.graphPoint[0]);
    const yExtent = d3.extent(noteConfigs, (d) => d.graphPoint[1]);
    if (!xExtent[0] || !xExtent[1] || !yExtent[0] || !yExtent[1]) return;

    const x = d3
      .scaleLinear()
      .domain([
        Math.min(xExtent[0], 0),
        Math.max(xExtent[1], model.trombone.slideLength as number),
      ])
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([yExtent[0], yExtent[1]])
      .range([innerHeight, 0]);

    const tuningNames = Array.from(
      new Set(model.trombone.tunings.map((t) => t.name)),
    );
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(tuningNames)
      .range(d3.schemeCategory10);

    // --- 3. Base SVG & Defs ---
    const svgRoot = d3.select(svgRef.current);
    svgRoot.selectAll("*").remove();

    const defs = svgRoot.append("defs");

    // Def: Arrow marker. Tip is exactly at x=10 so it aligns with the end of the shortened paths.
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

    const asteriskGen = d3.symbol().type(d3.symbolAsterisk);
    defs
      .append("path")
      .attr("id", "lip-bend-symbol")
      .attr("d", asteriskGen.size(50)());
    defs
      .append("path")
      .attr("id", "lip-bend-symbol-large")
      .attr("d", asteriskGen.size(120)());

    const svg = svgRoot
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${xMargin},${yMargin})`);

    // Title
    svgRoot
      .append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .style("text-anchor", "middle")
      .style("fill", "var(--mantine-color-text)")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(model.title);

    // --- 4. Axes & Gridlines ---
    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(posLengths)
          .tickFormat((d) => String(posLengthToPos[+d])),
      );

    xAxisGroup
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .text(X_AXIS_LABEL);

    const yAxisGroup = svg.append("g").call(
      d3
        .axisLeft(y)
        .tickValues(y.ticks().filter(Number.isInteger))
        .tickFormat((d) => Note.fromMidiNum(+d as MidiNumber).name),
    );

    yAxisGroup
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

    // --- 5. Layer Ordering ---

    // 1. Z-Index Fix: Path layer declared BEFORE points layer so lines draw underneath nodes
    const pathLayer = svg
      .append("g")
      .attr("class", "optimal-path")
      .style("pointer-events", "none");

    // 2. Points layer sits on top
    const pointsLayer = svg
      .append("g")
      .attr("class", "points")
      .style("isolation", "isolate");

    // --- 6. Path Layer (Conditionals & Animation) ---
    if (viewOptions.showOptimalSlidePath && optimalSlidePath.length > 1) {
      pathLayer
        .selectAll("path.optimal-path-segment")
        .data(optimalSlidePath.slice(1))
        .join(
          (enter) => {
            const path = enter
              .append("path")
              .attr("class", "optimal-path-segment")
              .attr("d", (d, i) => {
                const prev = optimalSlidePath[i];
                const x1 = x(prev.graphPoint[0]);
                const y1 = y(prev.graphPoint[1]);
                const x2 = x(d.graphPoint[0]);
                const y2 = y(d.graphPoint[1]);

                const dx = x2 - x1;
                const dy = y2 - y1;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist === 0) return "";

                // Padding offsets the straight line from the center of the nodes
                const padding = 3;
                if (dist <= padding * 2) return "";

                const ux = dx / dist;
                const uy = dy / dist;

                const startX = x1;
                const startY = y1;
                const endX = x2 - ux * padding;
                const endY = y2 - uy * padding;

                return `M${startX},${startY}L${endX},${endY}`;
              })
              .style("fill", "none")
              .style("stroke", "var(--mantine-color-teal-8)")
              .style("stroke-width", 1.5)
              .style("stroke-opacity", 0.6);

            // Only play the drawing animation if the checkbox was just activated
            if (shouldAnimatePath) {
              path
                .attr("stroke-dasharray", function () {
                  const length = this.getTotalLength();
                  return `${length} ${length}`;
                })
                .attr("stroke-dashoffset", function () {
                  return this.getTotalLength();
                })
                .transition()
                .duration(400)
                .delay((_, i) => i * 400) // Sequential animation based on index
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .on("end", function () {
                  d3.select(this).style(
                    "marker-end",
                    "url(#optimal-slide-arrow)",
                  );
                });
            } else {
              // Otherwise render instantly with arrowheads already attached
              path
                .style("marker-end", "url(#optimal-slide-arrow)")
                .attr("stroke-dasharray", "none")
                .attr("stroke-dashoffset", 0);
            }

            return path;
          },
          (update) =>
            update
              .style("marker-end", "url(#optimal-slide-arrow)")
              .attr("stroke-dasharray", "none")
              .attr("stroke-dashoffset", 0),
          (exit) => exit.remove(),
        );
    } else {
      pathLayer.selectAll("path.optimal-path-segment").remove();
    }

    // --- 7. Data Points Layer ---
    const nonLipNotes = noteConfigs
      .filter((d) => d.lipBendCents === 0)
      .reverse();
    const bentNotes = noteConfigs.filter((d) => d.lipBendCents > 0);

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

    if (viewOptions.showNoteLabels) {
      const visibleLabels = noteConfigs.filter(
        (d) =>
          !noteConfigs
            .filter((other) => other.graphPoint[1] === d.graphPoint[1])
            .some(
              (other) =>
                other !== d &&
                x(other.graphPoint[0]) < x(d.graphPoint[0]) &&
                Math.abs(x(other.graphPoint[0]) - x(d.graphPoint[0])) < 30,
            ) &&
          !y
            .ticks()
            .some(
              (tick) => x(d.graphPoint[0]) < 30 && d.graphPoint[1] === tick,
            ),
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

    // --- 8. Interactivity & Hover State ---
    const hoverPoint = pointsLayer.append("circle").style("display", "none");
    const hoverLipBend = pointsLayer
      .append("use")
      .attr("href", "#lip-bend-symbol-large")
      .style("display", "none")
      .style("fill", "none");

    const tooltip = d3
      .select("body")
      .selectAll("#tooltip")
      .data([null])
      .join("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("display", "none")
      .style("pointer-events", "none")
      .style("padding", "10px 12px")
      .style("border-radius", "12px")
      .style("backdrop-filter", "blur(5px)")
      .style("-webkit-backdrop-filter", "blur(5px)")
      .style("border", "1px solid var(--mantine-color-default-border)")
      .style("font-family", "var(--mantine-font-family)")
      .style("color", "var(--mantine-color-text)")
      .style("font-size", "12px")
      .style("line-height", "1.4");

    const resetHoverState = () => {
      hoverPoint.style("display", "none");
      hoverLipBend.style("display", "none");
    };

    const highlightHoverState = (hoveredNote: (typeof noteConfigs)[number]) => {
      resetHoverState();

      if (hoveredNote.lipBendCents === 0) {
        hoverPoint
          .style("display", "block")
          .attr("cx", x(hoveredNote.graphPoint[0]))
          .attr("cy", y(hoveredNote.graphPoint[1]))
          .attr("r", 6)
          .style("fill", color(hoveredNote.tuning.name));
      } else {
        hoverLipBend
          .style("display", "block")
          .attr(
            "transform",
            `translate(${x(hoveredNote.graphPoint[0])}, ${y(hoveredNote.graphPoint[1])})`,
          )
          .style("stroke", color(hoveredNote.tuning.name));
      }
    };

    const delaunay = d3.Delaunay.from(
      noteConfigs,
      (d) => x(d.graphPoint[0]),
      (d) => y(d.graphPoint[1]),
    );
    const hoverRadius = 22;

    pointsLayer
      .append("rect")
      .attr("x", -hoverRadius / 2)
      .attr("y", -hoverRadius / 2)
      .attr("width", innerWidth + hoverRadius)
      .attr("height", innerHeight + hoverRadius)
      .style("fill", "transparent")
      .style("pointer-events", "all")
      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(event);
        const nearestIndex = delaunay.find(mouseX, mouseY);
        const hoveredNote = noteConfigs[nearestIndex];

        if (
          !hoveredNote ||
          Math.hypot(
            mouseX - x(hoveredNote.graphPoint[0]),
            mouseY - y(hoveredNote.graphPoint[1]),
          ) > hoverRadius
        ) {
          tooltip.style("display", "none");
          resetHoverState();
          return;
        }

        let slideTip = "All the way out";
        if (hoveredNote.lipBendCents === 0) {
          slideTip = (+hoveredNote
            .getSlidePosition(model.player)
            .toFixed(2)).toString();

          if (hoveredNote.tuning !== model.trombone.tunings[0]) {
            const openPos = +hoveredNote
              .getOpenPosition(model.player, model.trombone)
              .toFixed(2);
            slideTip += `${hoveredNote.tuning.name.split(" ")[0]} (${openPos})`;
          }
        }

        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .style("display", "block").html(`
            <div>${hoveredNote.note.name}</div>
            <div>Slide position: ${slideTip}</div>
            <div>Tuning: ${hoveredNote.tuning.name}</div>
            <div>Partial: ${hoveredNote.partial}</div>
          `);

        highlightHoverState(hoveredNote);
      })
      .on("mouseleave", () => {
        tooltip.style("display", "none");
        resetHoverState();
      });

    // --- 9. Legend ---
    const legend = svgRoot.append("g").attr("class", "legend");
    const legendX = width - xMargin + 20;
    const legendY = yMargin + 5;

    const legendItems = legend
      .selectAll("g.legend-item")
      .data(tuningNames)
      .join("g")
      .attr("class", "legend-item")
      .attr(
        "transform",
        (_, i) => `translate(${legendX}, ${legendY + i * 18})`,
      );

    legendItems
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("y", -10)
      .style("fill", color);
    legendItems
      .append("text")
      .attr("x", 16)
      .attr("y", 0)
      .style("alignment-baseline", "middle")
      .style("font-size", "12px")
      .text((d) => d);

    if (bentNotes.length > 0) {
      const lipBendGroup = legend
        .append("g")
        .attr(
          "transform",
          `translate(${legendX}, ${legendY + tuningNames.length * 18})`,
        );

      lipBendGroup
        .append("use")
        .attr("href", "#lip-bend-symbol-large")
        .attr("transform", "translate(6, -4)")
        .style("stroke", "red")
        .style("fill", "none");

      lipBendGroup
        .append("text")
        .attr("x", 16)
        .attr("y", 0)
        .style("alignment-baseline", "middle")
        .style("font-size", "12px")
        .text("Lip bent");
    }

    // --- 10. Final Global Styling ---
    svgRoot
      .selectAll(".domain, .tick line")
      .style("stroke", "var(--mantine-color-default-border)");
    svgRoot
      .selectAll("text, .tick text")
      .style("font-family", "var(--mantine-font-family)")
      .style("fill", "var(--mantine-color-text)");
    svgRoot.selectAll(".tick text").style("font-size", "12px");

    // Update the ref for subsequent renders
    prevShowSlidePathRef.current = viewOptions.showOptimalSlidePath;
  }, [model, viewOptions, width, height]);

  return <svg ref={svgRef} style={{ display: "block", margin: "0 auto" }} />;
}
