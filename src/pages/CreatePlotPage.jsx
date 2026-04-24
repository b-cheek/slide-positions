import { Button, Stack, Text, TextInput, Title } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { plotInputsSchema } from "../plots";

export function CreatePlotPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    defaultValues: {
      notesString: "Bb2 C3 D4",
      valvesString: "Bb/F",
      topSlideNote: "Bb1",
      bottomSlideNote: "E1",
      lipBendStartNote: "Bb1",
      lipBendStopNote: "F1",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(plotInputsSchema),
  });

  const handleCreatePlot = (values) => {
    const params = new URLSearchParams(values);
    navigate(`/plot/custom?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(handleCreatePlot)}>
      <Stack>
        <Title order={2}>Create Plot</Title>
        <Text>Configure notes, trombone tuning, and player limits.</Text>
        <TextInput
          label="Notes"
          withAsterisk
          error={errors.notesString?.message}
          {...register("notesString")}
        />
        <TextInput
          label="Tunings"
          withAsterisk
          error={errors.valvesString?.message}
          {...register("valvesString")}
        />
        <TextInput
          label="Top Slide Note"
          withAsterisk
          error={errors.topSlideNote?.message}
          {...register("topSlideNote")}
        />
        <TextInput
          label="Bottom Slide Note"
          withAsterisk
          error={errors.bottomSlideNote?.message}
          {...register("bottomSlideNote")}
        />
        <TextInput
          label="Lip Bend Start Note"
          withAsterisk
          error={errors.lipBendStartNote?.message}
          {...register("lipBendStartNote")}
        />
        <TextInput
          label="Lip Bend Stop Note"
          withAsterisk
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
