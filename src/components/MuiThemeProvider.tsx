"use client";

import { useMemo, useEffect, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export default function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setMode(isDark ? "dark" : "light");

    const observer = new MutationObserver(() => {
      setMode(document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#6366f1" },     // indigo-500
          secondary: { main: "#f59e0b" },   // amber-500
          background: {
            default: mode === "dark" ? "#030712" : "#f8fafc",
            paper: mode === "dark" ? "#111827" : "#ffffff",
          },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: "var(--font-sans), sans-serif",
          button: { textTransform: "none", fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: 12, padding: "8px 20px" },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: { borderRadius: 16, backgroundImage: "none" },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: { borderRadius: 20 },
            },
          },
          MuiTextField: {
            defaultProps: { size: "small" },
          },
          MuiChip: {
            styleOverrides: {
              root: { borderRadius: 8 },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
