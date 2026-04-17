import { Button, Stack, Text, Title } from "@mantine/core";
import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useParams } from "react-router";
import Plotly from "plotly.js-dist";
import {
  buildPlotFigure,
  getPresetPlotInputs,
  plotInputsSchema,
} from "../plots";
import NotFoundPage from "./NotFoundPage";

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
    const parsedInputs = plotInputsSchema.safeParse({
      points: Number(queryParams.get("points")),
    });

    if (!parsedInputs.success) {
      return null;
    }

    return parsedInputs.data;
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

  if (!plotInputs) {
    return <NotFoundPage />;
  }

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
