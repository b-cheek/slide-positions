import React from "react";
import {
  Accordion,
  Button,
  Blockquote,
  Stack,
  TextInput,
  Title,
  Center,
  Group,
  Code,
  useComputedColorScheme,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate } from "react-router";
import { plotInputsRawSchema } from "../plotting/parsing/plotInputsSchema";
import { placeholderInputs } from "../plotting/presets/examplePlotInputs";
import { readPlotInputRawValues } from "../plotting/parsing/utils";
import InfoPopover from "./InfoPopover";
import InfoIcon from "./svgIcons/InfoIcon";
import InputsHelpModal from "./InputsHelpModal";

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

  const isDark = useComputedColorScheme() === "dark";
  const codeColor = isDark ? "var(--mantine-color-gray-8)" : undefined;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing="md">
        <Group position="apart" align="center">
          <Title order={3}>Inputs</Title>
          <InputsHelpModal />
        </Group>

        <TextInput
          label="Notes"
          withAsterisk
          // TODO: accept other notations?
          description="Notes in scientific pitch notation"
          placeholder={placeholderInputs.notesString}
          error={errors.notesString?.message}
          rightSection={
            <InfoPopover label="About notes input">
              Ranges are supported using a{" "}
              {/* code color to work in both light and dark mode */}
              <Code color={codeColor}>start-end</Code> syntax. This works for
              ascending or descending. You can specify a key in parentheses
              after to include only notes in that major key:{" "}
              <Code color={codeColor}>start-end(key)</Code>.
            </InfoPopover>
          }
          {...register("notesString")}
        />

        <TextInput
          label="Tuning(s) (optional)"
          description="The first fundamental pitch of the instrument for each tuning"
          placeholder={placeholderInputs.valvesString}
          error={errors.valvesString?.message}
          rightSection={
            <InfoPopover label="About tuning defaults">
              Defaults to octave 1 in line with typical Bb, F, Gb, D tunings.
              Otherwise specify in scientific notation, like Eb2 for alto
              trombone.
            </InfoPopover>
          }
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
                <Blockquote mt="sm" icon={<InfoIcon />}>
                  The following two inputs define the length of your slide, and
                  where you keep first position. It is important for this
                  measurement that you play in the open tuning of your
                  instrument, in a partial that starts with that note. For a Bb
                  trombone for example, play any of the partials Bb to E in any
                  octave.
                </Blockquote>
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

                <Blockquote mt="md" icon={<InfoIcon />}>
                  The last two inputs define the range of your lip bend. Since
                  this is tracked in frequency rather than pitch, it should
                  scale somewhat appropriately between low and high registers,
                  but measure this in a register you are most likely to bend.
                  Lip bends are only presented when there is no available
                  position without lip bending.
                </Blockquote>
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
