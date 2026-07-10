import {
  Button,
  Checkbox,
  Group,
  Stack,
  Title,
  Modal,
  Center,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useMemo, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { D3ScatterPlot } from "../components/D3ScatterPlot";
import { buildPlotModel } from "../plotting/parsing/utils";
import PlotInputsForm from "../components/PlotInputsForm";

export function PlotViewPage() {
  const { plotInputs } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [opened, setOpened] = useState(false);

  const model = useMemo(() => buildPlotModel(plotInputs), [plotInputs]);

  const { ref, width, height } = useElementSize();

  // 1. Derive viewOptions directly from searchParams (No useState or useEffect needed)
  const viewOptions = useMemo(
    () => ({
      showNoteLabels: searchParams.get("showNoteLabels") === "true",
      showOptimalSlidePath: searchParams.get("showOptimalSlidePath") === "true",
    }),
    [searchParams],
  );

  const handleViewOptionsChange = (e) => {
    const { name, checked } = e.currentTarget;
    const newParams = new URLSearchParams(searchParams);

    if (checked) {
      newParams.set(name, "true");
    } else {
      newParams.delete(name);
    }

    // 2. Just update the URL. React Router will trigger a re-render,
    // and viewOptions will automatically recalculate with the new params.
    setSearchParams(newParams);
  };

  return (
    <Stack ref={ref}>
      <Title order={1}>Slide Positions Plot</Title>
      <Center>
        <D3ScatterPlot
          model={model}
          viewOptions={viewOptions}
          width={width}
          height={height * 0.8}
        />
      </Center>

      <Center>
        <Group>
          <Button
            onClick={() => setOpened(true)}
            style={{ width: "fit-content" }}
          >
            Edit Inputs
          </Button>
          <Checkbox
            checked={viewOptions.showNoteLabels}
            onChange={handleViewOptionsChange}
            name="showNoteLabels"
            label="Show Individual Note Names"
            description="Show note name labels at each point"
          />
          <Checkbox
            checked={viewOptions.showOptimalSlidePath}
            onChange={handleViewOptionsChange}
            name="showOptimalSlidePath"
            label="Show optimal slide path"
            description="Show arrows indicating optimal slide movements to travel between input notes"
          />
        </Group>
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
