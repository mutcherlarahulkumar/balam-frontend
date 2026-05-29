import React from 'react';

interface Props {
  size?: number;
}

export default function BalamLogo({ size = 72 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      aria-label="Balam CRM logo"
    >
      {/* Background circle */}
      <circle cx="256" cy="256" r="256" fill="#1a3c5e" />

      {/* Left hand */}
      <g fill="#d4821a">
        <ellipse cx="185" cy="310" rx="52" ry="38" transform="rotate(-30 185 310)" />
        <ellipse cx="148" cy="283" rx="18" ry="28" transform="rotate(-60 148 283)" />
        <rect x="162" y="220" width="22" height="72" rx="11" transform="rotate(-15 162 220)" />
        <rect x="188" y="212" width="22" height="80" rx="11" transform="rotate(-5 188 212)" />
        <rect x="214" y="218" width="22" height="74" rx="11" transform="rotate(5 214 218)" />
        <rect x="236" y="230" width="20" height="60" rx="10" transform="rotate(15 236 230)" />
        <rect x="155" y="308" width="72" height="80" rx="20" transform="rotate(-30 155 308)" />
      </g>

      {/* Right hand */}
      <g fill="#d4821a">
        <ellipse cx="327" cy="310" rx="52" ry="38" transform="rotate(30 327 310)" />
        <ellipse cx="364" cy="283" rx="18" ry="28" transform="rotate(60 364 283)" />
        <rect x="328" y="220" width="22" height="72" rx="11" transform="rotate(15 328 220)" />
        <rect x="302" y="212" width="22" height="80" rx="11" transform="rotate(5 302 212)" />
        <rect x="276" y="218" width="22" height="74" rx="11" transform="rotate(-5 276 218)" />
        <rect x="256" y="230" width="20" height="60" rx="10" transform="rotate(-15 256 230)" />
        <rect x="285" y="308" width="72" height="80" rx="20" transform="rotate(30 285 308)" />
      </g>

      {/* Center join glow */}
      <ellipse cx="256" cy="268" rx="28" ry="22" fill="#e8a040" opacity="0.5" />
    </svg>
  );
}
