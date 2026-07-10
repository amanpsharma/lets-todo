import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  Sparkles,
  CheckCircle2,
  Users,
  Timer,
  MessageCircle,
  Share2,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";

export const metadata = {
  title: "TaskFlow - Smarter Task Management for Teams & Individuals",
  description:
    "Organize tasks, collaborate with friends, track progress, and stay productive with TaskFlow. Free, beautiful, and powerful.",
};

const features = [
  {
    icon: CheckCircle2,
    title: "Smart Task Management",
    description:
      "Create, organize, and prioritize tasks with categories, due dates, and priority levels.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Users,
    title: "Collaborate with Friends",
    description:
      "Add friends, share tasks, and work together on projects in real time.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: MessageCircle,
    title: "Built-in Chat",
    description:
      "Message your collaborators directly without leaving the app.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Timer,
    title: "Pomodoro Focus Timer",
    description:
      "Stay focused with a built-in Pomodoro timer. Work in sprints, rest between.",
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Share2,
    title: "Shareable Task Lists",
    description:
      "Share your task lists with anyone via a link — no sign-up required to view.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "See your productivity stats, streaks, and completion rates at a glance.",
    color: "from-amber-500 to-yellow-600",
  },
];

const stats = [
  { value: "10K+", label: "Tasks Created" },
  { value: "99.9%", label: "Uptime" },
  { value: "Free", label: "Forever" },
];

export default async function LandingPage() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-900 dark:text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-200/30 dark:bg-indigo-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-[500px] h-[500px] bg-amber-200/15 dark:bg-amber-800/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 lg:px-20 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-heading">TaskFlow</span>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-500 hover:to-indigo-400 transition-all"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-500 hover:to-indigo-400 transition-all"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-20 pt-16 sm:pt-24 pb-20 sm:pb-32 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 border border-indigo-200 dark:border-indigo-800/40">
          <Zap className="w-3.5 h-3.5" />
          Now with real-time collaboration
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-heading leading-tight tracking-tight">
          Get Things Done,{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-amber-500 to-indigo-600 bg-clip-text text-transparent">
            Together
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          The beautiful task manager that helps you organize your life,
          collaborate with friends, and stay focused — all in one place.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-500 hover:to-indigo-400 transition-all"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="group flex items-center gap-2 px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-500 hover:to-indigo-400 transition-all"
              >
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/sign-in"
                className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all backdrop-blur-sm"
              >
                I have an account
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-16 flex items-center justify-center gap-8 sm:gap-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold font-heading text-indigo-600 dark:text-indigo-400">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-20 py-20 sm:py-32 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              stay productive
            </span>
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Powerful features wrapped in a beautiful, intuitive interface.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all hover:shadow-lg hover:shadow-indigo-500/5 backdrop-blur-sm"
            >
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-4`}
              >
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-heading mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Security */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-20 py-20 max-w-4xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
          <div className="relative z-10">
            <Shield className="w-10 h-10 mx-auto mb-6 opacity-80" />
            <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-4">
              Your data is safe with us
            </h2>
            <p className="text-indigo-100 max-w-lg mx-auto mb-8">
              End-to-end encryption, secure authentication powered by Clerk,
              and your data never shared with third parties.
            </p>
            <Link
              href={isLoggedIn ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-2xl hover:bg-indigo-50 transition-colors shadow-xl"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started — It's Free"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 sm:px-10 lg:px-20 py-10 border-t border-gray-200/60 dark:border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold font-heading">TaskFlow</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} TaskFlow. Built with Next.js &amp; love.
          </p>
        </div>
      </footer>
    </div>
  );
}
