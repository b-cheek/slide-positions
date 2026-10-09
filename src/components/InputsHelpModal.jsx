import {
  Box,
  Button,
  Code,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { C4Icon } from "./svgIcons/C4Icon";
import { FSharp2Icon } from "./svgIcons/FSharp2Icon";
import { Eb3Icon } from "./svgIcons/Eb3Icon";

// Wraps a staff icon so it is exposed to screen readers and sized consistently.
function NoteIcon({ Icon, label }) {
  return (
    <Box
      component="span"
      role="img"
      aria-label={label}
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      <Icon size={64} />
    </Box>
  );
}

const NOTES = [
  {
    input: "C4",
    Icon: C4Icon,
    label: "C in octave 4 (middle C)",
  },
  {
    input: "F#2",
    Icon: FSharp2Icon,
    label: "F sharp in octave 2",
  },
  {
    input: "Eb3",
    Icon: Eb3Icon,
    label: "E flat in octave 3",
  },
];

const CENTS = [
  { input: "Bb3+20", meaning: "Bb3 raised 20 cents" },
  { input: "A2-14.5", meaning: "A2 lowered 14.5 cents" },
];

const RANGES = [
  {
    input: "F1-F4",
    meaning: "All notes from F1 to F4",
  },
  {
    input: "Bb3-Bb2(F)",
    meaning: "Descending Bb lydian scale",
  },
];

function Section({ title, description, examples }) {
  return (
    <Stack gap={6}>
      <Title order={5}>{title}</Title>
      <Text size="sm" c="dimmed">
        {description}
      </Text>
      <Table
        withRowBorders
        verticalSpacing={6}
        horizontalSpacing={0}
        aria-label={`${title} examples`}
      >
        <Table.Tbody>
          {examples.map((ex) => (
            <Table.Tr key={ex.input}>
              <Table.Td w={140}>
                <Code fz="sm">{ex.input}</Code>
              </Table.Td>
              <Table.Td>
                {typeof ex.meaning === "string" ? (
                  <Text size="sm">{ex.meaning}</Text>
                ) : (
                  ex.meaning
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

function NotesSection() {
  return (
    <Stack gap={6}>
      <Title order={5}>Notes</Title>
      <Text size="sm" c="dimmed">
        Scientific pitch notation: a letter, an optional sharp (#) or flat (b),
        and an octave number.
      </Text>
      <Table
        withColumnBorders
        horizontalSpacing="xs"
        verticalSpacing="xs"
        aria-label="Notes examples"
      >
        <Table.Tbody>
          <Table.Tr>
            {NOTES.map(({ input, Icon, label }) => (
              <Table.Td key={input} ta="center">
                <Stack align="center" gap={4}>
                  <NoteIcon Icon={Icon} label={label} />
                  <Code fz="sm">{input}</Code>
                </Stack>
              </Table.Td>
            ))}
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

export function InputsHelpModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant="outline" size="compact-sm" onClick={open}>
        Notation guide
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title="Notation guide"
        size="md"
        centered
      >
        <Stack gap="lg">
          <NotesSection />

          <Section
            title="Microtonal adjustments"
            description="Add + or - and a number of cents after a note. Decimals are supported."
            examples={CENTS}
          />

          <Section
            title="Ranges"
            description="Join two notes with a hyphen to include every note between them. The order sets the direction. Add a major key in parentheses to keep only notes in that key."
            examples={RANGES}
          />

          <Text size="xs" c="dimmed">
            Ranges can only be used for input notes, and can't include cent
            adjustments.
          </Text>

          <Group justify="flex-end">
            <Button size="xs" onClick={close}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default InputsHelpModal;
