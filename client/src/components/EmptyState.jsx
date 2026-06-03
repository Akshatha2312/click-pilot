import { motion } from "framer-motion";

export default function EmptyState({ title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card border-dashed border-2 p-10 text-center"
    >
      <h4 className="font-heading text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h4>
      <p className="mt-2 text-slate-500 dark:text-slate-300">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
