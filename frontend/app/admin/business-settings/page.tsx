"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { businessSettingsApi } from "@/api/businessSettings"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BlockedTimesManager } from "./BlockedTimesManager"

type FormValues = {
    workingDays: number[]
    openTime: string
    closeTime: string
    maxAdvanceBookingDays: number
}

const WEEK_DAYS = [
    { value: 0, label: "ראשון" },
    { value: 1, label: "שני" },
    { value: 2, label: "שלישי" },
    { value: 3, label: "רביעי" },
    { value: 4, label: "חמישי" },
    { value: 5, label: "שישי" },
    { value: 6, label: "שבת" },
]

function BusinessSettingsContent() {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const { data, isLoading } = useQuery({
        queryKey: ["business-settings"],
        queryFn: businessSettingsApi.get,
    })

    const { register, handleSubmit, reset, watch, setValue, formState } = useForm<FormValues>({
        defaultValues: {
            workingDays: [0, 1, 2, 3, 4],
            openTime: "09:00",
            closeTime: "17:00",
            maxAdvanceBookingDays: 90,
        },
    })

    useEffect(() => {
        if (data) {
            reset({
                workingDays: (data.workingDays ?? [0, 1, 2, 3, 4]) as number[],
                openTime: data.openingHours.openTime,
                closeTime: data.openingHours.closeTime,
                maxAdvanceBookingDays: data.maxAdvanceBookingDays,
            })
        }
    }, [data, reset])

    const selectedDays = watch("workingDays") || []

    const toggleDay = (day: number) => {
        const current = selectedDays as number[]
        if (current.includes(day)) {
            setValue(
                "workingDays",
                current.filter((d) => d !== day),
                { shouldDirty: true }
            )
        } else {
            setValue("workingDays", [...current, day].sort(), { shouldDirty: true })
        }
    }

    const mutation = useMutation({
        mutationFn: (values: FormValues) =>
            businessSettingsApi.update({
                workingDays: values.workingDays,
                openingHours: {
                    openTime: values.openTime,
                    closeTime: values.closeTime,
                },
                maxAdvanceBookingDays: values.maxAdvanceBookingDays,
            }),
        onSuccess: (updated) => {
            queryClient.setQueryData(["business-settings"], updated)
            toast({
                title: "ההגדרות נשמרו",
                description: "הגדרות העסק עודכנו בהצלחה.",
            })
        },
        onError: () => {
            toast({
                title: "כישלון בשמירה",
                description: "לא ניתן לעדכן את הגדרות העסק. אנא נסה שוב.",
                variant: "destructive",
            })
        },
    })

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values)
    }

    if (isLoading && !data) {
        return <div className="container mx-auto px-4 py-12">טוען...</div>
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">הגדרות עסק</h1>
                    <p className="text-muted-foreground">
                        הגדר ימי פתיחה, שעות פתיחה ומגבלות הזמנה.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>הגדרות כללי</CardTitle>
                        <CardDescription>כללים אלה משפיעים על כל לוגיקת התורים.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-start mb-4 mt-1">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">ניהול זמנים חסומים</Button>
                                </DialogTrigger>

                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>זמנים חסומים</DialogTitle>
                                    </DialogHeader>
                                    <BlockedTimesManager />
                                </DialogContent>
                            </Dialog>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            {/* Working days */}
                            <div className="space-y-2">
                                <Label>ימי עבודה</Label>
                                <div className="flex flex-wrap gap-2">
                                    {WEEK_DAYS.map((day) => {
                                        const isSelected = selectedDays.includes(day.value)
                                        return (
                                            <Button
                                                key={day.value}
                                                type="button"
                                                variant={isSelected ? "default" : "outline"}
                                                onClick={() => toggleDay(day.value)}
                                                className="px-3 py-1 text-sm"
                                            >
                                                {day.label}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Opening hours */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="openTime">שעת פתיחה</Label>
                                    <Input id="openTime" type="time" {...register("openTime")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="closeTime">שעת סגירה</Label>
                                    <Input id="closeTime" type="time" {...register("closeTime")} />
                                </div>
                            </div>

                            {/* Max advance booking */}
                            <div className="space-y-2">
                                <Label htmlFor="maxAdvanceBookingDays">מספר ימים מראש</Label>
                                <Input
                                    id="maxAdvanceBookingDays"
                                    type="number"
                                    min={1}
                                    max={365}
                                    {...register("maxAdvanceBookingDays", { valueAsNumber: true })}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => data && reset({
                                        workingDays: (data.workingDays ?? [0, 1, 2, 3, 4]) as number[],
                                        openTime: data.openingHours.openTime,
                                        closeTime: data.openingHours.closeTime,
                                        maxAdvanceBookingDays: data.maxAdvanceBookingDays,
                                    })}
                                >
                                    אפס
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={mutation.isPending || !formState.isDirty}
                                >
                                    {mutation.isPending ? "שמירה..." : "שמור שינויים"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function BusinessSettingsPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <BusinessSettingsContent />
        </ProtectedRoute>
    )
}
