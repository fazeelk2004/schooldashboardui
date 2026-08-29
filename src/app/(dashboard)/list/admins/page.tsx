import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Admin, Prisma, School } from "@prisma/client";
import Image from "next/image";
import { getCurrentUser } from "@/lib/utils";

type AdminList = Admin & { school: School };

const AdminListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { role } = getCurrentUser();

  const columns = [
    {
      header: "Admin ID",
      accessor: "id",
    },
    {
      header: "Username",
      accessor: "username",
    },
    {
      header: "School",
      accessor: "school",
    },
    ...(role === "superadmin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: AdminList) => (
    <tr
      key={item.id}
      className="text-sm text-ink-muted hover:bg-surface-subtle transition"
    >
      <td className="flex items-center gap-4 p-4">
        <span className="font-medium">{item.id}</span>
      </td>
      <td>{item.username}</td>
      <td>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
          {item.school?.name}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "superadmin" && (
            <FormContainer table="admin" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AdminWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        switch (key) {
          case "search":
            query.username = { contains: value, mode: "insensitive" };
            break;
          case "schoolId":
            query.schoolId = parseInt(value);
            break;
          default:
            break;
        }
      }
    }
  }

  const order = (queryParams.order as "asc" | "desc") ?? "asc";
  const sortMap: Record<string, Prisma.AdminOrderByWithRelationInput> = {
    username: { username: order },
    school: { school: { name: order } },
  };
  const orderBy =
    queryParams.sort && sortMap[queryParams.sort]
      ? sortMap[queryParams.sort]
      : { username: "asc" as const };

  const [data, count, schoolsForFilter] = await prisma.$transaction([
    prisma.admin.findMany({
      where: query,
      include: {
        school: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.admin.count({ where: query }),
    prisma.school.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="dashboard-page list-page-card m-4 mt-0 flex-1 rounded-[24px] border border-line/75 bg-surface p-4 shadow-soft sm:p-6">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Admins</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <TableFilter
              fields={[
                {
                  key: "schoolId",
                  label: "School",
                  options: schoolsForFilter.map((s) => ({
                    value: String(s.id),
                    label: s.name,
                  })),
                },
              ]}
            />
            <TableSort
              options={[
                { value: "username", label: "Username" },
                { value: "school", label: "School" },
              ]}
            />
            {role === "superadmin" && (
              <FormContainer table="admin" type="create" />
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

export default AdminListPage;
