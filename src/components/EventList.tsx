import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  const { role, schoolId } = getCurrentUser();

  const date = dateParam ? new Date(dateParam) : new Date();

  const data = await prisma.event.findMany({
    where: {
      startTime: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999)),
      },
      // School scoping for non-superadmin (default-deny if no schoolId)
      ...(role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {}),
    },
  });

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-ink-subtle">
        No events on this day.
      </div>
    );
  }

  return data.map((event, idx) => (
    <div
      className="event-list-item group rounded-2xl border border-line/70 bg-surface-muted/55 p-4 transition hover:border-brand/30 hover:bg-surface"
      key={event.id}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
              idx % 2 === 0 ? "bg-brand" : "bg-amber-400"
            }`}
          />
          <h3 className="truncate text-sm font-semibold text-ink">
            {event.title}
          </h3>
        </div>
        <span className="shrink-0 text-[11px] font-medium text-ink-subtle">
          {event.startTime.toLocaleTimeString("en-UK", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      </div>
      {event.description && (
        <p className="mt-2 pl-5 text-xs text-ink-muted line-clamp-2">
          {event.description}
        </p>
      )}
    </div>
  ));
};

export default EventList;
