import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { D3ScatterPlot } from "./D3ScatterPlot";
import { buildPlotModel } from "../plotting/parsing/utils";
import { plotInputsSchema } from "../plotting/parsing/plotInputsSchema";

const identityMatrix = {
  inverse() {
    return this;
  },
};

beforeAll(() => {
  Object.defineProperty(SVGElement.prototype, "getScreenCTM", {
    configurable: true,
    value() {
      return identityMatrix;
    },
  });

  Object.defineProperty(SVGSVGElement.prototype, "createSVGPoint", {
    configurable: true,
    value() {
      return {
        x: 0,
        y: 0,
        matrixTransform() {
          return { x: this.x, y: this.y };
        },
      };
    },
  });
});

afterEach(() => {
  cleanup();
});

describe("D3ScatterPlot hover", () => {
  it("shows a tooltip and inflates the hovered point", async () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({ notesString: "Bb1" }),
    );
    const { container } = render(<D3ScatterPlot model={model} />);

    await waitFor(() => {
      expect(container.querySelectorAll("circle").length).toBeGreaterThan(0);
    });

    const basePoint = Array.from(container.querySelectorAll("circle")).find(
      (circle) => circle.getAttribute("r") === "3",
    );

    expect(basePoint).toBeTruthy();
    const baseRadius = Number(basePoint?.getAttribute("r"));

    const hoverLayer = container.querySelector("rect.hover-layer");
    expect(hoverLayer).toBeTruthy();

    const cx = Number(basePoint?.getAttribute("cx"));
    const cy = Number(basePoint?.getAttribute("cy"));

    fireEvent.mouseMove(hoverLayer as Element, {
      clientX: cx,
      clientY: cy,
      pageX: cx,
      pageY: cy,
    });

    const tooltip = document.body.querySelector("#tooltip");
    expect(tooltip?.textContent).toContain("Bb1");
    expect(tooltip?.textContent).toContain("Slide position: 1");
    expect(tooltip?.textContent).toContain("Tuning:");
    expect(tooltip?.textContent).toContain("Partial:");

    const hoveredPoint = Array.from(container.querySelectorAll("circle")).find(
      (circle) => Number(circle.getAttribute("r")) > baseRadius,
    );

    expect(hoveredPoint).toBeTruthy();
  });

  it("omits the lip bent legend entry when there are no lip bent notes", async () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({ notesString: "Bb1" }),
    );
    const { container } = render(<D3ScatterPlot model={model} />);

    await waitFor(() => {
      expect(container.querySelector("g.legend")).toBeTruthy();
    });

    expect(container.textContent).not.toContain("Lip bent");
  });

  it("shows the lip bent legend entry when bent notes are present", async () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({
        notesString: "B1",
        lipBendStartNote: "Bb1",
        lipBendStopNote: "C1",
      }),
    );
    const { container } = render(<D3ScatterPlot model={model} />);

    await waitFor(() => {
      expect(
        container.querySelectorAll("path.lip-bend").length,
      ).toBeGreaterThan(0);
      expect(container.textContent).toContain("Lip bent");
    });
  });

  it("shows that a lip bent note has slide all the way out in tooltip", async () => {
    const model = buildPlotModel(
      // Using a note without an open pos for simplicity
      plotInputsSchema.parse({
        notesString: "B1",
        lipBendStartNote: "Bb1",
        lipBendStopNote: "C1",
      }),
    );
    const { container } = render(<D3ScatterPlot model={model} />);

    const noteConfig = model.notes
      .flatMap((note) => model.trombone.getNoteConfigs(note, model.player))
      .find((config) => config.tuning !== model.trombone.tunings[0]);

    expect(noteConfig).toBeTruthy();

    const hoverLayer = container.querySelector("rect.hover-layer");
    expect(hoverLayer).toBeTruthy();

    // Get cx and cy for the lip bend symbol
    const lipBentPoint = Array.from(
      container.querySelectorAll("path.lip-bend"),
    )[0];
    const cx = Number(
      lipBentPoint
        .getAttribute("transform")
        ?.match(/translate\(([^,]+),([^)]+)\)/)?.[1],
    );
    const cy = Number(
      lipBentPoint
        .getAttribute("transform")
        ?.match(/translate\(([^,]+),([^)]+)\)/)?.[2],
    );

    fireEvent.mouseMove(hoverLayer as Element, {
      clientX: cx,
      clientY: cy,
      pageX: cx,
      pageY: cy,
    });

    const tooltip = document.body.querySelector("#tooltip");

    await waitFor(() => {
      expect(tooltip?.textContent).toContain(`Slide position: All the way out`);
    });
  });

  it("shows tuning and open position for a note on a non-open tuning", async () => {
    const model = buildPlotModel(
      // Using a note without an open pos for simplicity
      plotInputsSchema.parse({
        notesString: "C3",
      }),
    );
    const { container } = render(<D3ScatterPlot model={model} />);

    const noteConfig = model.notes
      .flatMap((note) => model.trombone.getNoteConfigs(note, model.player))
      .find((config) => config.tuning !== model.trombone.tunings[0]);

    expect(noteConfig).toBeTruthy();

    const hoverLayer = container.querySelector("rect.hover-layer");
    expect(hoverLayer).toBeTruthy();

    // Get the point using the F attachment
    const point = Array.from(container.querySelectorAll("circle")).find(
      (circle) => Number(circle.getAttribute("cx")) < 10,
    );
    const cx = Number(point?.getAttribute("cx"));
    const cy = Number(point?.getAttribute("cy"));

    fireEvent.mouseMove(hoverLayer as Element, {
      clientX: cx,
      clientY: cy,
      pageX: cx,
      pageY: cy,
    });

    const tooltip = document.body.querySelector("#tooltip");

    await waitFor(() => {
      expect(tooltip?.textContent).toContain(`Slide position: 1.02F (1.03)`);
    });
  });
});
