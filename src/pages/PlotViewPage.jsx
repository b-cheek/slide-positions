import { Button, Stack, Text, Title } from "@mantine/core";
import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useParams } from "react-router";
import Plotly from "plotly.js-dist";
import { buildPlotFigure, getPresetPlotInputs } from "../plots";

function PlotViewPage() {
  const { plotId } = useParams();
  const location = useLocation();
  const plotContainerRef = useRef(null);

  const plotInputs = useMemo(() => {
    if (plotId !== "custom") {
      return getPresetPlotInputs(plotId);
    }

    const queryParams = new URLSearchParams(location.search);
    const pointsFromUrl = Number(queryParams.get("points"));

    return { points: Math.floor(pointsFromUrl) };
  }, [location.search, plotId]);

  const figure = useMemo(() => buildPlotFigure(plotInputs), [plotInputs]);

  useEffect(() => {
    if (!plotContainerRef.current) {
      return;
    }

    Plotly.newPlot(plotContainerRef.current, figure.data, figure.layout);
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
