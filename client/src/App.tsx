import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Marketplace from "@/pages/marketplace";
import CustomAgent from "@/pages/custom-agent";
import AgentDetails from "@/pages/agent-details";
import AgentHiring from "@/pages/agent-hiring";
import AgentRecommender from "@/pages/agent-recommender";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/custom-agent" component={CustomAgent} />
      <Route path="/agent/:id" component={AgentDetails} />
      <Route path="/hire/:id" component={AgentHiring} />
      <Route path="/agent-recommender" component={AgentRecommender} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
