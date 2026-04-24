import { getPresetPlotInputs, plotInputsSchema } from "../plots";

export function plotViewLoader({ params, request }) {
  const plotId = params.plotId;

  if (!plotId) {
    // TODO: message
    throw new Response("Plot route not found", { status: 404 });
  }

  if (plotId !== "custom") {
    const presetInputs = getPresetPlotInputs(plotId);
    if (!presetInputs) {
      // TODO: message
      throw new Response("Plot preset not found", { status: 404 });
    }

    return { plotId, plotInputs: presetInputs };
  }

  const url = new URL(request.url);
  const parsedInputs = plotInputsSchema.safeParse({
    notesString: url.searchParams.get("notesString") ?? undefined,
    valvesString: url.searchParams.get("valvesString") ?? undefined,
    topSlideNote: url.searchParams.get("topSlideNote") ?? undefined,
    bottomSlideNote: url.searchParams.get("bottomSlideNote") ?? undefined,
    lipBendStartNote: url.searchParams.get("lipBendStartNote") ?? undefined,
    lipBendStopNote: url.searchParams.get("lipBendStopNote") ?? undefined,
  });

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

  return { plotId, plotInputs: parsedInputs.data };
}
