import React from "react";
import { Button } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";

export function ShareButton({ title, text, url }) {
  const clipboard = useClipboard({ timeout: 2000 });

  const handleShare = async () => {
    // Check for native Web Share API support
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to Mantine's useClipboard hook
      clipboard.copy(url);
    }
  };

  return (
    <Button onClick={handleShare} color={clipboard.copied ? "teal" : "blue"}>
      {clipboard.copied ? "Copied URL" : "Share"}
    </Button>
  );
}
