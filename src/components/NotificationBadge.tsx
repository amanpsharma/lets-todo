"use client";

import { Badge } from "@mui/material";

export default function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <Badge
      badgeContent={count > 99 ? "99+" : count}
      color="error"
      max={99}
      sx={{
        "& .MuiBadge-badge": {
          fontSize: "0.6rem",
          height: 18,
          minWidth: 18,
          boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
        },
      }}
    />
  );
}
