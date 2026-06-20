import { Button, Stack, Title, Modal, Center } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { D3ScatterPlot } from "../components/D3ScatterPlot";
import { buildPlotModel } from "../plotting/parsing/utils";
import PlotInputsForm from "../components/PlotInputsForm";

export function PlotViewPage() {
  const { plotInputs } = useLoaderData();

  const [opened, setOpened] = useState(false);

  const model = useMemo(() => buildPlotModel(plotInputs), [plotInputs]);

  const { ref, width, height } = useElementSize();

  return (
    <Stack ref={ref}>
      <Title order={1}>Slide Positions Plot</Title>
      <Center>
        <D3ScatterPlot model={model} width={width} height={height * 0.8} />
      </Center>

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
    </Stack>
  );
}
