import { Container, Text } from "@mantine/core";
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useNavigation,
} from "react-router";
import CreatePlotPage from "./pages/CreatePlotPage";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlotViewErrorBoundary from "./pages/PlotViewErrorBoundary";
import { plotViewLoader } from "./pages/PlotViewLoader";
import PlotViewPage from "./pages/PlotViewPage";

function AppLayout() {
  const navigation = useNavigation();

  return (
    <Container py="xl">
      {navigation.state === "loading" ? (
        <Text size="sm">Loading...</Text>
      ) : null}
      <Outlet />
    </Container>
  );
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    hydrateFallbackElement: <Text size="sm">Loading...</Text>,
    children: [
      { path: "/", element: <LandingPage /> },
      {
        path: "/plot/:plotId",
        loader: plotViewLoader,
        hydrateFallbackElement: <Text size="sm">Loading plot...</Text>,
        element: <PlotViewPage />,
        errorElement: <PlotViewErrorBoundary />,
      },
      { path: "/create", element: <CreatePlotPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
