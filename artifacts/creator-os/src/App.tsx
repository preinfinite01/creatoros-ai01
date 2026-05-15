import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useAuthStore } from "./store/authStore";
import { useUserStore } from "./store/userStore";
import { useSubscriptionStore } from "./store/subscriptionStore";
import { CountryDetector } from "@/components/CountryDetector";

// Layouts
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import VerifyEmail from "@/pages/auth/verify-email";
import Dashboard from "@/pages/dashboard";
import Tools from "@/pages/tools";
import Titles from "@/pages/tools/titles";
import Hooks from "@/pages/tools/hooks";
import Scripts from "@/pages/tools/scripts";
import Ideas from "@/pages/tools/ideas";
import Workflow from "@/pages/tools/workflow";
import Projects from "@/pages/projects";
import Settings from "@/pages/settings";
import Onboarding from "@/pages/onboarding";
import Pricing from "@/pages/pricing";
import PaymentSuccess from "@/pages/payment-success";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/payment/success" component={PaymentSuccess} />

      {/* Protected Routes */}
      <Route path="/onboarding">
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/tools">
        <ProtectedRoute><Tools /></ProtectedRoute>
      </Route>
      <Route path="/tools/titles">
        <ProtectedRoute><Titles /></ProtectedRoute>
      </Route>
      <Route path="/tools/hooks">
        <ProtectedRoute><Hooks /></ProtectedRoute>
      </Route>
      <Route path="/tools/script">
        <ProtectedRoute><Scripts /></ProtectedRoute>
      </Route>
      <Route path="/tools/ideas">
        <ProtectedRoute><Ideas /></ProtectedRoute>
      </Route>
      <Route path="/tools/workflow">
        <ProtectedRoute><Workflow /></ProtectedRoute>
      </Route>
      <Route path="/projects">
        <ProtectedRoute><Projects /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><Settings /></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { setSession, setUser } = useAuthStore();
  const { syncFromProfile } = useUserStore();
  const { loadSubscription, loadRates } = useSubscriptionStore();

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        loadSubscription(session.user.id).then(() => {
          // sync profile data into userStore
          fetch(`/api/payments/subscription/${session.user.id}`)
            .then((r) => r.json())
            .then((json: { status: boolean; data?: { profile?: { plan?: string; credits?: number; xp?: number; level?: number; streak?: number } } }) => {
              if (json.status && json.data?.profile) {
                syncFromProfile(json.data.profile);
              }
            })
            .catch(() => {});
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        loadSubscription(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser, loadSubscription, syncFromProfile]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <CountryDetector />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
