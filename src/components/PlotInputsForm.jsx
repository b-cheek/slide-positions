import React from "react";
import { Button, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { plotInputsRawSchema } from "../plotting/parsing/plotInputsSchema";
import { placeholderInputs } from "../plotting/presets/examplePlotInputs";
import { readPlotInputRawValues } from "../plotting/parsing/utils";

function defaultsFromUrl() {
  if (typeof window === "undefined") return {};
  return readPlotInputRawValues(new URL(window.location.href).searchParams);
}

export function PlotInputsForm({
  defaultValues = {},
  onSubmit,
  submitLabel = "Submit",
}) {
  const resolvedDefaults = Object.keys(defaultValues).length
    ? defaultValues
    : { ...placeholderInputs, ...defaultsFromUrl() };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    defaultValues: { notesString: resolvedDefaults.notesString },
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(plotInputsRawSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Title order={3}>Plot Inputs</Title>

        <TextInput
          label="Notes"
          withAsterisk
          placeholder={resolvedDefaults.notesString}
          error={errors.notesString?.message}
          {...register("notesString")}
        />

        <TextInput
          label="Tunings (optional)"
          placeholder={resolvedDefaults.valvesString}
          error={errors.valvesString?.message}
          {...register("valvesString")}
        />

        <TextInput
          label="Top Slide Note (optional)"
          placeholder={resolvedDefaults.topSlideNote}
          error={errors.topSlideNote?.message}
          {...register("topSlideNote")}
        />

        <TextInput
          label="Bottom Slide Note (optional)"
          placeholder={resolvedDefaults.bottomSlideNote}
          error={errors.bottomSlideNote?.message}
          {...register("bottomSlideNote")}
        />

        <TextInput
          label="Lip Bend Start Note (optional)"
          placeholder={resolvedDefaults.lipBendStartNote}
          error={errors.lipBendStartNote?.message}
          {...register("lipBendStartNote")}
        />

        <TextInput
          label="Lip Bend Stop Note (optional)"
          placeholder={resolvedDefaults.lipBendStopNote}
          error={errors.lipBendStopNote?.message}
          {...register("lipBendStopNote")}
        />

        <TextInput
          label="Custom Title (optional)"
          placeholder="Bb/F Trombone"
          error={errors.title?.message}
          {...register("title")}
        />

        <Button type="submit" disabled={!isValid || isSubmitting}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}

export default PlotInputsForm;
