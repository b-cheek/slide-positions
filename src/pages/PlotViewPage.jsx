import { useState, useMemo } from "react";
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

export function PlotViewPage() {
  const { plotInputs } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Target only the plot container element for native full-screen mode
  const {
    ref: fullscreenRef,
    toggle: toggleFullscreen,
    fullscreen,
  } = useFullscreenElement();

  // Measure container dimensions for dynamic D3 rendering
  const { ref: sizeRef, width, height } = useElementSize();

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
        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
          <Paper
            ref={fullscreenRef}
            p={fullscreen ? "md" : "sm"}
            radius={fullscreen ? 0 : "md"}
            withBorder={!fullscreen}
            h={fullscreen ? "100vh" : 500}
            pos="relative"
            style={{
              backgroundColor: fullscreen
                ? "var(--mantine-color-body)"
                : undefined,
            }}
          >
            {/* Quick action button positioned over the chart */}
            <Tooltip label={fullscreen ? "Exit Fullscreen" : "Fullscreen Plot"}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={toggleFullscreen}
                size="sm"
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 10,
                }}
              >
                {fullscreen ? "✕" : "⛶"}
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
        </Grid.Col>

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
                {fullscreen ? "Exit Fullscreen Mode" : "View Fullscreen Plot"}
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
