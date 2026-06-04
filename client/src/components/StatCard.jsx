import { motion } from "framer-motion";

export default function StatCard({ label, value, note, icon, tone = "indigo" }) {
  const toneClasses = {
    indigo: "from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/10",
    cyan: "from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/10",
    emerald: "from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/10",
    orange: "from-customAccent to-orange-600 shadow-lg shadow-customAccent/10",
    pink: "from-pink-500 to-rose-600 shadow-lg shadow-pink-500/10",
  };

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="card p-5 h-full flex flex-col justify-between border border-customSec/30 dark:border-white/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">{label}</p>
          <strong className="mt-2.5 block text-3xl font-heading font-extrabold text-customDark dark:text-white leading-none">{value}</strong>
          {note ? (
            <span className="mt-2 block text-xs text-slate-400 dark:text-slate-500 font-medium truncate" title={note}>
              {note}
            </span>
          ) : null}
        </div>
        <div className={`rounded-2xl bg-gradient-to-br p-3 text-white shrink-0 ${toneClasses[tone] || toneClasses.indigo}`}>
          {icon}
        </div>
      </div>
    </motion.article>
  );
}
