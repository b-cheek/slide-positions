import React from "react";
import { Button, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { plotInputsRawSchema } from "../plotting/parsing/plotInputsSchema";
import { placeholderInputs } from "../plotting/presets/examplePlotInputs";
import { readPlotInputRawValues } from "../plotting/parsing/utils";

export function PlotInputsForm({ onSubmit, submitLabel = "Submit" }) {
  const navigate = useNavigate();

  const currentValues = {
    ...readPlotInputRawValues(new URL(window.location.href).searchParams),
    notesString: placeholderInputs.notesString,
  };

  const handleFormSubmit = (values) => {
    onSubmit?.(values);
    const params = new URLSearchParams(values);
    navigate(`/plot?${params.toString()}`);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    defaultValues: { ...currentValues },
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(plotInputsRawSchema),
  });

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack>
        <Title order={3}>Plot Inputs</Title>

        <TextInput
          label="Notes"
          withAsterisk
          placeholder={placeholderInputs.notesString}
          error={errors.notesString?.message}
          {...register("notesString")}
        />

        <TextInput
          label="Tunings (optional)"
          placeholder={placeholderInputs.valvesString}
          error={errors.valvesString?.message}
          {...register("valvesString")}
        />

        <TextInput
          label="Top Slide Note (optional)"
          placeholder={placeholderInputs.topSlideNote}
          error={errors.topSlideNote?.message}
          {...register("topSlideNote")}
        />

        <TextInput
          label="Bottom Slide Note (optional)"
          placeholder={placeholderInputs.bottomSlideNote}
          error={errors.bottomSlideNote?.message}
          {...register("bottomSlideNote")}
        />

        <TextInput
          label="Lip Bend Start Note (optional)"
          placeholder={placeholderInputs.lipBendStartNote}
          error={errors.lipBendStartNote?.message}
          {...register("lipBendStartNote")}
        />

        <TextInput
          label="Lip Bend Stop Note (optional)"
          placeholder={placeholderInputs.lipBendStopNote}
          error={errors.lipBendStopNote?.message}
          {...register("lipBendStopNote")}
        />

        <TextInput
          label="Custom Title (optional)"
          // TODO: rework the title for more consistency alongside dynamic defaults
          placeholder="Bb/F Trombone Slide Positions"
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
