"use client";

import { motion } from "framer-motion";
import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";

export default function DashboardNotFound() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.50",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
            }}
          >
            <FileQuestion className="w-10 h-10 text-indigo-500" />
          </Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Page not found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            The page you&apos;re looking for doesn&apos;t exist.
          </Typography>
          <Button
            component={Link}
            href="/dashboard"
            variant="contained"
            sx={{ borderRadius: 2, textTransform: "none", px: 3, py: 1.25 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}
