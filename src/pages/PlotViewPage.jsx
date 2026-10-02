import { useEffect, useMemo, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import {
  Button,
  Checkbox,
  Group,
  Stack,
  Title,
  Modal,
  Box,
  Paper,
  Divider,
  Grid,
  Text,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { useElementSize, useFullscreenElement } from "@mantine/hooks";

import { D3ScatterPlot } from "../components/D3ScatterPlot";
import { ShareButton } from "../components/ShareButton";
import PlotInputsForm from "../components/PlotInputsForm";
import { buildPlotModel } from "../plotting/parsing/utils";

/**
 * Detects whether the browser actually supports the native Fullscreen API.
 * Some browsers (older Safari on iOS, some embedded webviews) either omit
 * the API entirely or report `fullscreenEnabled: false`, in which case we
 * fall back to a CSS-based "fake fullscreen" view instead.
 */
function useFullscreenSupport() {
  return useMemo(() => {
    if (typeof document === "undefined") return false;
    return Boolean(
      document.fullscreenEnabled ??
      document.webkitFullscreenEnabled ??
      document.mozFullScreenEnabled ??
      document.msFullscreenEnabled,
    );
  }, []);
}

// Three possible states the plot container can be in, spread directly onto
// <Paper> as props. Everything here uses Mantine's own style props (pos,
// top, left, w, h) rather than a raw `style` object — mixing the two for
// the same CSS property (e.g. pos="relative" alongside style={{ position:
// "fixed" }}) is what silently broke the fallback view before: the pos
// prop won, so it was never actually fixed.
const PLOT_VIEW_CONFIG = {
  normal: {
    p: "sm",
    radius: "md",
    h: "clamp(220px, min(75vh, 100vw), 720px)",
    withBorder: true,
    pos: "relative",
  },
  fullscreen: {
    p: "md",
    radius: 0,
    h: "100vh",
    withBorder: false,
    pos: "relative",
    style: { backgroundColor: "var(--mantine-color-body)" },
  },
  // Used when the native Fullscreen API isn't available: pinned to the
  // viewport with plain CSS instead of the browser's real fullscreen mode.
  fallback: {
    p: "md",
    radius: 0,
    h: "100dvh",
    withBorder: false,
    pos: "fixed",
    top: 0,
    left: 0,
    w: "100vw",
    style: { backgroundColor: "var(--mantine-color-body)", zIndex: 1000 },
  },
};

export function PlotViewPage() {
  const { plotInputs } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isFullscreenSupported = useFullscreenSupport();
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  // Target only the plot container element for native full-screen mode
  const {
    ref: fullscreenRef,
    toggle: toggleNativeFullscreen,
    fullscreen: isNativeFullscreen,
  } = useFullscreenElement();

  // Measure container dimensions for dynamic D3 rendering
  const { ref: sizeRef, width, height } = useElementSize();

  // Single source of truth for which of the 3 views we're in.
  const viewMode = isNativeFullscreen
    ? "fullscreen"
    : isFallbackActive
      ? "fallback"
      : "normal";
  const isExpanded = viewMode !== "normal";
  const viewConfig = PLOT_VIEW_CONFIG[viewMode];

  const toggleFullscreen = () => {
    if (isFullscreenSupported) {
      toggleNativeFullscreen();
    } else {
      setIsFallbackActive((prev) => !prev);
    }
  };

  // The fallback view has no browser chrome/gesture to exit with, so wire
  // up Escape manually to mirror native fullscreen behavior.
  useEffect(() => {
    if (!isFallbackActive) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsFallbackActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFallbackActive]);

  // The overlay covers the viewport visually, but the page underneath can
  // still scroll unless we lock it — which would be jarring on exit.
  useEffect(() => {
    if (!isFallbackActive) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isFallbackActive]);

  const model = useMemo(() => buildPlotModel(plotInputs), [plotInputs]);

  // Derive view options directly from URL search parameters
  const viewOptions = useMemo(
    () => ({
      showNoteLabels: searchParams.get("showNoteLabels") === "true",
      showOptimalSlidePath: searchParams.get("showOptimalSlidePath") === "true",
    }),
    [searchParams],
  );

  const handleViewOptionToggle = ({ currentTarget: { name, checked } }) => {
    const next = new URLSearchParams(searchParams);
    if (checked) {
      next.set(name, "true");
    } else {
      next.delete(name);
    }
    setSearchParams(next);
  };

  const plotPaper = (
    <Paper ref={fullscreenRef} {...viewConfig}>
      {/* Quick action button positioned over the chart */}
      <Tooltip label={isExpanded ? "Exit Fullscreen" : "Fullscreen Plot"}>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label={
            isExpanded ? "Exit fullscreen plot" : "View fullscreen plot"
          }
          onClick={toggleFullscreen}
          size="sm"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
          }}
        >
          {isExpanded ? "✕" : "⛶"}
        </ActionIcon>
      </Tooltip>

      {/* Container measured for D3 responsiveness */}
      <Box ref={sizeRef} w="100%" h="100%">
        {width > 0 && height > 0 && (
          <D3ScatterPlot
            model={model}
            viewOptions={viewOptions}
            width={width}
            height={height}
          />
        )}
      </Box>
    </Paper>
  );

  return (
    <Stack gap="lg" w="100%" p="md">
      {/* Page Header */}
      <Group justify="space-between" align="center">
        <Title order={2}>Slide Positions Plot</Title>
        <Group gap="xs">
          <Button onClick={() => setIsModalOpen(true)}>Edit Inputs</Button>
          <ShareButton
            title="Slide Positions Plot"
            text="Check out this slide positions plot!"
            url={typeof window !== "undefined" ? window.location.href : ""}
          />
        </Group>
      </Group>

      <Divider />

      {/* Main Content Layout */}
      <Grid gutter="lg" align="stretch">
        {/* Plot Visualization Area */}
        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>{plotPaper}</Grid.Col>

        {/* Controls & Options Sidebar */}
        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
          <Paper p="md" radius="md" withBorder h="100%">
            <Stack gap="md">
              <Text fw={600} size="sm" c="dimmed" tt="uppercase">
                Display Options
              </Text>

              <Checkbox
                name="showNoteLabels"
                label="Note Names"
                description="Labels on data points"
                checked={viewOptions.showNoteLabels}
                onChange={handleViewOptionToggle}
              />

              <Checkbox
                name="showOptimalSlidePath"
                label="Optimal Slide Path"
                description="Show arrows to indicate efficient slide movements"
                checked={viewOptions.showOptimalSlidePath}
                onChange={handleViewOptionToggle}
              />

              <Divider my="xs" />

              <Button
                variant="outline"
                color="gray"
                onClick={toggleFullscreen}
                fullWidth
              >
                {isExpanded ? "Exit Fullscreen Mode" : "View Fullscreen Plot"}
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Edit Inputs Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Plot Inputs"
        centered
      >
        <PlotInputsForm
          onSubmit={() => setIsModalOpen(false)}
          submitLabel="Apply"
        />
      </Modal>
    </Stack>
  );
}
