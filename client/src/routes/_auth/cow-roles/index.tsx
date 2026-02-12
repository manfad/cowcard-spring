import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
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
import { Pencil } from "lucide-react";
import type { CowRole, CowRoleFormData } from "@/lib/types";
import { cowRoleApi, cowGenderApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
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
import { MultiSelect } from "@/components/ui/multi-select";

export const Route = createFileRoute("/_auth/cow-roles/")({
  component: CowRolesPage,
});

const cowRoleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  remark: z.string(),
  cowGenderIds: z.array(z.string()),
});

type CowRoleFormValues = z.infer<typeof cowRoleSchema>;

const columnHelper = createColumnHelper<CowRole>();

function CowRolesPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<CowRole | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.admin === true;
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cow-roles"],
    queryFn: async () => {
      const res = await cowRoleApi.getAll();
      return res.data.data ?? [];
    },
  });

  const { data: genders = [] } = useQuery({
    queryKey: ["cow-genders"],
    queryFn: async () => {
      const res = await cowGenderApi.getAll();
      return res.data.data ?? [];
    },
  });

  const genderOptions = genders.map((g) => ({
    value: g.id.toString(),
    label: g.name,
  }));

  const toggleMutation = useMutation({
    mutationFn: cowRoleApi.toggleActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cow-roles"] }),
  });

  const createMutation = useMutation({
    mutationFn: cowRoleApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cow-roles"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: CowRoleFormData }) =>
      cowRoleApi.update(vars.id, vars.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cow-roles"] }),
  });

  const form = useForm<CowRoleFormValues>({
    resolver: zodResolver(cowRoleSchema),
    defaultValues: { name: "", remark: "", cowGenderIds: [] },
  });

  useEffect(() => {
    if (dialogOpen) {
      form.reset({
        name: editingEntity?.name ?? "",
        remark: editingEntity?.remark ?? "",
        cowGenderIds:
          editingEntity?.cowGenders?.map((g) => g.id.toString()) ?? [],
      });
    }
  }, [dialogOpen, editingEntity, form]);

  const handleAdd = () => {
    setEditingEntity(null);
    setDialogOpen(true);
  };

  const handleEdit = (entity: CowRole) => {
    setEditingEntity(entity);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: CowRoleFormValues) => {
    const payload: CowRoleFormData = {
      name: data.name,
      remark: data.remark,
      cowGenderIds: data.cowGenderIds.map((id) => parseInt(id)),
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
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("cowGenders", {
      header: "Genders",
      cell: (info) => {
        const genders = info.getValue();
        if (!genders || genders.length === 0) return "-";
        return genders.map((g) => g.name).join(", ");
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
        <h1 className="text-3xl font-bold">Cow Roles</h1>
        <p className="text-muted-foreground">Manage cow role classifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cow Role List</CardTitle>
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
                      No cow roles found.
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
              {isEdit ? "Edit Cow Role" : "Add New Cow Role"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the cow role details below."
                : "Fill in the details to create a new cow role."}
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
              <Controller
                control={form.control}
                name="cowGenderIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genders (Optional)</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={genderOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select genders..."
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
