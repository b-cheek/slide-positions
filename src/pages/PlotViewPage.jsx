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
    if (!plotId) {
      return null;
    }

    if (plotId !== "custom") {
      return getPresetPlotInputs(plotId) ?? null;
    }

    const queryParams = new URLSearchParams(location.search);
    const pointsFromUrl = Number(queryParams.get("points"));

    if (Number.isFinite(pointsFromUrl) && pointsFromUrl > 0) {
      return { points: Math.floor(pointsFromUrl) };
    }

    return null;
  }, [location.search, plotId]);

  const figure = useMemo(() => {
    if (!plotInputs) {
      return null;
    }

    return buildPlotFigure(plotInputs);
  }, [plotInputs]);

  useEffect(() => {
    if (!plotContainerRef.current || !figure) {
      return;
    }

    Plotly.newPlot(plotContainerRef.current, figure.data, figure.layout);
  }, [figure]);

  return (
    <Stack>
      <Title order={2}>Plot View</Title>
      <Text>Viewing plot: {plotId}</Text>
      {plotInputs ? (
        <Text>Point count: {plotInputs.points}</Text>
      ) : (
        <Text>No plot inputs found for this route.</Text>
      )}
      <div ref={plotContainerRef} />
      <Button component={Link} to="/">
        Back to Gallery
      </Button>
    </Stack>
  );
}

export default PlotViewPage;
