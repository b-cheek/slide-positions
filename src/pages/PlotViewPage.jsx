import { Button, Stack, Text, Title } from "@mantine/core";
import { useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import { D3ScatterPlot } from "../components/D3ScatterPlot";
import { buildPlotModel } from "../plotting/processing/utils/buildPlotFigure";

export function PlotViewPage() {
  const { plotId, plotInputs } = useLoaderData();

  const model = useMemo(() => buildPlotModel(plotInputs), [plotInputs]);

  return (
    <Stack>
      <Title order={2}>Plot View</Title>
      <Text>Viewing plot: {plotId}</Text>
      <D3ScatterPlot model={model} width={800} height={600} />
      <Button component={Link} to="/">
        Back to Gallery
      </Button>
    </Stack>
  );
}
