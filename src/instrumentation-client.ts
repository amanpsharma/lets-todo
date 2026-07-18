function initializeTheme() {
  try {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    document.documentElement.classList.toggle(
      "dark",
      storedTheme === "dark" || (storedTheme === null && prefersDark),
    );
  } catch {
    // Storage may be unavailable in restricted browsing contexts.
  }
}

function removeLegacyOfflineState() {
  if ("serviceWorker" in navigator) {
    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) {
          void registration.unregister();
        }
      })
      .catch(() => {});
  }

  if ("caches" in window) {
    void caches
      .keys()
      .then((keys) => {
        for (const key of keys) {
          void caches.delete(key);
        }
      })
      .catch(() => {});
  }
}

initializeTheme();
removeLegacyOfflineState();
