import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import NotificationBell, { NotificationItem } from "./NotificationBell";
import NavbarSearch from "./NavbarSearch";

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
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/80 pl-16 pr-4 md:px-6 py-3 backdrop-blur">
      {/* SEARCH BAR */}
      <NavbarSearch />

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <NotificationBell initialItems={items} />

        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-medium leading-tight text-ink">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-[11px] capitalize text-ink-subtle">
            {user?.publicMetadata?.role as string}
          </span>
        </div>

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 ring-1 ring-line",
            },
          }}
        />
      </div>
    </header>
  );
};

export default Navbar;
