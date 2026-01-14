import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/Dashboard";
import RfpList from "@/pages/RfpList";
import CreateRfp from "@/pages/CreateRfp";
import RfpDetails from "@/pages/RfpDetails";
import VendorList from "@/pages/VendorList";
import Simulation from "@/pages/Simulation";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/rfps" component={RfpList} />
        <Route path="/rfps/create" component={CreateRfp} />
        <Route path="/rfps/:id" component={RfpDetails} />
        <Route path="/vendors" component={VendorList} />
        <Route path="/simulate" component={Simulation} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
