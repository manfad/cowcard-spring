import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { aiRecordApi } from "@/lib/api";
import type { DamAiRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_auth/dam-ai-record/")({
  component: DamAiRecordPage,
});

const columnHelper = createColumnHelper<DamAiRecord>();

const linkClass = "text-primary underline";

function formatAiRecord(record: DamAiRecord["aiRecords"][number] | undefined) {
  if (!record) return "-";
  return (
    <Link to={`/ai-records/${record.id}`} className={linkClass}>
      {record.code}
    </Link>
  );
}

function formatLastAiDays(days: number | null) {
  if (days === null) return "-";
  if (days === 0) return <Badge>Today</Badge>;
  if (days === 1) return <Badge>1 day ago</Badge>;
  return <Badge>{days} days ago</Badge>;
}

function DamAiRecordPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [bullAiDialogOpen, setBullAiDialogOpen] = useState(false);
  const [selectedDam, setSelectedDam] = useState<{
    tag: string;
    bullAiRecords: DamAiRecord["bullAiRecords"];
  }>({ tag: "", bullAiRecords: [] });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["dam-ai-record"],
    queryFn: async () => {
      const res = await aiRecordApi.getDamAiRecord();
      return res.data.data ?? [];
    },
  });

  const handleViewBullAi = (row: DamAiRecord) => {
    setSelectedDam({ tag: row.damTag, bullAiRecords: row.bullAiRecords });
    setBullAiDialogOpen(true);
  };

  const columns = [
    columnHelper.display({
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor("damTag", {
      header: "Dam Tag",
      cell: (info) => {
        const tag = info.getValue();
        const id = info.row.original.damId;
        if (!tag) return "-";
        return (
          <Link to={`/cows/${id}`} className={`font-medium ${linkClass}`}>
            {tag}
          </Link>
        );
      },
    }),
    columnHelper.display({
      id: "ai1",
      header: "AI Record 1",
      cell: ({ row }) => formatAiRecord(row.original.aiRecords[0]),
    }),
    columnHelper.display({
      id: "ai2",
      header: "AI Record 2",
      cell: ({ row }) => formatAiRecord(row.original.aiRecords[1]),
    }),
    columnHelper.display({
      id: "ai3",
      header: "AI Record 3",
      cell: ({ row }) => formatAiRecord(row.original.aiRecords[2]),
    }),
    columnHelper.display({
      id: "bullAi",
      header: "Bull Record",
      cell: ({ row }) => {
        const count = row.original.bullAiRecords.length;
        if (count === 0) return "-";
        return (
          <Button size="sm" onClick={() => handleViewBullAi(row.original)}>
            View ({count})
          </Button>
        );
      },
    }),
    columnHelper.accessor("lastAiDays", {
      header: "Last AI Days",
      cell: (info) => formatLastAiDays(info.getValue()),
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
        <h1 className="text-3xl font-bold">Dam AI Record</h1>
        <p className="text-muted-foreground">
          Overview of dams and their AI records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dam AI Records</CardTitle>
          <CardAction>
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
                      No dam AI records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} dam(s) total
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

      <Dialog open={bullAiDialogOpen} onOpenChange={setBullAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bull Semen AI - {selectedDam.tag}</DialogTitle>
            <DialogDescription>
              AI records using bull semen for this dam
            </DialogDescription>
          </DialogHeader>
          {selectedDam.bullAiRecords.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>AI Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDam.bullAiRecords.map((record, i) => (
                    <TableRow key={record.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <Link
                          to={`/ai-records/${record.id}`}
                          className={linkClass}
                          onClick={() => setBullAiDialogOpen(false)}
                        >
                          {record.code}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No bull semen AI records.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
