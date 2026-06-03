export default function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-8 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-3 w-36 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
