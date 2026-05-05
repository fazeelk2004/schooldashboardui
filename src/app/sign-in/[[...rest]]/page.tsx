"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const role = user?.publicMetadata.role;
    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-surface-muted text-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <SignIn.Root>
          <SignIn.Step
            name="start"
            className="rounded-2xl border border-line bg-surface p-8 shadow-soft flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft">
                <Image src="/logo.png" alt="" width={20} height={20} />
              </div>
              <span className="font-semibold tracking-tight">SchooLama</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">Welcome back</h1>
              <p className="text-sm text-ink-muted mt-1">
                Sign in to continue to your dashboard.
              </p>
            </div>

            <Clerk.GlobalError className="text-sm text-red-500" />

            <Clerk.Field name="identifier" className="flex flex-col gap-1.5">
              <Clerk.Label className="text-xs font-medium text-ink-muted">
                Username
              </Clerk.Label>
              <Clerk.Input
                type="text"
                required
                className="input-base"
              />
              <Clerk.FieldError className="text-xs text-red-500" />
            </Clerk.Field>

            <Clerk.Field name="password" className="flex flex-col gap-1.5">
              <Clerk.Label className="text-xs font-medium text-ink-muted">
                Password
              </Clerk.Label>
              <Clerk.Input
                type="password"
                required
                className="input-base"
              />
              <Clerk.FieldError className="text-xs text-red-500" />
            </Clerk.Field>

            <SignIn.Action submit className="btn-primary mt-2">
              Sign in
            </SignIn.Action>
          </SignIn.Step>
        </SignIn.Root>
      </div>
    </div>
  );
};

export default LoginPage;
