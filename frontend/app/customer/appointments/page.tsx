"use client"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Card, CardContent } from "@/components/ui/card"
import { appointmentsApi } from "@/api/appointments"
import { useState } from "react"
import { Appointment, AppointmentSuggestion } from "@/src/types"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

function MyAppointmentsContent() {

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState({
    serviceId: "",
    date: "",
    preferredTime: "",
  })
  const [suggestions, setSuggestions] = useState<AppointmentSuggestion[]>([])
  const { toast } = useToast()
  const queryClient = useQueryClient()

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

  interface UpdateAppointmentPayload {
    date?: string
    preferredTime?: string
    startTime: string
    endTime: string
  }

  const handleOpenDialog = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setFormData({
      serviceId: apt.service?.id ?? "",
      date: format(new Date(apt.startTime), "yyyy-MM-dd"),
      preferredTime: format(new Date(apt.startTime), "HH:mm"),
    })
    setSuggestions([])
    setIsDialogOpen(true)
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
                    <div key={apt.id} className="border rounded-lg p-4" onClick={() => handleOpenDialog(apt)}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{apt.service?.name || "Service"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.startTime), "PPP")} –  {format(new Date(apt.startTime), "p")} to {format(new Date(apt.endTime), "p")}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${apt.status === "scheduled"
                            ? "bg-green-100 text-green-800"
                            : apt.status === "done"
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
          {isDialogOpen && selectedAppointment && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Appointment</DialogTitle>
                  <DialogDescription>Select a new date and preferred time</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label>Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Preferred Time</label>
                    <input
                      type="time"
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!formData.date || !formData.preferredTime || !formData.serviceId) return
                      const result = await appointmentsApi.getSuggestions({
                        serviceId: formData.serviceId,
                        date: formData.date,
                        preferredTime: formData.preferredTime,
                      })
                      setSuggestions(result)
                    }}
                  >
                    Get Suggestions
                  </button>
                  <div>
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={async () => {
                          if (!selectedAppointment) return
                          try {
                            await appointmentsApi.update(selectedAppointment.id, {
                              date: formData.date,
                              preferredTime: formData.preferredTime,
                              startTime: s.start,
                              endTime: s.end,
                            } as UpdateAppointmentPayload)

                            setIsDialogOpen(false)
                            queryClient.invalidateQueries({ queryKey: ["myAppointments"] })

                            toast({
                              title: "Appointment updated",
                              description: `Your appointment on ${format(new Date(s.start), "PPP p")} was updated successfully.`,
                            })

                          } catch (err: any) {
                            console.error(err)
                            alert(err.message || "Failed to update appointment")
                          }
                        }}
                      >
                        {format(new Date(s.start), "PPP p")} – {format(new Date(s.end), "p")}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setIsDialogOpen(false)}>Cancel</button>
                </div>
              </DialogContent>
            </Dialog>
          )}

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
