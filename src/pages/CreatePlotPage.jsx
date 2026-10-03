import { Stack, Text, Title } from "@mantine/core";
import PlotInputsForm from "../components/PlotInputsForm";

export function CreatePlotPage() {
  return (
    // TODO refactor single note inputs as "advanced" options
    <div>
      <Stack>
        <Title order={1}>Create Slide Positions</Title>
        <Text>
          Choose the notes to include and optionally provide information about
          your instrument.
        </Text>

        <PlotInputsForm submitLabel="View Slide Positions" />
      </Stack>
    </div>
  );
}
