import {
  Accordion,
  Anchor,
  Avatar,
  Code,
  Container,
  Divider,
  Group,
  List,
  Paper,
  Flex,
  SimpleGrid,
  Stack,
  Text,
  Title,
  rem,
  Alert,
} from "@mantine/core";
import cheekHeadshot from "../assets/cheek_headshot_square.webp";

import InfoIcon from "../components/svgIcons/InfoIcon";

const WEBSITE_URL = "https://bcheek.dev"; // TODO: your website
const SERVICE_DESK_EMAIL =
  "contact-project+b-cheek-group-slide-positions-82036391-issue-@incoming.gitlab.com";

const variables = [
  { symbol: "f", meaning: "Frequency of the pitch" },
  { symbol: "n", meaning: "Partial (harmonic) number" },
  { symbol: "v", meaning: "Speed of sound in the tube" },
  { symbol: "L", meaning: "Effective length of the tube" },
];

export function AboutPage() {
  return (
    <Container size="md" py="xl">
      <Stack gap={rem(48)}>
        <Title order={1}>About SlidePositions</Title>

        {/* Overview */}
        <Stack gap="sm">
          <Title order={2}>Overview</Title>
          <Text>
            SlidePositions is a tool for visualizing slide positions for various
            types of trombones. Positions are calculated from pitch rather than
            taken from a fixed chart, so each one is exact. That makes a few
            things easier to look at:
          </Text>
          <List spacing="xs">
            <List.Item>
              How just intonation (in line with the harmonic series) differs
              from equal temperament for a given note.
            </List.Item>
            <List.Item>Positions that involve valves.</List.Item>
            <List.Item>
              The full set of alternate positions for a note.
            </List.Item>
          </List>
        </Stack>

        <Divider />

        {/* How it works */}
        <Stack gap="md">
          <Title order={2}>How it works</Title>
          <Text>
            The model is an ideal cylinder that is open at both ends. This is
            fundamentally how a trombone operates, minus end correction and
            other instrument-specific factors. Its resonant frequencies follow:
          </Text>

          <Paper withBorder radius="md" p="md">
            <Flex
              direction={{ base: "column", sm: "row" }}
              align={{ base: "flex-start", sm: "stretch" }}
              gap="lg"
            >
              <Group align="center">
                <Code fz="xl" px="md" py="xs">
                  f = nv / 2L
                </Code>
              </Group>

              <Divider orientation="vertical" visibleFrom="sm" />
              <Divider hiddenFrom="sm" w="100%" />

              <SimpleGrid
                cols={{ base: 1, xs: 2 }}
                spacing="md"
                verticalSpacing={6}
              >
                {variables.map(({ symbol, meaning }) => (
                  <Group key={symbol} gap="xs" wrap="nowrap">
                    <Code>{symbol}</Code>
                    <Text size="sm">{meaning}</Text>
                  </Group>
                ))}
              </SimpleGrid>
            </Flex>
          </Paper>

          <Text>
            Since the trombone is specified in terms of tunings (fundamental
            frequency in first position) and the range accessible on the slide
            (top and bottom pitch), we can use the above equation to derive
            theoretical lengths to create said notes (in A440 equal
            temperament), which furthermore allows us to derive any tuning,
            position, partial combinations for arbitrary notes. As long as we
            care about these three things and not the practical length, the
            speed of sound and its variation inside the instrument do not
            matter.
          </Text>
        </Stack>

        <Alert variant="outline" title="Note on length" icon={<InfoIcon />}>
          This means length is mostly an implementation detail. It currently
          only modifies a hardcoded weight in the cost function of the Viterbi
          algorithm that calculates optimal slide paths. I might add another
          weight for slide proportion which is probably more relevant anyway.
          These generalizations don't meaningfully affect the features described
          above.
        </Alert>

        <Divider />

        {/* FAQ */}
        <Stack gap="md">
          <Title order={2}>FAQ</Title>
          <Accordion variant="separated" radius="md" defaultValue="d4">
            <Accordion.Item value="d4">
              <Accordion.Control>
                Why does it say I can't play D4 in first position?
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Text size="sm">
                    D4 is about 14 cents flat in first position, as a justly
                    tuned major third in the harmonic series.
                  </Text>
                  <Text size="sm">
                    If you can play 14 or more cents sharper than your open
                    tuning with the slide all the way in, update your top slide
                    note to reflect that and D4 will be treated as playable.
                  </Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="f-attachment">
              <Accordion.Control>
                Why is F3 a different position in the F tuning than the Bb
                tuning?
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Text size="sm">
                    In theory, with the F attachment engaged and the slide in
                    exact first position, the fundamental produced by the
                    instrument's length is exactly F. In the Bb tuning, that
                    same F is the third partial, which the harmonic series
                    places roughly 2 cents sharp of equal temperament.
                  </Text>
                  <Text size="sm">
                    If you tune the F attachment to F3 in the open Bb tuning,
                    keeping the slide in the same position for both, one of the
                    two tunings will be about 2 cents from an exact note. The F
                    attachment position should account for that, giving a tuning
                    of roughly <Code>Bb / F+2</Code>.
                  </Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>

        <Divider />

        {/* About me */}
        <Stack gap="md">
          <Title order={2}>About me</Title>
          <Group align="flex-start" wrap="nowrap" gap="lg">
            <Avatar
              src={cheekHeadshot}
              alt="Brayden Cheek Headshot"
              size={80}
              radius="xl"
            >
              YN
            </Avatar>
            <Stack gap="xs">
              <Text>
                I'm a software engineer and a musician. This is one of many
                small projects I work on during time I can't spend practicing.
              </Text>
              <Text size="sm">
                More at my website:{" "}
                <Anchor
                  href={WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                >
                  {WEBSITE_URL.replace("https://", "")}
                </Anchor>
              </Text>
            </Stack>
          </Group>

          <Text size="sm" c="dimmed">
            For comments, questions, or bug reports: if you know me, text me.
            Otherwise,{" "}
            <Anchor href={"mailto:" + SERVICE_DESK_EMAIL} size="sm">
              send an email
            </Anchor>
            .
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
}
