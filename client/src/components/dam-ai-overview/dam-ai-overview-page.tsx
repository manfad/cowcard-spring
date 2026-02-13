import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { aiRecordApi } from "@/lib/api";
import type { DamAiOverview } from "@/lib/types";
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

const columnHelper = createColumnHelper<DamAiOverview>();

function formatAiRecord(
  record: DamAiOverview["aiRecords"][number] | undefined,
) {
  if (!record) return "-";
  return `${record.code}`;
}

const columns = [
  columnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  }),
  columnHelper.accessor("damTag", { header: "Dam Tag" }),
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
];

export function DamAiOverviewPage() {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: overviews = [], isLoading } = useQuery({
    queryKey: ["dam-ai-overview"],
    queryFn: async () => {
      const res = await aiRecordApi.getDamAiOverview();
      return res.data.data ?? [];
    },
  });

  const table = useReactTable({
    data: overviews,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dam AI Overview</h1>
        <p className="text-muted-foreground">
          Overview of dams and their non-bull AI records
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
    </div>
  );
}
