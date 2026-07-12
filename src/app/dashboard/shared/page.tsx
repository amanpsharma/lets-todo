"use client";

import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import SharedWithMe from "@/components/SharedWithMe";
import { Box, Typography } from "@mui/material";

export default function SharedPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, mb: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            p: { xs: 0.75, sm: 1 },
            bgcolor: "#ede9fe",
            borderRadius: { xs: 1.5, sm: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Share2 size={18} color="#6366f1" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.125rem" } }}>
            Shared with Me
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Tasks others have shared with you
          </Typography>
        </Box>
      </Box>

      <SharedWithMe />
    </motion.div>
  );
}
