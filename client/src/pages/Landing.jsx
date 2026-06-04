import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HiArrowRight,
  HiQrCode,
  HiChartBarSquare,
  HiCheckCircle,
  HiLockClosed,
  HiShieldCheck,
  HiCpuChip,
  HiSparkles,
} from "react-icons/hi2";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const features = [
  {
    icon: <HiQrCode className="h-6 w-6" />,
    title: "Instant QR Codes",
    description: "Every short link generated automatically creates a clean, high-resolution QR code perfect for print and digital materials.",
    tone: "accent",
  },
  {
    icon: <HiChartBarSquare className="h-6 w-6" />,
    title: "Real-time Metrics",
    description: "Track visit counts, device categories, web browser client distribution, and geographical parameters instantly without delays.",
    tone: "dark",
  },
  {
    icon: <HiCheckCircle className="h-6 w-6" />,
    title: "Branded Shortlinks",
    description: "Establish link trust and increase CTR by crafting memorable, custom domain aliases and unique code keywords.",
    tone: "sec",
  },
  {
    icon: <HiLockClosed className="h-6 w-6" />,
    title: "Secure Redirection",
    description: "Enterprise grade link routing mechanisms shield your target users from malware, spam redirections, and security breaches.",
    tone: "accent",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-customBg text-customDark dark:bg-customDark dark:text-slate-100 transition-colors duration-300 overflow-x-hidden selection:bg-customAccent/30 selection:text-customDark">
      {/* Grid Pattern BG */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#bfc9d120_1px,transparent_1px),linear-gradient(to_bottom,#bfc9d120_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-customAccent/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-orange-400/5 blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-customSec/40 dark:border-white/10 bg-white/70 dark:bg-customDark/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
              className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-customAccent to-orange-500 font-heading text-lg font-bold text-white shadow-md shadow-customAccent/25"
            >
              CP
            </motion.div>
            <span className="font-heading text-xl font-black tracking-tight text-customDark dark:text-white group-hover:text-customAccent transition-colors">
              ClickPilot
            </span>
          </Link>
          <div className="flex items-center gap-3.5">
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2 shadow-sm">
              Get Started <HiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-28 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-customAccent/10 border border-customAccent/30 px-3.5 py-1 text-xs font-bold text-customAccent"
            >
              <HiSparkles className="h-3.5 w-3.5" /> Introducing click tracking 2.0
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="heading-xl bg-gradient-to-br from-customDark via-customDark to-slate-700 dark:from-white dark:via-white dark:to-customSec bg-clip-text text-transparent leading-none"
            >
              Shorten, Track and Analyze Links <span className="text-customAccent">Smarter</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="text-lg sm:text-xl text-slate-650 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              The enterprise shortlink management platform providing granular device metrics, geographic locations, instant dynamic QR generation, and real-time updates.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start"
            >
              <Link to="/register" className="btn-primary px-7 py-3 text-base shadow-lg shadow-customAccent/20">
                Start Shortening Free <HiArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="btn-secondary px-7 py-3 text-base">
                View Demo
              </Link>
            </motion.div>

            {/* Translation Demo Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl border border-customSec/40 dark:border-white/10 bg-white/70 dark:bg-customDark/50 p-6 shadow-xl max-w-xl mx-auto lg:mx-0 backdrop-blur-md"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-customSec/25 pb-2">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Example mapping</span>
                  <span className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                  <code className="flex-1 rounded-lg bg-slate-900 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-customAccent overflow-hidden text-left font-mono font-medium">
                    https://company.com/pages/marketing/campaign?source=social&medium=twitter
                  </code>
                  <span className="text-customAccent font-bold text-lg rotate-90 sm:rotate-0 self-center">→</span>
                  <code className="rounded-lg bg-slate-900 dark:bg-slate-950 px-4 py-2.5 text-xs text-emerald-400 font-mono font-bold text-center">
                    clickpilot.link/t5x89a
                  </code>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Mock Dashboard View */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="card p-5 bg-white/80 dark:bg-customDark/80 border border-customSec/30 shadow-2xl relative overflow-hidden backdrop-blur-md"
            >
              {/* Fake dashboard elements */}
              <div className="flex items-center justify-between mb-4 border-b border-customSec/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-customAccent" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">Live Pilot Console</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Connected</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-customBg/50 dark:bg-customDark p-3 border border-customSec/20">
                  <p className="text-3xs uppercase tracking-wider text-slate-400">Short Links</p>
                  <p className="text-xl font-bold font-heading text-customDark dark:text-white">12,845</p>
                </div>
                <div className="rounded-xl bg-customBg/50 dark:bg-customDark p-3 border border-customSec/20">
                  <p className="text-3xs uppercase tracking-wider text-slate-400">Clicks Logged</p>
                  <p className="text-xl font-bold font-heading text-customAccent">892,305</p>
                </div>
              </div>
              {/* Fake graph representation */}
              <div className="space-y-2 mb-4">
                <p className="text-3xs uppercase tracking-wider text-slate-400">Real-time load activity</p>
                <div className="h-28 rounded-xl bg-slate-900 flex items-end p-2 gap-2 justify-between">
                  {[20, 45, 30, 60, 50, 75, 40, 90, 85, 110, 65, 120, 80].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h / 1.5}px` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className={`w-full rounded-t-sm ${i === 11 ? "bg-customAccent" : "bg-customSec/40"}`}
                    />
                  ))}
                </div>
              </div>
              {/* Fake link entries */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-customBg/30 dark:bg-customDark/50 text-2xs font-semibold border border-customSec/10">
                  <span className="font-mono text-customAccent">cp.link/sales</span>
                  <span className="text-emerald-500 font-bold">1.2k clicks</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-customBg/30 dark:bg-customDark/50 text-2xs font-semibold border border-customSec/10">
                  <span className="font-mono text-slate-400">cp.link/launch</span>
                  <span className="text-slate-400">450 clicks</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-customSec/20 dark:border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="heading-lg">Engineered for Performance and Brand Growth</h2>
          <p className="text-slate-600 dark:text-slate-450 font-medium text-lg">
            Everything you need to deploy, monitor, and scale short links successfully.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={item}
              whileHover={{ y: -6, scale: 1.01 }}
              className="card p-6 border border-customSec/30 bg-white/70 dark:bg-customDark/40 flex flex-col justify-between"
            >
              <div>
                <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-br from-customAccent to-orange-500 p-3.5 text-white shadow-md shadow-customAccent/25`}>
                  {feature.icon}
                </div>
                <h3 className="mb-2.5 font-heading text-lg font-bold text-customDark dark:text-white">{feature.title}</h3>
                <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed font-medium">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Interactive Statistics Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-customSec/10 dark:bg-customDark/30 rounded-3xl border border-customSec/20 dark:border-white/5">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { label: "Links Shortened & Hosted", value: "10M+", sub: "Increasing by 500k monthly" },
            { label: "Total Redirect Visits Logged", value: "500M+", sub: "99.99% redirect uptime" },
            { label: "Satisfied Business Teams", value: "50K+", sub: "Trusted by companies globally" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="text-center space-y-2 p-4"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">{stat.label}</p>
              <p className="text-5xl font-black font-heading text-transparent bg-gradient-to-r from-customAccent to-orange-500 bg-clip-text leading-none py-1">
                {stat.value}
              </p>
              <p className="text-2xs font-semibold text-slate-500 dark:text-slate-400">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-r from-customDark via-customDark to-slate-900 p-10 sm:p-14 text-center shadow-2xl border border-white/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#ff9b5115,transparent_50%)]" />
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="heading-lg text-white">Supercharge your link workflows today</h2>
            <p className="text-base text-slate-300 leading-relaxed font-medium">
              Join professional builders and analytics-driven teams shortening links and scaling traffic statistics with ClickPilot.
            </p>
            <div className="pt-2">
              <Link to="/register" className="btn-primary px-8 py-3.5 text-base shadow-lg shadow-customAccent/20">
                Create Free Account <HiArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-customSec/30 dark:border-white/5 bg-white/40 dark:bg-customDark/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <p>© 2026 ClickPilot. Developed with ❤️ for Akshuu. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-customAccent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-customAccent transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
