import { Button, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";
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

        <Button component={Link} to="/" style={{ width: "fit-content" }}>
          Home
        </Button>
      </Stack>
    </div>
  );
}
