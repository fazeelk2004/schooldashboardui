import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import TableFilter from "@/components/TableFilter";
import TableSort from "@/components/TableSort";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/utils";

type EventList = Event & { class: Class };

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const { userId, role, schoolId } = getCurrentUser();
  const currentUserId = userId;

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Start Time",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "End Time",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
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

  const renderRow = (item: EventList) => (
    <tr
      key={item.id}
      className="text-sm text-ink-muted hover:bg-surface-subtle transition"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.class?.name || "-"}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>
      <td className="hidden md:table-cell">
        {item.startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td className="hidden md:table-cell">
        {item.endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="event" type="update" data={item} />
              <FormContainer table="event" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
      {role === "superadmin" && (
        <td className="hidden md:table-cell">
          <span className="text-xs bg-lamaSkyLight px-2 py-1 rounded">{(item as any).school?.name}</span>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.EventWhereInput = {};

  // School scoping
  if (role !== "superadmin" && schoolId) {
    query.schoolId = schoolId;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            // handled via join below — we'll add to the OR conditions
            break;
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: currentUserId! } } },
    student: { students: { some: { id: currentUserId! } } },
    parent: { students: { some: { parentId: currentUserId! } } },
  };

  const classFilter = queryParams.classId ? parseInt(queryParams.classId) : undefined;

  if (classFilter) {
    query.classId = classFilter;
  } else {
    query.OR = [
      { classId: null },
      {
        class: roleConditions[role as keyof typeof roleConditions] || {},
      },
    ];
  }

  const order = (queryParams.order as "asc" | "desc") ?? "asc";
  const sortMap: Prisma.EventOrderByWithRelationInput = {
    ...(queryParams.sort === "title" ? { title: order } : {}),
    ...(queryParams.sort === "class" ? { class: { name: order } } : {}),
    ...(queryParams.sort === "date" || !queryParams.sort ? { startTime: order } : {}),
  };

  const [data, count, classesForFilter] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        class: true,
        school: { select: { name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: sortMap,
    }),
    prisma.event.count({ where: query }),
    prisma.class.findMany({
      where: role !== "superadmin" && schoolId ? { schoolId } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="m-4 mt-0 flex-1 rounded-2xl border border-line bg-surface p-6 shadow-soft">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
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
              ]}
            />
            <TableSort
              options={[
                { value: "date", label: "Date" },
                { value: "title", label: "Title" },
                { value: "class", label: "Class" },
              ]}
            />
            {role === "admin" && <FormContainer table="event" type="create" />}
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

export default EventListPage;
