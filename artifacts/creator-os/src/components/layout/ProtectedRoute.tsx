import { useAuthStore } from "@/store/authStore";
import { AppLayout } from "./AppLayout";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = `https://replit.com/login?goto=${encodeURIComponent(window.location.href)}`;
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}
