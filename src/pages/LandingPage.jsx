import { Button, Group, Stack, Title } from "@mantine/core";
import { Link } from "react-router";
import { exampleInputs } from "../plotting/presets/examplePlotInputs";

export function LandingPage() {
  const params = new URLSearchParams(exampleInputs).toString();

  return (
    <Stack>
      <Title order={1}>Slide Position Plots</Title>
      <Group>
        <Button component={Link} to={`/plot?${params}`}>
          Open Example Plot
        </Button>
      </Group>
      <Button component={Link} to="/create" variant="outline">
        Create a Plot
      </Button>
    </Stack>
  );
}
