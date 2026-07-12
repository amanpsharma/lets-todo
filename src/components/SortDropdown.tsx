"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Calendar, Flag, Type, Clock } from "lucide-react";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

type SortType = "date" | "priority" | "name" | "dueDate";

interface SortDropdownProps {
  sortBy: SortType;
  setSortBy: (sort: SortType) => void;
}

const sortOptions: { value: SortType; label: string; icon: typeof Calendar }[] = [
  { value: "date", label: "Date Created", icon: Clock },
  { value: "priority", label: "Priority", icon: Flag },
  { value: "name", label: "Name", icon: Type },
  { value: "dueDate", label: "Due Date", icon: Calendar },
];

export default function SortDropdown({ sortBy, setSortBy }: SortDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const currentSort = sortOptions.find((s) => s.value === sortBy)!;

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleOpen}
          startIcon={<ArrowUpDown style={{ width: 16, height: 16 }} />}
          variant="outlined"
          size="small"
          sx={{
            borderRadius: 3,
            textTransform: "none",
            "& .button-label": { display: { xs: "none", sm: "inline" } },
          }}
        >
          <span className="button-label">{currentSort.label}</span>
        </Button>
      </motion.div>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { mt: 1, borderRadius: 3, minWidth: 192 } } }}
      >
        {sortOptions.map((option) => {
          const Icon = option.icon;
          return (
            <MenuItem
              key={option.value}
              selected={sortBy === option.value}
              onClick={() => {
                setSortBy(option.value);
                handleClose();
              }}
              sx={{ borderRadius: 2, mx: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Icon style={{ width: 16, height: 16 }} />
              </ListItemIcon>
              <ListItemText primary={option.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
