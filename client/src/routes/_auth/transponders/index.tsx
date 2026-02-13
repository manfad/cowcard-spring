import { useState, useEffect, useMemo, useCallback } from "react";
import { createFileRoute, Link as RouterLink } from "@tanstack/react-router";
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
import { Pencil, X, Link, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { transponderApi } from "@/lib/api";
import type { Transponder, CowView } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CowSelectDialog } from "@/components/transponder/cow-select-dialog";

export const Route = createFileRoute("/_auth/transponders/")({
  component: TranspondersPage,
});

const transponderSchema = z.object({
  code: z.string().min(1, "Code is required"),
  remark: z.string(),
});

type TransponderFormValues = z.infer<typeof transponderSchema>;

const columnHelper = createColumnHelper<Transponder>();

// Static columns that don't depend on component state
const staticColumns = [
  columnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  }),
  columnHelper.accessor("code", {
    header: "Code",
    cell: (info) => (
      <RouterLink
        to={`/transponders/${info.row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {info.getValue()}
      </RouterLink>
    ),
  }),
  columnHelper.accessor("assignedDate", {
    header: "Assigned Date",
    cell: (info) => {
      const val = info.getValue();
      return val ? format(new Date(val), "dd/MM/yyyy") : "-";
    },
  }),
  columnHelper.display({
    id: "feedlot",
    header: "Feedlot",
    cell: (info) => {
      const feedlot = info.row.original.currentCow?.currentFeedlot;
      if (!feedlot) return "-";
      return feedlot.name;
    },
  }),
  columnHelper.accessor("remark", {
    header: "Remark",
    cell: (info) => info.getValue() ?? "-",
  }),
];

function TranspondersPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Transponder | null>(null);
  const [cowSelectOpen, setCowSelectOpen] = useState(false);
  const [assigningTransponderId, setAssigningTransponderId] = useState<
    number | null
  >(null);
  const [cowSelectSource, setCowSelectSource] = useState<"table" | "dialog">(
    "table",
  );
  const [selectedCow, setSelectedCow] = useState<{
    id: number;
    tag: string;
  } | null>(null);
  const qc = useQueryClient();

  const { data: transponders = [], isLoading } = useQuery({
    queryKey: ["transponders"],
    queryFn: async () => {
      const res = await transponderApi.getAll();
      return res.data.data ?? [];
    },
  });

  const invalidateAll = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["transponders"] });
    qc.invalidateQueries({ queryKey: ["cows"] });
    qc.invalidateQueries({ queryKey: ["feedlot-with-cows"] });
  }, [qc]);

  const createMutation = useMutation({
    mutationFn: (data: { code: string; remark: string }) =>
      transponderApi.create(data),
    onError: () => toast.error("Failed to create transponder"),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: {
      id: number;
      data: { code: string; remark: string };
    }) => transponderApi.update(vars.id, vars.data),
    onError: () => toast.error("Failed to update transponder"),
  });

  const assignMutation = useMutation({
    mutationFn: (vars: { transponderId: number; cowId: number }) =>
      transponderApi.assign(vars.transponderId, vars.cowId),
    onError: () => toast.error("Failed to assign cow"),
  });

  const unassignMutation = useMutation({
    mutationFn: (transponderId: number) =>
      transponderApi.unassign(transponderId),
    onError: () => toast.error("Failed to unassign cow"),
  });

  const form = useForm<TransponderFormValues>({
    resolver: zodResolver(transponderSchema),
    defaultValues: { code: "", remark: "" },
  });

  useEffect(() => {
    if (dialogOpen) {
      form.reset({
        code: editingEntity?.code ?? "",
        remark: editingEntity?.remark ?? "",
      });
      setSelectedCow(editingEntity?.currentCow ?? null);
    }
  }, [dialogOpen, editingEntity, form]);

  const handleAdd = useCallback(() => {
    setEditingEntity(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((entity: Transponder) => {
    setEditingEntity(entity);
    setDialogOpen(true);
  }, []);

  const handleFormSubmit = async (data: TransponderFormValues) => {
    try {
      if (editingEntity) {
        await updateMutation.mutateAsync({ id: editingEntity.id, data });
        const hadCow = editingEntity.currentCow;
        const wantsCow = selectedCow;

        if (hadCow && !wantsCow) {
          await unassignMutation.mutateAsync(editingEntity.id);
        } else if (wantsCow && (!hadCow || hadCow.id !== wantsCow.id)) {
          if (hadCow) {
            await unassignMutation.mutateAsync(editingEntity.id);
          }
          await assignMutation.mutateAsync({
            transponderId: editingEntity.id,
            cowId: wantsCow.id,
          });
        }
        toast.success("Transponder updated");
      } else {
        const res = await createMutation.mutateAsync(data);
        const created = res.data.data;
        if (created && selectedCow) {
          await assignMutation.mutateAsync({
            transponderId: created.id,
            cowId: selectedCow.id,
          });
        }
        toast.success("Transponder created");
      }
      // Single invalidation after all operations complete
      invalidateAll();
      setDialogOpen(false);
    } catch {
      // Individual mutation error toasts handle this
    }
  };

  const handleAssignClick = useCallback((transponderId: number) => {
    setAssigningTransponderId(transponderId);
    setCowSelectSource("table");
    setCowSelectOpen(true);
  }, []);

  const handleCowSelected = useCallback(
    (cow: CowView) => {
      if (cowSelectSource === "dialog") {
        setSelectedCow({ id: cow.id, tag: cow.tag });
      } else {
        if (assigningTransponderId !== null) {
          assignMutation.mutate(
            { transponderId: assigningTransponderId, cowId: cow.id },
            {
              onSuccess: () => {
                invalidateAll();
                toast.success("Cow assigned to transponder");
              },
            },
          );
        }
        setAssigningTransponderId(null);
      }
    },
    [cowSelectSource, assigningTransponderId, assignMutation, invalidateAll],
  );

  const handleUnassign = useCallback(
    (transponderId: number) => {
      unassignMutation.mutate(transponderId, {
        onSuccess: () => {
          invalidateAll();
          toast.success("Cow unassigned from transponder");
        },
      });
    },
    [unassignMutation, invalidateAll],
  );

  const anyPending = assignMutation.isPending || unassignMutation.isPending;

  // Dynamic columns that depend on handlers - memoized
  const columns = useMemo(
    () => [
      staticColumns[0], // #
      staticColumns[1], // Code
      columnHelper.accessor("currentCow", {
        header: "Current Cow",
        cell: (info) => {
          const cow = info.getValue();
          const transponderId = info.row.original.id;
          if (cow) {
            return (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-2.5 py-1 text-sm font-medium hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50"
                onClick={() => handleUnassign(transponderId)}
                disabled={anyPending}
              >
                {cow.tag}
                <X className="h-3 w-3" />
              </button>
            );
          }
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAssignClick(transponderId)}
              disabled={anyPending}
            >
              <Link className="mr-1 h-3 w-3" />
              Assign
            </Button>
          );
        },
      }),
      staticColumns[2], // Assigned Date
      staticColumns[3], // Feedlot
      staticColumns[4], // Remark
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <RouterLink to={`/transponders/${info.row.original.id}`}>
                <Eye className="h-4 w-4" />
              </RouterLink>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleEdit(info.row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [handleUnassign, handleAssignClick, handleEdit, anyPending],
  );

  const table = useReactTable({
    data: transponders,
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
        <h1 className="text-3xl font-bold">Transponders</h1>
        <p className="text-muted-foreground">Manage transponder records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transponder List</CardTitle>
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
                      No transponders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} transponder(s) total
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
              {isEdit ? "Edit Transponder" : "Add New Transponder"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the transponder details below."
                : "Fill in the details to create a new transponder."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter transponder code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Assigned Cow</FormLabel>
                <div>
                  {selectedCow ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-2.5 py-1 text-sm font-medium hover:bg-primary/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedCow(null)}
                    >
                      {selectedCow.tag}
                      <X className="h-3 w-3" />
                    </button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setCowSelectSource("dialog");
                        setCowSelectOpen(true);
                      }}
                    >
                      Assign Cow
                    </Button>
                  )}
                </div>
              </FormItem>
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

      <CowSelectDialog
        open={cowSelectOpen}
        onOpenChange={setCowSelectOpen}
        onSelect={handleCowSelected}
      />
    </div>
  );
}
