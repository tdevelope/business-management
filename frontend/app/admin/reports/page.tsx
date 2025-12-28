"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { appointmentsApi } from "@/src/api/appointments";
import { servicesApi } from "@/src/api/services";
import { usersApi } from "@/src/api/users";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { format } from "date-fns";

export default function ReportsDashboard() {
  const { data: appointments } = useQuery({ queryKey: ["appointments"], queryFn: appointmentsApi.getAll });
  const { data: services } = useQuery({ queryKey: ["services"], queryFn: servicesApi.getAll });
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: usersApi.getAllCustomers });

  if (!appointments || !services || !users) return <div>טוען...</div>;

  const servicesById = Object.fromEntries(services.map(s => [String(s.id), s]));
  const usersById = Object.fromEntries(users.map(u => [String(u.id), u]));

  // Total revenue
  const totalRevenue = appointments
    .filter(a => a.status === "done")
    .reduce((sum, a) => {
      const servicePrice = a.service?.price || servicesById[String(a.serviceId)]?.price || 0;
      return sum + servicePrice;
    }, 0);

  // Appointments by status
  const appointmentsByStatus = appointments.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  // Popular services
  const serviceCount = appointments.reduce<Record<string, number>>((acc, a) => {
    const key = String(a.serviceId);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const popularServices = Object.entries(serviceCount)
    .map(([id, count]) => ({ name: servicesById[id]?.name || "לא ידוע", count }))
    .sort((a, b) => b.count - a.count);

  // Top customers (with first + last name)
  const userCount = appointments.reduce<Record<string, number>>((acc, a) => {
    const key = String(a.userId);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topCustomers = Object.entries(userCount)
    .map(([id, count]) => ({
      name: `${usersById[id]?.firstName || "לא ידוע"} ${usersById[id]?.lastName || ""}`.trim(),
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Revenue per month
  const revenuePerMonth: Record<string, number> = {};
  appointments
    .filter(a => a.status === "done")
    .forEach(a => {
      const month = format(new Date(a.startTime), "yyyy-MM");
      const servicePrice = a.service?.price || servicesById[String(a.serviceId)]?.price || 0;
      revenuePerMonth[month] = (revenuePerMonth[month] || 0) + servicePrice;
    });
  const revenuePerMonthData = Object.entries(revenuePerMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold">דוחות וסטטיסטיקות</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle>הרווח הכולל</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32 text-5xl">
            ₪{totalRevenue.toLocaleString()}
          </CardContent>
        </Card>
        {/* Appointments Status */}
        <Card>
          <CardHeader>
            <CardTitle>סטטוס התורים</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(appointmentsByStatus).map(([status, count]) => {
                const statusMap: Record<string, string> = {
                  'scheduled': 'מתוזמן',
                  'done': 'הושלם',
                  'cancelled': 'בוטל'
                };
                return { status: statusMap[status] || status, count };
              })}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>שירותים פופולריים</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={popularServices}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#82ca9d"
                  label
                >
                  {popularServices.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue per Month */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>הרווח לפי חודש</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenuePerMonthData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>לקוחות מובילים</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCustomers}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
