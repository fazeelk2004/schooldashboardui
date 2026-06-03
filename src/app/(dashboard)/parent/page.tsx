import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


const ParentPage = async () => {
  const { userId } = auth();
  const currentUserId = userId;
  
  const students = await prisma.student.findMany({
    where: {
      parentId: currentUserId!,
    },
  });

  return (
    <div className="flex flex-col gap-5 p-5 xl:flex-row">
      {/* LEFT */}
      <div className="flex w-full flex-col gap-5 xl:w-2/3">
        {students.map((student) => (
          <div
            className="h-full rounded-2xl border border-line bg-surface p-5 shadow-soft"
            key={student.id}
          >
            <div className="mb-4">
              <h1 className="text-xl font-semibold text-ink">
                Schedule ({student.name + " " + student.surname})
              </h1>
              <p className="text-xs text-ink-subtle mt-1">
                Class lessons for the week.
              </p>
            </div>
            <BigCalendarContainer type="classId" id={student.classId} />
          </div>
        ))}
      </div>
      {/* RIGHT */}
      <div className="flex w-full flex-col gap-5 xl:w-1/3">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
