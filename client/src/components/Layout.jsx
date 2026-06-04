import { NavLink, Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowLeftOnRectangle,
  HiBars3,
  HiChartBarSquare,
  HiLink,
  HiPlusCircle,
  HiXMark,
} from "react-icons/hi2";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="mb-8 flex items-center justify-between">
          <Link to="/app/dashboard" className="flex items-center gap-3 group" onClick={() => isMobile && setOpen(false)}>
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
              className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-customAccent to-orange-500 font-heading text-lg font-bold text-white shadow-md shadow-customAccent/10"
            >
              CP
            </motion.div>
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-customDark dark:text-white group-hover:text-customAccent transition-colors">ClickPilot</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Smart Link Platform</p>
            </div>
          </Link>
          {isMobile && (
            <button
              type="button"
              className="rounded-xl p-2 hover:bg-customSec/20 dark:hover:bg-white/10 text-customDark dark:text-white transition-colors"
              onClick={() => setOpen(false)}
            >
              <HiXMark className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mb-7 rounded-2xl bg-gradient-to-br from-customAccent/10 to-orange-500/10 p-4 border border-customAccent/10">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Signed in as</p>
          <p className="mt-0.5 truncate font-semibold text-customDark dark:text-slate-200">{user?.name || user?.email}</p>
        </div>

        <nav className="space-y-1.5 relative">
          {navItems.map((item) => (
            <NavLink end
              key={item.to}
              to={item.to}
              onClick={() => isMobile && setOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-colors duration-200 ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-slate-700 dark:text-slate-200 hover:bg-customSec/25 dark:hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId={isMobile ? "activeNavMobile" : "activeNavDesktop"}
                      className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-customAccent to-orange-500 shadow-md shadow-customAccent/25"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className={isActive ? "text-white" : "text-slate-700 dark:text-slate-200 group-hover:text-customAccent transition-colors"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-customSec/20 dark:border-white/5 mt-auto">
        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <HiArrowLeftOnRectangle className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen animated-bg bg-customBg dark:bg-customDark transition-colors duration-300">
      <div className="mx-auto flex max-w-[1600px] gap-4 p-3 sm:p-4 lg:p-6 relative">
        
        {/* Desktop Sidebar - Static & Hidden on Mobile */}
        <aside className="hidden lg:block w-72 min-h-[calc(100vh-3rem)] rounded-3xl glass p-4 shrink-0">
          {renderSidebarContent(false)}
        </aside>

        {/* Mobile Sidebar - Drawer Overlay with AnimatePresence */}
        <AnimatePresence>
          {open && (
            <>
              {/* Dark Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-40 bg-customDark/60 backdrop-blur-xs lg:hidden"
                onClick={() => setOpen(false)}
              />
              
              {/* Drawer Container */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed inset-y-0 left-0 z-50 w-72 glass p-4 lg:hidden shadow-2xl h-full overflow-y-auto"
              >
                {renderSidebarContent(true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

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
    </div>
  );
}
