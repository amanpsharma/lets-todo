"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Alert, Button, Box } from "@mui/material";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 480 }}
      >
        <Alert
          severity="error"
          icon={<AlertTriangle className="w-10 h-10" />}
          sx={{
            borderRadius: 3,
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            py: 4,
            "& .MuiAlert-icon": {
              mb: 2,
              fontSize: "2.5rem",
            },
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
          action={
            <Button
              color="error"
              variant="contained"
              onClick={reset}
              startIcon={<RotateCcw className="w-4 h-4" />}
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Try Again
            </Button>
          }
        >
          <strong>Something went wrong</strong>
          <br />
          {error.message || "An unexpected error occurred. Please try again."}
        </Alert>
      </motion.div>
    </Box>
  );
}
