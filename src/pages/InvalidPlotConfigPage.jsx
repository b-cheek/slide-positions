import { Button, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";

export function InvalidPlotConfigPage({ message }) {
  // TODO: message
  return (
    <Stack>
      <Title order={1}>Invalid Plot Configuration</Title>
      <Text>
        {message ?? "The custom plot URL is missing or has invalid inputs."}
      </Text>
      <Button component={Link} to="/create">
        Create a Plot
      </Button>
    </Stack>
  );
}
