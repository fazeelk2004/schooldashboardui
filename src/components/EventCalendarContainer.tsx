import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = searchParams;
  return (
    <div className="dashboard-card rounded-[22px] border border-line/75 bg-surface p-5 shadow-soft">
      <EventCalendar />
      <div className="mt-5 flex items-center justify-between">
        <div><span className="dashboard-section-kicker">Today</span><h2 className="mt-1 text-base font-bold text-ink">Upcoming events</h2></div>
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
