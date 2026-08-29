import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import NotificationBell, { NotificationItem } from "./NotificationBell";
import NavbarSearch from "./NavbarSearch";
import UserMenu from "./UserMenu";

const Navbar = async () => {
  const user = await currentUser();
  const { userId } = getCurrentUser();

  let items: NotificationItem[] = [];
  if (userId) {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    items = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type as string,
      link: r.link,
      read: r.read,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  return (
    <header className="dashboard-navbar sticky top-0 z-30 flex min-h-[66px] items-center justify-between gap-3 border-b border-line/70 bg-surface/75 py-3 pl-16 pr-4 backdrop-blur-xl md:px-7">
      {/* SEARCH BAR */}
      <NavbarSearch />

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-2.5 sm:gap-3.5">
        <NotificationBell initialItems={items} />

        <span className="hidden h-7 w-px bg-line/80 sm:block" />
        <div className="hidden flex-col text-right sm:flex">
          <span className="text-sm font-semibold leading-tight text-ink">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="mt-0.5 text-[10px] font-medium capitalize text-ink-subtle">
            {user?.publicMetadata?.role as string}
          </span>
        </div>

        <UserMenu role={user?.publicMetadata?.role as string | undefined} />
      </div>
    </header>
  );
};

export default Navbar;
