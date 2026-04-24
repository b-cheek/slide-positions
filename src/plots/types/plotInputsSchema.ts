import { z } from "zod";
import type { PlotInputs } from "./plotInputs";

export const plotInputsSchema: z.ZodType<PlotInputs> = z.object({
  notesString: z.string().nonempty("Notes are required."),
  valvesString: z.string().nonempty("Tunings are required."),
  topSlideNote: z.string().nonempty("Top slide note is required."),
  bottomSlideNote: z.string().nonempty("Bottom slide note is required."),
  lipBendStartNote: z.string().nonempty("Lip bend start note is required."),
  lipBendStopNote: z.string().nonempty("Lip bend stop note is required."),
});
