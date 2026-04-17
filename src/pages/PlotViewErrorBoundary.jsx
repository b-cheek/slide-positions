import { Button, Stack, Text, Title } from "@mantine/core";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import InvalidPlotConfigPage from "./InvalidPlotConfigPage";
import NotFoundPage from "./NotFoundPage";

function PlotViewErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFoundPage />;
    }

    if (error.status === 400) {
      return <InvalidPlotConfigPage message={error.statusText} />;
    }
  }

  return (
    <Stack>
      <Title order={2}>Something Went Wrong</Title>
      <Text>Unable to load this plot right now.</Text>
      <Button component={Link} to="/">
        Back to Gallery
      </Button>
    </Stack>
  );
}

export default PlotViewErrorBoundary;
