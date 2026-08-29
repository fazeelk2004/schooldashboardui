import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { getCurrentUser } from "@/lib/utils";

type ParentList = Parent & { students: Student[] } & { school: { name: string } };

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const { role, schoolId } = getCurrentUser();


const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student Names",
    accessor: "students",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  ...(role === "superadmin"
    ? [
        {
          header: "School",
          accessor: "school",
          className: "hidden md:table-cell",
        },
      ]
    : []),
  ...(role === "admin"
    ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
    : []),
];

const renderRow = (item: ParentList) => (
  <tr
    key={item.id}
    className="text-sm text-ink-muted hover:bg-surface-subtle transition"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <Link
          href={`/list/parents/${item.id}`}
          className="font-semibold text-ink hover:text-brand transition"
        >
          {item.name}
        </Link>
        <p className="text-xs text-ink-subtle">{item?.email}</p>
      </div>
    </td>
    <td className="hidden md:table-cell">
      {item.students.map((student) => student.name).join(",")}
    </td>
    <td className="hidden md:table-cell">{item.phone}</td>
    <td className="hidden md:table-cell">{item.address}</td>
    {role === "superadmin" && (
      <td className="hidden md:table-cell">
        <span className="chip">{item.school?.name}</span>
      </td>
    )}
    <td>
      <div className="flex items-center gap-2">
        <Link
          href={`/list/parents/${item.id}`}
          className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-brand-soft text-brand hover:opacity-80 transition"
          aria-label="View"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </Link>
        {role === "admin" && (
          <>
            <FormContainer table="parent" type="update" data={item} />
            <FormContainer table="parent" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ParentWhereInput = {};

  // School scoping
  if (role !== "superadmin") {
    query.schoolId = schoolId ?? -1;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        switch (key) {
          case "classId":
            query.students = { some: { classId: parseInt(value) } };
            break;
          case "gradeId":
            query.students = { some: { gradeId: parseInt(value) } };
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { surname: { contains: value, mode: "insensitive" } },
              { username: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const order = (queryParams.order as "asc" | "desc") ?? "asc";
  const sortMap: Record<string, Prisma.ParentOrderByWithRelationInput> = {
    name: { name: order },
    surname: { surname: order },
    createdAt: { createdAt: order },
  };
  const orderBy =
    queryParams.sort && sortMap[queryParams.sort]
      ? sortMap[queryParams.sort]
      : { name: "asc" as const };

  const [data, count, classesForFilter, gradesForFilter] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: {
        students: true,
        school: { select: { name: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
    prisma.class.findMany({
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
        <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <TableFilter
              fields={[
                {
                  key: "classId",
                  label: "Child's Class",
                  options: classesForFilter.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  })),
                },
                {
                  key: "gradeId",
                  label: "Child's Grade",
                  options: gradesForFilter.map((g) => ({
                    value: String(g.id),
                    label: `Grade ${g.level}`,
                  })),
                },
              ]}
            />
            <TableSort
              options={[
                { value: "name", label: "First name" },
                { value: "surname", label: "Last name" },
                { value: "createdAt", label: "Date added" },
              ]}
            />
            {role === "admin" && <FormContainer table="parent" type="create" />}
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

export default ParentListPage;
