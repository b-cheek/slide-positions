import { Button, Stack, Text, Title } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import Plotly from "plotly.js-dist";
import { buildPlotFigure, getPresetPlotInputs } from "../plots";

function resolvePlotInputs(plotId, search) {
  if (!plotId) {
    return {
      plotInputs: null,
      errorMessage: "Missing plot id in route.",
    };
  }

  if (plotId !== "custom") {
    const presetInputs = getPresetPlotInputs(plotId);

    if (!presetInputs) {
      return {
        plotInputs: null,
        errorMessage: `Unknown preset plot: ${plotId}.`,
      };
    }

    return {
      plotInputs: presetInputs,
      errorMessage: null,
    };
  }

  const queryParams = new URLSearchParams(search);
  const pointsFromUrl = Number(queryParams.get("points"));

  if (!Number.isFinite(pointsFromUrl) || pointsFromUrl <= 0) {
    return {
      plotInputs: null,
      errorMessage: "Custom plot requires a positive points query parameter.",
    };
  }

  return {
    plotInputs: { points: Math.floor(pointsFromUrl) },
    errorMessage: null,
  };
}

function PlotViewPage() {
  const { plotId } = useParams();
  const location = useLocation();
  const plotContainerRef = useRef(null);
  const [renderError, setRenderError] = useState(null);

  const resolution = useMemo(() => {
    return resolvePlotInputs(plotId, location.search);
  }, [location.search, plotId]);

  const plotInputs = resolution.plotInputs;

  const figure = useMemo(() => {
    if (!plotInputs) {
      return null;
    }

    return buildPlotFigure(plotInputs);
  }, [plotInputs]);

  useEffect(() => {
    setRenderError(null);

    if (!plotContainerRef.current || !figure) {
      return;
    }

    Promise.resolve(
      Plotly.newPlot(plotContainerRef.current, figure.data, figure.layout),
    ).catch(() => {
      setRenderError(
        "Plot rendering failed. Verify input values and try again.",
      );
    });
  }, [figure]);

  return (
    <Stack>
      <Title order={2}>Plot View</Title>
      <Text>Viewing plot: {plotId}</Text>
      {resolution.errorMessage ? <Text>{resolution.errorMessage}</Text> : null}
      {renderError ? <Text>{renderError}</Text> : null}
      {plotInputs ? <Text>Point count: {plotInputs.points}</Text> : null}
      <div ref={plotContainerRef} />
      <Button component={Link} to="/">
        Back to Gallery
      </Button>
    </Stack>
  );
}

export default PlotViewPage;
