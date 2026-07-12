"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Timer,
  Moon,
  Keyboard,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewTask: () => void;
  onTogglePomodoro: () => void;
  onToggleTheme: () => void;
}

interface Command {
  id: string;
  label: string;
  description: string;
  icon: typeof Plus;
  action: () => void;
  shortcut?: string;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNewTask,
  onTogglePomodoro,
  onToggleTheme,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: "new-task",
      label: "New Task",
      description: "Create a new task",
      icon: Plus,
      action: onNewTask,
      shortcut: "Ctrl+N",
    },
    {
      id: "pomodoro",
      label: "Focus Timer",
      description: "Open pomodoro timer",
      icon: Timer,
      action: onTogglePomodoro,
      shortcut: "Ctrl+P",
    },
    {
      id: "theme",
      label: "Toggle Theme",
      description: "Switch between light and dark mode",
      icon: Moon,
      action: onToggleTheme,
    },
    {
      id: "shortcuts",
      label: "Keyboard Shortcuts",
      description: "View all keyboard shortcuts",
      icon: Keyboard,
      action: () => {},
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            mt: { xs: "15vh", sm: "20vh" },
            verticalAlign: "top",
            overflow: "hidden",
          },
        },
        backdrop: {
          sx: { backdropFilter: "blur(4px)" },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Search Input */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            variant="standard"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            slotProps={{
              input: {
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search style={{ width: 20, height: 20, color: "#9ca3af" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Chip label="ESC" size="small" variant="outlined" sx={{ fontSize: "0.6rem", height: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ "& input": { fontSize: "0.875rem" } }}
          />
        </Box>

        {/* Commands List */}
        <Box sx={{ maxHeight: 256, overflowY: "auto", p: 1 }}>
          {filteredCommands.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Zap
                style={{ width: 32, height: 32, color: "#d1d5db", margin: "0 auto 8px" }}
              />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No commands found
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                const selected = index === selectedIndex;
                return (
                  <ListItemButton
                    key={cmd.id}
                    selected={selected}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    sx={{ borderRadius: 2, mb: 0.25 }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        "& > div": {
                          p: 0.75,
                          borderRadius: 1.5,
                          bgcolor: selected ? "primary.100" : "action.selected",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
                    >
                      <div>
                        <Icon style={{ width: 16, height: 16 }} />
                      </div>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {cmd.label}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {cmd.description}
                        </Typography>
                      }
                      disableTypography={false}
                    />
                    {cmd.shortcut && (
                      <Chip
                        label={cmd.shortcut}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.6rem", height: 20, ml: 1 }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            px: 2.5,
            py: 1.25,
            borderTop: 1,
            borderColor: "divider",
            gap: 2,
          }}
        >
          {[
            { key: "↑↓", label: "Navigate" },
            { key: "↵", label: "Select" },
            { key: "Esc", label: "Close" },
          ].map(({ key, label }) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Chip
                label={key}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.6rem", height: 18 }}
              />
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
