import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import InfoPopover from "./InfoPopover";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
});

afterEach(() => {
  cleanup();
});

describe("InfoPopover", () => {
  const renderInfoPopover = () =>
    render(
      <MantineProvider>
        <InfoPopover label="About tuning defaults">
          Defaulting to octave 1.
        </InfoPopover>
      </MantineProvider>,
    );

  it("opens contextual information when clicked", () => {
    renderInfoPopover();

    fireEvent.click(
      screen.getByRole("button", { name: "About tuning defaults" }),
    );

    return waitFor(() =>
      expect(screen.getByText("Defaulting to octave 1.")).toBeTruthy(),
    );
  });

  it("opens contextual information when activated", () => {
    renderInfoPopover();

    fireEvent.click(
      screen.getByRole("button", { name: "About tuning defaults" }),
    );

    return waitFor(() =>
      expect(screen.getByText("Defaulting to octave 1.")).toBeTruthy(),
    );
  });
});
