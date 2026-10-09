import { ActionIcon, Popover, Text } from "@mantine/core";
import InfoIcon from "./svgIcons/InfoIcon";

export function InfoPopover({ label = "More information", children }) {
  return (
    <Popover
      trigger="hover"
      position="bottom-start"
      withArrow
      shadow="md"
      withinPortal
    >
      <Popover.Target>
        <ActionIcon type="button" variant="subtle" size="md" aria-label={label}>
          <InfoIcon />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown maw={320}>
        <Text size="sm">{children}</Text>
      </Popover.Dropdown>
    </Popover>
  );
}

export default InfoPopover;
