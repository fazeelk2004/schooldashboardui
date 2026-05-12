import Image from "next/image";
import Link from "next/link";

export default function StudentSignupSuccessPage() {
  return (
    <div className="min-h-screen bg-surface-muted text-ink flex items-center justify-center px-6">
      <div className="max-w-md text-center rounded-2xl border border-line bg-surface p-10 shadow-soft">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand mb-4">
          <Image src="/logo.png" alt="" width={22} height={22} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Application submitted
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Your application is now pending. A school admin will review your
          details and assign you to a class. You&apos;ll be able to sign in
          once accepted.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/" className="btn-ghost px-5 py-2.5">
            Back home
          </Link>
          <Link href="/sign-in" className="btn-primary px-5 py-2.5">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
