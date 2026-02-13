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
import { cowGenderApi } from "@/lib/api";
import type { GenderDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_auth/cow-genders/$genderId")({
  component: GenderDetailPage,
});

type CowRow = GenderDetail["cows"][number];
const columnHelper = createColumnHelper<CowRow>();

const columns = [
  columnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  }),
  columnHelper.accessor("tag", {
    header: "Tag",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: (info) => {
      const val = info.getValue();
      return val ? <Badge variant="outline">{val}</Badge> : "-";
    },
  }),
  columnHelper.accessor("feedlot", {
    header: "Feedlot",
    cell: (info) => {
      const val = info.getValue();
      return val ? <Badge variant="outline">{val}</Badge> : "-";
    },
  }),
];

function GenderDetailPage() {
  const { genderId } = Route.useParams();
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: detail, isLoading } = useQuery({
    queryKey: ["cow-gender-detail", genderId],
    queryFn: async () => {
      const res = await cowGenderApi.getDetail(Number(genderId));
      return res.data.data!;
    },
  });

  const table = useReactTable({
    data: detail?.cows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!detail) return <div className="p-4">Gender not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link
            to="/cow-genders"
            className="text-muted-foreground hover:underline text-sm"
          >
            Cow Genders
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
          <CardTitle>Cows ({detail.cows.length})</CardTitle>
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
                      No cows with this gender.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} cow(s) total
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
