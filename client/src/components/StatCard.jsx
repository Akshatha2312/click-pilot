import { motion } from "framer-motion";

export default function StatCard({ label, value, note, icon, tone = "indigo" }) {
  const toneClasses = {
    indigo: "from-brand-500 to-violet-500",
    cyan: "from-cyan-500 to-blue-500",
    emerald: "from-emerald-500 to-green-500",
    orange: "from-orange-500 to-amber-500",
    pink: "from-pink-500 to-fuchsia-500",
  };

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</p>
          <strong className="mt-2 block text-3xl font-heading font-bold text-slate-900 dark:text-white">{value}</strong>
          {note ? <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">{note}</span> : null}
        </div>
        <div className={`rounded-xl bg-gradient-to-br p-2.5 text-white ${toneClasses[tone] || toneClasses.indigo}`}>
          {icon}
        </div>
      </div>
    </motion.article>
  );
}
