"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, isSameDay, isSameMonth } from "date-fns"
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
import { usersApi } from "@/api/users"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Plus } from "lucide-react"
import type { Appointment } from "@/types"
import { AdminWaitlist } from "../appointments/adminWaitlist"
import { blockedTimesApi } from "@/src/api/blockedTimes"


function AppointmentsCalendarContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month")
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

  const [formData, setFormData] = useState({
    serviceId: 0,
    startTime: "",
    endTime: "",
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: appointmentsApi.getAll,
  })

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: servicesApi.getAll,
  })

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: usersApi.getAllCustomers,
  })


  const createMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast({ title: "הצלחה", description: "התור נוצר בהצלחה!" })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast({ title: "הצלחה", description: "התור עודכן בהצלחה!" })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: appointmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast({ title: "הצלחה", description: "התור נמחק בהצלחה!" })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" })
    },
  })

  const handleOpenDialog = (appointment?: Appointment) => {
    setIsEditing(false)
    if (appointment) {
      setSelectedAppointment(appointment)
      setFormData({
        serviceId: Number(appointment.serviceId),
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      })
    } else {
      setSelectedAppointment(null)
      setSelectedCustomerId(null)
      setFormData({ serviceId: 0, startTime: "", endTime: "" })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedAppointment(null)
    setSelectedCustomerId(null)
    setFormData({ serviceId: 0, startTime: "", endTime: "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const [datePart, timeWithSeconds] = formData.startTime.split("T")
    const time = timeWithSeconds?.slice(0, 5)

    if (!datePart || !time || !formData.serviceId) {
      toast({ title: "שגיאה", description: "אנא מלא את כל השדות הנדרשים", variant: "destructive" })
      return
    }

    const payload: any = {
      serviceId: Number(formData.serviceId),
      date: datePart,
      startTime: time,
    }

    if (selectedCustomerId) {
      payload.userId = Number(selectedCustomerId)
    }

    createMutation.mutate(payload)
  }

  const { data: blockedTimes } = useQuery({
    queryKey: ["blockedTimes"],
    queryFn: blockedTimesApi.getAll,
  })


  const handleStatusChange = (status: string) => {
    if (selectedAppointment) {
      updateMutation.mutate({
        id: selectedAppointment.id,
        data: { status: status as any },
      })
    }
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppointment) return

    const selectedService = services?.find(s => Number(s.id) === formData.serviceId)
    if (selectedService) {
      const durationMinutes = selectedService.duration
      const end = new Date(formData.startTime)
      end.setMinutes(end.getMinutes() + durationMinutes)
      setFormData(prev => ({ ...prev, endTime: end.toISOString() }))
    }

    updateMutation.mutate({
      id: selectedAppointment.id,
      data: {
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (selectedAppointment && confirm("האם אתה בטוח שברצונך למחוק תור זה?")) {
      deleteMutation.mutate(selectedAppointment.id)
    }
  }

  const handlePrev = () => {
    setCurrentDate((prev) => {
      if (viewMode === "day") return subDays(prev, 1)
      if (viewMode === "week") return subWeeks(prev, 1)
      return subMonths(prev, 1)
    })
  }

  const handleNext = () => {
    setCurrentDate((prev) => {
      if (viewMode === "day") return addDays(prev, 1)
      if (viewMode === "week") return addWeeks(prev, 1)
      return addMonths(prev, 1)
    })
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateInputChange = (value: string) => {
    const parsed = new Date(value)
    if (!isNaN(parsed.getTime())) {
      setCurrentDate(parsed)
    }
  }

  const getCalendarDays = (): Date[] => {
    if (viewMode === "day") {
      return [currentDate]
    }

    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    }

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days: Date[] = []
    for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
      days.push(d)
    }
    return days
  }

  const calendarDays = getCalendarDays()

  const getAppointmentsForDay = (day: Date): Appointment[] => {
    if (!appointments) return []
    return appointments.filter(
      (apt) =>
        isSameDay(new Date(apt.startTime), day) &&
        (apt.status === "scheduled" || apt.status === "done")
    )
  }

  const periodLabel = () => {
    if (viewMode === "day") {
      return format(currentDate, "PPP")
    }
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })
      return `${format(start, "PPP")} - ${format(end, "PPP")}`
    }
    return format(currentDate, "LLLL yyyy")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="flex gap-2 ml-auto">
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              תור חדש
            </Button>
            <Button onClick={() => setIsWaitlistOpen(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              ניהול רשימת המתנה
            </Button>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">יומן התורים</h1>
            <p className="text-muted-foreground">הצגה וניהול של כל התורים</p>
          </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>תצוגת לוח שנה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="date">תאריך</Label>
                <Input
                  id="date"
                  type="date"
                  value={format(currentDate, "yyyy-MM-dd")}
                  onChange={(e) => handleDateInputChange(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handlePrev}>
                  הקודם
                </Button>
                <Button type="button" variant="outline" onClick={handleToday}>
                  היום
                </Button>
                <Button type="button" variant="outline" onClick={handleNext}>
                  הבא
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={viewMode === "day" ? "default" : "outline"}
                  onClick={() => setViewMode("day")}
                >
                  יום
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "week" ? "default" : "outline"}
                  onClick={() => setViewMode("week")}
                >
                  שבוע
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "month" ? "default" : "outline"}
                  onClick={() => setViewMode("month")}
                >
                  חודש
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              תורים עבור {periodLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">טוען...</p>
            ) : !appointments || appointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">לא נמצאו תורים</p>
            ) : viewMode === "day" ? (
              <>
                {getAppointmentsForDay(currentDate).length > 0 ? (
                  <div className="space-y-4">
                    {getAppointmentsForDay(currentDate).map((apt) => (
                      <div
                        key={apt.id}
                        className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleOpenDialog(apt)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{apt.service?.name || "Service"}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.startTime), "PPp")} - {format(new Date(apt.endTime), "p")}
                            </p>
                            {apt.user && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Client: {apt.user.firstName} {apt.user.lastName}
                              </p>
                            )}
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">לא נמצאו תורים ליום זה</p>
                )}
              </>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const dayAppointments = getAppointmentsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const dayBlocked = blockedTimes?.some(bt =>
                    isSameDay(new Date(bt.startTime), day)
                  )

                  return (
                    <div
                      key={day.toISOString()}
                      className={`border rounded-lg p-2 min-h-[120px] bg-background ${!isCurrentMonth && viewMode === "month" ? "opacity-50" : ""
                        }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold">
                          {format(day, "d MMM")}
                        </span>
                        {viewMode === "week" && (
                          <span className="text-[10px] text-muted-foreground">
                            {format(day, "EEE")}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {/* Existing appointments */}
                        {dayAppointments.map((apt) => (
                          <button
                            key={apt.id}
                            type="button"
                            className="w-full text-left text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
                            onClick={() => handleOpenDialog(apt)}
                          >
                            <span className="block font-medium">
                              {format(new Date(apt.startTime), "p")} – {apt.service?.name || "Service"}
                            </span>
                            {apt.user && (
                              <span className="block text-[10px] text-muted-foreground">
                                {apt.user.firstName} {apt.user.lastName}
                              </span>
                            )}
                          </button>
                        ))}

                        {/* Blocked times */}
                        {blockedTimes
                          ?.filter(bt => isSameDay(new Date(bt.startTime), day))
                          .map(bt => (
                            <div
                              key={bt.id}
                              className="w-full text-left text-xs p-1 rounded bg-red-200/50 mb-1"
                              title={bt.reason || "זמן חסום"}
                            >
                              <span className="block font-medium">
                                {format(new Date(bt.startTime), "p")} – {format(new Date(bt.endTime), "p")} (חסום)
                              </span>
                              {bt.reason && (
                                <span className="block text-[10px] text-muted-foreground">
                                  {bt.reason}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                      {dayAppointments.length === 0 && (
                        <p className="text-[10px] text-muted-foreground">לא נמצאו תורים</p>
                      )}
                    </div>
            )
            })}
          </div>
            )}
        </CardContent>
      </Card>

      {/* Dialog for Appointment Details/Edit/Create */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAppointment ? (isEditing ? "Edit Appointment" : "Appointment Details") : "Create Appointment"}</DialogTitle>
            <DialogDescription>
              {selectedAppointment
                ? isEditing
                  ? "Edit the appointment details"
                  : "View and manage this appointment"
                : "Schedule a new appointment manually"}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment ? (
            isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select
                    value={String(formData.serviceId)}
                    onValueChange={(value) => setFormData({ ...formData, serviceId: Number(value) })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">זמן התחלה</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    ביטול
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    שמור
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <div className="space-y-4 py-4">
                <div>
                  <Label>שירות</Label>
                  <p className="text-sm">{selectedAppointment.service?.name}</p>
                </div>
                <div>
                  <Label>לקוח</Label>
                  <p className="text-sm">
                    {selectedAppointment.user?.firstName} {selectedAppointment.user?.lastName}
                  </p>
                </div>
                <div>
                  <Label>זמן</Label>
                  <p className="text-sm">
                    {format(new Date(selectedAppointment.startTime), "PPp")} - {format(new Date(selectedAppointment.endTime), "p")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">סטטוס</Label>
                  <Select value={selectedAppointment.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">מתוזמן</SelectItem>
                      <SelectItem value="done">הושלם</SelectItem>
                      <SelectItem value="cancelled">בוטל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>ערוך</Button>
                  <Button variant="destructive" onClick={handleDelete}>מחק</Button>
                  <Button variant="outline" onClick={handleCloseDialog}>סגור</Button>
                </DialogFooter>
              </div>
            )
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">לקוח</Label>
                  <Select
                    value={selectedCustomerId || ""}
                    onValueChange={(value) => setSelectedCustomerId(value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר לקוח" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.firstName} {customer.lastName} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">שירות</Label>
                  <Select
                    value={String(formData.serviceId)}
                    onValueChange={(value) => setFormData({ ...formData, serviceId: Number(value) })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר שירות" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">זמן התחלה</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  ביטול
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  צור
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for Waitlist Management */}
      <Dialog open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>ניהול רשימת המתנה</DialogTitle>
            <DialogDescription>הצגת וניהול כל הערכים ברשימת ההמתנה</DialogDescription>
          </DialogHeader>
          <AdminWaitlist services={services || []} />
        </DialogContent>
      </Dialog>
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