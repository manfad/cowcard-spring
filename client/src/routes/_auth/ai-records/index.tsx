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
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { aiRecordApi } from "@/lib/api";
import type { AiRecord } from "@/lib/types";
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

export const Route = createFileRoute("/_auth/ai-records/")({
  component: AiRecordsPage,
});

const columnHelper = createColumnHelper<AiRecord>();

const linkClass = "text-primary underline";

function AiRecordsPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AiRecord | null>(null);
  const qc = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["ai-records"],
    queryFn: async () => {
      const res = await aiRecordApi.getAll();
      return res.data.data ?? [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, aiStatusId }: { id: number; aiStatusId: number }) =>
      aiRecordApi.updateStatus(id, aiStatusId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-records"] });
      toast.success("Status updated");
      setStatusDialogOpen(false);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleStatusClick = (record: AiRecord) => {
    setSelectedRecord(record);
    setStatusDialogOpen(true);
  };

  const handleStatusSelect = (aiStatusId: number) => {
    if (!selectedRecord) return;
    statusMutation.mutate({ id: selectedRecord.id, aiStatusId });
  };

  const columns = [
    columnHelper.display({
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor("code", {
      header: "Code",
      cell: (info) => {
        const code = info.getValue();
        if (!code) return "-";
        return (
          <Link
            to={`/ai-records/${info.row.original.id}`}
            className={`font-medium ${linkClass}`}
          >
            {code}
          </Link>
        );
      },
    }),
    columnHelper.accessor("dam", {
      header: "Dam",
      cell: (info) => {
        const dam = info.getValue();
        if (!dam) return "-";
        return (
          <Link to={`/cows/${dam.id}`} className={linkClass}>
            {dam.tag}
          </Link>
        );
      },
    }),
    columnHelper.accessor("semen", {
      header: "Semen",
      cell: (info) => {
        const semen = info.getValue();
        if (!semen) return "-";
        return (
          <Link to={`/semen/${semen.id}`} className={linkClass}>
            {semen.name}
          </Link>
        );
      },
    }),
    columnHelper.accessor("aiDate", {
      header: "AI Date",
      cell: (info) =>
        info.getValue()
          ? new Date(info.getValue()!).toLocaleDateString()
          : "-",
    }),
    columnHelper.accessor("aiTime", {
      header: "AI Time",
      cell: (info) => info.getValue() ?? "-",
    }),
    columnHelper.accessor("feedlot", {
      header: "Feedlot",
      cell: (info) => {
        const feedlot = info.getValue();
        const feedlotId = info.row.original.feedlotId;
        if (!feedlot) return "-";
        if (feedlotId)
          return (
            <Link to={`/feedlots/${feedlotId}`} className={linkClass}>
              {feedlot}
            </Link>
          );
        return feedlot;
      },
    }),
    columnHelper.accessor("aiBy", {
      header: "AI By",
      cell: (info) => {
        const aiBy = info.getValue();
        if (!aiBy) return "-";
        return (
          <Link to={`/inseminators/${aiBy.id}`} className={linkClass}>
            {aiBy.name}
          </Link>
        );
      },
    }),
    columnHelper.accessor("preparedBy", {
      header: "Prepared By",
      cell: (info) => {
        const preparedBy = info.getValue();
        if (!preparedBy) return "-";
        return (
          <Link to={`/inseminators/${preparedBy.id}`} className={linkClass}>
            {preparedBy.name}
          </Link>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1"
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
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link to={`/ai-records/${info.row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
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
        <h1 className="text-3xl font-bold">AI Records</h1>
        <p className="text-muted-foreground">
          Manage artificial insemination records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Record List</CardTitle>
          <CardAction className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-60"
            />
            <Button asChild>
              <a href="/ai-record-form" target="_blank" rel="noopener noreferrer">Add New</a>
            </Button>
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
                                h.getContext(),
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
                      No AI records found.
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
              Update Status - {selectedRecord?.code ?? ""}
            </DialogTitle>
            <DialogDescription>
              Select a status for this AI record.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center">
            <Button
              disabled={statusMutation.isPending}
              onClick={() => handleStatusSelect(1)}
            >
              {statusMutation.isPending ? "Saving..." : "Success"}
            </Button>
            <Button
              variant="destructive"
              disabled={statusMutation.isPending}
              onClick={() => handleStatusSelect(2)}
            >
              {statusMutation.isPending ? "Saving..." : "Fail"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
