import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { getCurrentUser } from "@/lib/utils";

type SubjectList = Subject & { teachers: Teacher[] } & { school: { name: string } };

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { role, schoolId } = getCurrentUser();

  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },
    {
      header: "Teachers",
      accessor: "teachers",
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

  const renderRow = (item: SubjectList) => (
    <tr
      key={item.id}
      className="text-sm text-ink-muted hover:bg-surface-subtle transition"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">
        {item.teachers.map((teacher) => teacher.name).join(",")}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="subject" type="update" data={item} />
              <FormContainer table="subject" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
      {role === "superadmin" && (
        <td className="hidden md:table-cell">
          <span className="text-xs bg-lamaSkyLight px-2 py-1 rounded">{item.school?.name}</span>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.SubjectWhereInput = {};

  // School scoping
  if (role !== "superadmin" && schoolId) {
    query.schoolId = schoolId;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        switch (key) {
          case "teacherId":
            query.teachers = { some: { id: value } };
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
  const sortMap: Record<string, Prisma.SubjectOrderByWithRelationInput> = {
    name: { name: order },
  };
  const orderBy =
    queryParams.sort && sortMap[queryParams.sort]
      ? sortMap[queryParams.sort]
      : { name: "asc" as const };

  const [data, count, teachersForFilter] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: {
        teachers: true,
        school: { select: { name: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.subject.count({ where: query }),
    prisma.teacher.findMany({
      where: role !== "superadmin" && schoolId ? { schoolId } : {},
      select: { id: true, name: true, surname: true },
      orderBy: [{ surname: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="m-4 mt-0 flex-1 rounded-2xl border border-line bg-surface p-6 shadow-soft">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <TableFilter
              fields={[
                {
                  key: "teacherId",
                  label: "Taught by",
                  options: teachersForFilter.map((t) => ({
                    value: t.id,
                    label: `${t.name} ${t.surname}`,
                  })),
                },
              ]}
            />
            <TableSort
              options={[{ value: "name", label: "Subject name" }]}
            />
            {role === "admin" && (
              <FormContainer table="subject" type="create" />
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

export default SubjectListPage;
