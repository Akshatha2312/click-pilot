import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HiArrowLeft, HiExclamationTriangle } from "react-icons/hi2";

export default function NotFound() {
  return (
    <div className="min-h-screen animated-bg bg-hero-light dark:bg-hero-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-4xl text-white"
        >
          <HiExclamationTriangle />
        </motion.div>

        <h1 className="heading-xl mb-4 text-slate-900 dark:text-white">404 - Page Not Found</h1>
        <p className="mb-8 text-lg text-slate-600 dark:text-slate-300">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="btn-primary">
            <HiArrowLeft /> Back Home
          </Link>
          <Link to="/start" className="btn-secondary">
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
