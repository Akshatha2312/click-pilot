import { motion } from "framer-motion";

export default function LoadingScreen({ text = "Loading ClickPilot..." }) {
  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl px-8 py-7 text-center"
      >
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="font-semibold text-slate-700 dark:text-slate-100">{text}</p>
      </motion.div>
    </div>
  );
}
