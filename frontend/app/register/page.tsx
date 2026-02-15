"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';


export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "שדה זה נדרש"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "שדה זה נדרש"
    }
    if (!formData.email.trim()) {
      newErrors.email = "שדה זה נדרש"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "דוא״ל לא תקין"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "שדה זה נדרש"
    }
    if (!formData.password) {
      newErrors.password = "שדה זה נדרש"
    } else if (formData.password.length < 6) {
      newErrors.password = "הסיסמה קצרה מדי (לפחות 6 תווים)"
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "הסיסמאות אינן תואמות"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })
    } catch (error) {
      // Error handling is done in useAuth hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-right">
            <CardTitle className="text-2xl">צור חשבון חדש</CardTitle>
            <CardDescription>הרשם כדי להתחיל להזמן תורים</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="firstName">שם פרטי</Label>
                  <Input
                    id="firstName"
                    placeholder="יוחנן"
                    value={formData.firstName}
                    className="text-right"
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    required
                  />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                </div>
                <div className="space-y-2 text-right">
                  <Label htmlFor="lastName">שם משפחה</Label>
                  <Input
                    id="lastName"
                    placeholder="לוי"
                    value={formData.lastName}
                    className="text-right"
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    required
                  />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="email">דוא״ל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  className="text-right"
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2 text-right">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  placeholder="05XXXXXXXX"
                  value={formData.phone}
                  className="text-right"
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="relative text-right">
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  className="pl-10 text-right"
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 left-2 flex items-center">
                  <button
                    type="button"
                    className="relative top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center p-0 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="relative text-right">
                <Label htmlFor="confirmPassword">אישור סיסמה</Label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  className="pl-10 text-right"
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 left-2 flex items-center">
                  <button
                    type="button"
                    className="relative top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center p-0 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "טוען..." : "הרשמה"}
              </Button>
              <p className="text-sm text-muted-foreground text-right">
                כבר יש לך חשבון?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  כניסה
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

