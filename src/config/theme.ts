/**
 * Recruit-OS — LIGHT THEME (Single Source of Truth)
 *
 * Cool grays + soothing blue-teal accents.
 * Every color used across the app lives here.
 */

export const theme = {
  /* ─────────────────────────────────────
   * Backgrounds
   * ───────────────────────────────────── */
  background: "#EDF4FF",
  surface: "#FFFFFF",
  surfaceMuted: "#EEF1F6",
  surfaceHover: "#E4E8EF",

  /* ─────────────────────────────────────
   * Text
   * ───────────────────────────────────── */
  textPrimary: "#1A1D26",
  textSecondary: "#4B5263",
  textMuted: "#7C8497",
  textInverse: "#FFFFFF",

  /* ─────────────────────────────────────
   * Borders
   * ───────────────────────────────────── */
  border: "#D8DDE6",
  borderStrong: "#BFC6D2",
  input: "#CDD3DE",

  /* ─────────────────────────────────────
   * Primary (Cool Teal-Blue)
   * ───────────────────────────────────── */
  accent: "#3B82C4",
  accentHover: "#2E6DA8",
  accentSoft: "#E0EEF9",
  accentForeground: "#FFFFFF",

  /* Focus */
  ring: "#6AADEB",

  /* ─────────────────────────────────────
   * Status
   * ───────────────────────────────────── */
  destructive: "#D9534F",
  destructiveForeground: "#FFFFFF",
  destructiveSoft: "#FDECEA",

  success: "#3AAF76",
  successSoft: "#E6F7EF",

  warning: "#E0963A",
  warningSoft: "#FDF3E3",

  info: "#4A9FD9",
  infoSoft: "#E3F2FC",

  /* ─────────────────────────────────────
   * Charts
   * ───────────────────────────────────── */
  chart1: "#3B82C4",
  chart2: "#7367D6",
  chart3: "#2EBAA0",
  chart4: "#E0963A",
  chart5: "#D96B8C",

  /* ─────────────────────────────────────
   * Sidebar
   * ───────────────────────────────────── */
  sidebar: "#FFFFFF",
  sidebarForeground: "#1A1D26",

  sidebarPrimary: "#3B82C4",
  sidebarPrimaryForeground: "#FFFFFF",

  sidebarAccent: "#EEF1F6",
  sidebarAccentForeground: "#1A1D26",

  sidebarBorder: "#D8DDE6",
  sidebarRing: "#6AADEB",
} as const;

export type Theme = typeof theme;

// ── DARK THEME (backup) ──────────────────────────────────────
// export const theme = {
//   background: "#181A20",
//   surface: "#242731",
//   surfaceMuted: "#2D313D",
//   surfaceHover: "#383D4A",
//   textPrimary: "#F7F8FA",
//   textSecondary: "#C9CDD6",
//   textMuted: "#959CAB",
//   textInverse: "#181A20",
//   border: "#3A3F4B",
//   borderStrong: "#4C5262",
//   input: "#404656",
//   accent: "#6C8DFF",
//   accentHover: "#5A7DF6",
//   accentSoft: "#2E3F72",
//   accentForeground: "#FFFFFF",
//   ring: "#7D9EFF",
//   destructive: "#F05F68",
//   destructiveForeground: "#FFFFFF",
//   destructiveSoft: "#3D2022",
//   success: "#41C88A",
//   successSoft: "#213D33",
//   warning: "#F4B44E",
//   warningSoft: "#443417",
//   info: "#59B9FF",
//   infoSoft: "#1D3B56",
//   chart1: "#6C8DFF",
//   chart2: "#8D79FF",
//   chart3: "#53D6C6",
//   chart4: "#F4B44E",
//   chart5: "#FF7E9E",
//   sidebar: "#20232B",
//   sidebarForeground: "#F7F8FA",
//   sidebarPrimary: "#6C8DFF",
//   sidebarPrimaryForeground: "#FFFFFF",
//   sidebarAccent: "#2C303B",
//   sidebarAccentForeground: "#F7F8FA",
//   sidebarBorder: "#393E4B",
//   sidebarRing: "#7D9EFF",
// } as const;