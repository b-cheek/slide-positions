import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CreatePlotPage } from "./CreatePlotPage";
import { LandingPage } from "./LandingPage";
import { NotFoundPage } from "./NotFoundPage";
import { PlotViewErrorBoundary } from "./PlotViewErrorBoundary";
import { plotViewLoader } from "./PlotViewLoader";
import { PlotViewPage } from "./PlotViewPage";
import { exampleInputs } from "../plotting/presets/examplePlotInputs";

// TODO: add tests for example paths, other happy paths?

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
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
        path: "/plot",
        loader: plotViewLoader,
        hydrateFallbackElement: <div>Loading plot...</div>,
        element: <PlotViewPage />,
        errorElement: <PlotViewErrorBoundary />,
      },
      { path: "*", element: <NotFoundPage /> },
    ],
    { initialEntries },
  );

  return render(
    <MantineProvider defaultColorScheme="auto">
      <RouterProvider router={router} />
    </MantineProvider>,
  );
}

// Add tests that pages load successfully
describe("page rendering", () => {
  it("renders landing page", async () => {
    renderWithRouter(["/"]);

    expect(await screen.findByText("Gallery")).toBeTruthy();
  });

  it("renders create plot page", async () => {
    renderWithRouter(["/create"]);

    expect(
      // findByText doesn't work since there are two elements with this text
      await screen.findByRole("heading", {
        name: "Create a Plot",
        level: 1,
      }),
    ).toBeTruthy();
  });
});

describe("plot user flows", () => {
  it("opens an example plot without errors", async () => {
    const user = userEvent.setup();
    renderWithRouter(["/"]);

    await user.click(
      screen.getByRole("link", { name: exampleInputs[0].title }),
    );

    expect(await screen.findByText("Slide Positions Plot")).toBeTruthy();
  });

  it("creates a custom plot from create page input", async () => {
    const user = userEvent.setup();
    renderWithRouter(["/create"]);

    const notesInput = screen.getByLabelText(/Notes/);
    await user.clear(notesInput);
    await user.type(notesInput, "Bb2 C3 D4");
    await user.click(screen.getByRole("button", { name: "Create Plot" }));

    expect(await screen.findByText("Slide Positions Plot")).toBeTruthy();
  });

  it("shows not found page for invalid plot route", async () => {
    renderWithRouter(["/plot/not-a-real-plot"]);

    expect(await screen.findByText("Page Not Found")).toBeTruthy();
  });

  it("shows invalid config page for malformed custom route", async () => {
    renderWithRouter(["/plot?points=abc"]);

    expect(
      await screen.findByRole("heading", {
        name: "Invalid Plot Configuration",
      }),
    ).toBeTruthy();
  });
});
