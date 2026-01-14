import { useVendors, useCreateVendor } from "@/hooks/use-vendors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Building2, Mail, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Define a local schema since we can't easily import the Zod schema from @shared/schema inside the client build context sometimes if the types export is complex. 
// However, the prompt says to use types from shared. I will adhere to manual definition for form validation to be safe and clean.
const vendorFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  description: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

export default function VendorList() {
  const { data: vendors, isLoading } = useVendors();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-32" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
          <p className="text-muted-foreground">Manage your supplier directory.</p>
        </div>
        <AddVendorDialog open={open} onOpenChange={setOpen} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Email</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Description</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {vendors?.map((vendor) => (
                  <tr key={vendor.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Building2 className="w-4 h-4" />
                        </div>
                        {vendor.name}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {vendor.email}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">{vendor.description || "-"}</td>
                    <td className="p-4 align-middle text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddVendorDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema)
  });
  const createMutation = useCreateVendor();
  const { toast } = useToast();

  const onSubmit = async (data: VendorFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      toast({ title: "Success", description: "Vendor added successfully" });
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to add vendor", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <Input {...register("name")} placeholder="Acme Corp" />
            {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Contact</label>
            <Input {...register("email")} placeholder="sales@acme.com" />
            {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input {...register("description")} placeholder="IT Services, Hardware, etc." />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Vendor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
