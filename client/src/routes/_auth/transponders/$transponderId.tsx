import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { transponderApi } from "@/lib/api";
import type { TransponderDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
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

export const Route = createFileRoute("/_auth/transponders/$transponderId")({
  component: TransponderDetailPage,
});

// History table
type HistoryRow = TransponderDetail["history"][number];
const histColumnHelper = createColumnHelper<HistoryRow>();
const histColumns = [
  histColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  }),
  histColumnHelper.accessor("cowTag", {
    header: "Cow",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  histColumnHelper.accessor("assignedAt", {
    header: "Assigned",
    cell: (info) => {
      const val = info.getValue();
      return val ? format(new Date(val), "dd/MM/yyyy") : "-";
    },
  }),
  histColumnHelper.accessor("unassignedAt", {
    header: "Unassigned",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return <Badge variant="secondary">Current</Badge>;
      return format(new Date(val), "dd/MM/yyyy");
    },
  }),
];

function TransponderDetailPage() {
  const { transponderId } = Route.useParams();
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: detail, isLoading } = useQuery({
    queryKey: ["transponder-detail", transponderId],
    queryFn: async () => {
      const res = await transponderApi.getDetail(Number(transponderId));
      return res.data.data!;
    },
  });

  const histTable = useReactTable({
    data: detail?.history ?? [],
    columns: histColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!detail) return <div className="p-4">Transponder not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link to="/transponders" className="text-muted-foreground hover:underline text-sm">
            Transponders
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <h1 className="text-3xl font-bold">{detail.code}</h1>
        </div>
        {detail.remark && (
          <p className="text-muted-foreground mt-1">{detail.remark}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.currentCow ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Assigned to:</span>
              <Badge variant="default">{detail.currentCow.tag}</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not assigned to any cow.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment History ({detail.history.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {histTable.getHeaderGroups().map((hg) => (
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
                            : flexRender(h.column.columnDef.header, h.getContext())}
                          {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? null}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {histTable.getRowModel().rows.length ? (
                  histTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={histColumns.length} className="h-24 text-center">
                      No assignment history.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {histTable.getFilteredRowModel().rows.length} record(s) total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => histTable.previousPage()}
                disabled={!histTable.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => histTable.nextPage()}
                disabled={!histTable.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
