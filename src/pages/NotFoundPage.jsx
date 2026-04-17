import { Button, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";

function NotFoundPage() {
  return (
    <Stack>
      <Title order={2}>Page Not Found</Title>
      <Text>The page you requested does not exist.</Text>
      <Button component={Link} to="/">
        Back to Gallery
      </Button>
    </Stack>
  );
}

export default NotFoundPage;
