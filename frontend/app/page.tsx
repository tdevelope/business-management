"use client"

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
          <h1 className="text-5xl font-bold mb-4 text-balance">יעל את התורים העסקיים שלך</h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            מערכת הזמנות מקצועית עם תזמון חכם, ניהול לוח שנה ותזכורות אוטומטיות.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link href="/customer">
                <Calendar className="mr-2 h-5 w-5" />
                הזמן תור
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin">
                <Users className="mr-2 h-5 w-5" />
                לוח בקרה
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
                <CardTitle>תזמון חכם</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                הצעות היעול על סמך העדפות והדפוסים של זמינות שלך.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>ניהול יומן</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                תצוגת לוח שנה כוללת עם תזמון גרירה-והנחה ועדכונים בזמן אמת.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>אופטימיזציית זמן</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                צמצום פערים והגברת פרודוקטיביות עם הצבת תורים חכמה.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>ניהול לקוחות</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                עקוב אחר היסטוריית לקוחות, העדפות והתורים שלהם במקום אחד.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-2xl">מוכן להתחיל?</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              בחר בנתיב שלך בהמשך לגישה לפלטפורמה
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild variant="secondary" size="lg">
              <Link href="/register">צור חשבון</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-primary border-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              <Link href="/login">כניסה</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
