import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateRfp, useGenerateRfp } from "@/hooks/use-rfps";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, Sparkles, ArrowRight, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  rawRequirements: z.string().min(10, "Please provide more detail about your requirements"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateRfp() {
  const [structuredPreview, setStructuredPreview] = useState<any>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const generateMutation = useGenerateRfp();
  const createMutation = useCreateRfp();

  const handleGenerate = async () => {
    const rawRequirements = watch("rawRequirements");
    if (!rawRequirements) {
      toast({ title: "Error", description: "Please enter requirements first", variant: "destructive" });
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({ rawRequirements });
      setStructuredPreview(result.structuredRequirements);
      setValue("title", result.title); // AI suggests a title
      toast({ title: "Success", description: "RFP structure generated successfully!" });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await createMutation.mutateAsync({
        title: data.title,
        rawRequirements: data.rawRequirements,
        structuredRequirements: structuredPreview,
        status: "draft"
      });
      toast({ title: "Success", description: "RFP Created!" });
      setLocation("/rfps");
    } catch (error) {
      toast({ title: "Error", description: "Failed to create RFP", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create New RFP</h2>
        <p className="text-muted-foreground">Use AI to convert your needs into a professional Request for Proposal.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Input */}
        <div className="space-y-6">
          <Card className="h-full border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Describe Your Needs</CardTitle>
              <CardDescription>
                Write in natural language. Our AI will structure it for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Title</label>
                <Input 
                  {...register("title")} 
                  placeholder="e.g. Enterprise CRM Migration" 
                />
                {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Requirements</label>
                <Textarea 
                  {...register("rawRequirements")}
                  className="min-h-[400px] font-mono text-sm leading-relaxed"
                  placeholder="e.g. We need a new CRM system that integrates with Slack and Salesforce. It should support 500 users, have SSO, and includes a mobile app..."
                />
                {errors.rawRequirements && <span className="text-xs text-destructive">{errors.rawRequirements.message}</span>}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                disabled={generateMutation.isPending}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Requirements...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Structure with AI
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          <Card className="h-full bg-slate-50 border-dashed">
            <CardHeader>
              <CardTitle>Structured Preview</CardTitle>
              <CardDescription>
                Review the AI-generated structure before saving.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {structuredPreview ? (
                <div className="bg-white rounded-lg border p-4 shadow-sm overflow-auto max-h-[500px]">
                  <pre className="text-xs font-mono text-slate-700">
                    {JSON.stringify(structuredPreview, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-center max-w-xs">
                    Content will appear here after you generate the RFP structure.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end space-x-2">
              <Button variant="ghost" onClick={() => setLocation("/rfps")}>Cancel</Button>
              <Button 
                onClick={handleSubmit(onSubmit)} 
                disabled={createMutation.isPending || !structuredPreview}
              >
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save RFP
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
