import { NavLink, Outlet, useNavigate } from "react-router-dom";
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

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen animated-bg bg-hero-light dark:bg-hero-dark transition-colors duration-300">
      <div className="mx-auto flex max-w-[1600px] gap-4 p-3 sm:p-4 lg:p-6">
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`fixed inset-y-0 left-0 z-40 w-72 transform glass p-4 transition-transform duration-300 lg:static lg:translate-x-0 lg:min-h-[calc(100vh-3rem)] lg:rounded-3xl ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 font-heading text-lg font-bold text-white">
                CP
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold">ClickPilot</h1>
                <p className="text-xs text-slate-500 dark:text-slate-300">Smart Link Platform</p>
              </div>
            </div>
            <button
              type="button"
              className="lg:hidden rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setOpen(false)}
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-7 rounded-2xl bg-gradient-to-br from-brand-500/20 via-cyan-500/20 to-emerald-500/20 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">Signed in as</p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">{user?.name || user?.email}</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 flex items-center gap-2">
            <ThemeToggle />
            <button onClick={handleLogout} type="button" className="btn-secondary flex-1">
              <HiArrowLeftOnRectangle className="h-5 w-5" /> Logout
            </button>
          </div>
        </motion.aside>

        <div className="min-w-0 flex-1">
          <header className="glass mb-4 flex items-center justify-between rounded-2xl px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden rounded-xl border border-slate-200 dark:border-slate-700 p-2"
                onClick={() => setOpen(true)}
              >
                <HiBars3 className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">SaaS Dashboard</p>
                <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Manage your links smarter</h2>
              </div>
            </div>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-[calc(100vh-8rem)] rounded-3xl glass p-4 sm:p-6"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>

      {open ? <button type="button" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} /> : null}
    </div>
  );
}
