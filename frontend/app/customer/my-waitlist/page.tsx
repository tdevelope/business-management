"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { waitlistApi } from "@/api/waitlist"
import { servicesApi } from "@/api/services"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

function MyWaitlistContent() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")

  const { data: waitlist, isLoading, error } = useQuery({
    queryKey: ["myWaitlist", selectedMonth],
    queryFn: async () => {
      try {
        return await waitlistApi.getMyEntries()
      } catch (err: any) {
        console.error("Waitlist API Error:", err)
        console.error("Error response:", err.response)
        throw err
      }
    },
  })

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: servicesApi.getAll,
  })

  // Debug: log the data
  console.log("Waitlist data:", waitlist)
  console.log("Services data:", services)
  console.log("Error:", error)

  const filtered = waitlist?.filter((entry) =>
    selectedMonth ? entry.preferredDate.startsWith(selectedMonth) : true
  )

  const getServiceName = (serviceId: string | number) => {
    const service = services?.find(s => String(s.id) === String(serviceId))
    return service?.name || `Service #${serviceId}`
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/customer/appointments" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>
          <h1 className="text-4xl font-bold mb-2">My Waitlist</h1>
          <p className="text-muted-foreground">View your waitlist entries</p>
        </div>

        <div className="flex gap-4 mb-6">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40"
          />
          <Button
            variant="outline"
            onClick={() => setSelectedMonth("")}
          >
            Clear
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-muted-foreground">Loading waitlist...</p>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-2">Error loading waitlist</p>
                <p className="text-sm text-muted-foreground">{String(error)}</p>
              </div>
            ) : !waitlist ? (
              <p className="text-muted-foreground text-center py-8">
                Unable to load waitlist
              </p>
            ) : filtered && filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {getServiceName(entry.serviceId)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Date: {format(new Date(entry.preferredDate), "PPP")} | Time: {entry.preferredTime}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          entry.status === "pending"
                            ? "bg-blue-100 text-blue-800"
                            : entry.status === "scheduled"
                              ? "bg-green-100 text-green-800"
                              : entry.status === "expired"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You have no waitlist entries
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Join a waitlist when booking a service that doesn't have available times
                </p>
                <Link href="/customer/book">
                  <Button>Book a Service</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify({
                  isLoading,
                  hasError: !!error,
                  waitlistCount: waitlist?.length || 0,
                  filteredCount: filtered?.length || 0,
                  selectedMonth
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function MyWaitlistPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <MyWaitlistContent />
    </ProtectedRoute>
  )
}