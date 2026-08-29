import Image from "next/image";
import Link from "next/link";
import HomeThemeToggle from "@/components/HomeThemeToggle";

export default function PublicHeader({
  actionHref,
  actionLabel,
}: {
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <header className="public-header">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="NeuraLearn home">
          <span className="public-brand-mark">
            <Image
              src="/logo.png"
              alt=""
              width={22}
              height={22}
              className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            />
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-[-0.02em] text-ink sm:text-base">
              NeuraLearn
            </span>
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-ink-subtle sm:block">
              School intelligence
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <HomeThemeToggle />
          <Link href={actionHref} className="btn-ghost px-3 sm:px-4">
            {actionLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
