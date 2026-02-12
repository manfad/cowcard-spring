import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dam-form")({
  component: DamFormPage,
});

const damSchema = z.object({
  tag: z.string().min(1, "Tag number is required"),
  statusId: z.string().min(1, "Status is required"),
  remark: z.string().optional(),
});

type DamForm = z.infer<typeof damSchema>;

function DamFormPage() {
  const { data: statuses, isLoading: statusesLoading } = useQuery({
    queryKey: ["cow-statuses"],
    queryFn: () => formApi.getCowStatuses().then((r) => r.data.data!),
  });

  const mutation = useMutation({
    mutationFn: (data: DamForm) =>
      formApi.createDam({
        tag: data.tag,
        statusId: parseInt(data.statusId),
        remark: data.remark,
      }),
    onSuccess: () => {
      toast.success("Dam record created successfully");
      form.reset();
    },
    onError: () => {
      toast.error("Failed to create dam record");
    },
  });

  const form = useForm<DamForm>({
    resolver: zodResolver(damSchema),
    defaultValues: { tag: "", statusId: "", remark: "" },
  });

  const onSubmit = (data: DamForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Dam Form</CardTitle>
          <CardDescription>
            Quick submission form for new dam records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tag number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusesLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          statuses?.map((status) => (
                              <SelectItem
                                key={status.id}
                                value={String(status.id)}
                              >
                                {status.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
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
                      <Input
                        placeholder="Optional remark"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
