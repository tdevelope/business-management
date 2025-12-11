"use client";

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { servicesApi } from "@/api/services"
import { appointmentsApi } from "@/api/appointments"
import { Calendar, Package, Settings, BarChart, Users } from "lucide-react"

function AdminDashboardContent() {
  const today = format(new Date(), "yyyy-MM-dd")

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: servicesApi.getAll,
  })

  const { data: todayAppointments } = useQuery({
    queryKey: ["appointments", today],
    queryFn: () => appointmentsApi.getForDate(today),
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your business operations</p>
        </div>

        <Link href="/admin/reports">
          <button className="btn-primary">Reports</button>
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMM d")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services?.filter((s) => s.isActive !== false).length || 0}</div>
              <p className="text-xs text-muted-foreground">Available to book</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services?.length || 0}</div>
              <p className="text-xs text-muted-foreground">In the system</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              title: "Manage Services",
              desc: "Add, edit, or remove services",
              icon: <Package className="h-6 w-6 text-primary" />,
              link: "/admin/services",
              btnText: "Go to Services",
            },
            {
              title: "Appointments Calendar",
              desc: "View and manage all appointments",
              icon: <Calendar className="h-6 w-6 text-primary" />,
              link: "/admin/appointments",
              btnText: "Open Calendar",
            },
            {
              title: "Business Settings",
              desc: "Opening hours & booking rules",
              icon: <Settings className="h-6 w-6 text-primary" />,
              link: "/admin/business-settings",
              btnText: "Open Settings",
            },
            {
              title: "Reports & Statistics",
              desc: "View income & popular services",
              icon: <BarChart className="h-6 w-6 text-primary" />,
              link: "/admin/reports",
              btnText: "Go to Reports",
            },
            {
              title: "Users Management",
              desc: "Manage clients & staff",
              icon: <Users className="h-6 w-6 text-primary" />,
              link: "/admin/users",
              btnText: "Go to Users",
            },
          ].map((card) => (
            <Card key={card.title} className="flex flex-col hover:shadow-lg transition-shadow p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">{card.icon}</div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </div>
              </div>
              <Button asChild className="w-full mt-auto">
                <Link href={card.link}>{card.btnText}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}