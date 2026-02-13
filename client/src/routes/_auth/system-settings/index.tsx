import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { systemSettingApi } from "@/lib/api";
import type { SystemSetting, SystemSettingFormData } from "@/lib/types";
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
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_auth/system-settings/")({
  component: SystemSettingsPage,
});

const columnHelper = createColumnHelper<SystemSetting>();

function SystemSettingsPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(
    null
  );
  const [formName, setFormName] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formRemark, setFormRemark] = useState("");
  const qc = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const res = await systemSettingApi.getAll();
      return res.data.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: SystemSettingFormData) => systemSettingApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("Setting created");
      setDialogOpen(false);
    },
    onError: () => toast.error("Failed to create setting"),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: SystemSettingFormData }) =>
      systemSettingApi.update(vars.id, vars.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("Setting updated");
      setDialogOpen(false);
    },
    onError: () => toast.error("Failed to update setting"),
  });

  const cronMutation = useMutation({
    mutationFn: () => systemSettingApi.runCron(),
    onSuccess: () => toast.success("Cron job executed"),
    onError: () => toast.error("Failed to run cron job"),
  });

  const handleAdd = () => {
    setEditingSetting(null);
    setFormName("");
    setFormValue("");
    setFormRemark("");
    setDialogOpen(true);
  };

  const handleEdit = (setting: SystemSetting) => {
    setEditingSetting(setting);
    setFormName(setting.name);
    setFormValue(setting.value);
    setFormRemark(setting.remark ?? "");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: SystemSettingFormData = {
      name: formName,
      value: formValue,
      remark: formRemark,
    };
    if (editingSetting) {
      updateMutation.mutate({ id: editingSetting.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const columns = [
    columnHelper.display({
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("value", { header: "Value" }),
    columnHelper.accessor("remark", {
      header: "Remark",
      cell: (info) => info.getValue() ?? "-",
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
    data: settings,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings List</CardTitle>
          <CardAction className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-60"
            />
            <Button
              variant="outline"
              onClick={() => cronMutation.mutate()}
              disabled={cronMutation.isPending}
            >
              {cronMutation.isPending ? "Running..." : "Run Cron"}
            </Button>
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
                        className={h.column.getCanSort() ? "cursor-pointer select-none" : ""}
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {h.isPlaceholder
                            ? null
                            : flexRender(
                                h.column.columnDef.header,
                                h.getContext()
                              )}
                          {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? null}
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
                            cell.getContext()
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
                      No settings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} setting(s) total
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
              {editingSetting ? "Edit Setting" : "Add Setting"}
            </DialogTitle>
            <DialogDescription>
              {editingSetting
                ? "Update the setting value."
                : "Create a new system setting."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="setting-name">Name</Label>
              <Input
                id="setting-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Setting name"
                required
                disabled={editingSetting !== null}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-value">Value</Label>
              <Input
                id="setting-value"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="Setting value"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-remark">Remark</Label>
              <Input
                id="setting-remark"
                value={formRemark}
                onChange={(e) => setFormRemark(e.target.value)}
                placeholder="Optional remark"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
