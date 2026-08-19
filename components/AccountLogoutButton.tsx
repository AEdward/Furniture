"use client";

import { useRouter } from "next/navigation";

export default function AccountLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/account/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-walnut-200 px-4 py-2 text-sm font-medium text-walnut-600 hover:bg-walnut-100"
    >
      Sign out
    </button>
  );
}
