import { Badge, EmptyState } from "@/components/ui";
import { formatWeekdayDate } from "@/lib/date";
import { taskPriorityTones, taskStatusTones } from "@/lib/design";
import type { WorkspaceTask } from "@/lib/workspace-view";
import { deleteTask } from "@/app/actions/workspace";
import { TaskEditForm } from "@/components/TaskEditForm";

type TaskListProps = {
  tasks: WorkspaceTask[];
  brandSlug: string;
};

export function TaskList({ tasks, brandSlug }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks in this workspace"
        description="As new campaign work, approvals, or production items are added, they will appear here."
      />
    );
  }

  return (
    <div className="data-list">
      {tasks.map((task) => (
        <article key={task.id} className="data-row">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink">{task.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {task.dueDate ? `Due ${formatWeekdayDate(task.dueDate)}` : "No due date"}
              </p>
            </div>
            <Badge tone={taskPriorityTones[task.priority]}>{task.priority}</Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <Badge tone={taskStatusTones[task.status]}>{task.status}</Badge>
            <div className="flex flex-wrap items-center gap-3">
              <TaskEditForm task={task} brandSlug={brandSlug} />
              <form action={deleteTask}>
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="brandSlug" value={brandSlug} />
                <button
                  type="submit"
                  className="text-sm font-medium text-danger hover:opacity-80"
                >
                  Remove
                </button>
              </form>
            </div>
          </div>
          {task.notes ? (
            <p className="mt-3 text-sm leading-6 text-ink-muted">{task.notes}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
