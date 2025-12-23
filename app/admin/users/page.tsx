"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Shield, User, Stethoscope, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search) {
        setFilteredUsers(users);
    } else {
        setFilteredUsers(users.filter(u => 
            u.name.toLowerCase().includes(search.toLowerCase()) || 
            u.email.toLowerCase().includes(search.toLowerCase())
        ));
    }
  }, [search, users]);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
    }
    setLoading(false);
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    // Optimistic UI Update
    const originalUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

    try {
        const res = await fetch("/api/admin/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, newRole })
        });
        if (!res.ok) throw new Error("Failed");
        // alert("User rights updated!");
    } catch (error) {
        alert("Failed to update role");
        setUsers(originalUsers); // Revert
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure? This will permanently delete this user and their data.")) return;
    
    await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
            <p className="text-slate-500">Manage user roles, rights, and account status.</p>
        </div>
        <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Search users..." 
                className="pl-8 bg-white" 
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="h-12 px-4 font-medium text-slate-500">User Details</th>
                  <th className="h-12 px-4 font-medium text-slate-500">Current Role</th>
                  <th className="h-12 px-4 font-medium text-slate-500">Rights / Actions</th>
                  <th className="h-12 px-4 font-medium text-slate-500 text-right">Remove</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin mx-auto"/></td></tr>
                ) : filteredUsers.length === 0 ? (
                   <tr><td colSpan={4} className="p-8 text-center text-slate-500">No users found.</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                              user.role === 'nutritionist' ? 'bg-green-100 text-green-700' : 
                              'bg-slate-100 text-slate-700'}`}>
                            {user.role === 'ADMIN' && <Shield className="w-3 h-3"/>}
                            {user.role === 'nutritionist' && <Stethoscope className="w-3 h-3"/>}
                            {user.role === 'client' && <User className="w-3 h-3"/>}
                            {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <Select 
                            defaultValue={user.role} 
                            onValueChange={(val) => updateUserRole(user.id, val)}
                        >
                            <SelectTrigger className="w-[180px] h-8 text-xs bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="client">Client (Standard)</SelectItem>
                                <SelectItem value="nutritionist">Nutritionist (Provider)</SelectItem>
                                <SelectItem value="ADMIN">Administrator (Full Access)</SelectItem>
                            </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-right">
                         <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 h-8 w-8 p-0" onClick={() => deleteUser(user.id)}>
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}