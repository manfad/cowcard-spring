import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import type { LookupEntity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const lookupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  remark: z.string(),
});

type LookupFormValues = z.infer<typeof lookupSchema>;

interface LookupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: LookupEntity | null;
  entityLabel: string;
  onSubmit: (data: LookupFormValues) => Promise<void>;
  isPending: boolean;
}

export function LookupFormDialog({
  open,
  onOpenChange,
  entity,
  entityLabel,
  onSubmit,
  isPending,
}: LookupFormDialogProps) {
  const isEdit = entity !== null;

  const form = useForm<LookupFormValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { name: "", remark: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: entity?.name ?? "",
        remark: entity?.remark ?? "",
      });
    }
  }, [open, entity, form]);

  const handleSubmit = async (data: LookupFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit ${entityLabel}` : `Add New ${entityLabel}`}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update the ${entityLabel.toLowerCase()} details below.`
              : `Fill in the details to create a new ${entityLabel.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remark</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter remark (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
