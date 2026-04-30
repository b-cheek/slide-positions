import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CreatePlotPage } from "./CreatePlotPage";
import { LandingPage } from "./LandingPage";
import { PlotViewErrorBoundary } from "./PlotViewErrorBoundary";
import { plotViewLoader } from "./PlotViewLoader";
import { PlotViewPage } from "./PlotViewPage";

// TODO: add tests for example paths, other happy paths?

vi.mock("plotly.js-dist", () => ({
  default: {
    newPlot: vi.fn(),
    purge: vi.fn(),
  },
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })),
  });
});

function renderWithRouter(initialEntries) {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <LandingPage />,
        hydrateFallbackElement: <div>Loading...</div>,
      },
      { path: "/create", element: <CreatePlotPage /> },
      {
        path: "/plot/:plotId",
        loader: plotViewLoader,
        hydrateFallbackElement: <div>Loading plot...</div>,
        element: <PlotViewPage />,
        errorElement: <PlotViewErrorBoundary />,
      },
    ],
    { initialEntries },
  );

  return render(
    <MantineProvider defaultColorScheme="light">
      <RouterProvider router={router} />
    </MantineProvider>,
  );
}

describe("plot user flows", () => {
  it("opens an example plot without errors", async () => {
    const user = userEvent.setup();
    renderWithRouter(["/"]);

    await user.click(screen.getByRole("link", { name: "Open Example Plot" }));

    expect(
      await screen.findByText("Viewing plot: Bb-scale-default"),
    ).toBeTruthy();
  });

  it("creates a custom plot from create page input", async () => {
    const user = userEvent.setup();
    renderWithRouter(["/create"]);

    const notesInput = screen.getByLabelText(/Notes/);
    await user.clear(notesInput);
    await user.type(notesInput, "Bb2 C3 D4");
    await user.click(screen.getByRole("button", { name: "Create Plot" }));

    expect(await screen.findByText("Viewing plot: custom")).toBeTruthy();
  });

  it("shows not found page for unknown preset route", async () => {
    renderWithRouter(["/plot/not-a-real-plot"]);

    expect(await screen.findByText("Page Not Found")).toBeTruthy();
  });

  it("shows invalid config page for malformed custom route", async () => {
    renderWithRouter(["/plot/custom?points=abc"]);

    expect(
      await screen.findByRole("heading", {
        name: "Invalid Plot Configuration",
      }),
    ).toBeTruthy();
  });
});
