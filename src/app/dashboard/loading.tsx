"use client";

import { motion } from "framer-motion";
import { Box, Skeleton } from "@mui/material";

export default function DashboardLoading() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header skeleton */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2 }} />
          <Box>
            <Skeleton variant="rounded" width={128} height={20} sx={{ borderRadius: 1.5 }} />
            <Skeleton variant="rounded" width={80} height={12} sx={{ borderRadius: 1.5, mt: 0.75 }} />
          </Box>
        </Box>
        <Skeleton variant="rounded" width={112} height={36} sx={{ borderRadius: 2 }} />
      </Box>

      {/* Filter bar skeleton */}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Skeleton variant="rounded" sx={{ flex: 1, maxWidth: 384, height: 40, borderRadius: 2 }} />
        <Skeleton variant="rounded" width={128} height={40} sx={{ borderRadius: 2, display: { xs: "none", sm: "block" } }} />
      </Box>

      {/* Todo card skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Box
            sx={{
              borderRadius: 3,
              borderLeft: "4px solid",
              borderLeftColor: "divider",
              p: 2.5,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Skeleton variant="circular" width={24} height={24} sx={{ mt: 0.25, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="rounded" width="75%" height={20} sx={{ borderRadius: 1.5 }} />
                <Skeleton variant="rounded" width="50%" height={14} sx={{ borderRadius: 1.5, mt: 1 }} />
                <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                  <Skeleton variant="rounded" width={64} height={20} sx={{ borderRadius: 1.5 }} />
                  <Skeleton variant="rounded" width={80} height={20} sx={{ borderRadius: 1.5 }} />
                  <Skeleton variant="rounded" width={96} height={20} sx={{ borderRadius: 1.5 }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>
      ))}
    </Box>
  );
}
