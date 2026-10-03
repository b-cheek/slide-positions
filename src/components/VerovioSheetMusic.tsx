import { useEffect, useRef, useState } from "react";
import { Skeleton, Stack } from "@mantine/core";
import type { PlotModel } from "../plotting/parsing/utils";
import { createSheetMusicMei } from "../plotting/processing/utils/sheetMusic";

interface VerovioSheetMusicProps {
  model: PlotModel;
  width: number;
  height: number;
  showOptimalSlidePath: boolean;
}

export function VerovioSheetMusic({
  model,
  width,
  height,
  showOptimalSlidePath,
}: VerovioSheetMusicProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    setSvgMarkup("");
    setError(null);

    async function renderSheetMusic() {
      try {
        const [{ default: createVerovioModule }, { VerovioToolkit }] =
          await Promise.all([import("verovio/wasm"), import("verovio/esm")]);
        const verovioModule = await createVerovioModule();
        const toolkit = new VerovioToolkit(verovioModule);

        toolkit.setOptions({
          pageWidth: width,
          // scale to 40 for desktop, 30 for mobile
          scale: window.innerWidth > 768 ? 40 : 30,
          scaleToPageSize: true,
          adjustPageHeight: true,
          justifyVertically: true,
          spacingLinear: 0.4,
        });

        const loaded = toolkit.loadData(createSheetMusicMei(model));
        if (!loaded) throw new Error("Verovio could not load the chart data.");

        const renderedSvg = toolkit.renderToSVG(1, true);
        if (isCurrent) setSvgMarkup(renderedSvg);
      } catch (renderError) {
        if (isCurrent) {
          setError(
            renderError instanceof Error
              ? renderError.message
              : "Unable to render sheet music.",
          );
        }
      }
    }

    void renderSheetMusic();
    return () => {
      isCurrent = false;
    };
  }, [model, width, height]);

  if (error) {
    return <div role="alert">Unable to render sheet music: {error}</div>;
  }

  return (
    <div
      role="img"
      aria-label={`${model.title} sheet music`}
      style={{
        height: "100%",
        overflowY: "auto",
        width: "100%",
      }}
    >
      <div className="sheet-music-title">{model.title}</div>
      {!svgMarkup && (
        <>
          <Stack aria-hidden="true" gap="xl" p="md" style={{ width: "100%" }}>
            {Array.from({ length: Math.max(3, Math.ceil(height / 160)) }).map(
              (_, staffIndex) => (
                <Stack key={staffIndex} gap={7} mt="lg">
                  {Array.from({ length: 5 }).map((__, lineIndex) => (
                    <Skeleton key={lineIndex} height={1} radius="xl" />
                  ))}
                </Stack>
              ),
            )}
          </Stack>
        </>
      )}
      <div
        ref={svgContainerRef}
        className={`sheet-music-svg${showOptimalSlidePath ? " show-optimal" : ""}`}
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
      <style>{`
        .sheet-music-svg svg {
          display: block;
          height: auto;
          max-width: 100%;
          color: var(--mantine-color-text);
        }

        .sheet-music-title {
          max-width: 80%;
          margin: 0 auto;
          color: var(--mantine-color-text);
          font-family: var(--mantine-font-family);
          font-size: 16px;
          font-weight: 700;
          line-height: 1.1;
          text-align: center;
        }

        .sheet-music-svg svg * {
          fill: currentColor;
          stroke: currentColor;
        }

        .sheet-music-svg [id^="position-"],
        .sheet-music-svg [id^="optimal-position-"],
        .sheet-music-svg [id^="note-name-"],
        .sheet-music-svg [id^="lip-bend-"],
        .sheet-music-svg [id^="optimal-lip-bend-"],
        .sheet-music-svg [id^="unplayable-"] {
          fill: var(--mantine-color-text);
          font-family: var(--mantine-font-family);
          font-size: 12px;
        }

        .sheet-music-svg [id^="position-"],
        .sheet-music-svg [id^="optimal-position-"],
        .sheet-music-svg [id^="lip-bend-"],
        .sheet-music-svg [id^="optimal-lip-bend-"],
        .sheet-music-svg [id^="unplayable-"] {
          transform: translate(-130px, 100px);
        }

        .sheet-music-svg [id^="note-name-"] {
          transform: translate(-200px, -100px);
        }

        .sheet-music-svg [id^="lip-bend-"],
        .sheet-music-svg [id^="optimal-lip-bend-"],
        .sheet-music-svg [id^="unplayable-"] {
          font-size: 340px;
        }

        .sheet-music-svg [id^="lip-bend-"] tspan,
        .sheet-music-svg [id^="optimal-lip-bend-"] tspan,
        .sheet-music-svg [id^="unplayable-"] tspan {
          font-size: 340px !important;
        }

        .sheet-music-svg.show-optimal [id^="optimal-position-"],
        .sheet-music-svg.show-optimal [id^="optimal-position-"] *,
        .sheet-music-svg.show-optimal [id^="optimal-lip-bend-"],
        .sheet-music-svg.show-optimal [id^="optimal-lip-bend-"] * {
          fill: var(--mantine-color-teal-8);
          font-weight: 700;
        }

        .mNum {
            display: none
        }
      `}</style>
    </div>
  );
}
