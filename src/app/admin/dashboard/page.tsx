"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users);
      } catch (error) {
        console.error(error);
        alert("Error fetching users. Please try again.");
      }
    }
    fetchUsers();
  }, []);

  async function promoteToAdmin(userId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/make-admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to promote user.");
      }

      setUsers(users.map(user => (user.id === userId ? { ...user, role: "ADMIN" } : user)));
    } catch (error) {
      console.error(error);
      alert("Failed to promote user.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <ul className="mt-4">
        {users.map((user) => (
          <li key={user.id} className="p-4 bg-white shadow rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-gray-500">{user.email}</p>
              <p className={`text-sm ${user.role === "ADMIN" ? "text-green-500" : "text-red-500"}`}>
                Role: {user.role}
              </p>
            </div>
            {user.role !== "ADMIN" && (
              <button
                onClick={() => promoteToAdmin(user.id)}
                disabled={loading}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Make Admin
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
