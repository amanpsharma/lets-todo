"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, Plus } from "lucide-react";
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    if (standalone) return;

    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (ios) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (isStandalone) return null;

  return (
    <Snackbar
      open={showBanner}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{
        bottom: { xs: 80, md: 24 },
        right: { xs: 16, sm: 24 },
        left: { xs: 16, sm: "auto" },
        width: { xs: "auto", sm: 384 },
      }}
    >
      <Alert
        severity="info"
        icon={false}
        sx={{
          width: "100%",
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          backdropFilter: "blur(12px)",
          p: 2,
          "& .MuiAlert-message": { width: "100%", p: 0 },
        }}
        action={
          <IconButton size="small" onClick={handleDismiss} sx={{ alignSelf: "flex-start", mt: -0.5 }}>
            <X style={{ width: 16, height: 16 }} />
          </IconButton>
        }
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, pr: 1 }}>
          <Box
            sx={{
              p: 1.25,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              flexShrink: 0,
            }}
          >
            <Download style={{ width: 20, height: 20, color: "white" }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ mb: 0.25, fontWeight: 700 }}>
              Install TaskFlow
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {isIOS
                ? "Add to your home screen for the best experience"
                : "Install for quick access and offline support"}
            </Typography>

            {isIOS ? (
              <Box
                sx={{
                  mt: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.5,
                  py: 1,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Tap{" "}
                  <Share style={{ width: 14, height: 14, display: "inline", color: "#3b82f6", verticalAlign: "middle" }} />{" "}
                  then{" "}
                  <Box component="span" sx={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 0.25 }}>
                    <Plus style={{ width: 12, height: 12 }} /> Add to Home Screen
                  </Box>
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 1.5, display: "flex", gap: 1 }}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  onClick={handleDismiss}
                  sx={{ borderRadius: "10px", textTransform: "none", fontSize: "0.75rem" }}
                >
                  Not now
                </Button>
                <Button
                  fullWidth
                  size="small"
                  variant="contained"
                  onClick={handleInstall}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                    "&:hover": { background: "linear-gradient(135deg, #6366f1, #818cf8)" },
                  }}
                >
                  Install
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
}
