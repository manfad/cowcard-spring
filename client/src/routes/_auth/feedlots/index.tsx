import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { feedlotApi } from "@/lib/api";
import type { Feedlot, LookupFormData } from "@/lib/types";
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
import { LookupFormDialog } from "@/components/lookup-form-dialog";

export const Route = createFileRoute("/_auth/feedlots/")({
  component: FeedlotsPage,
});

const columnHelper = createColumnHelper<Feedlot>();

function FeedlotsPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Feedlot | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.admin === true;
  const qc = useQueryClient();

  const { data: feedlots = [], isLoading } = useQuery({
    queryKey: ["feedlots"],
    queryFn: async () => {
      const res = await feedlotApi.getAll();
      return res.data.data ?? [];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => feedlotApi.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feedlots"] }),
    onError: () => toast.error("Failed to toggle feedlot status"),
  });

  const createMutation = useMutation({
    mutationFn: (data: LookupFormData) => feedlotApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feedlots"] });
      toast.success("Feedlot created");
    },
    onError: () => toast.error("Failed to create feedlot"),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: LookupFormData }) =>
      feedlotApi.update(vars.id, vars.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feedlots"] });
      toast.success("Feedlot updated");
    },
    onError: () => toast.error("Failed to update feedlot"),
  });

  const handleAdd = () => {
    setEditingEntity(null);
    setDialogOpen(true);
  };

  const handleEdit = (entity: Feedlot) => {
    setEditingEntity(entity);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: LookupFormData) => {
    if (editingEntity) {
      await updateMutation.mutateAsync({ id: editingEntity.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const columns = [
    columnHelper.display({
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("remark", {
      header: "Remark",
      cell: (info) => info.getValue() ?? "-",
    }),
    ...(isAdmin
      ? [
          columnHelper.accessor("active", {
            header: "Status",
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
    data: feedlots,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feedlots</h1>
        <p className="text-muted-foreground">Manage feedlot records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedlot List</CardTitle>
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
                      No feedlots found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} feedlot(s) total
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

      <LookupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entity={editingEntity}
        entityLabel="Feedlot"
        onSubmit={handleFormSubmit}
        isPending={isPending}
      />
    </div>
  );
}
