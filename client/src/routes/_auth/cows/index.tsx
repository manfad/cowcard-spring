import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Eye, StickyNote, Plus } from "lucide-react";
import type { CowView } from "@/lib/types";
import { cowApi } from "@/lib/api";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_auth/cows/")({
  component: CowPage,
});

const columnHelper = createColumnHelper<CowView>();

const linkClass = "text-primary underline";

const staticColumns = [
  columnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  }),
  columnHelper.accessor("tag", {
    header: "Tag",
    cell: (info) => (
      <Link
        to={`/cows/${info.row.original.id}`}
        className={`font-medium ${linkClass}`}
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("gender", {
    header: "Gender",
    cell: (info) => {
      const val = info.getValue();
      const id = info.row.original.genderId;
      if (!val) return "-";
      if (id)
        return (
          <Link to={`/cow-genders/${id}`} className={linkClass}>
            {val}
          </Link>
        );
      return val;
    },
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: (info) => {
      const val = info.getValue();
      const id = info.row.original.roleId;
      if (!val) return "-";
      if (id)
        return (
          <Link to={`/cow-roles/${id}`} className={linkClass}>
            {val}
          </Link>
        );
      return val;
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const val = info.getValue();
      const id = info.row.original.statusId;
      if (!val) return "-";
      if (id)
        return (
          <Link to={`/cow-statuses/${id}`} className={linkClass}>
            {val}
          </Link>
        );
      return val;
    },
  }),
  columnHelper.accessor("feedlot", {
    header: "Feedlot",
    cell: (info) => {
      const val = info.getValue();
      const id = info.row.original.feedlotId;
      if (!val) return "-";
      if (id)
        return (
          <Link to={`/feedlots/${id}`} className={linkClass}>
            {val}
          </Link>
        );
      return val;
    },
  }),
  columnHelper.accessor("transponder", {
    header: "Transponder",
    cell: (info) => {
      const val = info.getValue();
      const id = info.row.original.transponderId;
      if (!val) return "-";
      if (id)
        return (
          <Link to={`/transponders/${id}`} className={linkClass}>
            {val}
          </Link>
        );
      return val;
    },
  }),
];

type CowFilter = "Male" | "Female" | "Dam" | "Calf" | null;

function CowPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [activeFilter, setActiveFilter] = useState<CowFilter>(null);
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<{
    tag: string;
    remark: string;
  }>({ tag: "", remark: "" });

  const { data: cows = [], isLoading } = useQuery({
    queryKey: ["cows"],
    queryFn: async () => {
      const res = await cowApi.getAll();
      return res.data.data ?? [];
    },
  });

  const filteredCows = useMemo(() => {
    if (!activeFilter) return cows;
    if (activeFilter === "Male" || activeFilter === "Female") {
      return cows.filter((c) => c.gender === activeFilter);
    }
    return cows.filter((c) => c.role === activeFilter);
  }, [cows, activeFilter]);

  const handleRemarkClick = (tag: string, remark: string | null) => {
    setSelectedRemark({ tag, remark: remark || "No remark" });
    setRemarkDialogOpen(true);
  };

  const columns = [
    ...staticColumns,
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to={`/cows/${info.row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              handleRemarkClick(info.row.original.tag, info.row.original.remark)
            }
          >
            <StickyNote className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredCows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cows</h1>
        <p className="text-muted-foreground">Manage cattle records</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Cow List</CardTitle>
            {(["Male", "Female", "Dam", "Calf"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={activeFilter === f ? "default" : "outline"}
                onClick={() =>
                  setActiveFilter((prev) => (prev === f ? null : f))
                }
              >
                {f}
              </Button>
            ))}
          </div>
          <CardAction className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-60"
            />
            <Button asChild>
              <a href="/cow-form" target="_blank" rel="noopener noreferrer">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </a>
            </Button>
          </CardAction>
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
                      No cows found.
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
        </CardContent>
      </Card>

      <Dialog open={remarkDialogOpen} onOpenChange={setRemarkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remark - {selectedRemark.tag}</DialogTitle>
            <DialogDescription>{selectedRemark.remark}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
