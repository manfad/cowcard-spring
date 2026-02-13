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
import { feedlotApi } from "@/lib/api";
import type { FeedlotDetail } from "@/lib/types";
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

export const Route = createFileRoute("/_auth/feedlots/$feedlotId")({
  component: FeedlotDetailPage,
});

// Cows table
type CowRow = FeedlotDetail["cows"][number];
const cowColumnHelper = createColumnHelper<CowRow>();
const cowColumns = [
  cowColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  }),
  cowColumnHelper.accessor("tag", {
    header: "Tag",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  cowColumnHelper.accessor("role", {
    header: "Role",
    cell: (info) => {
      const val = info.getValue();
      return val ? <Badge variant="outline">{val}</Badge> : "-";
    },
  }),
];

// History table
type HistoryRow = FeedlotDetail["history"][number];
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
  histColumnHelper.accessor("movedInAt", {
    header: "Moved In",
    cell: (info) => {
      const val = info.getValue();
      return val ? format(new Date(val), "dd/MM/yyyy") : "-";
    },
  }),
  histColumnHelper.accessor("movedOutAt", {
    header: "Moved Out",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return <Badge variant="secondary">Current</Badge>;
      return format(new Date(val), "dd/MM/yyyy");
    },
  }),
];

function FeedlotDetailPage() {
  const { feedlotId } = Route.useParams();
  const [cowSorting, setCowSorting] = useState<SortingState>([]);
  const [histSorting, setHistSorting] = useState<SortingState>([]);

  const { data: detail, isLoading } = useQuery({
    queryKey: ["feedlot-detail", feedlotId],
    queryFn: async () => {
      const res = await feedlotApi.getDetail(Number(feedlotId));
      return res.data.data!;
    },
  });

  const cowTable = useReactTable({
    data: detail?.cows ?? [],
    columns: cowColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting: cowSorting },
    onSortingChange: setCowSorting,
    initialState: { pagination: { pageSize: 10 } },
  });

  const histTable = useReactTable({
    data: detail?.history ?? [],
    columns: histColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting: histSorting },
    onSortingChange: setHistSorting,
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!detail) return <div className="p-4">Feedlot not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link to="/feedlots" className="text-muted-foreground hover:underline text-sm">
            Feedlots
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <h1 className="text-3xl font-bold">{detail.name}</h1>
          {detail.active != null && (
            <Badge variant={detail.active ? "default" : "secondary"}>
              {detail.active ? "Active" : "Inactive"}
            </Badge>
          )}
        </div>
        {detail.remark && (
          <p className="text-muted-foreground mt-1">{detail.remark}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Cows ({detail.cows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {cowTable.getHeaderGroups().map((hg) => (
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
                {cowTable.getRowModel().rows.length ? (
                  cowTable.getRowModel().rows.map((row) => (
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
                    <TableCell colSpan={cowColumns.length} className="h-24 text-center">
                      No cows in this feedlot.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {cowTable.getFilteredRowModel().rows.length} cow(s) total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => cowTable.previousPage()}
                disabled={!cowTable.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => cowTable.nextPage()}
                disabled={!cowTable.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movement History ({detail.history.length})</CardTitle>
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
                      No movement history.
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
