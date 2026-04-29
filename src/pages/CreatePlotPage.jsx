import { Button, Stack, Text, TextInput, Title } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { examplePlotInputs } from "../plots/presets/examplePlotInputs";
import { plotInputsRawSchema } from "../plots/types/plotInputsSchema";

export function CreatePlotPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    defaultValues: {
      // TODO: is this being used?
      notesString: "Bb2 C3 D4",
      ...examplePlotInputs,
    },
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(plotInputsRawSchema),
  });

  const handleCreatePlot = (values) => {
    const params = new URLSearchParams(values);
    navigate(`/plot/custom?${params.toString()}`);
  };

  return (
    // TODO refactor single note inputs as "advanced" options
    // TODO allow no input for options?
    <form onSubmit={handleSubmit(handleCreatePlot)}>
      <Stack>
        <Title order={2}>Create Plot</Title>
        <Text>
          Enter notes. Trombone and player defaults are applied automatically.
        </Text>
        <TextInput
          label="Notes"
          withAsterisk
          error={errors.notesString?.message}
          {...register("notesString")}
        />
        <TextInput
          label="Tunings (optional)"
          placeholder="Bb/F"
          error={errors.valvesString?.message}
          {...register("valvesString")}
        />
        <TextInput
          label="Top Slide Note (optional)"
          placeholder="Bb1"
          error={errors.topSlideNote?.message}
          {...register("topSlideNote")}
        />
        <TextInput
          label="Bottom Slide Note (optional)"
          placeholder="E1"
          error={errors.bottomSlideNote?.message}
          {...register("bottomSlideNote")}
        />
        <TextInput
          label="Lip Bend Start Note (optional)"
          placeholder="Bb1"
          error={errors.lipBendStartNote?.message}
          {...register("lipBendStartNote")}
        />
        <TextInput
          label="Lip Bend Stop Note (optional)"
          placeholder="F1"
          error={errors.lipBendStopNote?.message}
          {...register("lipBendStopNote")}
        />
        <Button type="submit" disabled={!isValid || isSubmitting}>
          Create Plot
        </Button>
        <Button component={Link} to="/">
          Back to Gallery
        </Button>
      </Stack>
    </form>
  );
}
