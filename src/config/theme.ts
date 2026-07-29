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
// export const theme = {
//   /* ─────────────────────────────────────
//    * Backgrounds
//    * ───────────────────────────────────── */
//   background: "#F8FAFC",
//   surface: "#FFFFFF",
//   surfaceMuted: "#F1F5F9",
//   surfaceHover: "#E8EEF5",

//   /* ─────────────────────────────────────
//    * Text
//    * ───────────────────────────────────── */
//   textPrimary: "#0F172A",
//   textSecondary: "#475569",
//   textMuted: "#64748B",
//   textInverse: "#FFFFFF",

//   /* ─────────────────────────────────────
//    * Borders
//    * ───────────────────────────────────── */
//   border: "#E2E8F0",
//   borderStrong: "#CBD5E1",
//   input: "#D8E0EB",

//   /* ─────────────────────────────────────
//    * Primary
//    * ───────────────────────────────────── */
//   accent: "#2563EB",
//   accentHover: "#1D4ED8",
//   accentSoft: "#DBEAFE",
//   accentForeground: "#FFFFFF",

//   /* Focus */
//   ring: "#60A5FA",

//   /* Status */
//   destructive: "#DC2626",
//   destructiveForeground: "#FFFFFF",

//   success: "#16A34A",
//   successSoft: "#DCFCE7",

//   warning: "#D97706",
//   warningSoft: "#FEF3C7",

//   info: "#0284C7",
//   infoSoft: "#E0F2FE",

//   /* Charts */
//   chart1: "#2563EB",
//   chart2: "#7C3AED",
//   chart3: "#14B8A6",
//   chart4: "#F59E0B",
//   chart5: "#EC4899",

//   /* Sidebar */
//   sidebar: "#FFFFFF",
//   sidebarForeground: "#0F172A",

//   sidebarPrimary: "#2563EB",
//   sidebarPrimaryForeground: "#FFFFFF",

//   sidebarAccent: "#F1F5F9",
//   sidebarAccentForeground: "#0F172A",

//   sidebarBorder: "#E2E8F0",
//   sidebarRing: "#60A5FA",
// } as const;