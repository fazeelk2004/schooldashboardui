"use client";

import { UserButton } from "@clerk/nextjs";

const BillingIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <path d="M6 15h4" />
  </svg>
);

export default function UserMenu({ role }: { role?: string }) {
  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "h-9 w-9 ring-1 ring-line",
        },
      }}
    >
      {role === "admin" && (
        <UserButton.MenuItems>
          <UserButton.Link
            label="Billing"
            labelIcon={<BillingIcon />}
            href="/admin/billing"
          />
        </UserButton.MenuItems>
      )}
    </UserButton>
  );
}
