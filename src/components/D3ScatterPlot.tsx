import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { PlotModel } from "../plotting/parsing/utils";
import { Note } from "../plotting/processing/types/note";
import { MidiNumber } from "../plotting";

const X_AXIS_LABEL = "Slide Position";
const Y_AXIS_LABEL = "Note";

interface D3ScatterPlotProps {
  model: PlotModel;
  width?: number;
  height?: number;
}

export function D3ScatterPlot({
  model,
  width = 800,
  height = 600,
}: D3ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const noteConfigs = model.notes.flatMap((note) =>
      model.trombone.getNoteConfigs(note, model.player),
    );

    // TODO: prevent recomputation?
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
    const posLengthToPos: Record<number, number> = {};
    posLengths.forEach((len, i) => {
      posLengthToPos[len] = i + 1;
    });

    // TODO: perhaps a major rework for complete dimensional consistency of labels, but for now just
    // hardcoding margins that look good with the current labels and font sizes
    const xMargin = 90;
    const yMargin = 40;
    const innerWidth = width - xMargin * 2;
    const innerHeight = height - yMargin * 2;

    d3.select(svgRef.current).selectAll("*").remove();

    const xExtent = d3.extent(noteConfigs, (d) => d.slideDistance);
    const yExtent = d3.extent(noteConfigs, (d) => d.note.midiNum);
    if (!xExtent || xExtent[0] == null || xExtent[1] == null) return;
    if (!yExtent || yExtent[0] == null || yExtent[1] == null) return;
    const xDomain: [number, number] = [
      xExtent[0] as number,
      xExtent[1] as number,
    ];
    const yDomain: [number, number] = [
      yExtent[0] as number,
      yExtent[1] as number,
    ];

    const xScale = d3.scaleLinear().domain(xDomain).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]);

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

    // Plot
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${xMargin},${yMargin})`);

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(posLengths)
          .tickFormat((d) => String(posLengthToPos[+d])),
      )
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .style("text-anchor", "middle")
      .text(X_AXIS_LABEL);

    svg
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .tickValues(yScale.ticks().filter((tick) => Number.isInteger(tick)))
          .tickFormat((d) => Note.fromMidiNum(+d as MidiNumber).name),
      )
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45) // Slightly farther to look even with length of numbers vs height of numbers for x-axis label
      .attr("x", 0 - innerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(Y_AXIS_LABEL);

    // Gridlines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
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

    // Points
    // Color scale per tuning
    const tuningNames = Array.from(
      new Set(noteConfigs.map((d) => d.tuning.name)),
    );
    const colorScheme = d3.schemeCategory10;
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(tuningNames)
      .range(colorScheme);

    svg
      .selectAll("circle")
      .data(noteConfigs)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.slideDistance))
      .attr("cy", (d) => yScale(d.note.midiNum))
      .attr("r", 3)
      .style("fill", (d) => color(d.tuning.name));

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

    // Axis styling
    svg
      .selectAll(".domain, .tick line")
      .style("stroke", "var(--mantine-color-default-border)");
    svg
      .selectAll(".tick text")
      .style("font-family", "var(--mantine-font-family)")
      .style("fill", "var(--mantine-color-text)");
    svg
      .selectAll("text")
      .style("font-family", "var(--mantine-font-family)")
      .style("fill", "var(--mantine-color-text)");
  }, [model, width, height]);

  return <svg ref={svgRef} style={{ display: "block", margin: "0 auto" }} />;
}
