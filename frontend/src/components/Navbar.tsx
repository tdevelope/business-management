"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProfileContent } from "@/components/ProfileContent";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const hashColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${hash % 360}, 70%, 50%)`;
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span>BookingPro</span>
        </Link>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          ) : (
            <>
              {user && (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: hashColor(user.email) }}
                      >
                        {user.firstName?.[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </DialogTrigger>

                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>My Profile</DialogTitle>
                    </DialogHeader>
                    <ProfileContent />
                  </DialogContent>
                </Dialog>
              )}

              {user?.role === "admin" && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin">Admin Dashboard</Link>
                </Button>
              )}
              {user?.role === "customer" && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/customer">My Appointments</Link>
                </Button>
              )}

              <Button onClick={logout} variant="ghost" size="sm">
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
