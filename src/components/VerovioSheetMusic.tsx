import { useEffect, useState } from "react";
import { Skeleton, Stack } from "@mantine/core";
import type { PlotModel } from "../plotting/parsing/utils";
import { createSheetMusicMei } from "../plotting/processing/utils/sheetMusic";
import "./VerovioSheetMusic.css";

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
  }, [model, width]);

  if (error) {
    return <div role="alert">Unable to render sheet music: {error}</div>;
  }

  return (
    <div
      role="img"
      aria-label={`${model.title} sheet music`}
      className="sheet-music"
    >
      <div className="sheet-music__title">{model.title}</div>
      {!svgMarkup && (
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
      )}
      <div
        className={`sheet-music__svg${showOptimalSlidePath ? " sheet-music__svg--optimal" : ""}`}
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </div>
  );
}
