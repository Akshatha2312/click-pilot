export default function SkeletonCard() {
  return (
    <div className="card p-6 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden bg-white/40 dark:bg-slate-900/25">
      <div className="animate-pulse space-y-4">
        <div className="h-3.5 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-20 rounded-lg bg-slate-250 dark:bg-slate-750" />
        <div className="h-3.5 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
