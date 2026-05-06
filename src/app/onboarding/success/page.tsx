import Link from "next/link";
import SuccessPoller from "./SuccessPoller";

export default function OnboardingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  return (
    <div className="min-h-screen bg-surface-muted text-ink flex items-center justify-center p-6">
      <div className="panel panel-pad max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold">Payment received</h1>
        <p className="text-sm text-ink-muted mt-2">
          We're setting up your school. This usually takes a few seconds.
        </p>

        {sessionId ? (
          <SuccessPoller sessionId={sessionId} />
        ) : (
          <div className="mt-6">
            <Link href="/sign-in" className="btn-primary px-6 py-3">
              Go to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
