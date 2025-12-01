"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
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
          <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground">Manage your appointments and book new services</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Book New Appointment</CardTitle>
                  <CardDescription>Schedule a new service</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/customer/book">
                  <Calendar className="mr-2 h-5 w-5" />
                  Start Booking
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
                  <CardTitle>My Appointments</CardTitle>
                  <CardDescription>View all appointments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
                <Link href="/customer/appointments">View All</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your next upcoming appointment</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : upcoming && upcoming.length > 0 ? (
              <div className="space-y-3">
                {(() => {
                  const nextApt = upcoming[0]
                  return (
                    <div key={nextApt.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{nextApt.service?.name || "Service"}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(nextApt.startTime), "PPp")}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">{nextApt.status}</span>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Button asChild>
                  <Link href="/customer/book">Book Your First Appointment</Link>
                </Button>
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
