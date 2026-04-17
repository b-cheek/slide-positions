import { Button, NumberInput, Stack, Text, Title } from "@mantine/core";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

function CreatePlotPage() {
  const navigate = useNavigate();
  const [pointCount, setPointCount] = useState();

  const handleCreatePlot = () => {
    navigate(`/plot/custom?points=${Math.floor(pointCount)}`);
  };

  return (
    <Stack>
      <Title order={2}>Create Plot</Title>
      <Text>Proof of concept: one input controls the generated plot.</Text>
      <NumberInput
        label="Point count"
        value={pointCount}
        onChange={setPointCount}
      />
      <Button onClick={handleCreatePlot}>Create Plot</Button>
      <Button component={Link} to="/">
        Back to Gallery
      </Button>
    </Stack>
  );
}

export default CreatePlotPage;
