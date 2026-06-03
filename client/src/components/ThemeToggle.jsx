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
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      aria-label="Toggle theme"
    >
      {isDark ? <HiSun className="h-5 w-5 text-amber-400" /> : <HiMoon className="h-5 w-5 text-indigo-500" />}
      {isDark ? "Light" : "Dark"}
    </motion.button>
  );
}
