import { Stack, Text, Title } from "@mantine/core";
import PlotInputsForm from "../components/PlotInputsForm";

export function CreatePlotPage() {
  return (
    // TODO refactor single note inputs as "advanced" options
    <div>
      <Stack>
        <Title order={1}>Create a Plot</Title>
        <Text>
          Specify which notes to include and the plot, and optionally include
          information about your instrument.
        </Text>

        <PlotInputsForm submitLabel="Create Plot" />
      </Stack>
    </div>
  );
}
