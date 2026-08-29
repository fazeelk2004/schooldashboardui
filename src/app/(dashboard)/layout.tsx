import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import DashboardShell from "@/components/DashboardShell";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sidebar = (
    <>
      <Link
        href="/"
        className="group mb-4 flex items-center justify-start gap-3 px-2 md:justify-center lg:!justify-start"
      >
        <div className="dashboard-logo flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
          <Image className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" src="/logo.png" alt="logo" width={23} height={23} />
        </div>
        <span className="block md:hidden lg:block">
          <span className="block text-[16px] font-bold tracking-[-0.035em] text-ink">NeuraLearn</span>
          <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.15em] text-ink-subtle">School workspace</span>
        </span>
      </Link>
      <Menu />
    </>
  );

  return (
    <DashboardShell sidebar={sidebar} navbar={<Navbar />}>
      {children}
    </DashboardShell>
  );
}
