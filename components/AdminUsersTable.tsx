"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminRole, AdminUser } from "@/lib/admin-users";

export default function AdminUsersTable({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUser[];
  currentUserId: number | null;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add admin.");
        return;
      }
      setUsers((prev) => [...prev, data.user]);
      setName("");
      setEmail("");
      setPassword("");
      setRole("editor");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(user: AdminUser, nextRole: AdminRole) {
    if (nextRole === user.role) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to update role.");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)));
    router.refresh();
  }

  async function handleRemove(user: AdminUser) {
    if (!confirm(`Remove admin "${user.name}" (${user.email})? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to remove admin.");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    router.refresh();
  }

  async function handleChangePassword(user: AdminUser) {
    const next = prompt(`New password for ${user.email} (min 8 characters):`);
    if (!next) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: next }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to update password.");
      return;
    }
    alert("Password updated.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto rounded-2xl border border-walnut-100 bg-white/60">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-walnut-100 text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Added</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-walnut-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-3 font-medium text-ink">
                  {user.name}
                  {user.id === currentUserId && (
                    <span className="ml-2 rounded-full bg-walnut-100 px-2 py-0.5 text-xs font-normal text-walnut-700">
                      You
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-ink/70">{user.email}</td>
                <td className="px-5 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value as AdminRole)}
                    className="rounded-lg border border-walnut-200 bg-transparent px-2 py-1.5 text-sm focus:border-walnut-400 focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                </td>
                <td className="px-5 py-3 text-ink/50">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => handleChangePassword(user)}
                      className="text-sm font-medium text-walnut-600 hover:underline"
                    >
                      Change password
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(user)}
                      disabled={users.length <= 1}
                      className="text-sm font-medium text-danger-500 hover:underline disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-4 rounded-2xl border border-walnut-100 bg-white/60 p-6"
      >
        <h2 className="font-serif text-base font-semibold text-ink">Give someone access</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-sm">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Password
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
        {error && (
          <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>
        )}
        <button type="submit" disabled={submitting} className="btn-primary self-start">
          {submitting ? "Adding…" : "Add user"}
        </button>
      </form>
    </div>
  );
}
