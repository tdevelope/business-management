"use client"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Card, CardContent } from "@/components/ui/card"
import { appointmentsApi } from "@/api/appointments"

function MyAppointmentsContent() {

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["myAppointments"],
    queryFn: appointmentsApi.getMy
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Appointments</h1>
          <p className="text-muted-foreground">View and manage your appointments</p>
        </div>

        <Card>
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
                          {format(new Date(apt.startTime), "PPP")} –  {format(new Date(apt.startTime), "p")} to {format(new Date(apt.endTime), "p")}
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
              <p className="text-muted-foreground text-center py-8">You have no appointments</p>
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
