import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSimulateEmail } from "@/hooks/use-simulate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, CheckCircle2 } from "lucide-react";

// Matches inboundEmailSchema from backend
const emailSchema = z.object({
  from: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function Simulation() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      from: "vendor@example.com",
      subject: "Re: RFP #1 - Proposal Submission",
      body: "Dear Procurement Team,\n\nWe are pleased to submit our proposal for your CRM project.\n\nOur solution offers:\n- Full Salesforce integration\n- SSO support\n- Mobile app included\n- Pricing: $50,000/year\n\nBest regards,\nVendor Team"
    }
  });

  const simulateMutation = useSimulateEmail();
  const { toast } = useToast();

  const onSubmit = async (data: EmailFormValues) => {
    try {
      await simulateMutation.mutateAsync(data);
      toast({ 
        title: "Email Simulated", 
        description: "The system has received the email and triggered AI processing." 
      });
      // Don't reset to allow easy re-testing
    } catch (error) {
      toast({ title: "Error", description: "Simulation failed", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Email Simulator</h2>
        <p className="text-muted-foreground">
          Debug tool to simulate inbound vendor emails without sending real emails.
        </p>
      </div>

      <Card className="border-t-4 border-t-purple-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-500" />
            Inbound Email Simulation
          </CardTitle>
          <CardDescription>
            This will hit the <code>/api/webhooks/email</code> endpoint, simulating a SendGrid webhook.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From (Vendor Email)</label>
              <Input {...register("from")} placeholder="vendor@example.com" />
              {errors.from && <span className="text-xs text-destructive">{errors.from.message}</span>}
              <p className="text-[10px] text-muted-foreground">Must match an existing vendor email to be linked correctly.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input {...register("subject")} placeholder="Proposal for RFP..." />
              {errors.subject && <span className="text-xs text-destructive">{errors.subject.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Body (Proposal Content)</label>
              <Textarea 
                {...register("body")} 
                className="min-h-[200px] font-mono text-sm"
                placeholder="Paste proposal text here..."
              />
              {errors.body && <span className="text-xs text-destructive">{errors.body.message}</span>}
            </div>
          </CardContent>
          <CardFooter className="bg-purple-50/50 border-t flex justify-end p-4">
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={simulateMutation.isPending}>
              {simulateMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Simulate Inbound Email
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
        <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">How it works:</p>
          <p>
            When you click "Simulate", the backend receives this text as if it came from an email provider. 
            It will then use AI to parse the unstructured body text into a structured JSON proposal and assign a score based on the RFP requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
