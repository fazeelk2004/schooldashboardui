import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, School } from "@prisma/client";
import Image from "next/image";
import { getCurrentUser } from "@/lib/utils";

type SchoolList = School & {
  _count: {
    students: number;
    teachers: number;
    classes: number;
  };
};

const SchoolListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { role } = getCurrentUser();

  const columns = [
    {
      header: "School Name",
      accessor: "name",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden md:table-cell",
    },
    {
      header: "Students",
      accessor: "students",
      className: "hidden lg:table-cell",
    },
    {
      header: "Teachers",
      accessor: "teachers",
      className: "hidden lg:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
      className: "hidden lg:table-cell",
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

  const renderRow = (item: SchoolList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.email || "-"}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.address || "-"}</td>
      <td className="hidden md:table-cell">{item.phone || "-"}</td>
      <td className="hidden lg:table-cell">{item._count.students}</td>
      <td className="hidden lg:table-cell">{item._count.teachers}</td>
      <td className="hidden lg:table-cell">{item._count.classes}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "superadmin" && (
            <>
              <FormContainer table="school" type="update" data={item} />
              <FormContainer table="school" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.SchoolWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.school.findMany({
      where: query,
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
            classes: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.school.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Schools</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "superadmin" && (
              <FormContainer table="school" type="create" />
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

export default SchoolListPage;
