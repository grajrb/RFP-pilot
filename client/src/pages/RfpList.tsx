import { useRfps } from "@/hooks/use-rfps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./Dashboard";
import { Link } from "wouter";
import { Plus, ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function RfpList() {
  const { data: rfps, isLoading } = useRfps();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">My RFPs</h2>
        <Link href="/rfps/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New RFP
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {rfps?.length === 0 ? (
          <Card className="bg-muted/20 border-dashed py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold mt-4">No RFPs yet</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Get started by creating your first Request for Proposal using our AI wizard.
              </p>
              <Link href="/rfps/create" className="mt-4">
                <Button variant="outline">Create Now</Button>
              </Link>
            </div>
          </Card>
        ) : (
          rfps?.map((rfp) => (
            <Card key={rfp.id} className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {rfp.title}
                    </h3>
                    <StatusBadge status={rfp.status} />
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {format(new Date(rfp.createdAt!), 'MMM dd, yyyy')}
                    </span>
                    <span className="truncate max-w-md hidden md:block">
                      {rfp.rawRequirements.substring(0, 60)}...
                    </span>
                  </div>
                </div>
                <Link href={`/rfps/${rfp.id}`}>
                  <Button variant="ghost" className="group-hover:bg-primary group-hover:text-white transition-all">
                    View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
