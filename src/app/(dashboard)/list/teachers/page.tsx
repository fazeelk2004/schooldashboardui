import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getCurrentUser } from "@/lib/utils";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] } & { school: { name: string } };

const TeacherListPage = async ({
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
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
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

  const renderRow = (item: TeacherList) => (
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
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        {item.subjects.map((subject) => subject.name).join(",")}
      </td>
      <td className="hidden md:table-cell">
        {item.classes.map((classItem) => classItem.name).join(",")}
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      {role === "superadmin" && (
        <td className="hidden md:table-cell">
          <span className="text-xs bg-lamaSkyLight px-2 py-1 rounded">{item.school?.name}</span>
        </td>
      )}
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <FormContainer table="teacher" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.TeacherWhereInput = {};

  // School scoping
  if (role !== "superadmin") {
    query.schoolId = schoolId ?? -1;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value),
              },
            };
            break;
          case "subjectId":
            query.subjects = { some: { id: parseInt(value) } };
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

  const sortMap: Record<string, Prisma.TeacherOrderByWithRelationInput> = {
    name: { name: (queryParams.order as "asc" | "desc") ?? "asc" },
    surname: { surname: (queryParams.order as "asc" | "desc") ?? "asc" },
    createdAt: { createdAt: (queryParams.order as "asc" | "desc") ?? "desc" },
  };
  const orderBy =
    queryParams.sort && sortMap[queryParams.sort]
      ? sortMap[queryParams.sort]
      : { name: "asc" as const };

  const [data, count, subjectsForFilter, classesForFilter] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
        school: { select: { name: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({ where: query }),
    prisma.subject.findMany({
      where: role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.class.findMany({
      where: role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="m-4 mt-0 flex-1 rounded-2xl border border-line bg-surface p-6 shadow-soft">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
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
                  key: "classId",
                  label: "Class",
                  options: classesForFilter.map((c) => ({
                    value: String(c.id),
                    label: c.name,
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
                { value: "createdAt", label: "Date added" },
              ]}
            />
            {role === "admin" && (
              <FormContainer table="teacher" type="create" />
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

export default TeacherListPage;
