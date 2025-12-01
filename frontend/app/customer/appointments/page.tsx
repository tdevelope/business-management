"use client"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Card, CardContent } from "@/components/ui/card"
import { appointmentsApi } from "@/api/appointments"
import { useState } from "react"

function MyAppointmentsContent() {

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["myAppointments"],
    queryFn: appointmentsApi.getMy
  })

  let filtered = appointments || []

  if (selectedMonth !== null) {
    filtered = filtered.filter(
      (apt) => new Date(apt.startTime).getMonth() === selectedMonth
    )
  }

  if (selectedDay !== null) {
    filtered = filtered.filter(
      (apt) => new Date(apt.startTime).getDate() === selectedDay
    )
  }


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Appointments</h1>
          <p className="text-muted-foreground">View and manage your appointments</p>
        </div>
        <div className="flex gap-4 mb-6">
          <select
            className="border p-2 rounded"
            value={selectedMonth ?? ""}
            onChange={(e) =>
              setSelectedMonth(e.target.value === "" ? null : Number(e.target.value))
            }
          >
            <option value="">All months</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {format(new Date(2024, i, 1), "LLLL")}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={selectedDay ?? ""}
            disabled={selectedMonth === null}
            onChange={(e) =>
              setSelectedDay(e.target.value === "" ? null : Number(e.target.value))
            }
          >
            <option value="">All days</option>
            {Array.from({ length: 31 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <button
            className="p-2 border rounded"
            onClick={() => {
              setSelectedMonth(null)
              setSelectedDay(null)
            }}
          >
            Clear
          </button>
        </div>
        <Card>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : appointments && appointments.length > 0 ? (
              filtered.length > 0 ? (
                <div className="space-y-4">
                  {filtered.map((apt) => (
                    <div key={apt.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{apt.service?.name || "Service"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.startTime), "PPP")} –  {format(new Date(apt.startTime), "p")} to {format(new Date(apt.endTime), "p")}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${apt.status === "confirmed"
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
                <p className="text-muted-foreground text-center py-8">
                  No appointments match the selected filters
                </p>
              )
              ) : (
              <p className="text-muted-foreground text-center py-8">You have no appointments</p>
            )}    
          </CardContent>
        </Card>
      </div>
    </div >
  )
}

export default function MyAppointmentsPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <MyAppointmentsContent />
    </ProtectedRoute>
  )
}
