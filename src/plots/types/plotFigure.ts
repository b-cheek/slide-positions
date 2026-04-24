export type PlotFigure = {
  data: Array<{
    mode: "markers";
    type: "scatter";
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
