import { motion } from "framer-motion";
import { HiOutlineFolderOpen } from "react-icons/hi2";

export default function EmptyState({ title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card border-dashed border-2 border-slate-200 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center bg-white/30 dark:bg-slate-900/10 backdrop-blur-sm"
    >
      <motion.div
        animate={{ 
          y: [0, -4, 0],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="mb-4 text-slate-400 dark:text-slate-500"
      >
        <HiOutlineFolderOpen className="h-12 w-12" />
      </motion.div>
      <h4 className="font-heading text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h4>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
