import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Grade } from "@prisma/client";
import Image from "next/image";
import { getCurrentUser } from "@/lib/utils";

type GradeList = Grade & {
  school: { name: string };
  _count: { classess: number; students: number };
};

const GradeListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { role, schoolId } = getCurrentUser();

  const columns = [
    {
      header: "Level",
      accessor: "level",
    },
    {
      header: "Classes",
      accessor: "classes",
      className: "hidden md:table-cell",
    },
    {
      header: "Students",
      accessor: "students",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
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
  ];

  const renderRow = (item: GradeList) => (
    <tr
      key={item.id}
      className="text-sm text-ink-muted hover:bg-surface-subtle transition"
    >
      <td className="flex items-center gap-4 p-4">{item.level}</td>
      <td className="hidden md:table-cell">{item._count.classess}</td>
      <td className="hidden md:table-cell">{item._count.students}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="grade" type="update" data={item} />
              <FormContainer table="grade" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
      {role === "superadmin" && (
        <td className="hidden md:table-cell">
          <span className="text-xs bg-lamaSkyLight px-2 py-1 rounded">
            {item.school?.name}
          </span>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.GradeWhereInput = {};

  if (role !== "superadmin" && schoolId) {
    query.schoolId = schoolId;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        switch (key) {
          case "search":
            const parsed = parseInt(value);
            if (!isNaN(parsed)) {
              query.level = parsed;
            }
            break;
          default:
            break;
        }
      }
    }
  }

  const order = (queryParams.order as "asc" | "desc") ?? "asc";
  const sortMap: Record<string, Prisma.GradeOrderByWithRelationInput> = {
    level: { level: order },
  };
  const orderBy =
    queryParams.sort && sortMap[queryParams.sort]
      ? sortMap[queryParams.sort]
      : { level: "asc" as const };

  const [data, count] = await prisma.$transaction([
    prisma.grade.findMany({
      where: query,
      include: {
        school: { select: { name: true } },
        _count: { select: { classess: true, students: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.grade.count({ where: query }),
  ]);

  return (
    <div className="m-4 mt-0 flex-1 rounded-2xl border border-line bg-surface p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Grades</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <TableSort options={[{ value: "level", label: "Grade level" }]} />
            {role === "admin" && (
              <FormContainer table="grade" type="create" />
            )}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default GradeListPage;
