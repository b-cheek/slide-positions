import { Container } from "@mantine/core";
import { BrowserRouter, Route, Routes } from "react-router";
import CreatePlotPage from "./pages/CreatePlotPage";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlotViewPage from "./pages/PlotViewPage";

function App() {
  return (
    <BrowserRouter>
      <Container py="xl">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/plot/:plotId" element={<PlotViewPage />} />
          <Route path="/create" element={<CreatePlotPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
