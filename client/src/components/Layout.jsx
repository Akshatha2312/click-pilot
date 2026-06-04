import { NavLink, Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiArrowLeftOnRectangle,
  HiBars3,
  HiChartBarSquare,
  HiLink,
  HiPlusCircle,
  HiXMark,
} from "react-icons/hi2";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: <HiChartBarSquare className="h-5 w-5" /> },
  { to: "/app/links/new", label: "Create Link", icon: <HiPlusCircle className="h-5 w-5" /> },
  { to: "/app/links", label: "My Links", icon: <HiLink className="h-5 w-5" /> },
];

const getPageTitle = (pathname) => {
  if (pathname.startsWith("/app/dashboard")) return "Dashboard Overview";
  if (pathname.startsWith("/app/links/new")) return "Create Short Link";
  if (pathname.startsWith("/app/links")) return "My Short Links";
  if (pathname.startsWith("/app/analytics")) return "Detailed Analytics";
  return "ClickPilot App";
};

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen animated-bg bg-customBg dark:bg-customDark transition-colors duration-300">
      <div className="mx-auto flex max-w-[1600px] gap-4 p-3 sm:p-4 lg:p-6">
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`fixed inset-y-0 left-0 z-40 w-72 transform glass p-4 transition-transform duration-300 lg:static lg:translate-x-0 lg:min-h-[calc(100vh-3rem)] lg:rounded-3xl ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="mb-8 flex items-center justify-between">
            <Link to="/app/dashboard" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.4 }}
                className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-customAccent to-orange-500 font-heading text-lg font-bold text-white shadow-md shadow-customAccent/10"
              >
                CP
              </motion.div>
              <div>
                <h1 className="font-heading text-xl font-bold tracking-tight text-customDark dark:text-white group-hover:text-customAccent transition-colors">ClickPilot</h1>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Smart Link Platform</p>
              </div>
            </Link>
            <button
              type="button"
              className="lg:hidden rounded-lg p-2 hover:bg-customSec/20 dark:hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              <HiXMark className="h-5 w-5 text-customDark dark:text-white" />
            </button>
          </div>

          <div className="mb-7 rounded-2xl bg-gradient-to-br from-customAccent/10 to-orange-500/10 p-4 border border-customAccent/10">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Signed in as</p>
            <p className="mt-0.5 truncate font-semibold text-customDark dark:text-slate-200">{user?.name || user?.email}</p>
          </div>

          <nav className="space-y-1.5 relative">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-customDark dark:text-slate-200 hover:bg-customSec/25 dark:hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="activeNav"
                        className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-customAccent to-orange-500 shadow-md shadow-customAccent/25"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <span className={isActive ? "text-white" : "text-customDark/70 dark:text-slate-400 group-hover:text-customAccent transition-colors"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </motion.aside>

        <div className="min-w-0 flex-1 flex flex-col">
          <header className="glass mb-4 flex items-center justify-between rounded-2xl px-4 py-3 lg:px-6 sticky top-3 sm:top-4 lg:top-6 z-30 shadow-sm border border-white/20 dark:border-white/5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden rounded-xl border border-customSec dark:border-slate-700 p-2"
                onClick={() => setOpen(true)}
              >
                <HiBars3 className="h-5 w-5 text-customDark dark:text-white" />
              </button>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-customAccent">Smart Dashboard</p>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-customDark dark:text-white">
                  {getPageTitle(location.pathname)}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                type="button"
                className="btn-secondary py-2 px-3 text-sm flex items-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-550 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-200"
                title="Logout"
              >
                <HiArrowLeftOnRectangle className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 rounded-3xl glass p-4 sm:p-6 shadow-sm border border-white/25 dark:border-white/5"
          >
            <Outlet />
          </motion.main>

          <footer className="mt-4 py-4 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
            Developed with ❤️ by Akshuu
          </footer>
        </div>
      </div>

      {open ? <button type="button" className="fixed inset-0 z-30 bg-customDark/40 backdrop-blur-xs lg:hidden" onClick={() => setOpen(false)} /> : null}
    </div>
  );
}
