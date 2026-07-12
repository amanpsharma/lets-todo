"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Users,
  Timer,
  BarChart3,
  ArrowRight,
  Columns3,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  Button,
  Typography,
  Box,
  MobileStepper,
} from "@mui/material";

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to TaskFlow!",
    description:
      "Your personal task manager with collaboration, focus tools, and beautiful analytics. Let us show you around.",
    color: "linear-gradient(135deg, #6366f1, #4f46e5)",
  },
  {
    icon: CheckCircle2,
    title: "Create & Organize Tasks",
    description:
      "Add tasks with priorities, categories, and due dates. Press Ctrl+N to quickly create a new task.",
    color: "linear-gradient(135deg, #10b981, #0d9488)",
  },
  {
    icon: Users,
    title: "Collaborate with Friends",
    description:
      "Add friends, share tasks, and chat in real-time. Stay connected and productive together.",
    color: "linear-gradient(135deg, #3b82f6, #06b6d4)",
  },
  {
    icon: Timer,
    title: "Stay Focused",
    description:
      "Use the built-in Pomodoro timer to work in focused sprints. Press Ctrl+P to start a focus session.",
    color: "linear-gradient(135deg, #f97316, #ef4444)",
  },
  {
    icon: Columns3,
    title: "Multiple Views",
    description:
      "Switch between list, Kanban board, and calendar views. Find the layout that works best for you.",
    color: "linear-gradient(135deg, #ec4899, #f43f5e)",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    description:
      "View completion rates, streaks, and category breakdowns in the Analytics dashboard. Stay motivated!",
    color: "linear-gradient(135deg, #f59e0b, #eab308)",
  },
];

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("taskflow-onboarding-complete");
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    localStorage.setItem("taskflow-onboarding-complete", "true");
    setShow(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const current = steps[step];
  const Icon = current.icon;

  return (
    <Dialog
      open={show}
      onClose={finish}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 4, overflow: "hidden" } },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}>
        {/* Step dots */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, mb: 3 }}>
          {steps.map((_, i) => (
            <Box
              key={i}
              sx={{
                height: 6,
                borderRadius: 3,
                width: i === step ? 32 : 16,
                bgcolor: i === step ? "primary.main" : i < step ? "primary.200" : "grey.200",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Box>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              sx={{
                display: "inline-flex",
                p: 2,
                borderRadius: 3,
                background: current.color,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                mb: 2.5,
              }}
            >
              <Icon style={{ width: 32, height: 32, color: "white" }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              {current.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", lineHeight: 1.6, maxWidth: 320, mx: "auto" }}
            >
              {current.description}
            </Typography>
          </motion.div>
        </AnimatePresence>

        <Box sx={{ mt: 4, display: "flex", gap: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={finish}
            sx={{ borderRadius: "16px", py: 1.25, textTransform: "none" }}
          >
            Skip
          </Button>
          <motion.div style={{ flex: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={next}
              endIcon={step < steps.length - 1 ? <ArrowRight style={{ width: 16, height: 16 }} /> : null}
              sx={{
                borderRadius: "16px",
                py: 1.25,
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                },
              }}
            >
              {step < steps.length - 1 ? "Next" : "Get Started"}
            </Button>
          </motion.div>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
