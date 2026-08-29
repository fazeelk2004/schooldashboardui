"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const localizer = momentLocalizer(moment);

export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  subjectName: string;
  teacherName: string;
  className: string;
};

const EventComponent = ({ event }: { event: CalendarEvent }) => {
  return (
    <div className="h-full w-full overflow-hidden px-1 text-[10px] leading-[1.1]">

      <div className="truncate font-semibold text-ink">
        {event.title}
      </div>

      <div className="truncate text-ink-muted">
        {event.subjectName}
      </div>

      <div className="truncate text-ink-muted">
        {event.teacherName}
      </div>

      <div className="truncate text-ink-muted">
        {event.className}
      </div>
    </div>
  );
};

const BigCalendar = ({ data }: { data: CalendarEvent[] }) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  // Auto-switch to day view on small screens so the schedule stays readable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = (matches: boolean) =>
      setView((prev) => {
        if (matches) return Views.DAY;
        if (prev === Views.DAY) return Views.WORK_WEEK;
        return prev;
      });
    apply(mq.matches);
    const onChange = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    <Calendar<CalendarEvent>
      localizer={localizer}
      events={data}
      startAccessor="start"
      endAccessor="end"
      views={[Views.WORK_WEEK, Views.DAY]}
      view={view}
      style={{ height: "98%" }}
      onView={handleOnChangeView}
      min={new Date(2025, 1, 0, 8, 0, 0)}
      max={new Date(2025, 1, 0, 17, 0, 0)}
      components={{
        event: EventComponent,
      }}
      eventPropGetter={() => ({
        className: "overflow-hidden rounded-xl border-none",
      })}
      onDoubleClickEvent={(event) => {
        toast.info(`Time: ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}, Title: ${event.title}, Subject: ${event.subjectName}, Teacher: ${event.teacherName}, Class: ${event.className}`)
      }}
      tooltipAccessor={(event) =>
        `\nTitle : ${event.title}\nSubject : ${event.subjectName}\nTeacher : ${event.teacherName}\nClass : ${event.className}`
      }
    />
  );
};

export default BigCalendar;
