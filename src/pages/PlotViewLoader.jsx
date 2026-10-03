import { plotInputsSchema } from "../plotting";
import { readPlotInputRawValues } from "../plotting/parsing/utils";

export function plotViewLoader({ request }) {
  const url = new URL(request.url);
  const raw = readPlotInputRawValues(url.searchParams);

  const parsedInputs = plotInputsSchema.safeParse(raw);

  if (!parsedInputs.success) {
    throw new Response(
      // TODO: message
      "The URL is missing or has invalid inputs.",
      {
        status: 400,
        // TODO: message
        statusText: "Invalid Inputs",
      },
    );
  }

  return { rawPlotInputs: raw, plotInputs: parsedInputs.data };
}
