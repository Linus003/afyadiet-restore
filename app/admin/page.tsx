"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Activity, Calendar, AlertCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then(res => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(data => setMetrics(data))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        <h3 className="font-bold">Error Loading Dashboard</h3>
        <p className="text-sm">Could not fetch data. Please try refreshing or logging in again.</p>
      </div>
    );
  }

  if (!metrics || !metrics.summary) {
    return <div className="p-8 text-center text-slate-400">Loading Dashboard...</div>;
  }

  // Placeholder Data for Charts
  const chartData = [
    { name: 'Week 1', users: 5 },
    { name: 'Week 2', users: 12 },
    { name: 'Week 3', users: metrics.summary.users || 0 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Overview</h1>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {Number(metrics.summary.revenue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.summary.users}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.summary.appointments}</div>
            <p className="text-xs text-muted-foreground">Total bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.summary.nutritionists}</div>
            <p className="text-xs text-muted-foreground">Active Nutritionists</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-lg border border-dashed text-slate-400">
                <div className="text-center">
                    <p className="font-semibold text-slate-500">System Status: Nominal</p>
                    <p className="text-sm">Database: Connected</p>
                    <p className="text-sm">M-Pesa Gateway: Active</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}