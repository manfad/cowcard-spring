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
import { inseminatorApi } from "@/lib/api";
import type { InseminatorDetail } from "@/lib/types";
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

export const Route = createFileRoute("/_auth/inseminators/$inseminatorId")({
  component: InseminatorDetailPage,
});

// AI By / Prepared By Records table
type AiRow = InseminatorDetail["aiByRecords"][number];
const aiColumnHelper = createColumnHelper<AiRow>();
const aiColumns = [
  aiColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  }),
  aiColumnHelper.accessor("code", {
    header: "Code",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  aiColumnHelper.accessor("aiDate", {
    header: "AI Date",
    cell: (info) => {
      const val = info.getValue();
      return val ? format(new Date(val), "dd/MM/yyyy") : "-";
    },
  }),
  aiColumnHelper.accessor("damTag", {
    header: "Dam",
    cell: (info) => info.getValue() || "-",
  }),
  aiColumnHelper.accessor("semenName", {
    header: "Semen",
    cell: (info) => info.getValue() || "-",
  }),
];

// Diagnosis By Records table
type DiagRow = InseminatorDetail["diagnosisByRecords"][number];
const diagColumnHelper = createColumnHelper<DiagRow>();
const diagColumns = [
  diagColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  }),
  diagColumnHelper.accessor("aiRecordCode", {
    header: "AI Record",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  diagColumnHelper.accessor("aiDate", {
    header: "AI Date",
    cell: (info) => {
      const val = info.getValue();
      return val ? format(new Date(val), "dd/MM/yyyy") : "-";
    },
  }),
  diagColumnHelper.accessor("pdStatus", {
    header: "PD Status",
    cell: (info) => {
      const val = info.getValue();
      return val ? <Badge variant="secondary">{val}</Badge> : "-";
    },
  }),
];

function SortableTable<T>({
  data,
  columns,
  emptyMessage,
}: {
  data: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: any[];
  emptyMessage: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <>
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
                        : flexRender(h.column.columnDef.header, h.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
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
    </>
  );
}

function InseminatorDetailPage() {
  const { inseminatorId } = Route.useParams();

  const { data: detail, isLoading } = useQuery({
    queryKey: ["inseminator-detail", inseminatorId],
    queryFn: async () => {
      const res = await inseminatorApi.getDetail(Number(inseminatorId));
      return res.data.data!;
    },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!detail) return <div className="p-4">Inseminator not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link to="/inseminators" className="text-muted-foreground hover:underline text-sm">
            Inseminators
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <h1 className="text-3xl font-bold">{detail.name}</h1>
        </div>
        {detail.remark && (
          <p className="text-muted-foreground mt-1">{detail.remark}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI By Records ({detail.aiByRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={detail.aiByRecords}
            columns={aiColumns}
            emptyMessage="No AI records as inseminator."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prepared By Records ({detail.preparedByRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={detail.preparedByRecords}
            columns={aiColumns}
            emptyMessage="No records as preparer."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnosis By Records ({detail.diagnosisByRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={detail.diagnosisByRecords}
            columns={diagColumns}
            emptyMessage="No diagnosis records."
          />
        </CardContent>
      </Card>
    </div>
  );
}
