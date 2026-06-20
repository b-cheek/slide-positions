import React from "react";

export function SlidePositionsIcon({ size = 100, style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={style}
    >
      {/* Outline */}
      <g
        stroke="var(--mantine-color-dark-9)"
        stroke-width="16"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      >
        <path d="M 20 80 L 70 80 A 10 10 0 0 0 70 55 L 25 55 C 10 55, 10 25, 35 25" />
        <line x1="32" y1="80" x2="32" y2="55" stroke-width="10" />
        <path d="M 35 25 Q 60 25 65 35 L 65 15 Q 60 25 35 25" />
      </g>
      {/* Fill */}
      <g
        stroke="#F1C40F"
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      >
        <path d="M 20 80 L 70 80 A 10 10 0 0 0 70 55 L 25 55 C 10 55, 10 25, 35 25" />
        <line x1="32" y1="80" x2="32" y2="55" stroke-width="6" />
        <path d="M 35 25 Q 60 25 65 35 L 65 15 Q 60 25 35 25" fill="#F1C40F" />
      </g>
    </svg>
  );
}
