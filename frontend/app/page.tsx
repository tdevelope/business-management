import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-balance">Streamline Your Business Appointments</h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Professional appointment booking system with smart scheduling, calendar management, and automated reminders.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link href="/customer">
                <Calendar className="mr-2 h-5 w-5" />
                Book an Appointment
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin">
                <Users className="mr-2 h-5 w-5" />
                Admin Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Scheduling</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered appointment suggestions based on your preferences and availability patterns.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Calendar Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive calendar view with drag-and-drop scheduling and real-time updates.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Time Optimization</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Minimize gaps and maximize productivity with intelligent appointment placement.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Client Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track customer history, preferences, and appointment records in one place.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to get started?</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Choose your path below to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild variant="secondary" size="lg">
              <Link href="/register">Create Account</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-primary border-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
