import { Container } from "@mantine/core";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import CreatePlotPage from "./pages/CreatePlotPage";
import LandingPage from "./pages/LandingPage";
import PlotViewPage from "./pages/PlotViewPage";

function App() {
  return (
    <BrowserRouter>
      <Container py="xl">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/plot/:plotId" element={<PlotViewPage />} />
          <Route path="/create" element={<CreatePlotPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
