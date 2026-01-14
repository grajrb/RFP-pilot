import { useRfps } from "@/hooks/use-rfps";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle, FileText, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: rfps, isLoading } = useRfps();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const activeRfps = rfps?.filter(r => r.status !== 'closed') || [];
  const draftRfps = rfps?.filter(r => r.status === 'draft') || [];
  const sentRfps = rfps?.filter(r => r.status === 'sent') || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your procurement activities.</p>
        </div>
        <Link href="/rfps/create">
          <Button size="lg" className="shadow-lg shadow-primary/25">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New RFP
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard 
          title="Active RFPs" 
          value={activeRfps.length} 
          icon={FileText} 
          className="border-l-4 border-l-blue-500"
        />
        <StatsCard 
          title="In Draft" 
          value={draftRfps.length} 
          icon={Clock} 
          className="border-l-4 border-l-orange-500"
        />
        <StatsCard 
          title="Sent to Vendors" 
          value={sentRfps.length} 
          icon={CheckCircle2} 
          className="border-l-4 border-l-green-500"
        />
      </div>

      <Card className="border-t-4 border-t-primary/20">
        <CardHeader>
          <CardTitle>Recent RFPs</CardTitle>
          <CardDescription>Your latest procurement requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rfps?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                <p>No RFPs found. Create one to get started.</p>
              </div>
            ) : (
              rfps?.slice(0, 5).map((rfp) => (
                <div key={rfp.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted transition-colors border border-transparent hover:border-border/50">
                  <div className="space-y-1">
                    <p className="font-semibold leading-none">{rfp.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Created {format(new Date(rfp.createdAt!), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={rfp.status} />
                    <Link href={`/rfps/${rfp.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, className }: { title: string, value: number, icon: any, className?: string }) {
  return (
    <Card className={cn("hover:-translate-y-1 transition-transform duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-sans uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold font-display">{value}</div>
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles = {
    draft: "bg-orange-100 text-orange-700 border-orange-200",
    sent: "bg-blue-100 text-blue-700 border-blue-200",
    closed: "bg-slate-100 text-slate-700 border-slate-200",
  };
  
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wide",
      styles[status as keyof typeof styles] || styles.draft
    )}>
      {status}
    </span>
  );
}
