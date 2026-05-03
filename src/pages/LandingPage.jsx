import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";
import { exampleInputs } from "../plotting/presets/examplePlotInputs";

export function LandingPage() {
  const params = new URLSearchParams(exampleInputs).toString();

  return (
    <Stack>
      <Title order={1}>Plot Gallery</Title>
      <Text>This is the landing page route scaffold.</Text>
      <Group>
        <Button component={Link} to={`/plot?${params}`}>
          Open Example Plot
        </Button>
        <Button component={Link} to="/create" variant="outline">
          Create Plot
        </Button>
      </Group>
    </Stack>
  );
}
