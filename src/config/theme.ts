/**
 * Recruit-OS — DARK THEME (Single Source of Truth)
 *
 * Every color used across the app lives here.
 * Import `theme` wherever you need programmatic access to colors
 * (charts, inline styles, canvas, etc.).
 *
 * Tailwind classes use the CSS custom-properties defined in index.css,
 * which mirror these exact values.
 */

export const theme = {
  /* ─────────────────────────────────────
   * Backgrounds
   * ───────────────────────────────────── */
  background: "#181A20",
  surface: "#242731",
  surfaceMuted: "#2D313D",
  surfaceHover: "#383D4A",

  /* ─────────────────────────────────────
   * Text
   * ───────────────────────────────────── */
  textPrimary: "#F7F8FA",
  textSecondary: "#C9CDD6",
  textMuted: "#959CAB",
  textInverse: "#181A20",

  /* ─────────────────────────────────────
   * Borders
   * ───────────────────────────────────── */
  border: "#3A3F4B",
  borderStrong: "#4C5262",
  input: "#404656",

  /* ─────────────────────────────────────
   * Primary
   * ───────────────────────────────────── */
  accent: "#6C8DFF",
  accentHover: "#5A7DF6",
  accentSoft: "#2E3F72",
  accentForeground: "#FFFFFF",

  /* Focus */
  ring: "#7D9EFF",

  /* Status */
  destructive: "#F05F68",
  destructiveForeground: "#FFFFFF",

  success: "#41C88A",
  successSoft: "#213D33",

  warning: "#F4B44E",
  warningSoft: "#443417",

  info: "#59B9FF",
  infoSoft: "#1D3B56",

  /* Charts */
  chart1: "#6C8DFF",
  chart2: "#8D79FF",
  chart3: "#53D6C6",
  chart4: "#F4B44E",
  chart5: "#FF7E9E",

  /* Sidebar */
  sidebar: "#20232B",
  sidebarForeground: "#F7F8FA",

  sidebarPrimary: "#6C8DFF",
  sidebarPrimaryForeground: "#FFFFFF",

  sidebarAccent: "#2C303B",
  sidebarAccentForeground: "#F7F8FA",

  sidebarBorder: "#393E4B",
  sidebarRing: "#7D9EFF",
} as const;

export type Theme = typeof theme;
