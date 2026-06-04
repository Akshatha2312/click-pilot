import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const gamifiedMessages = [
  "Preparing your dashboard...",
  "Analyzing clicks...",
  "Building insights...",
  "Loading analytics...",
  "Generating statistics...",
];

export default function LoadingScreen({ text }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    // Only cycle messages if no specific text is passed
    if (text) return;

    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % gamifiedMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [text]);

  const activeText = text || gamifiedMessages[msgIndex];

  return (
    <div className="min-h-screen animated-bg bg-customBg dark:bg-customDark flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glass rounded-3xl px-10 py-9 text-center shadow-xl border border-white/20 dark:border-white/5 max-w-sm w-full"
      >
        <div className="relative mx-auto mb-6 h-16 w-16">
          {/* Inner pulse */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-2 rounded-full bg-customAccent/20"
          />
          {/* Outer rotating gradient ring */}
          <div className="absolute inset-0 rounded-full border-4 border-customSec/20" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-customAccent border-r-customAccent"
          />
        </div>

        <div className="h-6 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeText}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="font-bold text-sm tracking-wide text-customDark/85 dark:text-slate-205 uppercase"
            >
              {activeText}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
