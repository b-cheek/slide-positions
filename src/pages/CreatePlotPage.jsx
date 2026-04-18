import { Button, NumberInput, Stack, Text, Title } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { plotInputsSchema } from "../plots";

export function CreatePlotPage() {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    defaultValues: { points: 20 },
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(plotInputsSchema),
  });

  const handleCreatePlot = ({ points }) => {
    navigate(`/plot/custom?points=${points}`);
  };

  return (
    <form onSubmit={handleSubmit(handleCreatePlot)}>
      <Stack>
        <Title order={2}>Create Plot</Title>
        <Text>Proof of concept: one input controls the generated plot.</Text>
        <Controller
          name="points"
          control={control}
          render={({ field }) => (
            <NumberInput
              label="Point count"
              withAsterisk
              value={field.value ?? ""}
              onBlur={field.onBlur}
              onChange={field.onChange}
              error={errors.points?.message}
            />
          )}
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
