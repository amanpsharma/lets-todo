"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, RefreshCw } from "lucide-react";

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "It is not enough to be busy. The question is: what are we busy about?", author: "Henry David Thoreau" },
  { text: "Productivity is never an accident. It is always the result of commitment to excellence.", author: "Paul J. Meyer" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
];

export default function MotivationalQuote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Set random quote based on day
    const dayIndex = new Date().getDate() % quotes.length;
    setIndex(dayIndex);
  }, []);

  const nextQuote = () => {
    setIndex((prev) => (prev + 1) % quotes.length);
  };

  const quote = quotes[index];

  return (
    <div className="glass-card rounded-2xl p-4 group">
      <div className="flex items-start gap-2 mb-2">
        <Quote className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <button
          onClick={nextQuote}
          className="ml-auto opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <RefreshCw className="w-3 h-3 text-gray-400" />
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
            - {quote.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
