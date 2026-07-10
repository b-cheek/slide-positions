import React from "react";
import {
  Accordion,
  Button,
  Stack,
  TextInput,
  Title,
  Center,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router";
import { useNavigate } from "react-router";
import { plotInputsRawSchema } from "../plotting/parsing/plotInputsSchema";
import { placeholderInputs } from "../plotting/presets/examplePlotInputs";
import { readPlotInputRawValues } from "../plotting/parsing/utils";

export function PlotInputsForm({ onSubmit, submitLabel = "Submit" }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawValues = readPlotInputRawValues(searchParams);

  const currentValues = {
    ...rawValues,
    notesString: rawValues.notesString ?? placeholderInputs.notesString,
  };

  const handleFormSubmit = (values) => {
    onSubmit?.(values);
    const newParams = new URLSearchParams(searchParams.toString());
    // Remove plot input keys and set submitted values; preserve view flags.
    Object.keys(readPlotInputRawValues(newParams)).forEach((k) =>
      newParams.delete(k),
    );
    Object.entries(values).forEach(([k, v]) =>
      v ? newParams.set(k, String(v)) : newParams.delete(k),
    );
    navigate(`/plot?${newParams.toString()}`);
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
          // TODO: accept other notations?
          description="The notes to plot in scientific pitch notation"
          placeholder={placeholderInputs.notesString}
          error={errors.notesString?.message}
          {...register("notesString")}
        />

        <TextInput
          label="Tuning(s) (optional)"
          description="The fundamental pitch of the instrument with "
          placeholder={placeholderInputs.valvesString}
          error={errors.valvesString?.message}
          {...register("valvesString")}
        />

        <TextInput
          label="Custom Title (optional)"
          placeholder="Bb/F Trombone Slide Positions"
          error={errors.title?.message}
          {...register("title")}
        />

        <Accordion variant="unstyled">
          <Accordion.Item value="advancedOptions">
            <Accordion.Control>Advanced Options</Accordion.Control>

            <Accordion.Panel>
              <Stack>
                <TextInput
                  label="Top Slide Note (optional)"
                  description="The note when the slide is all the way in"
                  placeholder={placeholderInputs.topSlideNote}
                  error={errors.topSlideNote?.message}
                  {...register("topSlideNote")}
                />

                <TextInput
                  label="Bottom Slide Note (optional)"
                  description="The note when the slide is all the way out"
                  placeholder={placeholderInputs.bottomSlideNote}
                  error={errors.bottomSlideNote?.message}
                  {...register("bottomSlideNote")}
                />

                <TextInput
                  label="Lip Bend Start Note (optional)"
                  description="The note you are starting the lip bend from"
                  placeholder={placeholderInputs.lipBendStartNote}
                  error={errors.lipBendStartNote?.message}
                  {...register("lipBendStartNote")}
                />

                <TextInput
                  label="Lip Bend Stop Note (optional)"
                  description="The lowest note you can bend down to"
                  placeholder={placeholderInputs.lipBendStopNote}
                  error={errors.lipBendStopNote?.message}
                  {...register("lipBendStopNote")}
                />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <Center>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            style={{ width: "fit-content" }}
          >
            {submitLabel}
          </Button>
        </Center>
      </Stack>
    </form>
  );
}

export default PlotInputsForm;
