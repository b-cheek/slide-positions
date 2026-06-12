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
});
