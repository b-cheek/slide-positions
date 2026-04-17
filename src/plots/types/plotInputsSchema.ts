import { z } from "zod";
import type { PlotInputs } from "./plotInputs";

export const plotInputsSchema: z.ZodType<PlotInputs> = z.object({
  points: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number({ error: "Point count is required." })
      .int("Point count must be a whole number.")
      .positive("Point count must be greater than 0."),
  ),
});
