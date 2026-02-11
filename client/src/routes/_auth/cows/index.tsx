import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { cowApi } from "@/lib/api";
import type { Cow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_auth/cows/")({
  component: CowsPage,
});

const columnHelper = createColumnHelper<Cow>();

function CowsPage() {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: cows = [], isLoading } = useQuery({
    queryKey: ["cows"],
    queryFn: async () => {
      const res = await cowApi.getAll();
      return res.data.data ?? [];
    },
  });

  const columns = [
    columnHelper.accessor("tag", { header: "Tag" }),
    columnHelper.accessor("dob", {
      header: "Date of Birth",
      cell: (info) => info.getValue() ? new Date(info.getValue()!).toLocaleDateString() : "-",
    }),
    columnHelper.accessor("weight", {
      header: "Weight",
      cell: (info) => info.getValue() ?? "-",
    }),
    columnHelper.accessor("gender", {
      header: "Gender",
      cell: (info) => info.getValue()?.name ?? "-",
    }),
    columnHelper.accessor("color", {
      header: "Color",
      cell: (info) => info.getValue()?.name ?? "-",
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => info.getValue()?.name ?? "-",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => info.getValue()?.name ?? "-",
    }),
    columnHelper.accessor("currentFeedlot", {
      header: "Feedlot",
      cell: (info) => info.getValue()?.name ?? "-",
    }),
    columnHelper.accessor("dam", {
      header: "Dam",
      cell: (info) => info.getValue()?.tag ?? "-",
    }),
  ];

  const table = useReactTable({
    data: cows,
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
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Cows</h1>
      <Input
        placeholder="Search cows..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">No cows found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} cow(s) total</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}
