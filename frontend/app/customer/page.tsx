"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { appointmentsApi } from "@/api/appointments"
import { Calendar, Clock, Plus } from "lucide-react"

function CustomerHomeContent() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: appointmentsApi.getMy,
  })

  const now = new Date()

  const upcoming = appointments
    ?.filter(apt => new Date(apt.startTime) > now && apt.status !== "cancelled")
    ?.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">ברוכים השבים!</h1>
          <p className="text-muted-foreground">נהל את התורים שלך והזמן תורים חדשים</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>הזמן תור חדש</CardTitle>
                  <CardDescription>תזמן שירות חדש</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/customer/book">
                  <Calendar className="mr-2 h-5 w-5" />
                  התחל הזמנה
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>התורים שלי</CardTitle>
                  <CardDescription>הצג הכל</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
                <Link href="/customer/appointments">הצג הכל</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>תורים קרובים</CardTitle>
            <CardDescription>התור הבא שלך</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p>טוען...</p>}
            {!isLoading && (!upcoming || upcoming.length === 0) ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">אין לך תורים קרובים</p>
                <Button asChild>
                  <Link href="/customer/book">הזמן עכשיו</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming?.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {appointment.status === "scheduled" && "מתוזמן"}
                        {appointment.status === "done" && "הושלם"}
                        {appointment.status === "cancelled" && "בוטל"}
                      </span>
                      <div>
                        <h4 className="font-semibold">
                          {appointment.service?.name || "שירות"}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(appointment.startTime), "PPP p", { locale: he })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CustomerHomePage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerHomeContent />
    </ProtectedRoute>
  )
}
