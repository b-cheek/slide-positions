import { Button, Group, Stack, Title } from "@mantine/core";
import { Link } from "react-router";
import { exampleInputs } from "../plotting/presets/examplePlotInputs";

export function LandingPage() {
  return (
    <Stack>
      <Title order={1}>Gallery</Title>

      <Group>
        {exampleInputs.map((inputs) => {
          const params = new URLSearchParams(
            Object.entries(inputs).filter(([, v]) => v),
          );

          return (
            <Button key={inputs.title} component={Link} to={`/plot?${params}`}>
              {inputs.title ?? "Example Plot"}
            </Button>
          );
        })}
      </Group>

      <Button
        component={Link}
        to="/create"
        variant="outline"
        style={{ width: "fit-content" }}
      >
        Create a Plot
      </Button>
    </Stack>
  );
}
