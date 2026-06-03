import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { HiArrowRight, HiEnvelope, HiKey } from "react-icons/hi2";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/app/dashboard";

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    isSubmitting.current = true;

    try {
      const response = await api.post("/auth/login", form);
      login(response.data.token, response.data.user);
      toast.success("✅ Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen animated-bg bg-hero-light dark:bg-hero-dark flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 font-heading text-2xl font-bold text-white">
              CP
            </div>
            <h1 className="heading-lg">Welcome back</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Sign in to your ClickPilot account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <HiEnvelope className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="you@example.com"
                  className={`input pl-10 ${errors.email ? "border-red-400" : ""}`}
                />
              </div>
              {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <HiKey className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  placeholder="••••••••"
                  className={`input pl-10 ${errors.password ? "border-red-400" : ""}`}
                />
              </div>
              {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password}</p> : null}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading ? <HiArrowRight /> : null}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
