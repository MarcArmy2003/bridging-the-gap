"use client";

import { useEffect, useState } from "react";

const DEMO_KEY = "sg_demo_mode";

export function useDemo() {
  const [isDemo, setIsDemo] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DEMO_KEY);
      setIsDemo(raw === "true");
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DEMO_KEY, isDemo ? "true" : "false");
    } catch (e) {
      // ignore
    }
  }, [isDemo]);

  function toggleDemo() {
    setIsDemo((v) => !v);
  }

  return { isDemo, setIsDemo, toggleDemo } as const;
}
