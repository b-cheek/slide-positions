import { Button, Stack, Text, Title, Modal } from "@mantine/core";
import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { D3ScatterPlot } from "../components/D3ScatterPlot";
import { buildPlotModel } from "../plotting/processing/utils/buildPlotFigure";
import PlotInputsForm from "../components/PlotInputsForm";
import { plotInputsSchema } from "../plotting/types/plotInputsSchema";

export function PlotViewPage() {
  const { plotId, plotInputs, rawPlotInputs } = useLoaderData();

  const [currentParsedInputs, setCurrentParsedInputs] = useState(plotInputs);
  const [opened, setOpened] = useState(false);

  const model = useMemo(
    () => buildPlotModel(currentParsedInputs),
    [currentParsedInputs],
  );

  // TODO: fix modal and write tests (values not being what they should)
  const handleEditSubmit = (values) => {
    // Parse raw values through schema to get parsed inputs
    const parsed = plotInputsSchema.parse(values);
    setCurrentParsedInputs(parsed);
    setOpened(false);
  };

  return (
    <Stack>
      <Title order={2}>Plot View</Title>
      <Text>Viewing plot: {plotId}</Text>
      <D3ScatterPlot model={model} width={800} height={600} />

      <Button onClick={() => setOpened(true)}>Edit Inputs</Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Edit Plot Inputs"
      >
        <PlotInputsForm onSubmit={handleEditSubmit} submitLabel="Apply" />
      </Modal>

      <Button component={Link} to="/">
        Back to Gallery
      </Button>
    </Stack>
  );
}
