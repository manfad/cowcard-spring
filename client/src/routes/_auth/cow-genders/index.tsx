import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { cowGenderApi } from "@/lib/api";
import type { CowGender } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_auth/cow-genders/")({ component: CowGendersPage });

const columnHelper = createColumnHelper<CowGender>();

function CowGendersPage() {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: genders = [], isLoading } = useQuery({
    queryKey: ["cow-genders"],
    queryFn: async () => { const res = await cowGenderApi.getAll(); return res.data.data ?? []; },
  });

  const columns = [
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("remark", { header: "Remark", cell: (info) => info.getValue() ?? "-" }),
    columnHelper.accessor("active", {
      header: "Status",
      cell: (info) => <Badge variant={info.getValue() ? "default" : "outline"}>{info.getValue() ? "Active" : "Inactive"}</Badge>,
    }),
  ];

  const table = useReactTable({
    data: genders, columns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), state: { globalFilter }, onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Cow Genders</h1>
      <Input placeholder="Search genders..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-sm" />
      <div className="rounded-md border">
        <Table>
          <TableHeader>{table.getHeaderGroups().map((hg) => (<TableRow key={hg.id}>{hg.headers.map((h) => (<TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))
            : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No genders found.</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} gender(s) total</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}
