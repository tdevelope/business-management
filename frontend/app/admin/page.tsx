"use client";

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { servicesApi } from "@/api/services"
import { appointmentsApi } from "@/api/appointments"
import { Calendar, Package, Settings, BarChart, Users, Clock } from "lucide-react"

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

  const formattedDate = format(new Date(), "EEEE, MMM d", { locale: he })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">לוח בקרה</h1>
          <p className="text-muted-foreground">נהל את פעולות העסק שלך</p>
        </div>

        <Link href="/admin/reports">
          <button className="btn-primary">דוחות</button>
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">תורים להיום</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">שירותים פעילים</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services?.filter((s) => s.isActive !== false).length || 0}</div>
              <p className="text-xs text-muted-foreground">זמין להזמנה</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סך הכל שירותים</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services?.length || 0}</div>
              <p className="text-xs text-muted-foreground">במערכת</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            {
              title: "ניהול שירותים",
              desc: "הוסף, ערוך או הסר שירותים",
              icon: <Package className="h-6 w-6 text-primary" />,
              link: "/admin/services",
              btnText: "עבור לשירותים",
            },
            {
              title: "יומן תורים",
              desc: "צפה בכל התורים וערוך אותם",
              icon: <Calendar className="h-6 w-6 text-primary" />,
              link: "/admin/appointments",
              btnText: "פתח יומן",
            },
            {
              title: "הגדרות עסק",
              desc: "שעות פתיחה וכללי הזמנות",
              icon: <Settings className="h-6 w-6 text-primary" />,
              link: "/admin/business-settings",
              btnText: "פתח הגדרות",
            },
            {
              title: "דוחות וסטטיסטיקות",
              desc: "צפה בהכנסות ובשירותים פופולריים",
              icon: <BarChart className="h-6 w-6 text-primary" />,
              link: "/admin/reports",
              btnText: "עבור לדוחות",
            },
            {
              title: "ניהול משתמשים",
              desc: "נהל לקוחות וצוות",
              icon: <Users className="h-6 w-6 text-primary" />,
              link: "/admin/users",
              btnText: "עבור למשתמשים",
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