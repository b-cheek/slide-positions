export const PLOT_INPUT_QUERY_KEYS = [
  "notesString",
  "valvesString",
  "topSlideNote",
  "bottomSlideNote",
  "lipBendStartNote",
  "lipBendStopNote",
  "title",
];

// TODO: to be moved to parsing utils file
export const blankStringToUndefined = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export function readPlotInputRawValues(searchParams) {
  return Object.fromEntries(
    PLOT_INPUT_QUERY_KEYS.map((key) => [
      key,
      blankStringToUndefined(searchParams.get(key)),
    ]).filter(([, value]) => value !== undefined),
  );
}
