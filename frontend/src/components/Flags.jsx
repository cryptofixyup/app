import React from "react";

const baseProps = (rest) => ({
  viewBox: "0 0 60 40",
  preserveAspectRatio: "xMidYMid slice",
  ...rest,
});

export const FlagEN = (p) => (
  <svg {...baseProps(p)} aria-label="English">
    <rect width="60" height="40" fill="#012169" />
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFF" strokeWidth="8" />
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
    <path d="M30,0 V40 M0,20 H60" stroke="#FFF" strokeWidth="12" />
    <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

export const FlagPL = (p) => (
  <svg {...baseProps(p)} aria-label="Polski">
    <rect width="60" height="20" fill="#FFFFFF" />
    <rect y="20" width="60" height="20" fill="#DC143C" />
  </svg>
);

export const FlagRU = (p) => (
  <svg {...baseProps(p)} aria-label="Русский">
    <rect width="60" height="13.34" fill="#FFFFFF" />
    <rect y="13.34" width="60" height="13.32" fill="#0039A6" />
    <rect y="26.66" width="60" height="13.34" fill="#D52B1E" />
  </svg>
);

export const FlagDE = (p) => (
  <svg {...baseProps(p)} aria-label="Deutsch">
    <rect width="60" height="13.34" fill="#000000" />
    <rect y="13.34" width="60" height="13.32" fill="#DD0000" />
    <rect y="26.66" width="60" height="13.34" fill="#FFCE00" />
  </svg>
);

export const FlagES = (p) => (
  <svg {...baseProps(p)} aria-label="Español">
    <rect width="60" height="40" fill="#AA151B" />
    <rect y="10" width="60" height="20" fill="#F1BF00" />
  </svg>
);

export const FlagFR = (p) => (
  <svg {...baseProps(p)} aria-label="Français">
    <rect width="20" height="40" fill="#0055A4" />
    <rect x="20" width="20" height="40" fill="#FFFFFF" />
    <rect x="40" width="20" height="40" fill="#EF4135" />
  </svg>
);

export const FLAG_MAP = {
  en: FlagEN,
  pl: FlagPL,
  ru: FlagRU,
  de: FlagDE,
  es: FlagES,
  fr: FlagFR,
};
