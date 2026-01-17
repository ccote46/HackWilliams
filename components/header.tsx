"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";

//Container for the header bar at the top (persists on every page)
export default function Header() {
  const { authStatus, checkingAuth, logout } = useAuth(); // grab logout from context

  return (
    <div className="sticky top-0 z-50 border-b border-stone-700 bg-stone-800 px-4 py-3 shadow-lg">

      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
            <Link href="/" className="transition-opacity hover:opacity-80">
                <Image 
                        src="/logo.svg"
                        alt="Logo"
                        width={25}
                        height={25}
                    />
                </Link>
                <h1 className="text-white text-xl font-bold">Sports Psychology Coach</h1>
            </div>
            
            { /* Login/Logout Button */}
            {checkingAuth ? (
            <Button variant="outline" disabled>
                Checking...
            </Button>
            ) : authStatus.authenticated ? (
            <div className="flex items-center gap-3">
                <span className="text-sm text-stone-300">
                Hello {authStatus.user?.firstName}!
                </span>
                <Button
                variant="outline"
                onClick={logout} 
                >
                Log Out
                </Button>
            </div>
            ) : (
            <Button onClick={() => (window.location.href = "/api/whoop/auth")}>
                Connect Whoop
            </Button>
            )}
      </div>
    </div>
  );
}
