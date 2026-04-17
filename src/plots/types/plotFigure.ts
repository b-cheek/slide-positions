export type PlotFigure = {
  data: Array<{
    type: "scatter";
    mode: "lines+markers";
    x: number[];
    y: number[];
    name: string;
  }>;
  layout: {
    title: string;
    xaxis: { title: string };
    yaxis: { title: string };
  };
};
