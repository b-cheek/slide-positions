import { render, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { D3ScatterPlot } from "./D3ScatterPlot";
import { buildPlotModel } from "../plotting/parsing/utils";
import { plotInputsSchema } from "../plotting/parsing/plotInputsSchema";
import { getNoteConfigs } from "../plotting/processing/utils/slideCalculation";

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

  Object.defineProperty(SVGElement.prototype, "getTotalLength", {
    configurable: true,
    value() {
      return 10;
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

    const hoverLayer = container.querySelector("g.points rect");
    expect(hoverLayer).toBeTruthy();

    const cx = Number(basePoint?.getAttribute("cx"));
    const cy = Number(basePoint?.getAttribute("cy"));

    fireEvent.mouseMove(hoverLayer as Element, {
      clientX: cx,
      clientY: cy,
      pageX: cx,
      pageY: cy,
    });

    await waitFor(() => {
      const tooltip = container.querySelector(
        'div > div[style*="position: fixed"]',
      );
      expect(tooltip).toBeTruthy();
      expect(tooltip?.textContent).toContain("Bb1");
      expect(tooltip?.textContent).toContain("Slide position: 1");
      expect(tooltip?.textContent).toContain("Tuning:");
      expect(tooltip?.textContent).toContain("Partial:");
    });

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

  it("centers legend markers and labels on the same row", async () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({ notesString: "Bb1" }),
    );
    const { container } = render(<D3ScatterPlot model={model} />);

    await waitFor(() => {
      expect(container.querySelector("g.legend")).toBeTruthy();
    });

    expect(
      Array.from(container.querySelectorAll("g.legend-item rect"), (rect) =>
        rect.getAttribute("y"),
      ).every((y) => y === "-7"),
    ).toBe(true);
    expect(
      Array.from(container.querySelectorAll("g.legend-item text"), (text) =>
        text.getAttribute("dominant-baseline"),
      ).every((baseline) => baseline === "middle"),
    ).toBe(true);
  });

  it("keeps note label colors separate from themed legend text", async () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({ notesString: "Bb1 C3" }),
    );
    const { container } = render(<D3ScatterPlot model={model} />);

    await waitFor(() => {
      expect(container.querySelector("g.legend")).toBeTruthy();
      expect(container.querySelector("text.note-label")).toBeTruthy();
    });

    expect(
      container.querySelector("text.note-label")?.getAttribute("style"),
    ).toContain("fill: var(--mantine-color-text)");
    expect(
      container.querySelector("g.legend text")?.getAttribute("style"),
    ).toContain("fill: var(--mantine-color-text)");
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
        container.querySelectorAll("use.lip-bend-point").length,
      ).toBeGreaterThan(0);
      expect(container.textContent).toContain("Lip bent");
    });

    expect(
      container
        .querySelector("g.legend text:last-child")
        ?.getAttribute("dominant-baseline"),
    ).toBe("middle");
  });

  it("draws optimal path arrows when enabled", async () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({
        notesString: "Bb1 C3",
      }),
    );
    const { container } = render(
      <D3ScatterPlot
        model={model}
        viewOptions={{ showNoteLabels: false, showOptimalSlidePath: true }}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector("g.optimal-path")).toBeTruthy();
      expect(
        container.querySelectorAll("path.optimal-path-segment").length,
      ).toBeGreaterThan(0);
      expect(
        container.querySelector("marker#optimal-slide-arrow"),
      ).toBeTruthy();
    });

    const tickText = container.querySelector("g .tick text");
    expect(tickText?.getAttribute("font-family")).toBeNull();
    expect(tickText?.getAttribute("font-size")).toBeNull();
    expect((tickText as SVGTextElement | null)?.style.fontSize).toBe("12px");
    expect((tickText as SVGTextElement | null)?.style.fontFamily).toBe(
      "var(--mantine-font-family)",
    );
  });

  it("keeps tick label geometry stable when the optimal path is toggled", async () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({ notesString: "Bb1 C3" }),
    );
    const { container, rerender } = render(
      <D3ScatterPlot
        model={model}
        viewOptions={{ showNoteLabels: true, showOptimalSlidePath: false }}
      />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".tick text").length).toBeGreaterThan(
        0,
      );
    });

    const tickGeometryBefore = Array.from(
      container.querySelectorAll<SVGTextElement>(".tick text"),
      (text) => [text.getAttribute("transform"), text.getAttribute("dy")],
    );

    rerender(
      <D3ScatterPlot
        model={model}
        viewOptions={{ showNoteLabels: true, showOptimalSlidePath: true }}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector(".optimal-path path")).toBeTruthy();
    });

    const tickGeometryAfter = Array.from(
      container.querySelectorAll<SVGTextElement>(".tick text"),
      (text) => [text.getAttribute("transform"), text.getAttribute("dy")],
    );

    expect(tickGeometryAfter).toEqual(tickGeometryBefore);
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
      .flatMap((note) => getNoteConfigs(model.trombone, note, model.player))
      .find((config) => config.tuning !== model.trombone.tunings[0]);

    expect(noteConfig).toBeTruthy();

    const hoverLayer = container.querySelector("g.points rect");
    expect(hoverLayer).toBeTruthy();

    // Get cx and cy for the lip bend symbol
    const lipBentPoint = Array.from(
      container.querySelectorAll("use.lip-bend-point"),
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

    await waitFor(() => {
      const tooltip = container.querySelector(
        'div > div[style*="position: fixed"]',
      );
      expect(tooltip).toBeTruthy();
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
      .flatMap((note) => getNoteConfigs(model.trombone, note, model.player))
      .find((config) => config.tuning !== model.trombone.tunings[0]);

    expect(noteConfig).toBeTruthy();

    const hoverLayer = container.querySelector("g.points rect");
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

    await waitFor(() => {
      const tooltip = container.querySelector(
        'div > div[style*="position: fixed"]',
      );
      expect(tooltip).toBeTruthy();
      expect(tooltip?.textContent).toContain(`Slide position: 1.02F (1.03)`);
    });
  });
});
