import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import { getCurrentUser } from "@/lib/utils";

type ClassList = Class & { supervisor: Teacher } & { school: { name: string } };

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const { role, schoolId } = getCurrentUser();


const columns = [
  {
    header: "Class Name",
    accessor: "name",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden md:table-cell",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Supervisor",
    accessor: "supervisor",
    className: "hidden md:table-cell",
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

const renderRow = (item: ClassList) => (
  <tr
    key={item.id}
    className="text-sm text-ink-muted hover:bg-surface-subtle transition"
  >
    <td className="flex items-center gap-4 p-4">{item.name}</td>
    <td className="hidden md:table-cell">{item.capacity}</td>
    <td className="hidden md:table-cell">{item.name[0]}</td>
    <td className="hidden md:table-cell">
      {item.supervisor.name + " " + item.supervisor.surname}
    </td>
    {role === "superadmin" && (
      <td className="hidden md:table-cell">
        <span className="text-xs bg-lamaSkyLight px-2 py-1 rounded">{item.school?.name}</span>
      </td>
    )}
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ClassWhereInput = {};

  // School scoping
  if (role !== "superadmin") {
    query.schoolId = schoolId ?? -1;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        switch (key) {
          case "supervisorId":
            query.supervisorId = value;
            break;
          case "gradeId":
            query.gradeId = parseInt(value);
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const order = (queryParams.order as "asc" | "desc") ?? "asc";
  const sortMap: Record<string, Prisma.ClassOrderByWithRelationInput> = {
    name: { name: order },
    capacity: { capacity: order },
    grade: { grade: { level: order } },
  };
  const orderBy =
    queryParams.sort && sortMap[queryParams.sort]
      ? sortMap[queryParams.sort]
      : { name: "asc" as const };

  const [data, count, teachersForFilter, gradesForFilter] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
        school: { select: { name: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where: query }),
    prisma.teacher.findMany({
      where: role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {},
      select: { id: true, name: true, surname: true },
      orderBy: [{ surname: "asc" }, { name: "asc" }],
    }),
    prisma.grade.findMany({
      where: role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {},
      select: { id: true, level: true },
      orderBy: { level: "asc" },
    }),
  ]);

  return (
    <div className="m-4 mt-0 flex-1 rounded-2xl border border-line bg-surface p-6 shadow-soft">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <TableFilter
              fields={[
                {
                  key: "gradeId",
                  label: "Grade",
                  options: gradesForFilter.map((g) => ({
                    value: String(g.id),
                    label: `Grade ${g.level}`,
                  })),
                },
                {
                  key: "supervisorId",
                  label: "Supervisor",
                  options: teachersForFilter.map((t) => ({
                    value: t.id,
                    label: `${t.name} ${t.surname}`,
                  })),
                },
              ]}
            />
            <TableSort
              options={[
                { value: "name", label: "Class name" },
                { value: "grade", label: "Grade" },
                { value: "capacity", label: "Capacity" },
              ]}
            />
            {role === "admin" && <FormContainer table="class" type="create" />}
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

export default ClassListPage;
