import clsx from "clsx";

export default function FloatingInput({ label, error, className, ...props }) {
  return (
    <div className={clsx("relative", className)}>
      <input
        {...props}
        placeholder=" "
        className={clsx(
          "peer input h-12",
          error && "border-red-400 focus:ring-red-300"
        )}
      />
      <label className="absolute left-3 top-3 origin-[0] -translate-y-6 scale-75 transform rounded bg-white dark:bg-slate-900 px-1 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-brand-600 dark:peer-focus:text-brand-300">
        {label}
      </label>
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
