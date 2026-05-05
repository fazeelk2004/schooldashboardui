import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/utils";

type ResultList = {
  id: number;
  kind: "result" | "quiz";
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  totalMarks?: number;
  className: string;
  startTime: Date;
};


const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const { userId, role } = getCurrentUser();
const currentUserId = userId;


const columns = [
  {
    header: "Title",
    accessor: "title",
  },
  {
    header: "Student",
    accessor: "student",
  },
  {
    header: "Score",
    accessor: "score",
    className: "hidden md:table-cell",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "class",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
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
];

const renderRow = (item: ResultList) => (
  <tr
    key={`${item.kind}-${item.id}`}
    className="text-sm text-ink-muted hover:bg-surface-subtle transition"
  >
    <td className="flex items-center gap-2 p-4">
      {item.kind === "quiz" && (
        <span className="px-2 py-0.5 bg-lamaPurple text-gray-800 text-[10px] rounded-full font-semibold">
          QUIZ
        </span>
      )}
      <span>{item.title}</span>
    </td>
    <td>{item.studentName + " " + item.studentSurname}</td>
    <td className="hidden md:table-cell">
      {item.kind === "quiz" && item.totalMarks
        ? `${item.score}/${item.totalMarks} (${Math.round((item.score / item.totalMarks) * 100)}%)`
        : item.score}
    </td>
    <td className="hidden md:table-cell">
      {item.teacherName + " " + item.teacherSurname}
    </td>
    <td className="hidden md:table-cell">{item.className}</td>
    <td className="hidden md:table-cell">
      {new Intl.DateTimeFormat("en-US").format(item.startTime)}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {item.kind === "result" && (role === "admin" || role === "teacher") && (
          <>
            <FormContainer table="result" type="update" data={item} />
            <FormContainer table="result" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;
  const search = queryParams?.search?.trim() || "";

  // ── Build query for traditional Result records ──
  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { student: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ── Build query for QuizSubmission records ──
  const quizQuery: any = {};

  switch (role) {
    case "admin":
    case "superadmin":
      break;
    case "teacher":
      query.OR = [
        { exam: { subject: { teachers: { some: { id: currentUserId! } } } } },
        { assignment: { subject: { teachers: { some: { id: currentUserId! } } } } },
      ];
      quizQuery.quizAssignment = { quiz: { teacherId: currentUserId! } };
      break;

    case "student":
      query.studentId = currentUserId!;
      quizQuery.studentId = currentUserId!;
      break;

    case "parent":
      query.student = { parentId: currentUserId! };
      quizQuery.student = { parentId: currentUserId! };
      break;
    default:
      break;
  }

  if (queryParams.studentId) {
    quizQuery.studentId = queryParams.studentId;
  }

  if (search) {
    quizQuery.OR = [
      { quizAssignment: { quiz: { title: { contains: search, mode: "insensitive" } } } },
      { student: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  // ── Fetch both data sets (no DB-level pagination so we can merge & sort) ──
  const [resultRows, quizRows] = await Promise.all([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            subject: {
              select: {
                name: true,
                teachers: { select: { name: true, surname: true }, take: 1 },
              },
            },
            grade: { select: { level: true } },
          },
        },
        assignment: {
          include: {
            subject: {
              select: {
                name: true,
                teachers: { select: { name: true, surname: true }, take: 1 },
              },
            },
            grade: { select: { level: true } },
          },
        },
      },
    }),
    (prisma as any).quizSubmission.findMany({
      where: quizQuery,
      include: {
        student: { select: { name: true, surname: true } },
        quizAssignment: {
          include: {
            quiz: { select: { title: true, teacher: { select: { name: true, surname: true } } } },
            class: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const resultData: (ResultList | null)[] = resultRows.map((item) => {
    if (item.exam) {
      const exam = item.exam;
      const teacher = exam.subject.teachers[0];
      return {
        id: item.id,
        kind: "result",
        title: exam.title,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        teacherName: teacher?.name ?? "",
        teacherSurname: teacher?.surname ?? "",
        score: item.score,
        className: `Grade ${exam.grade.level}`,
        startTime: exam.startTime,
      };
    }
    if (item.assignment) {
      const assignment = item.assignment;
      const teacher = assignment.subject.teachers[0];
      return {
        id: item.id,
        kind: "result",
        title: assignment.subject.name,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        teacherName: teacher?.name ?? "",
        teacherSurname: teacher?.surname ?? "",
        score: item.score,
        className: `Grade ${assignment.grade.level}`,
        startTime: assignment.dueDate,
      };
    }
    return null;
  });

  const quizData: ResultList[] = quizRows.map((q: any) => ({
    id: q.id,
    kind: "quiz",
    title: q.quizAssignment.quiz.title,
    studentName: q.student.name,
    studentSurname: q.student.surname,
    teacherName: q.quizAssignment.quiz.teacher.name,
    teacherSurname: q.quizAssignment.quiz.teacher.surname,
    score: q.score,
    totalMarks: q.totalMarks,
    className: q.quizAssignment.class.name,
    startTime: q.submittedAt,
  }));

  const sortField = queryParams.sort ?? "date";
  const sortOrder = (queryParams.order as "asc" | "desc") ?? "desc";
  const kindFilter = queryParams.kind; // "result" | "quiz" | undefined

  const allItems = [...resultData.filter((x): x is ResultList => x !== null), ...quizData];
  const filtered = kindFilter ? allItems.filter((x) => x.kind === kindFilter) : allItems;

  const merged = filtered.sort(
    (a, b) => {
      if (sortField === "score") {
        return sortOrder === "asc" ? a.score - b.score : b.score - a.score;
      }
      if (sortField === "student") {
        const nameA = `${a.studentName} ${a.studentSurname}`;
        const nameB = `${b.studentName} ${b.studentSurname}`;
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      if (sortField === "title") {
        return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      // default: date
      return sortOrder === "asc"
        ? a.startTime.getTime() - b.startTime.getTime()
        : b.startTime.getTime() - a.startTime.getTime();
    }
  );

  const count = merged.length;
  const data = merged.slice(ITEM_PER_PAGE * (p - 1), ITEM_PER_PAGE * p);

  return (
    <div className="m-4 mt-0 flex-1 rounded-2xl border border-line bg-surface p-6 shadow-soft">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <TableFilter
              fields={[
                {
                  key: "kind",
                  label: "Type",
                  options: [
                    { value: "result", label: "Exam / Assignment" },
                    { value: "quiz", label: "Quiz" },
                  ],
                },
              ]}
            />
            <TableSort
              options={[
                { value: "date", label: "Date" },
                { value: "score", label: "Score" },
                { value: "student", label: "Student" },
                { value: "title", label: "Title" },
              ]}
              defaultOrder="desc"
            />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultListPage;
