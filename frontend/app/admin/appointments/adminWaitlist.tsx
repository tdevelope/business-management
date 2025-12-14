"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { waitlistApi } from "@/api/waitlist"
import { useToast } from "@/hooks/use-toast"
import type { WaitlistEntry, Service } from "@/types"
import { Pencil, Trash2 } from "lucide-react"

interface AdminWaitlistProps {
  services: Service[]
}

export function AdminWaitlist({ services }: AdminWaitlistProps) {
  const [filterServiceId, setFilterServiceId] = useState<number | null>(null)
  const [filterMonth, setFilterMonth] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<WaitlistEntry | null>(null)
  const [formData, setFormData] = useState({ preferredDate: "", preferredTime: "" })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: waitlist, isLoading } = useQuery({
    queryKey: ["waitlist", filterServiceId, filterMonth],
    queryFn: () => waitlistApi.getAll(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WaitlistEntry> }) =>
      waitlistApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] })
      toast({ title: "Success", description: "Entry updated successfully!" })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => waitlistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] })
      toast({ title: "Success", description: "Entry deleted successfully!" })
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const handleOpenDialog = (entry: WaitlistEntry) => {
    setEditingEntry(entry)
    setFormData({ preferredDate: entry.preferredDate, preferredTime: entry.preferredTime })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setEditingEntry(null)
    setFormData({ preferredDate: "", preferredTime: "" })
    setIsDialogOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEntry) return
    updateMutation.mutate({ id: editingEntry.id, data: formData })
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteMutation.mutate(id)
    }
  }

  const filteredWaitlist = waitlist?.filter((entry) => {
    const matchesService = filterServiceId ? entry.serviceId === filterServiceId : true
    const matchesMonth = filterMonth ? entry.preferredDate.startsWith(filterMonth) : true
    return matchesService && matchesMonth
  })

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Select onValueChange={(v) => setFilterServiceId(v ? Number(v) : null)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-40"
          placeholder="Filter by month"
        />
      </div>

      {isLoading ? (
        <p>...טוען רשימת המתנה</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWaitlist?.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="flex flex-col">
                  <span className="mb-2">לקוח {entry.userId}</span>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(entry)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>קוד שירות: {entry.serviceId}</p>
                <p>תאריך: {entry.preferredDate}</p>
                <p>שעה: {entry.preferredTime}</p>
                <p>סטטוס: {entry.status}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ערוך רשומת המתנה</DialogTitle>
            <DialogDescription>עדכן את התאריך והשעה המועדפים</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preferredDate">תאריך מועדף</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredTime">זמן מועדף</Label>
              <Input
                id="preferredTime"
                type="time"
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                בטל
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                עדכן
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
