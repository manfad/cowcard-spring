import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import type { PdStatus, PdStatusFormData } from "@/lib/types";
import { pdStatusApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ColorPicker, colorBgMap } from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export const Route = createFileRoute("/_auth/pd-statuses/")({
  component: PdStatusesPage,
});

const pdStatusSchema = z.object({
  name: z.string().min(1, "Name is required"),
  remark: z.string(),
  color: z.string(),
});

type PdStatusFormValues = z.infer<typeof pdStatusSchema>;

const columnHelper = createColumnHelper<PdStatus>();

function PdStatusesPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<PdStatus | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.admin === true;
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["pd-statuses"],
    queryFn: async () => {
      const res = await pdStatusApi.getAll();
      return res.data.data ?? [];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: pdStatusApi.toggleActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pd-statuses"] }),
    onError: () => toast.error("Failed to toggle PD status"),
  });

  const createMutation = useMutation({
    mutationFn: pdStatusApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pd-statuses"] });
      toast.success("PD status created");
    },
    onError: () => toast.error("Failed to create PD status"),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: PdStatusFormData }) =>
      pdStatusApi.update(vars.id, vars.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pd-statuses"] });
      toast.success("PD status updated");
    },
    onError: () => toast.error("Failed to update PD status"),
  });

  const form = useForm<PdStatusFormValues>({
    resolver: zodResolver(pdStatusSchema),
    defaultValues: { name: "", remark: "", color: "" },
  });

  useEffect(() => {
    if (dialogOpen) {
      form.reset({
        name: editingEntity?.name ?? "",
        remark: editingEntity?.remark ?? "",
        color: editingEntity?.color ?? "",
      });
    }
  }, [dialogOpen, editingEntity, form]);

  const handleAdd = () => {
    setEditingEntity(null);
    setDialogOpen(true);
  };

  const handleEdit = (entity: PdStatus) => {
    setEditingEntity(entity);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: PdStatusFormValues) => {
    const payload: PdStatusFormData = {
      name: data.name,
      remark: data.remark,
      color: data.color,
    };
    if (editingEntity) {
      await updateMutation.mutateAsync({ id: editingEntity.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const columns = [
    columnHelper.display({
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("color", {
      header: "Color",
      cell: (info) => {
        const color = info.getValue();
        if (!color) return "-";
        const bgClass = colorBgMap[color];
        return (
          <div className="flex items-center gap-2">
            <span className={cn("inline-block h-4 w-4 rounded-full", bgClass)} />
            <span className="text-sm text-muted-foreground">{color}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("remark", {
      header: "Remarks",
      cell: (info) => info.getValue() || "-",
    }),
    ...(isAdmin
      ? [
          columnHelper.accessor("active", {
            header: "Active",
            cell: (info) => (
              <Switch
                checked={info.getValue() === true}
                onCheckedChange={() =>
                  toggleMutation.mutate(info.row.original.id)
                }
              />
            ),
          }),
        ]
      : []),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleEdit(info.row.original)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  const isEdit = editingEntity !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">PD Statuses</h1>
        <p className="text-muted-foreground">
          Manage pregnancy diagnosis status types
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PD Status List</CardTitle>
          <CardAction className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-60"
            />
            <Button onClick={handleAdd}>Add New</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead
                        key={h.id}
                        className={
                          h.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        }
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {h.isPlaceholder
                            ? null
                            : flexRender(
                                h.column.columnDef.header,
                                h.getContext(),
                              )}
                          {{ asc: " ↑", desc: " ↓" }[
                            h.column.getIsSorted() as string
                          ] ?? null}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No PD statuses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} record(s) total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit PD Status" : "Add New PD Status"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the PD status details below."
                : "Fill in the details to create a new PD status."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    {field.value && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {field.value}
                      </p>
                    )}
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
                  onClick={() => setDialogOpen(false)}
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
    </div>
  );
}
