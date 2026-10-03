import { Button, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";

export function InvalidPlotConfigPage({ message }) {
  // TODO: message
  return (
    <Stack>
      <Title order={1}>Invalid Inputs</Title>
      <Text>{message ?? "The URL is missing or has invalid inputs."}</Text>
      <Button component={Link} to="/create" style={{ width: "fit-content" }}>
        Back to Inputs
      </Button>
    </Stack>
  );
}
