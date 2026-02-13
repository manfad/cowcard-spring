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
import { semenApi } from "@/lib/api";
import type { SemenDetail } from "@/lib/types";
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

export const Route = createFileRoute("/_auth/semen/$semenId")({
  component: SemenDetailPage,
});

// AI Records
type AiRow = SemenDetail["aiRecords"][number];
const aiCol = createColumnHelper<AiRow>();
const aiColumns = [
  aiCol.display({ id: "index", header: "#", cell: ({ row }) => row.index + 1 }),
  aiCol.accessor("code", {
    header: "Code",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  aiCol.accessor("aiDate", {
    header: "AI Date",
    cell: (info) => {
      const val = info.getValue();
      return val ? format(new Date(val), "dd/MM/yyyy") : "-";
    },
  }),
  aiCol.accessor("damTag", {
    header: "Dam",
    cell: (info) => info.getValue() || "-",
  }),
  aiCol.accessor("aiBy", {
    header: "AI By",
    cell: (info) => info.getValue() || "-",
  }),
];

// Cows
type CowRow = SemenDetail["cows"][number];
const cowCol = createColumnHelper<CowRow>();
const cowColumns = [
  cowCol.display({ id: "index", header: "#", cell: ({ row }) => row.index + 1 }),
  cowCol.accessor("tag", {
    header: "Tag",
    cell: (info) => (
      <Link
        to={`/cows/${info.row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  cowCol.accessor("gender", {
    header: "Gender",
    cell: (info) => info.getValue() || "-",
  }),
  cowCol.accessor("role", {
    header: "Role",
    cell: (info) => {
      const val = info.getValue();
      return val ? <Badge variant="outline">{val}</Badge> : "-";
    },
  }),
  cowCol.accessor("feedlot", {
    header: "Feedlot",
    cell: (info) => info.getValue() || "-",
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

function InfoItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}

function SemenDetailPage() {
  const { semenId } = Route.useParams();

  const { data: detail, isLoading } = useQuery({
    queryKey: ["semen-detail", semenId],
    queryFn: async () => {
      const res = await semenApi.getDetail(Number(semenId));
      return res.data.data!;
    },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!detail) return <div className="p-4">Semen record not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link to="/semen" className="text-muted-foreground hover:underline text-sm">
            Semen
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <h1 className="text-3xl font-bold">{detail.name}</h1>
          {detail.bull != null && (
            <Badge variant={detail.bull ? "default" : "secondary"}>
              {detail.bull ? "Bull" : "Not Bull"}
            </Badge>
          )}
        </div>
        {detail.remark && (
          <p className="text-muted-foreground mt-1">{detail.remark}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semen Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <InfoItem label="Name" value={detail.name} />
            <InfoItem label="Sire" value={detail.sire} />
            <InfoItem label="Date" value={detail.date ? format(new Date(detail.date), "dd/MM/yyyy") : null} />
            <InfoItem label="Straw" value={detail.straw != null ? String(detail.straw) : null} />
            <InfoItem label="Bull" value={detail.bull != null ? (detail.bull ? "Yes" : "No") : null} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Records ({detail.aiRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={detail.aiRecords}
            columns={aiColumns}
            emptyMessage="No AI records using this semen."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cows ({detail.cows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={detail.cows}
            columns={cowColumns}
            emptyMessage="No cows from this semen."
          />
        </CardContent>
      </Card>
    </div>
  );
}
