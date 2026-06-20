import { Button, Stack, Title, Modal, Center } from "@mantine/core";
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
      <Title order={1}>Slide Positions Plot</Title>
      <D3ScatterPlot model={model} width={800} height={600} />

      <Center>
        <Button
          onClick={() => setOpened(true)}
          style={{ width: "fit-content" }}
        >
          Edit Inputs
        </Button>
      </Center>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Edit Plot Inputs"
      >
        <PlotInputsForm
          // TODO: get default values from current plot inputs
          // defaultValues={}
          onSubmit={() => setOpened(false)}
          submitLabel="Apply"
        />
      </Modal>
      <Button component={Link} to="/" style={{ width: "fit-content" }}>
        Home
      </Button>
    </Stack>
  );
}
