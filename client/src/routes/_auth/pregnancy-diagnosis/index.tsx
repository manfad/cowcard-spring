import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { Pencil } from "lucide-react";
import { colorBtnMap } from "@/components/ui/color-picker";
import { toast } from "sonner";
import { pregnancyDiagnosisApi, pdStatusApi, inseminatorApi, systemSettingApi } from "@/lib/api";
import type { PregnancyDiagnosis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

export const Route = createFileRoute("/_auth/pregnancy-diagnosis/")({
  component: PregnancyDiagnosisPage,
});

const columnHelper = createColumnHelper<PregnancyDiagnosis>();

const linkClass = "text-primary underline";

function PregnancyDiagnosisPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<PregnancyDiagnosis | null>(null);
  const [selectedDiagnosisById, setSelectedDiagnosisById] = useState("");
  const [selectedPdStatusId, setSelectedPdStatusId] = useState("");
  const qc = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["pregnancy-diagnosis"],
    queryFn: async () => {
      const res = await pregnancyDiagnosisApi.getAll();
      return res.data.data ?? [];
    },
  });

  const { data: pdStatuses = [] } = useQuery({
    queryKey: ["pd-statuses"],
    queryFn: async () => {
      const res = await pdStatusApi.getAll();
      return res.data.data ?? [];
    },
  });

  const { data: inseminators = [] } = useQuery({
    queryKey: ["inseminators"],
    queryFn: async () => {
      const res = await inseminatorApi.getAll();
      return res.data.data ?? [];
    },
  });

  const { data: systemSettings = [] } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const res = await systemSettingApi.getAll();
      return res.data.data ?? [];
    },
  });

  const pdDaySetting = systemSettings.find((s) => s.id === 1);
  const pdDayTotal = pdDaySetting ? parseInt(pdDaySetting.value) : 0;

  const statusMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { diagnosisById: number; pdStatusId: number } }) =>
      pregnancyDiagnosisApi.updateStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pregnancy-diagnosis"] });
      toast.success("Status updated");
      setStatusDialogOpen(false);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleStatusClick = (record: PregnancyDiagnosis) => {
    setSelectedRecord(record);
    setSelectedDiagnosisById(record.diagnosisBy?.id?.toString() ?? "");
    setSelectedPdStatusId(record.pdStatus?.id?.toString() ?? "");
    setStatusDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedRecord || !selectedDiagnosisById || !selectedPdStatusId) return;
    statusMutation.mutate({
      id: selectedRecord.id,
      data: {
        diagnosisById: parseInt(selectedDiagnosisById),
        pdStatusId: parseInt(selectedPdStatusId),
      },
    });
  };

  const columns = [
    columnHelper.display({
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor("aiRecord", {
      header: "AI Record",
      cell: (info) => {
        const aiRecord = info.getValue();
        if (!aiRecord) return "-";
        return (
          <Link to={`/ai-records/${aiRecord.id}`} className={linkClass}>
            {aiRecord.code}
          </Link>
        );
      },
    }),
    columnHelper.accessor("aiDate", {
      header: "AI Date",
      cell: (info) => {
        const val = info.getValue();
        if (!val) return "-";
        const date = new Date(val);
        return (
          <div>
            {date.toLocaleDateString()}
            <span className="block text-xs text-muted-foreground">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const val = row.original.aiDate;
        if (!val || !pdDayTotal) return "-";
        const days = differenceInDays(new Date(), new Date(val));
        const pct = Math.min(Math.round((days / pdDayTotal) * 100), 100);
        return (
          <div className="min-w-24">
            <Progress value={pct} className="h-2" />
            <span className="text-xs text-muted-foreground">
              {days}/{pdDayTotal} days
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("diagnosisBy", {
      header: "Diagnosis By",
      cell: (info) => {
        const diagnosisBy = info.getValue();
        if (!diagnosisBy) return "-";
        return (
          <Link to={`/inseminators/${diagnosisBy.id}`} className={linkClass}>
            {diagnosisBy.name}
          </Link>
        );
      },
    }),
    columnHelper.accessor("pdStatus", {
      header: "PD Status",
      cell: (info) => {
        const status = info.getValue();
        const colorClass = status?.color ? colorBtnMap[status.color] : "";
        return (
          <Button
            size="sm"
            variant={status?.color ? "default" : "outline"}
            className={"h-auto px-2 py-1 " + colorClass}
            onClick={() => handleStatusClick(info.row.original)}
          >
            {status?.name ?? "-"}
          </Button>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleStatusClick(info.row.original)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: records,
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
        <h1 className="text-3xl font-bold">Pregnancy Diagnosis</h1>
        <p className="text-muted-foreground">
          Manage pregnancy diagnosis records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pregnancy Diagnosis List</CardTitle>
          <CardAction className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-60"
            />
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
                      No records found.
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

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update PD Status - {selectedRecord?.aiRecord?.code ?? ""}
            </DialogTitle>
            <DialogDescription>
              Update the diagnosis details for this pregnancy diagnosis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Diagnosis By</Label>
              <Select value={selectedDiagnosisById} onValueChange={setSelectedDiagnosisById}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select inseminator..." />
                </SelectTrigger>
                <SelectContent>
                  {inseminators
                    .filter((i) => i.active !== false)
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>PD Status</Label>
              <Select value={selectedPdStatusId} onValueChange={setSelectedPdStatusId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {pdStatuses
                    .filter((s) => s.active !== false)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={statusMutation.isPending || !selectedDiagnosisById || !selectedPdStatusId}
              onClick={handleSubmit}
            >
              {statusMutation.isPending ? "Saving..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
