import { Button, Stack, Text, Title } from "@mantine/core";
import { Link, useNavigate } from "react-router";
import { placeholderInputs } from "../plotting/presets/examplePlotInputs";
import PlotInputsForm from "../components/PlotInputsForm";

export function CreatePlotPage() {
  const navigate = useNavigate();

  const handleCreatePlot = (values) => {
    const params = new URLSearchParams(values);
    navigate(`/plot/custom?${params.toString()}`);
  };

  return (
    // TODO refactor single note inputs as "advanced" options
    <div>
      <Stack>
        <Title order={2}>Create Plot</Title>
        <Text>
          Enter notes. Trombone and player defaults are applied automatically.
        </Text>

        <PlotInputsForm onSubmit={handleCreatePlot} submitLabel="Create Plot" />

        <Button component={Link} to="/">
          Back to Gallery
        </Button>
      </Stack>
    </div>
  );
}
