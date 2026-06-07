import type { Task } from "@/data/mockData";

type TaskListProps = {
  tasks: Task[];
};

const priorityStyles: Record<Task["priority"], string> = {
  High: "text-rose-700 bg-rose-50 ring-1 ring-rose-200",
  Medium: "text-amber-700 bg-amber-50 ring-1 ring-amber-200",
  Low: "text-slate-700 bg-slate-100 ring-1 ring-slate-200",
};

const statusStyles: Record<Task["status"], string> = {
  "In progress": "text-blue-700",
  "Needs review": "text-amber-700",
  Planned: "text-slate-500",
  Done: "text-emerald-700",
};

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <article
          key={task.id}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-950">{task.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {task.assignee} • Due {task.dueDate}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <p className={`mt-3 text-sm font-medium ${statusStyles[task.status]}`}>
            {task.status}
          </p>
        </article>
      ))}
    </div>
  );
}
