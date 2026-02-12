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
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Pencil, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { Semen, SemenFormData } from "@/lib/types";
import { semenApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_auth/semen/")({
  component: SemenPage,
});

const semenSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sire: z.string(),
  date: z.date(),
  straw: z.string(),
  bull: z.boolean(),
  remark: z.string(),
});

type SemenFormValues = z.infer<typeof semenSchema>;

const columnHelper = createColumnHelper<Semen>();

function SemenPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Semen | null>(null);
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["semen"],
    queryFn: async () => {
      const res = await semenApi.getAll();
      return res.data.data ?? [];
    },
  });

  const toggleBullMutation = useMutation({
    mutationFn: semenApi.toggleBull,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["semen"] }),
  });

  const createMutation = useMutation({
    mutationFn: semenApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["semen"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: SemenFormData }) =>
      semenApi.update(vars.id, vars.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["semen"] }),
  });

  const form = useForm<SemenFormValues>({
    resolver: zodResolver(semenSchema),
    defaultValues: {
      name: "",
      sire: "",
      date: new Date(),
      straw: "",
      bull: false,
      remark: "",
    },
  });

  useEffect(() => {
    if (dialogOpen) {
      form.reset({
        name: editingEntity?.name ?? "",
        sire: editingEntity?.sire ?? "",
        date: editingEntity ? new Date(editingEntity.date) : new Date(),
        straw: editingEntity?.straw?.toString() ?? "",
        bull: editingEntity?.bull ?? false,
        remark: editingEntity?.remark ?? "",
      });
    }
  }, [dialogOpen, editingEntity, form]);

  const handleAdd = () => {
    setEditingEntity(null);
    setDialogOpen(true);
  };

  const handleEdit = (entity: Semen) => {
    setEditingEntity(entity);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: SemenFormValues) => {
    const payload: SemenFormData = {
      name: data.name,
      sire: data.sire,
      date: format(data.date, "yyyy-MM-dd"),
      straw: data.straw ? parseInt(data.straw) : null,
      bull: data.bull,
      remark: data.remark,
    };
    if (editingEntity) {
      await updateMutation.mutateAsync({ id: editingEntity.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const columns = [
    columnHelper.accessor("id", { header: "ID" }),
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("sire", {
      header: "Sire",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => {
        const val = info.getValue();
        return val ? format(new Date(val), "dd/MM/yyyy") : "-";
      },
    }),
    columnHelper.accessor("straw", {
      header: "Straw",
      cell: (info) => info.getValue() ?? "-",
    }),
    columnHelper.accessor("bull", {
      header: "Bull",
      cell: (info) => (
        <Checkbox
          checked={info.getValue() === true}
          onCheckedChange={() =>
            toggleBullMutation.mutate(info.row.original.id)
          }
        />
      ),
    }),
    columnHelper.accessor("remark", {
      header: "Remark",
      cell: (info) => info.getValue() || "-",
    }),
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
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  const isEdit = editingEntity !== null;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Semen</h1>
        <p className="text-muted-foreground">Manage semen records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semen List</CardTitle>
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
                      <TableHead key={h.id}>
                        {h.isPlaceholder
                          ? null
                          : flexRender(
                              h.column.columnDef.header,
                              h.getContext(),
                            )}
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
                      No semen records found.
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
            <DialogTitle>{isEdit ? "Edit Semen" : "Add New Semen"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the semen record details below."
                : "Fill in the details to create a new semen record."}
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
                name="sire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sire</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sire (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "Pick a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="straw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Straw</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter straw count (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bull"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel className="!mt-0">Bull ?</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
