import { motion } from "framer-motion";
import { HiMoon, HiSun } from "react-icons/hi2";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.04 }}
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-xl border border-customSec/80 dark:border-white/10 bg-white/90 dark:bg-customDark/60 px-3.5 py-2 text-sm font-bold text-customDark dark:text-slate-200 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <HiSun className="h-5 w-5 text-amber-400 animate-spin-slow" /> : <HiMoon className="h-5 w-5 text-indigo-400" />}
      {isDark ? "Light" : "Dark"}
    </motion.button>
  );
}
