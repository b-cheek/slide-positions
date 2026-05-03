import { plotInputsSchema } from "../plotting";

export function plotViewLoader({ request }) {
  // Pass raw input for reuse in modal
  const url = new URL(request.url);
  const raw = {
    notesString: url.searchParams.get("notesString") ?? undefined,
    valvesString: url.searchParams.get("valvesString") ?? undefined,
    topSlideNote: url.searchParams.get("topSlideNote") ?? undefined,
    bottomSlideNote: url.searchParams.get("bottomSlideNote") ?? undefined,
    lipBendStartNote: url.searchParams.get("lipBendStartNote") ?? undefined,
    lipBendStopNote: url.searchParams.get("lipBendStopNote") ?? undefined,
  };

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
