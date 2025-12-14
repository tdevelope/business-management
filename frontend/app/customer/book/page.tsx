"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { servicesApi } from "@/api/services"
import { appointmentsApi } from "@/api/appointments"
import { waitlistApi } from "@/api/waitlist"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react"
import type { Service, AppointmentSuggestion } from "@/types"

function BookingWizardContent() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [preferredTime, setPreferredTime] = useState("")
  const [suggestions, setSuggestions] = useState<AppointmentSuggestion[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSuggestion | null>(null)
  const [showWaitlistOption, setShowWaitlistOption] = useState(false)
  const [waitlistNotes, setWaitlistNotes] = useState("")

  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: servicesApi.getAll,
  })

  const getSuggestionsMutation = useMutation({
    mutationFn: appointmentsApi.getSuggestions,
    onSuccess: (data) => {
      setSuggestions(data)
      setShowWaitlistOption(false)
      setStep(3)
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const createAppointmentMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast({
        title: "הצלחה",
        description: "התור הזמן בהצלחה!",
      })
      router.push("/customer/appointments")
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const joinWaitlistMutation = useMutation({
    mutationFn: waitlistApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myWaitlist"] })
      toast({
        title: "התווסף לרשימת ההמתנה",
        description: "הוספת לרשימת ההמתנה. נודיע לך כשיהיה זמן פנוי.",
      })
      router.push("/customer/my-waitlist")
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setStep(2)
  }

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedService && selectedDate && preferredTime) {
      getSuggestionsMutation.mutate({
        serviceId: selectedService.id,
        date: selectedDate,
        preferredTime,
      })
    }
  }

  const handleSlotSelect = (slot: AppointmentSuggestion) => {
    setSelectedSlot(slot)
    setStep(4)
  }

  const handleConfirm = () => {
    if (selectedService && selectedSlot) {
      const date = selectedSlot.start.split("T")[0]
      const slotDate = new Date(selectedSlot.start)
      const hh = slotDate.getHours().toString().padStart(2, "0")
      const mm = slotDate.getMinutes().toString().padStart(2, "0")
      const startTime = `${hh}:${mm}`

      createAppointmentMutation.mutate({
        serviceId: Number(selectedService.id),
        date,
        startTime,
      })
    }
  }

  const handleJoinWaitlist = () => {
    if (selectedService && selectedDate && preferredTime) {
      // Create full ISO datetime string for both fields
      const dateTimeString = `${selectedDate}T${preferredTime}:00.000Z`
      
      joinWaitlistMutation.mutate({
        serviceId: Number(selectedService.id),
        preferredDate: dateTimeString,  // Send as DateTime
        preferredTime: dateTimeString,
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => (step > 1 ? setStep(step - 1) : router.push("/customer"))}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            הקודם
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">הזמן תור</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={step >= 1 ? "text-primary font-medium" : ""}>1. בחר שירות</span>
            <ArrowRight className="h-4 w-4" />
            <span className={step >= 2 ? "text-primary font-medium" : ""}>2. בחר תאריך וזמן</span>
            <ArrowRight className="h-4 w-4" />
            <span className={step >= 3 ? "text-primary font-medium" : ""}>3. בחר משבצת</span>
            <ArrowRight className="h-4 w-4" />
            <span className={step >= 4 ? "text-primary font-medium" : ""}>4. אשר</span>
          </div>
        </div>

        {/* Step 1: Choose Service */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">בחר שירות</h2>
            {servicesLoading ? (
              <p>טוען שירותים...</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {services?.map((service) => (
                  <Card
                    key={service.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardHeader>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{service.duration} דקות</span>
                        <span className="font-semibold">₪{service.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && selectedService && (
          <Card>
            <CardHeader>
              <CardTitle>בחר תאריך וזמן מועדף</CardTitle>
              <CardDescription>
                שירות: {selectedService.name} ({selectedService.duration} דק')
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">תאריך</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">זמן מועדף</Label>
                  <Input
                    id="time"
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={getSuggestionsMutation.isPending}>
                  {getSuggestionsMutation.isPending ? "בודק זמינות..." : "חפש משבצות פנויות"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Pick Slot or Join Waitlist */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">משבצות זמן פנויות</h2>
            
            {suggestions.length > 0 ? (
              <>
                <div className="grid gap-4">
                  {suggestions.map((slot, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <p className="font-semibold">{format(new Date(slot.start), "PPP")}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(slot.start), "p")} - {format(new Date(slot.end), "p")}
                          </p>
                        </div>
                        {slot.confidence && <span className="text-sm text-muted-foreground">{slot.confidence}</span>}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    אף אחד מהזמנים האלה לא מתאים לך?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(2)
                        setSuggestions([])
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      נסה זמן שונה
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowWaitlistOption(true)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      הצטרף לרשימת המתנה
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">אין משבצות פנויות</h3>
                  <p className="text-muted-foreground mb-6">
                    סליחה, אין משבצות זמן פנויות לתאריך וזמן שנבחרו.
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(2)
                        setSuggestions([])
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Try Different Time
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => setShowWaitlistOption(true)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Join Waitlist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Waitlist Form */}
            {showWaitlistOption && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    הצטרף לרשימת המתנה
                  </CardTitle>
                  <CardDescription>
                    נודיע לך כשתהיה משבצת פנויה לתאריך וזמן המועדפים שלך
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>שירות</Label>
                    <p className="text-sm font-medium">{selectedService?.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>תאריך מועדף</Label>
                    <p className="text-sm font-medium">{format(new Date(selectedDate), "PPP")}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>זמן מועדף</Label>
                    <p className="text-sm font-medium">{preferredTime}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">הערות נוספות (אופציונלי)</Label>
                    <Textarea
                      id="notes"
                      placeholder="כל דרישה מיוחדת או זמנים גמישים..."
                      value={waitlistNotes}
                      onChange={(e) => setWaitlistNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowWaitlistOption(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleJoinWaitlist}
                      disabled={joinWaitlistMutation.isPending}
                    >
                      {joinWaitlistMutation.isPending ? "מצטרף..." : "הצטרף לרשימת המתנה"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && selectedService && selectedSlot && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-6 w-6 text-primary" />
                אשר את התור שלך
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">שירות</p>
                <p className="font-semibold">{selectedService.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">תאריך וזמן</p>
                <p className="font-semibold">
                  {format(new Date(selectedSlot.start), "PPP")} ב-{format(new Date(selectedSlot.start), "p")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">משך</p>
                <p className="font-semibold">{selectedService.duration} דקות</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">מחיר</p>
                <p className="font-semibold text-lg">₪{selectedService.price}</p>
              </div>
              <Button
                onClick={handleConfirm}
                className="w-full"
                size="lg"
                disabled={createAppointmentMutation.isPending}
              >
                {createAppointmentMutation.isPending ? "מזמין..." : "אשר תור"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function BookingWizardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <BookingWizardContent />
    </ProtectedRoute>
  )
}