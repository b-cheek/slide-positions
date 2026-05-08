import { Button, Stack, Title, Modal } from "@mantine/core";
import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { D3ScatterPlot } from "../components/D3ScatterPlot";
import { buildPlotModel } from "../plotting/parsing/utils";
import PlotInputsForm from "../components/PlotInputsForm";

export function PlotViewPage() {
  const { plotInputs } = useLoaderData();

  const [opened, setOpened] = useState(false);

  const model = useMemo(() => buildPlotModel(plotInputs), [plotInputs]);

  return (
    <Stack>
      <Title order={2}>Plot View</Title>
      <D3ScatterPlot model={model} width={800} height={600} />

      <Button onClick={() => setOpened(true)}>Edit Inputs</Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Edit Plot Inputs"
      >
        <PlotInputsForm onSubmit={() => setOpened(false)} submitLabel="Apply" />
      </Modal>

      <Button component={Link} to="/">
        Back to Gallery
      </Button>
    </Stack>
  );
}
