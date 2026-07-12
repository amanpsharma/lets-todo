"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal, CheckCheck, Trash2 } from "lucide-react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  Typography,
} from "@mui/material";

interface BulkActionsProps {
  todosCount: number;
  completedCount: number;
  onMarkAllComplete: () => void;
  onDeleteCompleted: () => void;
}

export default function BulkActions({
  todosCount,
  completedCount,
  onMarkAllComplete,
  onDeleteCompleted,
}: BulkActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleOpen}
          variant="outlined"
          size="small"
          startIcon={<MoreHorizontal style={{ width: 16, height: 16 }} />}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontSize: "0.875rem",
            color: "text.secondary",
            borderColor: "divider",
            bgcolor: "background.paper",
            backdropFilter: "blur(8px)",
            "&:hover": { bgcolor: "action.hover" },
            "& .MuiButton-startIcon": { display: { xs: "flex", sm: "flex" } },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Actions
          </Box>
        </Button>
      </motion.div>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 220,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            },
          },
        }}
      >
        <MenuItem
          onClick={() => { onMarkAllComplete(); handleClose(); }}
          disabled={todosCount === completedCount}
          sx={{
            borderRadius: 1.5,
            mx: 0.5,
            my: 0.25,
            "&:hover": { bgcolor: "success.50", color: "success.main" },
            "&.Mui-disabled": { opacity: 0.4 },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <CheckCheck style={{ width: 16, height: 16 }} />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>Mark All Complete</Typography>}
            secondary={<Typography variant="caption">{todosCount - completedCount} tasks remaining</Typography>}
          />
        </MenuItem>

        <MenuItem
          onClick={() => { onDeleteCompleted(); handleClose(); }}
          disabled={completedCount === 0}
          sx={{
            borderRadius: 1.5,
            mx: 0.5,
            my: 0.25,
            "&:hover": { bgcolor: "error.50", color: "error.main" },
            "&.Mui-disabled": { opacity: 0.4 },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <Trash2 style={{ width: 16, height: 16 }} />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>Delete Completed</Typography>}
            secondary={<Typography variant="caption">{completedCount} completed tasks</Typography>}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}
