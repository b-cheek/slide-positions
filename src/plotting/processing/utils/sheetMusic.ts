import type { PlotModel } from "../../parsing/utils";
import { getNoteConfigs, getViterbiSlidePath } from "./slideCalculation";

type NoteConfig = ReturnType<typeof getNoteConfigs>[number];

export interface SheetMusicPosition {
  text: string;
  lipBendCents: number;
  tuningName: string;
  partial: number;
  isOptimal: boolean;
}

export interface SheetMusicNote {
  noteName: string;
  positions: SheetMusicPosition[];
}

export function getSheetMusicNotes(model: PlotModel): SheetMusicNote[] {
  const configsByNote = model.notes.map((note) =>
    getNoteConfigs(model.trombone, note, model.player),
  );
  const optimalPath = getViterbiSlidePath(
    configsByNote.flat(),
    model.player,
    model.trombone,
  );
  const optimalConfigByNote = new Map(
    optimalPath.map((config) => [config.note, config]),
  );

  return configsByNote.map((configs, noteIndex) => {
    const optimalConfig = optimalConfigByNote.get(model.notes[noteIndex]);

    return {
      noteName: model.notes[noteIndex].name,
      positions: configs.map((config) => ({
        text: config.getSlidePositionString(model.player, model.trombone),
        lipBendCents: config.lipBendCents,
        tuningName: config.tuning.name,
        partial: config.partial,
        isOptimal:
          optimalConfig !== undefined &&
          configurationsMatch(config, optimalConfig),
      })),
    };
  });
}

export function createSheetMusicMei(
  model: PlotModel,
  sheetMusicNotes = getSheetMusicNotes(model),
): string {
  const notes = model.notes
    .map((note, noteIndex) => {
      const { pname, accid } = getMeiPitch(note.pitchClass);
      const positions = sheetMusicNotes[noteIndex]?.positions ?? [];
      const positionLabels = positions
        .map((position, positionIndex) => {
          const idPrefix =
            position.lipBendCents !== 0
              ? `${position.isOptimal ? "optimal-" : ""}lip-bend-position`
              : position.isOptimal
                ? "optimal-position"
                : "position";
          const lipBendIdPrefix = position.isOptimal
            ? "optimal-lip-bend"
            : "lip-bend";
          const lipBendLabel =
            position.lipBendCents !== 0
              ? `<dir xml:id="${lipBendIdPrefix}-${noteIndex}-${positionIndex}" startid="#note-${noteIndex}" place="below">-${formatCents(position.lipBendCents)}c lip bend</dir>`
              : "";
          return `<dir xml:id="${idPrefix}-${noteIndex}-${positionIndex}" startid="#note-${noteIndex}" place="below">${escapeXml(position.text)}</dir>${lipBendLabel}`;
        })
        .join("");
      const noteName = `<dir xml:id="note-name-${noteIndex}" startid="#note-${noteIndex}" place="above">${escapeXml(note.name)}</dir>`;
      const unplayableLabel =
        positions.length === 0
          ? `<dir xml:id="unplayable-${noteIndex}-first" startid="#note-${noteIndex}" place="below">Unplayable with</dir><dir xml:id="unplayable-${noteIndex}-second" startid="#note-${noteIndex}" place="below">current inputs</dir>`
          : "";

      return `<measure n="${noteIndex + 1}" right="invis"><staff n="1"><layer n="1"><note xml:id="note-${noteIndex}" pname="${pname}" oct="${note.octave}" dur="1"${accid ? ` accid="${accid}"` : ""}/></layer></staff>${noteName}${positionLabels}${unplayableLabel}</measure>`;
    })
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0">',
    `<meiHead><fileDesc></fileDesc></meiHead>`,
    `<music><body><mdiv><score><scoreDef><staffGrp><staffDef n="1" lines="5" clef.shape="F" clef.line="4"/></staffGrp></scoreDef><section>${notes}</section></score></mdiv></body></music>`,
    "</mei>",
  ].join("");
}

function configurationsMatch(left: NoteConfig, right: NoteConfig): boolean {
  return (
    left.note === right.note &&
    left.tuning === right.tuning &&
    left.partial === right.partial &&
    left.slideDistance === right.slideDistance &&
    left.lipBendCents === right.lipBendCents
  );
}

function getMeiPitch(pitchClass: string) {
  const pname = pitchClass[0].toLowerCase();
  const accidental = pitchClass[1];
  const accid = accidental === "b" ? "f" : accidental === "#" ? "s" : "";
  return { pname, accid };
}

function formatCents(cents: number): number {
  return Math.round(cents);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
