export const colors = {
  primary: "#F5AD05",
  secondary: "#52B800",
  background: "#FFFFFF",
  surface: "#FAFAFA",
  textPrimary: "#111111",
  textSecondary: "#4A4A4A",
  border: "#E6E6E6",
  error: "#D32F2F",
  success: "#1DAF55",
  warning: "#FFB020",
} as const;

export type ColorToken = keyof typeof colors;

const ROBOTO_REGULAR = "Roboto";
const ROBOTO_MEDIUM = "Roboto-Medium";
const ROBOTO_BOLD = "Roboto-Bold";

export const typography = {
  h1: {
    fontFamily: ROBOTO_BOLD,
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: ROBOTO_BOLD,
    fontSize: 22,
    lineHeight: 30,
  },
  body: {
    fontFamily: ROBOTO_REGULAR,
    fontSize: 16,
    lineHeight: 24,
  },
  small: {
    fontFamily: ROBOTO_REGULAR,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: ROBOTO_REGULAR,
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: ROBOTO_MEDIUM,
    fontSize: 16,
    lineHeight: 20,
  },
} as const;

export type TypographyToken = keyof typeof typography;

export const theme = {
  colors,
  typography,
};

export type Theme = typeof theme;
