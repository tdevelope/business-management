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
import { servicesApi } from "@/api/services"
import { appointmentsApi } from "@/api/appointments"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import type { Service, AppointmentSuggestion } from "@/types"
import { get } from "http"

function BookingWizardContent() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [preferredTime, setPreferredTime] = useState("")
  const [suggestions, setSuggestions] = useState<AppointmentSuggestion[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSuggestion | null>(null)

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
      setStep(3)
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
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
        title: "Success",
        description: "Appointment booked successfully!",
      })
      router.push("/customer/appointments")
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
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
      const date = selectedSlot.start.split("T")[0];
      const slotDate = new Date(selectedSlot.start);
      const hh = slotDate.getHours().toString().padStart(2, "0");
      const mm = slotDate.getMinutes().toString().padStart(2, "0");
      const startTime = `${hh}:${mm}`;


      createAppointmentMutation.mutate({
        serviceId: selectedService.id,
        date,
        startTime,
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => (step > 1 ? setStep(step - 1) : router.push("/customer"))}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Book Appointment</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={step >= 1 ? "text-primary font-medium" : ""}>1. Choose Service</span>
            <ArrowRight className="h-4 w-4" />
            <span className={step >= 2 ? "text-primary font-medium" : ""}>2. Select Date & Time</span>
            <ArrowRight className="h-4 w-4" />
            <span className={step >= 3 ? "text-primary font-medium" : ""}>3. Pick Slot</span>
            <ArrowRight className="h-4 w-4" />
            <span className={step >= 4 ? "text-primary font-medium" : ""}>4. Confirm</span>
          </div>
        </div>

        {/* Step 1: Choose Service */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Choose a Service</h2>
            {servicesLoading ? (
              <p>Loading services...</p>
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
                        <span className="text-muted-foreground">{service.duration} minutes</span>
                        <span className="font-semibold">${service.price}</span>
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
              <CardTitle>Select Date & Preferred Time</CardTitle>
              <CardDescription>
                Service: {selectedService.name} ({selectedService.duration} min)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
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
                  <Label htmlFor="time">Preferred Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={getSuggestionsMutation.isPending}>
                  {getSuggestionsMutation.isPending ? "Checking availability..." : "Find Available Slots"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Pick Slot */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Available Time Slots</h2>
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
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && selectedService && selectedSlot && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-6 w-6 text-primary" />
                Confirm Your Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-semibold">{selectedService.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-semibold">
                  {format(new Date(selectedSlot.start), "PPP")} at {format(new Date(selectedSlot.start), "p")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{selectedService.duration} minutes</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold text-lg">${selectedService.price}</p>
              </div>
              <Button
                onClick={handleConfirm}
                className="w-full"
                size="lg"
                disabled={createAppointmentMutation.isPending}
              >
                {createAppointmentMutation.isPending ? "Booking..." : "Confirm Appointment"}
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
