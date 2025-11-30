"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { appointmentsApi } from "@/api/appointments"
import { servicesApi } from "@/api/services"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Plus } from "lucide-react"
import type { Appointment } from "@/types"

function AppointmentsCalendarContent() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState({
    serviceId: "",
    startTime: "",
    endTime: "",
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", selectedDate],
    queryFn: () => appointmentsApi.getForDate(selectedDate),
  })

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: servicesApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast({ title: "Success", description: "Appointment created successfully!" })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast({ title: "Success", description: "Appointment updated successfully!" })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: appointmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast({ title: "Success", description: "Appointment deleted successfully!" })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setSelectedAppointment(appointment)
      setFormData({
        serviceId: appointment.serviceId,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      })
    } else {
      setSelectedAppointment(null)
      setFormData({ serviceId: "", startTime: "", endTime: "" })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedAppointment(null)
    setFormData({ serviceId: "", startTime: "", endTime: "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      serviceId: formData.serviceId,
      startTime: formData.startTime,
      endTime: formData.endTime,
    })
  }

  const handleStatusChange = (status: string) => {
    if (selectedAppointment) {
      updateMutation.mutate({
        id: selectedAppointment.id,
        data: { status: status as any },
      })
    }
  }

  const handleDelete = () => {
    if (selectedAppointment && confirm("Are you sure you want to delete this appointment?")) {
      deleteMutation.mutate(selectedAppointment.id)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Appointments Calendar</h1>
            <p className="text-muted-foreground">View and manage all appointments</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
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
                  <div
                    key={apt.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleOpenDialog(apt)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{apt.service?.name || "Service"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(apt.startTime), "p")} - {format(new Date(apt.endTime), "p")}
                        </p>
                        {apt.user && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Client: {apt.user.firstName} {apt.user.lastName}
                          </p>
                        )}
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No appointments for this date</p>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedAppointment ? "Appointment Details" : "Create Appointment"}</DialogTitle>
              <DialogDescription>
                {selectedAppointment ? "View and manage this appointment" : "Schedule a new appointment manually"}
              </DialogDescription>
            </DialogHeader>

            {selectedAppointment ? (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Service</Label>
                  <p className="text-sm">{selectedAppointment.service?.name}</p>
                </div>
                <div>
                  <Label>Client</Label>
                  <p className="text-sm">
                    {selectedAppointment.user?.firstName} {selectedAppointment.user?.lastName}
                  </p>
                </div>
                <div>
                  <Label>Time</Label>
                  <p className="text-sm">
                    {format(new Date(selectedAppointment.startTime), "PPp")} -{" "}
                    {format(new Date(selectedAppointment.endTime), "p")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedAppointment.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Select
                      value={formData.serviceId}
                      onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    Create
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function AppointmentsCalendarPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AppointmentsCalendarContent />
    </ProtectedRoute>
  )
}
