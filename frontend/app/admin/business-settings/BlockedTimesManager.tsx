"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { blockedTimesApi } from "@/api/blockedTimes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export function BlockedTimesManager() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const blockedTimesQuery = useQuery({
        queryKey: ["blocked-times"],
        queryFn: blockedTimesApi.getAll,
    })

    const createMutation = useMutation({
        mutationFn: blockedTimesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blocked-times"] })
            toast({ title: "Blocked time added" })
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            blockedTimesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blocked-times"] })
            toast({ title: "Blocked time updated" })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: blockedTimesApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blocked-times"] })
            toast({ title: "Blocked time removed" })
        },
    })

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget as typeof e.currentTarget & {
            startTime: { value: string }
            endTime: { value: string }
            reason: { value: string }
        }

        createMutation.mutate({
            startTime: form.startTime.value,
            endTime: form.endTime.value,
            reason: form.reason.value,
        })

        form.reset()
    }

    const handleUpdate = (id: number, e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget as typeof e.currentTarget & {
            startTime: { value: string }
            endTime: { value: string }
            reason: { value: string }
        }

        updateMutation.mutate({
            id,
            data: {
                startTime: form.startTime.value,
                endTime: form.endTime.value,
                reason: form.reason.value,
            },
        })
    }

    return (
        <div className="space-y-6">

            {/* Create */}
            <form className="space-y-3" onSubmit={handleCreate}>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <Label>Start</Label>
                        <Input name="startTime" type="datetime-local" required />
                    </div>

                    <div>
                        <Label>End</Label>
                        <Input name="endTime" type="datetime-local" required />
                    </div>

                    <div>
                        <Label>Reason</Label>
                        <Input name="reason" type="text" placeholder="(optional)" />
                    </div>
                </div>

                <Button type="submit" className="w-full">
                    Add Blocked Time
                </Button>
            </form>

            {/* List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {blockedTimesQuery.data?.map((bt) => (
                    <Dialog key={bt.id}>
                        <div className="border rounded p-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium">
                                    {new Date(bt.startTime).toLocaleString()} →{" "}
                                    {new Date(bt.endTime).toLocaleString()}
                                </p>
                                {bt.reason && (
                                    <p className="text-sm text-muted-foreground">
                                        {bt.reason}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </DialogTrigger>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteMutation.mutate(bt.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>

                        {/* Edit modal */}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Blocked Time</DialogTitle>
                            </DialogHeader>

                            <form
                                className="space-y-4"
                                onSubmit={(e) => handleUpdate(bt.id, e)}
                            >
                                <Input
                                    name="startTime"
                                    type="datetime-local"
                                    defaultValue={bt.startTime.slice(0, 16)}
                                    required
                                />
                                <Input
                                    name="endTime"
                                    type="datetime-local"
                                    defaultValue={bt.endTime.slice(0, 16)}
                                    required
                                />
                                <Input
                                    name="reason"
                                    type="text"
                                    defaultValue={bt.reason || ""}
                                />

                                <Button type="submit" className="w-full">
                                    Save changes
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                ))}

                {blockedTimesQuery.data?.length === 0 && (
                    <p className="text-muted-foreground">No blocked times yet.</p>
                )}
            </div>

        </div>
    )
}
