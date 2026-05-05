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
        className="flex items-center justify-start lg:justify-start gap-2 px-2 mb-2 md:justify-center lg:!justify-start"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft">
          <Image src="/logo.png" alt="logo" width={20} height={20} />
        </div>
        <span className="block md:hidden lg:block font-semibold tracking-tight text-ink">
          NeuraLearn
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
