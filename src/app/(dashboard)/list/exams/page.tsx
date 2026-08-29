import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Exam, Grade, Prisma, Subject } from "@prisma/client";
import Image from "next/image";
import { getCurrentUser } from "@/lib/utils";

type ExamList = Exam & {
  subject: Subject;
  grade: Grade;
};

const ExamListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const { userId, role, schoolId } = getCurrentUser();
const currentUserId = userId;


const columns = [
  {
    header: "Title",
    accessor: "title",
  },
  {
    header: "Subject",
    accessor: "subject",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Start Time",
    accessor: "startTime",
    className: "hidden md:table-cell",
  },
  {
    header: "End Time",
    accessor: "endTime",
    className: "hidden md:table-cell",
  },
  ...(role === "admin" || role === "teacher"
    ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
    : []),
  ...(role === "superadmin"
    ? [
        {
          header: "School",
          accessor: "school",
          className: "hidden md:table-cell",
        },
      ]
    : []),
];

const renderRow = (item: ExamList) => (
  <tr
    key={item.id}
    className="text-sm text-ink-muted hover:bg-surface-subtle transition"
  >
    <td className="px-4 py-3 font-medium text-ink">{item.title}</td>
    <td className="px-4 py-3">{item.subject.name}</td>
    <td className="hidden md:table-cell px-4 py-3">
      <span className="chip">Grade {item.grade.level}</span>
    </td>
    <td className="hidden md:table-cell px-4 py-3">
      {new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Karachi" }).format(item.date)}
    </td>
    <td className="hidden md:table-cell px-4 py-3">
      {new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Karachi",
      }).format(new Date(item.startTime))}
    </td>
    <td className="hidden md:table-cell px-4 py-3">
      {new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Karachi",
      }).format(new Date(item.endTime))}
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        {(role === "admin" || role === "teacher") && (
          <>
            <FormContainer table="exam" type="update" data={item} />
            <FormContainer table="exam" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
    {role === "superadmin" && (
      <td className="hidden md:table-cell px-4 py-3">
        <span className="chip">{(item as any).school?.name}</span>
      </td>
    )}
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ExamWhereInput = {};

  // School scoping
  if (role !== "superadmin") {
    query.schoolId = schoolId ?? -1;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        switch (key) {
          case "subjectId":
            query.subjectId = parseInt(value);
            break;
          case "gradeId":
            query.gradeId = parseInt(value);
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { subject: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const order = (queryParams.order as "asc" | "desc") ?? "asc";
  const sortMap: Record<string, Prisma.ExamOrderByWithRelationInput> = {
    title: { title: order },
    date: { date: order },
    startTime: { startTime: order },
    subject: { subject: { name: order } },
    grade: { grade: { level: order } },
  };
  const orderBy =
    queryParams.sort && sortMap[queryParams.sort]
      ? sortMap[queryParams.sort]
      : ({ date: "desc" } as Prisma.ExamOrderByWithRelationInput);

  // ROLE CONDITIONS

  switch (role) {
    case "admin":
    case "superadmin":
      break;
    case "teacher":
      query.subject = { teachers: { some: { id: currentUserId! } } };
      break;
    case "student":
      query.grade = { students: { some: { id: currentUserId! } } };
      break;
    case "parent":
      query.grade = {
        students: { some: { parentId: currentUserId! } },
      };
      break;

    default:
      break;
  }

  const [data, count, subjectsForFilter, gradesForFilter] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        subject: { select: { id: true, name: true } },
        grade: { select: { id: true, level: true } },
        school: { select: { name: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
    prisma.subject.findMany({
      where: role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.grade.findMany({
      where: role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {},
      select: { id: true, level: true },
      orderBy: { level: "asc" },
    }),
  ]);

  return (
    <div className="dashboard-page list-page-card m-4 mt-0 flex-1 rounded-[24px] border border-line/75 bg-surface p-4 shadow-soft sm:p-6">
      {/* TOP */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Exams</h1>
          <p className="mt-1 text-xs text-ink-subtle">
            Browse all scheduled exams across grades and subjects.
          </p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          <TableSearch />
          <TableFilter
            fields={[
              {
                key: "subjectId",
                label: "Subject",
                options: subjectsForFilter.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                })),
              },
              {
                key: "gradeId",
                label: "Grade",
                options: gradesForFilter.map((g) => ({
                  value: String(g.id),
                  label: `Grade ${g.level}`,
                })),
              },
            ]}
          />
          <TableSort
            options={[
              { value: "date", label: "Exam date" },
              { value: "title", label: "Title" },
              { value: "subject", label: "Subject" },
              { value: "grade", label: "Grade" },
              { value: "startTime", label: "Start time" },
            ]}
          />
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="exam" type="create" />
          )}
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ExamListPage;
