import { Button, Stack, Text, Title } from "@mantine/core";
import { useEffect, useMemo, useRef } from "react";
import { Link, useLoaderData } from "react-router";
import Plotly from "plotly.js-dist";
import { buildPlotFigure } from "../plotting";

export function PlotViewPage() {
  const { plotId, plotInputs } = useLoaderData();
  const plotContainerRef = useRef(null);

  const figure = useMemo(() => buildPlotFigure(plotInputs), [plotInputs]);

  useEffect(() => {
    const plotContainer = plotContainerRef.current;

    if (!plotContainer) {
      return;
    }

    Plotly.newPlot(plotContainer, figure.data, figure.layout);

    return () => {
      Plotly.purge(plotContainer);
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
