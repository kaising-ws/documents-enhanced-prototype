import type { DocumentProgress } from '../types';

export function ProgressBar({ progress }: { progress: DocumentProgress }) {
  const total = progress.total;
  if (total === 0) {
    return <span className="text-sm text-ink-500">No recipients</span>;
  }
  const completedPct = Math.round((progress.completed / total) * 100);
  const inProgressPct = Math.round((progress.in_progress / total) * 100);
  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <div className="flex-1 h-2 bg-ink-200 rounded-full overflow-hidden">
        <div className="h-full flex">
          <div className="bg-success-500" style={{ width: `${completedPct}%` }} />
          <div className="bg-warning-500" style={{ width: `${inProgressPct}%` }} />
        </div>
      </div>
      <span className="text-xs text-ink-700 whitespace-nowrap">
        {progress.completed}/{total} completed
      </span>
    </div>
  );
}
