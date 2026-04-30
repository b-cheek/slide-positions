import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";

export function LandingPage() {
  return (
    <Stack>
      <Title order={1}>Plot Gallery</Title>
      <Text>This is the landing page route scaffold.</Text>
      <Group>
        <Button component={Link} to="/plot/Bb-scale-default">
          Open Example Plot
        </Button>
        <Button component={Link} to="/create" variant="outline">
          Create Plot
        </Button>
      </Group>
    </Stack>
  );
}
