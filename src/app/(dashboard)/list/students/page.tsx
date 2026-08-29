import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import StudentSummaryReport from "@/components/StudentSummaryReport";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { getCurrentUser } from "@/lib/utils";

type StudentList = Student & { class: Class } & { school: { name: string } };

const StudentListPage = async ({
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
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
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
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="text-sm text-ink-muted hover:bg-surface-subtle transition"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-ink-subtle">{item.class.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.class.name[0]}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      {role === "superadmin" && (
        <td className="hidden md:table-cell">
          <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">{item.school?.name}</span>
        </td>
      )}
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand transition hover:bg-brand/20">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <StudentSummaryReport
            studentId={item.id}
            studentName={`${item.name} ${item.surname}`}
          />
          {role === "admin" && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <FormContainer table="student" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.StudentWhereInput = {};

  // School scoping
  if (role !== "superadmin") {
    query.schoolId = schoolId ?? -1;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        switch (key) {
          case "teacherId":
            query.class = {
              lessons: {
                some: {
                  teacherId: value,
                },
              },
            };
            break;
          case "classId":
            query.classId = parseInt(value);
            break;
          case "gradeId":
            query.gradeId = parseInt(value);
            break;
          case "sex":
            if (value === "MALE" || value === "FEMALE") query.sex = value;
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
  const sortMap: Record<string, Prisma.StudentOrderByWithRelationInput> = {
    name: { name: order },
    surname: { surname: order },
    createdAt: { createdAt: order },
    class: { class: { name: order } },
  };
  const orderBy =
    queryParams.sort && sortMap[queryParams.sort]
      ? sortMap[queryParams.sort]
      : { name: "asc" as const };

  const [data, count, classesForFilter, gradesForFilter] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        class: true,
        school: { select: { name: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
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
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
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
                  key: "gradeId",
                  label: "Grade",
                  options: gradesForFilter.map((g) => ({
                    value: String(g.id),
                    label: `Grade ${g.level}`,
                  })),
                },
                {
                  key: "sex",
                  label: "Sex",
                  options: [
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                  ],
                },
              ]}
            />
            <TableSort
              options={[
                { value: "name", label: "First name" },
                { value: "surname", label: "Last name" },
                { value: "class", label: "Class" },
                { value: "createdAt", label: "Date added" },
              ]}
            />
            {role === "admin" && (
              <FormContainer table="student" type="create" />
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

export default StudentListPage;
