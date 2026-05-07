import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import { getCurrentUser } from "@/lib/utils";

type LessonList = Lesson & { subject: Subject } & { class: Class } & {
  teacher: Teacher;
};

const dayLabel: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
};

const formatTime = (d: Date) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDate = (d: Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "—";

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { role, schoolId } = getCurrentUser();

  const columns = [
    { header: "Subject", accessor: "name" },
    { header: "Schedule", accessor: "schedule" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Semester", accessor: "semester", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "", accessor: "action" }] : []),
    ...(role === "superadmin"
      ? [{ header: "School", accessor: "school", className: "hidden md:table-cell" }]
      : []),
  ];

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b border-line text-sm hover:bg-surface-subtle transition"
    >
      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="font-medium text-ink">{item.subject.name}</span>
          <span className="text-xs text-ink-subtle">{item.name}</span>
        </div>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center min-w-[44px] px-2 py-1 rounded-md bg-surface-subtle text-[11px] font-semibold text-ink-muted">
            {dayLabel[item.day] ?? item.day}
          </span>
          <span className="text-xs text-ink-muted">
            {formatTime(item.startTime)} – {formatTime(item.endTime)}
          </span>
        </div>
      </td>
      <td className="hidden md:table-cell py-4 text-ink-muted">{item.class.name}</td>
      <td className="hidden md:table-cell py-4 text-ink-muted">
        {item.teacher.name} {item.teacher.surname}
      </td>
      <td className="hidden lg:table-cell py-4 text-xs text-ink-subtle">
        {formatDate((item as any).semesterStart)} → {formatDate((item as any).semesterEnd)}
      </td>
      {role === "admin" && (
        <td className="py-4">
          <div className="flex items-center gap-2">
            <FormContainer table="lesson" type="update" data={item} />
            <FormContainer table="lesson" type="delete" id={item.id} />
          </div>
        </td>
      )}
      {role === "superadmin" && (
        <td className="hidden md:table-cell py-4">
          <span className="text-xs bg-surface-subtle text-ink-muted px-2 py-1 rounded-md">
            {(item as any).school?.name}
          </span>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.LessonWhereInput = {};
  if (role !== "superadmin") query.schoolId = schoolId ?? -1;

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        switch (key) {
          case "classId":
            query.classId = parseInt(value);
            break;
          case "teacherId":
            query.teacherId = value;
            break;
          case "subjectId":
            query.subjectId = parseInt(value);
            break;
          case "day":
            query.day = value as any;
            break;
          case "search":
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const order = (queryParams.order as "asc" | "desc") ?? "asc";
  const sortMap: Record<string, Prisma.LessonOrderByWithRelationInput | Prisma.LessonOrderByWithRelationInput[]> = {
    day: [{ day: order }, { startTime: "asc" }],
    name: { name: order },
    subject: { subject: { name: order } },
    class: { class: { name: order } },
  };
  const orderBy =
    queryParams.sort && sortMap[queryParams.sort]
      ? sortMap[queryParams.sort]
      : ([{ day: "asc" }, { startTime: "asc" }] as Prisma.LessonOrderByWithRelationInput[]);

  const [data, count, classesForFilter, teachersForFilter, subjectsForFilter] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
        school: { select: { name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy,
    }),
    prisma.lesson.count({ where: query }),
    prisma.class.findMany({
      where: role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.teacher.findMany({
      where: role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {},
      select: { id: true, name: true, surname: true },
      orderBy: [{ surname: "asc" }, { name: "asc" }],
    }),
    prisma.subject.findMany({
      where: role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="m-4 mt-0 flex-1 rounded-2xl border border-line bg-surface p-6 shadow-soft">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">Lessons</h1>
          <p className="text-xs text-ink-muted mt-1">
            Weekly schedule — each lesson recurs on its day across the semester window.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <TableSearch />
          <TableFilter
            fields={[
              {
                key: "classId",
                label: "Class",
                options: classesForFilter.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                })),
              },
              {
                key: "teacherId",
                label: "Teacher",
                options: teachersForFilter.map((t) => ({
                  value: t.id,
                  label: `${t.name} ${t.surname}`,
                })),
              },
              {
                key: "subjectId",
                label: "Subject",
                options: subjectsForFilter.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                })),
              },
              {
                key: "day",
                label: "Day",
                options: [
                  { value: "MONDAY", label: "Monday" },
                  { value: "TUESDAY", label: "Tuesday" },
                  { value: "WEDNESDAY", label: "Wednesday" },
                  { value: "THURSDAY", label: "Thursday" },
                  { value: "FRIDAY", label: "Friday" },
                ],
              },
            ]}
          />
          <TableSort
            options={[
              { value: "day", label: "Day & time" },
              { value: "subject", label: "Subject" },
              { value: "class", label: "Class" },
              { value: "name", label: "Lesson name" },
            ]}
          />
          {role === "admin" && <FormContainer table="lesson" type="create" />}
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <div className="mt-4">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default LessonListPage;
