import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiArrowRight,
  HiQrCode,
  HiChartBarSquare,
  HiCheckCircle,
  HiLockClosed,
} from "react-icons/hi2";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  {
    icon: <HiQrCode className="h-6 w-6" />,
    title: "QR Codes",
    description: "Generate QR codes instantly for every shortened link",
    tone: "cyan",
  },
  {
    icon: <HiChartBarSquare className="h-6 w-6" />,
    title: "Real-time Analytics",
    description: "Track clicks, devices, and locations in real-time",
    tone: "emerald",
  },
  {
    icon: <HiCheckCircle className="h-6 w-6" />,
    title: "Custom Aliases",
    description: "Create branded short links with custom codes",
    tone: "pink",
  },
  {
    icon: <HiLockClosed className="h-6 w-6" />,
    title: "Secure & Private",
    description: "Bank-level security for your links and data",
    tone: "orange",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-violet-600 font-heading text-lg font-bold text-white">
              CP
            </div>
            <span className="font-heading text-xl font-bold">ClickPilot</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn-secondary text-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started <HiArrowRight />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:py-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-500/10 via-cyan-500/10 to-violet-500/10 blur-3xl"
        />

        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            variants={item}
            initial="hidden"
            animate="show"
            className="heading-xl mb-6 bg-gradient-to-r from-slate-900 via-brand-700 to-violet-900 bg-clip-text text-transparent dark:from-white dark:via-brand-300 dark:to-cyan-300"
          >
            Shorten, Track and Manage Links Smarter
          </motion.h1>

          <motion.p
            variants={item}
            initial="hidden"
            animate="show"
            className="mb-8 text-xl text-slate-600 dark:text-slate-300"
          >
            The modern URL shortener with real-time analytics, QR codes, and custom branding. Used by teams everywhere.
          </motion.p>

          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <Link to="/register" className="btn-primary">
              Start Shortening <HiArrowRight />
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In to Account
            </Link>
          </motion.div>

          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-100/50 to-blue-100/50 dark:from-slate-900/50 dark:to-slate-800/50 p-8 shadow-xl"
          >
            <div className="space-y-3">
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Example:</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="flex-1 rounded-lg bg-slate-900 dark:bg-slate-950 px-3 py-2 text-sm text-cyan-300">
                  https://verylongurlexample.com/page/with/many/segments
                </code>
                <span className="text-slate-600 dark:text-slate-400">→</span>
                <code className="rounded-lg bg-slate-900 dark:bg-slate-950 px-3 py-2 text-sm text-emerald-300">
                  cp.io/abc123
                </code>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={item}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="heading-lg mb-4">Everything you need</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Powerful features designed for modern teams
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass rounded-2xl p-6"
              >
                <div className={`mb-4 inline-block rounded-xl bg-gradient-to-br ${
                  feature.tone === "cyan"
                    ? "from-cyan-500 to-blue-500"
                    : feature.tone === "emerald"
                      ? "from-emerald-500 to-green-500"
                      : feature.tone === "pink"
                        ? "from-pink-500 to-fuchsia-500"
                        : "from-orange-500 to-amber-500"
                } p-3 text-white`}>
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-heading text-lg font-bold">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {[
              { label: "Links Created", value: "10M+" },
              { label: "Clicks Tracked", value: "500M+" },
              { label: "Teams Using", value: "50K+" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={item}
                className="card p-8 text-center"
              >
                <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-4xl font-heading font-bold text-transparent bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-600 p-10 text-center shadow-2xl"
        >
          <h2 className="heading-lg mb-4 text-white">Ready to get started?</h2>
          <p className="mb-8 text-lg text-white/90">
            Join thousands of teams shortening links and tracking analytics with ClickPilot.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-600 transition-transform hover:scale-105">
            Create Free Account <HiArrowRight />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-600 dark:text-slate-400">
          <p>© 2026 ClickPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
