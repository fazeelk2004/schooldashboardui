import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = searchParams;
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <EventCalendar />
      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Upcoming Events</h2>
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
