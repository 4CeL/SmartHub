"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { isAuthenticated } from "../lib/auth";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Account for optional trailing slashes
  const normalizedPath = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const isAuthPage = normalizedPath === "/login" || normalizedPath === "/register";

  useEffect(() => {
    setMounted(true);
    
    const auth = isAuthenticated();
    setIsAuth(auth);
    
    if (!auth && !isAuthPage) {
      router.push("/login");
    }
  }, [pathname, router, isAuthPage]);

  // Prevent flash of unauthenticated content
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-neutral-950"></div>;
  }

  // If not authenticated and not on an auth page, render nothing while redirecting
  if (!isAuth && !isAuthPage) {
    return <div className="min-h-screen bg-gray-50 dark:bg-neutral-950"></div>;
  }

  // If on login or register page, do not show sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <main className="pl-64">
        {children}
      </main>
    </>
  );
}
