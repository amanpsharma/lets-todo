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

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to TaskFlow!",
    description:
      "Your personal task manager with collaboration, focus tools, and beautiful analytics. Let us show you around.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: CheckCircle2,
    title: "Create & Organize Tasks",
    description:
      "Add tasks with priorities, categories, due dates, and recurring schedules. Press Ctrl+N to quickly create a new task.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Users,
    title: "Collaborate with Friends",
    description:
      "Add friends, share tasks, and chat in real-time. Stay connected and productive together.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Timer,
    title: "Stay Focused",
    description:
      "Use the built-in Pomodoro timer to work in focused sprints. Press Ctrl+P to start a focus session.",
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Columns3,
    title: "Multiple Views",
    description:
      "Switch between list, Kanban board, and calendar views. Find the layout that works best for you.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    description:
      "View completion rates, streaks, and category breakdowns in the Analytics dashboard. Stay motivated!",
    color: "from-amber-500 to-yellow-600",
  },
];

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("taskflow-onboarding-complete");
    if (!seen) {
      // Small delay so the app loads first
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
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-[60]"
          >
            <div className="glass-card rounded-3xl shadow-2xl p-6 sm:p-8 text-center">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-1.5 mb-6">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step
                        ? "w-8 bg-violet-500"
                        : i < step
                        ? "w-4 bg-violet-300 dark:bg-violet-700"
                        : "w-4 bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${current.color} shadow-xl mb-5`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-3">
                    {current.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                    {current.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={finish}
                  className="flex-1 py-3 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Skip
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={next}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all"
                >
                  {step < steps.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    "Get Started"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
