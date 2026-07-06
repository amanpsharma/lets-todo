import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TaskFlow - Task Management",
    short_name: "TaskFlow",
    description:
      "A beautifully designed, feature-rich task management application with Pomodoro timer, friend sharing, and real-time chat.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    orientation: "portrait-primary",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "New Task",
        url: "/dashboard?action=new-task",
        description: "Create a new task",
      },
      {
        name: "Focus Timer",
        url: "/dashboard/pomodoro",
        description: "Start a Pomodoro focus session",
      },
      {
        name: "Chat",
        url: "/dashboard/chat",
        description: "Open messages",
      },
    ],
  };
}
