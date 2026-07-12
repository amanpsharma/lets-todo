"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";
import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  IconButton,
  Box,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";

interface FilterBarProps {
  filters: {
    search: string;
    category: string;
    priority: string;
    status: string;
  };
  setFilters: (filters: FilterBarProps["filters"]) => void;
  categories: string[];
}

export default function FilterBar({ filters, setFilters }: FilterBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        gap: { xs: 1, sm: 1.5 },
      }}
    >
      {/* Search */}
      <TextField
        fullWidth
        size="small"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="Search tasks..."
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search style={{ width: 16, height: 16 }} />
              </InputAdornment>
            ),
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setFilters({ ...filters, search: "" })}
                  edge="end"
                  aria-label="clear search"
                >
                  <X style={{ width: 14, height: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{ flex: 1 }}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Priority Filter */}
        <FormControl size="small">
          <Select
            value={filters.priority}
            onChange={(e: SelectChangeEvent) =>
              setFilters({ ...filters, priority: e.target.value })
            }
            displayEmpty
            startAdornment={
              <InputAdornment position="start" sx={{ display: { sm: "none" } }}>
                <SlidersHorizontal style={{ width: 14, height: 14 }} />
              </InputAdornment>
            }
            renderValue={(value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "All Priorities")}
          >
            <MenuItem value="">All Priorities</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
        </FormControl>

        {/* Clear Filters */}
        <AnimatePresence>
          {(filters.priority || filters.search) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <IconButton
                size="small"
                onClick={() =>
                  setFilters({ search: "", category: "", priority: "", status: "" })
                }
                aria-label="clear filters"
                color="error"
                sx={{ borderRadius: 2 }}
              >
                <X style={{ width: 14, height: 14 }} />
              </IconButton>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
