"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserSync() {
  const { isSignedIn, user, isLoaded } = useUser();
  const synced = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !synced.current) {
      synced.current = true;
      fetch("/api/users/sync", { method: "POST" })
        .then((res) => {
          if (!res.ok) {
            synced.current = false;
            console.error("User sync failed");
          }
        })
        .catch(() => {
          synced.current = false;
        });
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
