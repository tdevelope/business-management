"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { appointmentsApi } from "@/api/appointments"
import { Calendar } from "lucide-react"

function MyAppointmentsContent() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", selectedDate],
    queryFn: () => appointmentsApi.getForDate(selectedDate),
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Appointments</h1>
          <p className="text-muted-foreground">View and manage your appointments</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>View appointments for a specific date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              <Button onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}>Today</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointments for {format(new Date(selectedDate), "PPP")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{apt.service?.name || "Service"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(apt.startTime), "p")} - {format(new Date(apt.endTime), "p")}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          apt.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : apt.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : apt.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    {apt.service && (
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{apt.service.duration} minutes</span>
                        <span>${apt.service.price}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No appointments for this date</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MyAppointmentsPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <MyAppointmentsContent />
    </ProtectedRoute>
  )
}
