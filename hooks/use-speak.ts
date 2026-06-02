"use client";

import { useCallback, useEffect, useState } from "react";

interface UseSpeak {
  supported: boolean;
  speaking: boolean;
  toggle: (text: string) => void;
  stop: () => void;
}

// Read the answer aloud (hands-free on the floor). Strips [n] citation markers
// so the spoken version sounds natural.
export function useSpeak(): UseSpeak {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const toggle = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window))
        return;
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      const clean = text.replace(/\[\d+\]/g, "").replace(/\s+/g, " ").trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    },
    [],
  );

  return { supported, speaking, toggle, stop };
}
