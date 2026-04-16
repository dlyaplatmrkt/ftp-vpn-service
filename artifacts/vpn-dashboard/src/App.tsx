import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Configs from "@/pages/configs";
import ConfigsNew from "@/pages/configs-new";
import Plans from "@/pages/plans";
import PaymentCrypto from "@/pages/payment-crypto";
import PaymentSbp from "@/pages/payment-sbp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <Layout>
      <Component {...rest} />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/configs"><ProtectedRoute component={Configs} /></Route>
      <Route path="/configs/new"><ProtectedRoute component={ConfigsNew} /></Route>
      <Route path="/plans"><ProtectedRoute component={Plans} /></Route>
      <Route path="/payment/crypto/:id"><ProtectedRoute component={PaymentCrypto} /></Route>
      <Route path="/payment/sbp/:id"><ProtectedRoute component={PaymentSbp} /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
