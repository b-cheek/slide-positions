import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { PlotModel } from "../plotting/parsing/utils";
import { Note } from "../plotting/processing/types/note";
import { MidiNumber } from "../plotting";
import { getNoteConfigs } from "../plotting/processing/utils/slideCalculation";

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

  useEffect(() => {
    // Music computation
    const noteConfigs = model.notes.flatMap((note) =>
      getNoteConfigs(model.trombone, note, model.player),
    );

    // TODO: prevent recomputation?
    // Derive the available slide positions
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
    // create mapping of each pos length to its index + 1
    // This is necessary since formatted tick values require a mapping function
    const posLengthToPos: Record<number, number> = {};
    posLengths.forEach((len, i) => {
      posLengthToPos[len] = i + 1;
    });

    // Chart dimensions and margins

    // TODO: perhaps a major rework for complete dimensional consistency of labels, but for now just
    // hardcoding margins that look good with the current labels and font sizes
    const xMargin = 90;
    const yMargin = 40;
    const innerWidth = width - xMargin * 2;
    const innerHeight = height - yMargin * 2;

    d3.select(svgRef.current).selectAll("*").remove();

    const xExtent = d3.extent(noteConfigs, (d) => d.graphPoint[0]);
    const yExtent = d3.extent(noteConfigs, (d) => d.graphPoint[1]);
    if (!xExtent || xExtent[0] == null || xExtent[1] == null) return;
    if (!yExtent || yExtent[0] == null || yExtent[1] == null) return;

    // Declare the x (horizontal position) scale.
    const x = d3
      .scaleLinear()
      // Set x axis to cover full slide
      .domain([
        Math.min(xExtent[0] as number, 0),
        Math.max(xExtent[1] as number, model.trombone.slideLength as number),
      ])
      .range([0, innerWidth]);

    // Declare the y (vertical position) scale.
    const y = d3
      .scaleLinear()
      .domain([yExtent[0] as number, yExtent[1] as number])
      .range([innerHeight, 0]);

    // Plot
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${xMargin},${yMargin})`);

    // Title
    d3.select(svgRef.current)
      .append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .style("text-anchor", "middle")
      .style("fill", "var(--mantine-color-text)")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(model.title);

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(posLengths)
          // this map is derived from posLengths to ensure consistency,
          // a map function is required to since the index is not available
          .tickFormat((d) => String(posLengthToPos[+d])),
      )
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .text(X_AXIS_LABEL);

    svg
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .tickValues(y.ticks().filter((tick) => Number.isInteger(tick)))
          .tickFormat((d) => Note.fromMidiNum(+d as MidiNumber).name),
      )
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60) // Slightly farther than x-axis label to look even with length of numbers vs height of numbers for x-axis label
      .attr("x", 0 - innerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .text(Y_AXIS_LABEL);

    // Gridlines
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
      // Remove unecessary domain lines that are already shown by axis
      .call((g) => g.select(".domain").remove())
      .selectAll("line")
      .style("stroke", "var(--mantine-color-default-border)")
      .style("stroke-opacity", 0.7)
      .style("stroke-dasharray", "3,3");

    // Lip bend lines
    svg
      .selectAll("line.lip-bend")
      .data(noteConfigs.filter((d) => d.lipBendCents > 0))
      .enter()
      .append("line")
      .attr("class", "lip-bend")
      .attr("x1", (_) => x(model.trombone.slideLength as number))
      .attr("y1", (d) => y(d.graphPoint[1]))
      .attr("x2", (d) => x(d.graphPoint[0]))
      .attr("y2", (d) => y(d.graphPoint[1]))
      .style("stroke", "red")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "4,4")
      .style("pointer-events", "none");

    // Slide all the way out marker
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
      // Remove unecessary domain lines that are already shown by axis
      .call((g) => g.select(".domain").remove())
      // Format text to not overlap numbers
      .call((g) => g.select(".tick text").style("text-anchor", "start"));

    // Points
    // Color scale per tuning
    const tuningNames = Array.from(
      new Set(model.trombone.tunings.map((t) => t.name)),
    );
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(tuningNames)
      .range(d3.schemeCategory10);

    const nonLipNotes = noteConfigs
      .filter((d) => d.lipBendCents === 0)
      .reverse(); // reverse so that notes in earlier specified tunings get color priority in blended overlaps
    const bentNotes = noteConfigs.filter((d) => d.lipBendCents > 0);
    const hasBentNotes = bentNotes.length > 0;

    // Isolate blended points so the grid does not participate in the blend backdrop.
    const pointsLayer = svg
      .append("g")
      .attr("class", "points")
      .style("isolation", "isolate");

    // Non lip-bent notes as circles
    pointsLayer
      .selectAll("circle.point")
      .data(nonLipNotes)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d) => x(d.graphPoint[0]))
      .attr("cy", (d) => y(d.graphPoint[1]))
      .attr("r", 3)
      .style("fill", (d) => color(d.tuning.name))
      .style("mix-blend-mode", "color"); // Better visibility of overlapping points

    // lip-bent notes as asterisks
    const lipBendSymbol = d3.symbol().type(d3.symbolAsterisk);
    svg
      .selectAll("path.lip-bend")
      .data(bentNotes)
      .enter()
      .append("path")
      .attr("class", "lip-bend")
      .attr("d", lipBendSymbol.size(50))
      .attr("transform", (d) => {
        const xVal = x(d.graphPoint[0]);
        const yVal = y(d.graphPoint[1]);
        return `translate(${xVal}, ${yVal})`;
      })
      .style("stroke", (d) => color(d.tuning.name))
      .style("pointer-events", "none");

    // Note text to the left if there are not points in the way
    svg
      .append("g")
      .attr("class", "note-labels")
      .selectAll("text.note-label")
      .data(
        noteConfigs.filter(
          (d) =>
            viewOptions.showNoteLabels &&
            // Exclude notes that have other notes to their left
            !noteConfigs
              .filter((other) => other.graphPoint[1] === d.graphPoint[1])
              .some(
                (other) =>
                  other !== d &&
                  x(other.graphPoint[0]) < x(d.graphPoint[0]) &&
                  Math.abs(x(other.graphPoint[0]) - x(d.graphPoint[0])) < 30,
              ) &&
            // Exclude notes that would conflict with y axis ticks
            !y
              .ticks()
              .some(
                (tick) => x(d.graphPoint[0]) < 30 && d.graphPoint[1] === tick,
              ),
        ),
      )
      .enter()
      .append("text")
      .attr("class", "note-label")
      .attr("x", (d) => x(d.graphPoint[0]) - 6)
      .attr("y", (d) => y(d.graphPoint[1]) + (d.lipBendCents > 0 ? -6 : 0)) // Nudge up if lip bend to prevent overlap
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .style("font-size", "10px")
      .style("fill", (d) => color(d.tuning.name))
      .style("pointer-events", "none") // Prevent labels from interfering with mouse events
      .text((d) => d.note.name);

    // Note interactivity
    // Larger versions of points for visibility and covering overlaps
    const hoverPoint = pointsLayer
      .append("circle")
      .style("display", "none")
      .style("mix-blend-mode", "normal");

    const hoverLipBend = pointsLayer
      .append("path")
      .style("display", "none")
      .style("fill", "none")
      .style("mix-blend-mode", "normal");

    const tooltip = d3
      .select("body")
      .selectAll("#tooltip")
      .data([null])
      .join("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("display", "none")
      .style("pointer-events", "none") // Prevent tooltip from interfering with mouse events
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
        return;
      }

      hoverLipBend
        .style("display", "block")
        .attr(
          "transform",
          `translate(${x(hoveredNote.graphPoint[0])}, ${y(hoveredNote.graphPoint[1])})`,
        )
        .attr("d", lipBendSymbol.size(120))
        .style("stroke", color(hoveredNote.tuning.name));
    };

    // Nearest neighbor to ensure fair hovering on overlaps
    const delaunay = d3.Delaunay.from(
      noteConfigs,
      (d) => x(d.graphPoint[0]),
      (d) => y(d.graphPoint[1]),
    );

    const hoverRadius = 22;

    const hoverCaptureLayer = pointsLayer
      .append("rect")
      .attr("class", "hover-layer")
      // Extend hover layer so no hover regions are clipped
      .attr("x", -hoverRadius / 2)
      .attr("y", -hoverRadius / 2)
      .attr("width", innerWidth + hoverRadius)
      .attr("height", innerHeight + hoverRadius)
      .style("fill", "transparent")
      .style("pointer-events", "all");

    hoverCaptureLayer.on("mousemove", function (event) {
      const [mouseX, mouseY] = d3.pointer(event);
      const nearestIndex = delaunay.find(mouseX, mouseY);
      const hoveredNote = noteConfigs[nearestIndex];

      if (!hoveredNote) {
        tooltip.style("display", "none");
        resetHoverState();
        return;
      }

      const pointX = x(hoveredNote.graphPoint[0]);
      const pointY = y(hoveredNote.graphPoint[1]);
      const distance = Math.hypot(mouseX - pointX, mouseY - pointY);

      if (distance > hoverRadius) {
        tooltip.style("display", "none");
        resetHoverState();
        return;
      }

      let slideTip;
      if (hoveredNote.lipBendCents === 0) {
        slideTip = (+hoveredNote
          .getSlidePosition(model.player)
          .toFixed(2)).toString();
        // Add tuning name and open position if not open tuning:
        // 2 -> 2F (3.2)
        if (hoveredNote.tuning !== model.trombone.tunings[0]) {
          const openPos = +hoveredNote
            .getOpenPosition(model.player, model.trombone)
            .toFixed(2);
          slideTip += `${hoveredNote.tuning.name.split(" ")[0]} (${openPos})`;
        }
      } else {
        slideTip = "All the way out";
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
    });

    hoverCaptureLayer.on("mouseleave", function () {
      tooltip.style("display", "none");
      resetHoverState();
    });

    // Legend: render in the right margin area so it doesn't overlap plot points
    const legendX = width - xMargin + 20;
    const legendY = yMargin + 5; // Better alignment
    const legendItemHeight = 18;

    const legend = d3
      .select(svgRef.current)
      .append("g")
      .attr("class", "legend");

    legend
      .selectAll("g")
      .data(tuningNames)
      .enter()
      .append("g")
      .attr(
        "transform",
        (_, i) => `translate(${legendX}, ${legendY + i * legendItemHeight})`,
      )
      .each(function (d) {
        const g = d3.select(this);
        g.append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("y", -10)
          .style("fill", color(d));

        g.append("text")
          .attr("x", 16)
          .attr("y", 0)
          .style("alignment-baseline", "middle")
          .style("font-size", "12px")
          .text(d)
          .style("fill", "var(--mantine-color-text)");
      });

    if (hasBentNotes) {
      // Add legend entry for lip bends as a separate top-level item.
      const lipBendGroup = legend
        .append("g")
        .attr(
          "transform",
          `translate(${legendX}, ${legendY + tuningNames.length * legendItemHeight})`,
        );

      lipBendGroup
        .append("path")
        .attr("d", lipBendSymbol.size(120))
        .attr("transform", "translate(6, -4)")
        .style("stroke", "red")
        .style("fill", "none");

      lipBendGroup
        .append("text")
        .attr("x", 16)
        .attr("y", 0)
        .style("alignment-baseline", "middle")
        .style("font-size", "12px")
        .text("Lip bent")
        .style("fill", "var(--mantine-color-text)");
    }

    // styling
    svg
      .selectAll(".domain, .tick line")
      .style("stroke", "var(--mantine-color-default-border)");
    svg
      .selectAll(".tick text")
      .style("font-family", "var(--mantine-font-family)")
      .style("fill", "var(--mantine-color-text)")
      .style("font-size", "12px");
    svg
      .selectAll("text")
      .style("font-family", "var(--mantine-font-family)")
      .style("fill", "var(--mantine-color-text)");
  }, [model, viewOptions, width, height]);

  return <svg ref={svgRef} style={{ display: "block", margin: "0 auto" }} />;
}
