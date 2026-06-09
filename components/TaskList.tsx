import { Badge, EmptyState } from "@/components/ui";
import {
  differenceInCalendarDays,
  formatWeekdayDate,
  getTaskDueDateLabel,
} from "@/lib/date";
import { getDueDateTone, taskPriorityTones, taskStatusTones } from "@/lib/design";
import type { WorkspaceCampaign, WorkspaceTask } from "@/lib/workspace-view";
import { deleteTask, updateTaskStatus } from "@/app/actions/workspace";
import { TaskEditForm } from "@/components/TaskEditForm";

type TaskListProps = {
  tasks: WorkspaceTask[];
  brandSlug: string;
  campaigns: Array<Pick<WorkspaceCampaign, "id" | "title">>;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function TaskList({
  tasks,
  brandSlug,
  campaigns,
  emptyTitle = "No tasks in this workspace",
  emptyDescription = "As new campaign work, approvals, or production items are added, they will appear here.",
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="data-list">
      {tasks.map((task) => {
        const dueLabel = getTaskDueDateLabel(task.dueDate);
        const dueTone = task.dueDate
          ? getDueDateTone(differenceInCalendarDays(task.dueDate))
          : "neutral";
        const quickActions = getTaskQuickActions(task.statusValue);

        return (
          <article
            key={task.id}
            role="group"
            aria-label={`Task card for ${task.title}`}
            className="data-row"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink">{task.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {task.dueDate ? `Due ${formatWeekdayDate(task.dueDate)}` : "No due date"}
                </p>
                {task.relatedCampaignTitle ? (
                  <p className="mt-1 text-sm text-ink-muted">
                    Campaign: {task.relatedCampaignTitle}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={taskPriorityTones[task.priority]}>
                  {task.priority} priority
                </Badge>
                <Badge tone={dueTone}>{dueLabel}</Badge>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={taskStatusTones[task.status]}>{task.status}</Badge>
                {quickActions.map((action) => (
                  <form key={action.status} action={updateTaskStatus}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <input type="hidden" name="brandSlug" value={brandSlug} />
                    <input type="hidden" name="status" value={action.status} />
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-full border border-app-line px-3 py-1 text-xs font-semibold text-ink-muted hover:bg-app-soft hover:text-ink"
                    >
                      {action.label}
                    </button>
                  </form>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <TaskEditForm
                  task={task}
                  brandSlug={brandSlug}
                  campaigns={campaigns}
                />
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
        );
      })}
    </div>
  );
}

function getTaskQuickActions(status: WorkspaceTask["statusValue"]) {
  switch (status) {
    case "planned":
      return [
        { status: "in_progress", label: "Start" },
        { status: "done", label: "Mark done" },
      ];
    case "in_progress":
      return [
        { status: "needs_review", label: "Send to review" },
        { status: "done", label: "Mark done" },
      ];
    case "needs_review":
      return [
        { status: "in_progress", label: "Back to work" },
        { status: "done", label: "Approve done" },
      ];
    case "done":
      return [{ status: "in_progress", label: "Reopen" }];
    case "archived":
      return [{ status: "planned", label: "Restore" }];
  }
}
