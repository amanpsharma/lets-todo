"use client";

import { motion } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-9 py-2.5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 backdrop-blur-sm transition-all"
        />
        {filters.search && (
          <button
            onClick={() => setFilters({ ...filters, search: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Priority Filter */}
        <div className="relative flex-1 sm:flex-none">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 sm:hidden" />
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="w-full sm:w-auto pl-8 sm:pl-3 pr-8 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm cursor-pointer appearance-none"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.priority || filters.search) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setFilters({ search: "", category: "", priority: "", status: "" })}
            className="flex items-center gap-1 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors whitespace-nowrap"
          >
            <X className="w-3 h-3" />
            Clear
          </motion.button>
        )}
      </div>
    </div>
  );
}
