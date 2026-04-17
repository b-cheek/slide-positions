import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";
import CreatePlotPage from "./CreatePlotPage";
import LandingPage from "./LandingPage";
import PlotViewErrorBoundary from "./PlotViewErrorBoundary";
import PlotViewPage, { plotViewLoader } from "./PlotViewPage";

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
      { path: "/", element: <LandingPage /> },
      { path: "/create", element: <CreatePlotPage /> },
      {
        path: "/plot/:plotId",
        loader: plotViewLoader,
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

    expect(await screen.findByText("Viewing plot: example-plot")).toBeTruthy();
  });

  it("creates a custom plot from create page input", async () => {
    const user = userEvent.setup();
    renderWithRouter(["/create"]);

    const input = screen.getByLabelText(/Point count/i);
    await user.clear(input);
    await user.type(input, "12");
    await user.click(screen.getByRole("button", { name: "Create Plot" }));

    expect(await screen.findByText("Viewing plot: custom")).toBeTruthy();
  });
});
