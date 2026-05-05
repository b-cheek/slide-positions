import { plotInputsSchema } from "../plotting";
import { readPlotInputRawValues } from "../plotting/utils/plotInputUrl";

export function plotViewLoader({ request }) {
  // Pass raw input for reuse in modal
  const url = new URL(request.url);
  const raw = readPlotInputRawValues(url.searchParams);

  const parsedInputs = plotInputsSchema.safeParse(raw);

  if (!parsedInputs.success) {
    throw new Response(
      // TODO: message
      "The custom plot URL is missing or has invalid inputs.",
      {
        status: 400,
        // TODO: message
        statusText: "Invalid Plot Configuration",
      },
    );
  }

  return { rawPlotInputs: raw, plotInputs: parsedInputs.data };
}
