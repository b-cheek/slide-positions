import { Button, Stack, Text, Title } from "@mantine/core";
import { useEffect, useMemo, useRef } from "react";
import { Link, useLoaderData } from "react-router";
import Plotly from "plotly.js-dist";
import {
  buildPlotFigure,
  getPresetPlotInputs,
  plotInputsSchema,
} from "../plots";

export function plotViewLoader({ params, request }) {
  const plotId = params.plotId;

  if (!plotId) {
    throw new Response("Plot route not found", { status: 404 });
  }

  if (plotId !== "custom") {
    const presetInputs = getPresetPlotInputs(plotId);
    if (!presetInputs) {
      throw new Response("Plot preset not found", { status: 404 });
    }

    return { plotId, plotInputs: presetInputs };
  }

  const url = new URL(request.url);
  const parsedInputs = plotInputsSchema.safeParse({
    points: Number(url.searchParams.get("points")),
  });

  if (!parsedInputs.success) {
    throw new Response(
      "The custom plot URL is missing or has invalid inputs.",
      {
        status: 400,
        statusText: "Invalid Plot Configuration",
      },
    );
  }

  return { plotId, plotInputs: parsedInputs.data };
}

function PlotViewPage() {
  const { plotId, plotInputs } = useLoaderData();
  const plotContainerRef = useRef(null);

  const figure = useMemo(() => buildPlotFigure(plotInputs), [plotInputs]);

  useEffect(() => {
    if (!plotContainerRef.current) {
      return;
    }

    Plotly.newPlot(plotContainerRef.current, figure.data, figure.layout);

    return () => {
      if (plotContainerRef.current) {
        Plotly.purge(plotContainerRef.current);
      }
    };
  }, [figure]);

  return (
    <Stack>
      <Title order={2}>Plot View</Title>
      <Text>Viewing plot: {plotId}</Text>
      <div ref={plotContainerRef} />
      <Button component={Link} to="/">
        Back to Gallery
      </Button>
    </Stack>
  );
}

export default PlotViewPage;
