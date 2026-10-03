import { Anchor, Container, Text, AppShell, Group } from "@mantine/core";
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useNavigation,
  Link,
} from "react-router";
import { CreatePlotPage } from "./pages/CreatePlotPage";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlotViewErrorBoundary } from "./pages/PlotViewErrorBoundary";
import { plotViewLoader } from "./pages/PlotViewLoader";
import { PlotViewPage } from "./pages/PlotViewPage";
import { SlidePositionsIcon } from "./components/SlidePositionsIcon";

function AppLayout() {
  const navigation = useNavigation();

  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header px="md">
        <Group h="100%" justify="space-between">
          <Group
            component={Link}
            to="/"
            aria-label="Homepage"
            style={{ textDecoration: "none", color: "inherit" }}
            gap="xs"
          >
            <SlidePositionsIcon
              size="1.75em"
              style={{ verticalAlign: "-0.5em" }}
            />
            <Text fw={700} size="lg">
              SlidePositions
            </Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container py="xl">
          {navigation.state === "loading" && <Text size="sm">Loading...</Text>}
          <Outlet />
        </Container>
      </AppShell.Main>

      <AppShell.Footer
        px="md"
        py="xs"
        withBorder={false}
        style={{ background: "transparent" }}
      >
        <Group h="100%" justify="center">
          <Text size="xs" c="dimmed" style={{ opacity: 0.6 }}>
            © {new Date().getFullYear()}{" "}
            <Anchor
              href="https://bcheek.dev"
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              c="dimmed"
              underline="hover"
            >
              Brayden Cheek
            </Anchor>
          </Text>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    hydrateFallbackElement: <Text size="sm">Loading...</Text>,
    children: [
      { path: "/", element: <LandingPage /> },
      {
        path: "/plot",
        loader: plotViewLoader,
        hydrateFallbackElement: <Text size="sm">Loading...</Text>,
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
