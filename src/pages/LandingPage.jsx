import { Button, Group, Stack, Title } from "@mantine/core";
import { Link } from "react-router";
import { exampleInputs } from "../plotting/presets/examplePlotInputs";
import { SlidePositionsIcon } from "../components/SlidePositionsIcon";

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
      <Title order={1}>
        <SlidePositionsIcon
          size="1.75em"
          style={{ verticalAlign: "-0.5em", marginRight: "0.2em" }}
        />
        SlidePositions
      </Title>

      <Group>{examplePlots}</Group>
      <Button component={Link} to="/create" variant="outline">
        Create a Plot
      </Button>
    </Stack>
  );
}
