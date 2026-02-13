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
import { cowApi } from "@/lib/api";
import type { CowDetail } from "@/lib/types";
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

export const Route = createFileRoute("/_auth/cows/$cowId")({
  component: CowDetailPage,
});

// Transponder History
type TransponderRow = CowDetail["transponderHistory"][number];
const thCol = createColumnHelper<TransponderRow>();
const transponderHistColumns = [
  thCol.display({ id: "index", header: "#", cell: ({ row }) => row.index + 1 }),
  thCol.accessor("transponderCode", {
    header: "Transponder",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  thCol.accessor("assignedAt", {
    header: "Assigned",
    cell: (info) => {
      const val = info.getValue();
      return val ? format(new Date(val), "dd/MM/yyyy") : "-";
    },
  }),
  thCol.accessor("unassignedAt", {
    header: "Unassigned",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return <Badge variant="secondary">Current</Badge>;
      return format(new Date(val), "dd/MM/yyyy");
    },
  }),
];

// Feedlot History
type FeedlotRow = CowDetail["feedlotHistory"][number];
const fhCol = createColumnHelper<FeedlotRow>();
const feedlotHistColumns = [
  fhCol.display({ id: "index", header: "#", cell: ({ row }) => row.index + 1 }),
  fhCol.accessor("feedlotName", {
    header: "Feedlot",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  fhCol.accessor("movedInAt", {
    header: "Moved In",
    cell: (info) => {
      const val = info.getValue();
      return val ? format(new Date(val), "dd/MM/yyyy") : "-";
    },
  }),
  fhCol.accessor("movedOutAt", {
    header: "Moved Out",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return <Badge variant="secondary">Current</Badge>;
      return format(new Date(val), "dd/MM/yyyy");
    },
  }),
];

// AI Records
type AiRow = CowDetail["aiRecords"][number];
const aiCol = createColumnHelper<AiRow>();
const aiRecordColumns = [
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
  aiCol.accessor("aiTime", {
    header: "Time",
    cell: (info) => info.getValue() || "-",
  }),
  aiCol.accessor("semenName", {
    header: "Semen",
    cell: (info) => info.getValue() || "-",
  }),
  aiCol.accessor("aiBy", {
    header: "AI By",
    cell: (info) => info.getValue() || "-",
  }),
  aiCol.accessor("preparedBy", {
    header: "Prepared By",
    cell: (info) => info.getValue() || "-",
  }),
  aiCol.accessor("status", {
    header: "Status",
    cell: (info) => {
      const val = info.getValue();
      return val ? <Badge variant="secondary">{val}</Badge> : "-";
    },
  }),
];

// Calves
type CalfRow = CowDetail["calves"][number];
const calfCol = createColumnHelper<CalfRow>();
const calfColumns = [
  calfCol.display({ id: "index", header: "#", cell: ({ row }) => row.index + 1 }),
  calfCol.accessor("tag", {
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
  calfCol.accessor("dob", {
    header: "DOB",
    cell: (info) => {
      const val = info.getValue();
      return val ? format(new Date(val), "dd/MM/yyyy") : "-";
    },
  }),
  calfCol.accessor("gender", {
    header: "Gender",
    cell: (info) => info.getValue() || "-",
  }),
  calfCol.accessor("color", {
    header: "Color",
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

function CowDetailPage() {
  const { cowId } = Route.useParams();

  const { data: detail, isLoading } = useQuery({
    queryKey: ["cow-detail", cowId],
    queryFn: async () => {
      const res = await cowApi.getDetail(Number(cowId));
      return res.data.data!;
    },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!detail) return <div className="p-4">Cow not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link to="/cows" className="text-muted-foreground hover:underline text-sm">
            Cows
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <h1 className="text-3xl font-bold">{detail.tag}</h1>
          {detail.status && (
            <Badge variant="secondary">{detail.status}</Badge>
          )}
        </div>
        {detail.remark && (
          <p className="text-muted-foreground mt-1">{detail.remark}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cow Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <InfoItem label="Tag" value={detail.tag} />
            <InfoItem label="Gender" value={detail.gender} />
            <InfoItem label="Color" value={detail.color} />
            <InfoItem label="Role" value={detail.role} />
            <InfoItem label="DOB" value={detail.dob ? format(new Date(detail.dob), "dd/MM/yyyy") : null} />
            <InfoItem label="Weight" value={detail.weight != null ? `${detail.weight} kg` : null} />
            <InfoItem label="Feedlot" value={detail.feedlot} />
            <InfoItem label="Transponder" value={detail.transponder} />
            <InfoItem label="Dam" value={detail.damTag} />
            <InfoItem label="Semen" value={detail.semenName} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transponder History ({detail.transponderHistory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={detail.transponderHistory}
            columns={transponderHistColumns}
            emptyMessage="No transponder history."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedlot History ({detail.feedlotHistory.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={detail.feedlotHistory}
            columns={feedlotHistColumns}
            emptyMessage="No feedlot history."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Records ({detail.aiRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={detail.aiRecords}
            columns={aiRecordColumns}
            emptyMessage="No AI records."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calves ({detail.calves.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SortableTable
            data={detail.calves}
            columns={calfColumns}
            emptyMessage="No calves."
          />
        </CardContent>
      </Card>
    </div>
  );
}
