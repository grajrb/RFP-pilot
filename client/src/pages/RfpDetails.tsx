import { useRfp, useSendRfp } from "@/hooks/use-rfps";
import { useVendors } from "@/hooks/use-vendors";
import { useProposals } from "@/hooks/use-proposals";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./Dashboard";
import { Loader2, Send, CheckSquare, Square, Building2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function RfpDetails() {
  const [, params] = useRoute("/rfps/:id");
  const id = parseInt(params?.id || "0");
  const { data: rfp, isLoading: rfpLoading } = useRfp(id);
  const { data: vendors } = useVendors();
  const { data: proposals } = useProposals(id);
  const { toast } = useToast();
  const sendMutation = useSendRfp();

  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);

  if (rfpLoading || !rfp) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  const toggleVendor = (vendorId: number) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync({ id, vendorIds: selectedVendors });
      toast({ title: "Sent", description: "RFP sent to selected vendors." });
      setSelectedVendors([]);
    } catch (error) {
      toast({ title: "Error", description: "Failed to send RFP", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{rfp.title}</h1>
            <StatusBadge status={rfp.status} />
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl truncate">{rfp.rawRequirements}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          ID: #{rfp.id}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Structure & Proposals */}
        <div className="lg:col-span-2 space-y-8">
          {/* Proposals Section */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Proposals</CardTitle>
              <CardDescription>AI-analyzed responses from vendors.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposals?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                    No proposals received yet.
                  </div>
                ) : (
                  proposals?.map((proposal) => {
                    const vendor = vendors?.find(v => v.id === proposal.vendorId);
                    return (
                      <div key={proposal.id} className="border rounded-xl p-6 hover:shadow-md transition-shadow bg-card relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg">{vendor?.name || 'Unknown Vendor'}</h4>
                            <p className="text-xs text-muted-foreground">Received on {new Date(proposal.createdAt!).toLocaleDateString()}</p>
                          </div>
                          <div className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm border-4",
                            (proposal.score || 0) > 80 ? "border-green-100 bg-green-50 text-green-700" :
                            (proposal.score || 0) > 50 ? "border-yellow-100 bg-yellow-50 text-yellow-700" :
                            "border-red-100 bg-red-50 text-red-700"
                          )}>
                            {proposal.score}%
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 mb-4">
                          <p className="font-semibold mb-1 text-slate-900">AI Analysis:</p>
                          {proposal.aiAnalysis}
                        </div>
                        
                        <div className="mt-4">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-primary hover:underline font-medium">View Raw Response</summary>
                            <p className="mt-2 text-muted-foreground whitespace-pre-wrap pl-4 border-l-2 border-muted">
                              {proposal.rawResponse}
                            </p>
                          </details>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Structured Data Preview */}
          <Card className="opacity-80 hover:opacity-100 transition-opacity">
            <CardHeader>
              <CardTitle className="text-lg">Structured Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded-lg overflow-auto max-h-64 font-mono">
                {JSON.stringify(rfp.structuredRequirements, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Vendor Selection */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle>Send to Vendors</CardTitle>
              <CardDescription>Select vendors to invite to this RFP.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {vendors?.map((vendor) => {
                  const isSelected = selectedVendors.includes(vendor.id);
                  return (
                    <div 
                      key={vendor.id}
                      onClick={() => toggleVendor(vendor.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        isSelected 
                          ? "bg-primary/5 border-primary shadow-inner" 
                          : "hover:bg-muted border-transparent bg-muted/30"
                      )}
                    >
                      {isSelected 
                        ? <CheckSquare className="w-5 h-5 text-primary" /> 
                        : <Square className="w-5 h-5 text-muted-foreground" />
                      }
                      <div className="flex-1 overflow-hidden">
                        <p className={cn("font-medium truncate", isSelected && "text-primary")}>{vendor.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{vendor.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button 
                className="w-full" 
                onClick={handleSend}
                disabled={selectedVendors.length === 0 || sendMutation.isPending}
              >
                {sendMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                Send to {selectedVendors.length} Vendor{selectedVendors.length !== 1 && 's'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
