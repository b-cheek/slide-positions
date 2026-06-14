import { Button, Group, Stack, Title } from "@mantine/core";
import { Link } from "react-router";
import { exampleInputs } from "../plotting/presets/examplePlotInputs";

export function LandingPage() {
  const examplePlots = exampleInputs.map((inputs) => {
    const params = new URLSearchParams(inputs).toString();
    return (
      <Button key={params} component={Link} to={`/plot?${params}`}>
        {inputs.title ?? "Example Plot"}
      </Button>
    );
  });

  return (
    <Stack>
      <Title order={1}>Slide Position Plots</Title>
      <Group>{examplePlots}</Group>
      <Button component={Link} to="/create" variant="outline">
        Create a Plot
      </Button>
    </Stack>
  );
}
