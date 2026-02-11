import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table";
import { aiRecordApi } from "@/lib/api";
import type { AiRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_auth/ai-records/")({ component: AiRecordsPage });

const columnHelper = createColumnHelper<AiRecord>();

function AiRecordsPage() {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["ai-records"],
    queryFn: async () => { const res = await aiRecordApi.getAll(); return res.data.data ?? []; },
  });

  const columns = [
    columnHelper.accessor("code", { header: "Code", cell: (info) => info.getValue() ?? "-" }),
    columnHelper.accessor("dam", { header: "Dam", cell: (info) => info.getValue()?.tag ?? "-" }),
    columnHelper.accessor("semen", { header: "Semen", cell: (info) => info.getValue()?.name ?? "-" }),
    columnHelper.accessor("aiDate", {
      header: "AI Date",
      cell: (info) => info.getValue() ? new Date(info.getValue()!).toLocaleDateString() : "-",
    }),
    columnHelper.accessor("aiTime", { header: "AI Time", cell: (info) => info.getValue() ?? "-" }),
    columnHelper.accessor("feedlot", { header: "Feedlot", cell: (info) => info.getValue()?.name ?? "-" }),
    columnHelper.accessor("aiBy", { header: "AI By", cell: (info) => info.getValue()?.name ?? "-" }),
    columnHelper.accessor("preparedBy", { header: "Prepared By", cell: (info) => info.getValue()?.name ?? "-" }),
    columnHelper.accessor("status", { header: "Status", cell: (info) => info.getValue()?.name ?? "-" }),
  ];

  const table = useReactTable({
    data: records, columns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), state: { globalFilter }, onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">AI Records</h1>
      <Input placeholder="Search AI records..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-sm" />
      <div className="rounded-md border">
        <Table>
          <TableHeader>{table.getHeaderGroups().map((hg) => (<TableRow key={hg.id}>{hg.headers.map((h) => (<TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))
            : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No AI records found.</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} record(s) total</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}
