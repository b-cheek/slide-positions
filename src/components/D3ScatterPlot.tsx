import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { PlotModel } from "../plotting";

const X_AXIS_LABEL = "Slide Distance (m)";
const Y_AXIS_LABEL = "MIDI Number";

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

    if (!svgRef.current || noteConfigs.length === 0) return;

    const margin = 40;
    const innerWidth = width - margin * 2;
    const innerHeight = height - margin * 2;

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

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin},${margin})`);

    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text(X_AXIS_LABEL);

    svg
      .append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin)
      .attr("x", 0 - innerHeight / 2)
      .attr("dy", "1em")
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text(Y_AXIS_LABEL);

    d3.select(svgRef.current)
      .append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(model.title);

    svg
      .selectAll("circle")
      .data(noteConfigs)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.slideDistance))
      .attr("cy", (d) => yScale(d.note.midiNum))
      .attr("r", 3)
      .attr("fill", "steelblue");
  }, [model, width, height]);

  return <svg ref={svgRef} style={{ display: "block", margin: "0 auto" }} />;
}
