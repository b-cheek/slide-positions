import type { PlotModel } from "../../parsing/utils";
import { getNoteConfigs, getViterbiSlidePath } from "./slideCalculation";
import { ACTIVE_WEIGHTS } from "../types/weights";

export function getSheetMusicNotes(model: PlotModel) {
  const configsByNote = model.notes.map((note) =>
    getNoteConfigs(model.trombone, note, model.player),
  );
  const optimalPath = getViterbiSlidePath(
    configsByNote.flat(),
    model.player,
    model.trombone,
    ACTIVE_WEIGHTS,
  );
  const optimalConfigByNote = new Map(
    optimalPath.map((config) => [config.note, config]),
  );

  return configsByNote.map((configs, noteIndex) => {
    const optimalConfig = optimalConfigByNote.get(model.notes[noteIndex]);

    return {
      positions: configs.map((config) => ({
        text: config.getSlidePositionString(model.player, model.trombone),
        lipBendCents: config.lipBendCents,
        isOptimal: optimalConfig !== undefined && config === optimalConfig,
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
      const labels = getNoteDirectives(note.name, positions, noteIndex);

      return `<measure n="${noteIndex + 1}" right="invis"><staff n="1"><layer n="1"><note xml:id="note-${noteIndex}" pname="${pname}" oct="${note.octave}" dur="1"${accid ? ` accid="${accid}"` : ""}/></layer></staff>${labels.join("")}</measure>`;
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

type SheetMusicPosition = ReturnType<
  typeof getSheetMusicNotes
>[number]["positions"][number];

function getNoteDirectives(
  noteName: string,
  positions: SheetMusicPosition[],
  noteIndex: number,
): string[] {
  const noteLabel = renderDirective(
    `note-name-${noteIndex}`,
    noteName,
    noteIndex,
    "above",
  );
  if (positions.length === 0) {
    return [
      noteLabel,
      renderDirective(
        `unplayable-${noteIndex}-first`,
        "Unplayable with",
        noteIndex,
      ),
      renderDirective(
        `unplayable-${noteIndex}-second`,
        "current inputs",
        noteIndex,
      ),
    ];
  }

  return [
    noteLabel,
    ...positions.flatMap((position, positionIndex) =>
      getPositionDirectives(position, noteIndex, positionIndex),
    ),
  ];
}

function getPositionDirectives(
  position: SheetMusicPosition,
  noteIndex: number,
  positionIndex: number,
): string[] {
  const prefix = position.isOptimal ? "optimal-" : "";
  const id = position.lipBendCents ? "lip-bend-position" : "position";
  return [
    renderDirective(
      `${prefix}${id}-${noteIndex}-${positionIndex}`,
      position.text,
      noteIndex,
    ),
    ...(position.lipBendCents
      ? [
          renderDirective(
            `${prefix}lip-bend-${noteIndex}-${positionIndex}`,
            `-${formatCents(position.lipBendCents)}c lip bend`,
            noteIndex,
          ),
        ]
      : []),
  ];
}

function renderDirective(
  id: string,
  text: string,
  noteIndex: number,
  place = "below",
): string {
  return `<dir xml:id="${id}" startid="#note-${noteIndex}" place="${place}">${escapeXml(text)}</dir>`;
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
