"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, ListTodo } from "lucide-react";
import { Stats } from "@/types/todo";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
} from "@mui/material";

interface StatsPanelProps {
  stats: Stats | null;
}

const cards = (stats: Stats) => [
  {
    label: "Total",
    value: stats.total,
    icon: ListTodo,
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    bgColor: "rgba(59,130,246,0.08)",
    shadowColor: "rgba(59,130,246,0.2)",
  },
  {
    label: "Done",
    value: stats.completed,
    icon: CheckCircle2,
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    bgColor: "rgba(16,185,129,0.08)",
    shadowColor: "rgba(16,185,129,0.2)",
  },
  {
    label: "Active",
    value: stats.active,
    icon: Clock,
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    bgColor: "rgba(245,158,11,0.08)",
    shadowColor: "rgba(245,158,11,0.2)",
  },
  {
    label: "Overdue",
    value: stats.overdue,
    icon: AlertTriangle,
    gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    bgColor: "rgba(239,68,68,0.08)",
    shadowColor: "rgba(239,68,68,0.2)",
  },
];

export default function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) return null;

  return (
    <Grid container spacing={1.5}>
      {cards(stats).map((card, index) => {
        const Icon = card.icon;
        return (
          <Grid key={card.label} size={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Card
                elevation={0}
                sx={{
                  backgroundColor: card.bgColor,
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: 2,
                        background: card.gradient,
                        boxShadow: `0 4px 12px ${card.shadowColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon style={{ width: 14, height: 14, color: "#fff" }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                        {card.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.625rem" }}
                      >
                        {card.label}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
}
