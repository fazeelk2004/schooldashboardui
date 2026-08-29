import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Grade, Prisma, Subject } from "@prisma/client";
import Image from "next/image";
import { getCurrentUser } from "@/lib/utils";

type AssignmentList = Assignment & {
  subject: Subject;
  grade: Grade;
};

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const { userId, role, schoolId } = getCurrentUser();
  const currentUserId = userId;


  const columns = [
    {
      header: "Subject",
      accessor: "subject",
    },
    {
      header: "Grade",
      accessor: "grade",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
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

  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="text-sm text-ink-muted hover:bg-surface-subtle transition"
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
      <td>{item.grade.level}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.dueDate)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="assignment" type="update" data={item} />
              <FormContainer table="assignment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
      {role === "superadmin" && (
        <td className="hidden md:table-cell">
          <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">{(item as any).school?.name}</span>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.AssignmentWhereInput = {};

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
            query.subject = {
              name: { contains: value, mode: "insensitive" },
            };
            break;
          default:
            break;
        }
      }
    }
  }

  const order = (queryParams.order as "asc" | "desc") ?? "asc";
  const sortMap: Record<string, Prisma.AssignmentOrderByWithRelationInput> = {
    dueDate: { dueDate: order },
    subject: { subject: { name: order } },
    grade: { grade: { level: order } },
  };
  const orderBy =
    queryParams.sort && sortMap[queryParams.sort]
      ? sortMap[queryParams.sort]
      : ({ dueDate: "asc" } as Prisma.AssignmentOrderByWithRelationInput);

  // ROLE CONDITIONS

  switch (role) {
    case "admin":
    case "superadmin":
      break;
    case "teacher":
      query.subject = {
        ...(query.subject as object),
        teachers: { some: { id: currentUserId! } },
      };
      break;
    case "student":
      query.grade = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    case "parent":
      query.grade = {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      };
      break;
    default:
      break;
  }

  const [data, count, subjectsForFilter, gradesForFilter] = await prisma.$transaction([
    prisma.assignment.findMany({
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
    prisma.assignment.count({ where: query }),
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
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Assignments
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
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
                { value: "dueDate", label: "Due date" },
                { value: "subject", label: "Subject" },
                { value: "grade", label: "Grade" },
              ]}
            />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="assignment" type="create" />
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

export default AssignmentListPage;
