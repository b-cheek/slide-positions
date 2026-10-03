import { describe, expect, it } from "vitest";
import { buildPlotModel } from "../../parsing/utils";
import { plotInputsSchema } from "../../parsing/plotInputsSchema";
import { createSheetMusicMei, getSheetMusicNotes } from "./sheetMusic";
import { getNoteConfigs } from "./slideCalculation";

describe("sheet music data", () => {
  it("keeps every applicable configuration for each note occurrence", () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({ notesString: "Bb1 Bb1" }),
    );
    const sheetMusicNotes = getSheetMusicNotes(model);
    const expectedPositions = getNoteConfigs(
      model.trombone,
      model.notes[0],
      model.player,
    );

    expect(sheetMusicNotes).toHaveLength(2);
    expect(sheetMusicNotes[0].noteName).toBe("Bb1");
    expect(sheetMusicNotes[1].noteName).toBe("Bb1");
    expect(sheetMusicNotes[0].positions).toHaveLength(expectedPositions.length);
    expect(sheetMusicNotes[1].positions).toHaveLength(expectedPositions.length);
    expect(
      sheetMusicNotes.flatMap((note) =>
        note.positions.map((position) => position.text),
      ),
    ).toContain("1");
  });

  it("marks one optimal configuration for each note occurrence", () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({ notesString: "Bb1 C3" }),
    );
    const sheetMusicNotes = getSheetMusicNotes(model);

    expect(
      sheetMusicNotes.every(
        (note) =>
          note.positions.filter((position) => position.isOptimal).length === 1,
      ),
    ).toBe(true);
  });

  it("marks an optimal configuration for every note in a chromatic range", () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({
        notesString: "Bb1-Bb3",
        valvesString: "Bb",
        topSlideNote: "Bb1+5",
        bottomSlideNote: "E1-10",
        lipBendStartNote: "Bb1",
        lipBendStopNote: "G1",
      }),
    );
    const sheetMusicNotes = getSheetMusicNotes(model);

    expect(sheetMusicNotes).toHaveLength(25);
    expect(
      sheetMusicNotes.map((note) =>
        note.positions.length === 0
          ? 0
          : note.positions.filter((position) => position.isOptimal).length,
      ),
    ).toEqual(
      sheetMusicNotes.map((note) => (note.positions.length === 0 ? 0 : 1)),
    );
  });

  it("generates whole-note MEI with position labels below each note", () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({ notesString: "Bb1 C3" }),
    );
    const sheetMusicNotes = getSheetMusicNotes(model);
    const mei = createSheetMusicMei(model, sheetMusicNotes);

    expect(mei).toContain('pname="b" oct="1" dur="1" accid="f"');
    expect(mei).toContain('pname="c" oct="3" dur="1"');
    expect(mei.match(/<note xml:id=/g)).toHaveLength(2);
    expect(mei).toContain('xml:id="optimal-position-0-');
    expect(mei).toContain('xml:id="note-name-0"');
    expect(mei).toContain('place="above">Bb1</dir>');
    expect(mei).toContain('startid="#note-0"');
    expect(mei).toContain('place="below"');
  });

  it("adds lip-bend text and a broken fallback for unplayable notes", () => {
    const model = buildPlotModel(
      plotInputsSchema.parse({ notesString: "B1 C0" }),
    );
    const mei = createSheetMusicMei(model);

    expect(mei).toContain("c lip bend");
    expect(mei).toContain('xml:id="optimal-lip-bend-position-0-0"');
    expect(mei).toContain('xml:id="optimal-lip-bend-0-0"');
    expect(mei).toContain(">Unplayable with</dir>");
    expect(mei).toContain(">current inputs</dir>");
  });
});
