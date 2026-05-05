import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth } from "@clerk/nextjs/server";

const TeacherPage = () => {
  const { userId } = auth();
  return (
    <div className="flex flex-1 flex-col gap-5 p-5 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-ink">Schedule</h1>
            <p className="text-xs text-ink-subtle mt-1">
              Your weekly teaching timetable.
            </p>
          </div>
          <BigCalendarContainer type="teacherId" id={userId!} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex w-full flex-col gap-5 xl:w-1/3">
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;
