import { useState, useMemo, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
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
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { feedlotApi } from "@/lib/api";
import type { CowView, Feedlot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CowMultiSelectDialog } from "@/components/feedlot/cow-multi-select-dialog";

const columnHelper = createColumnHelper<CowView>();

export function FeedlotManagementPage() {
  const [userSelectedId, setUserSelectedId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [cowSelectOpen, setCowSelectOpen] = useState(false);
  const qc = useQueryClient();

  // Fetch all feedlots for dropdown
  const { data: feedlots = [], isLoading: feedlotsLoading } = useQuery({
    queryKey: ["feedlots"],
    queryFn: async () => {
      const res = await feedlotApi.getAll();
      return (res.data.data ?? []).filter((f: Feedlot) => f.active);
    },
  });

  // Derive the effective feedlot ID: user selection or first available
  const selectedFeedlotId =
    userSelectedId ?? (feedlots.length > 0 ? String(feedlots[0].id) : null);
  const feedlotId = selectedFeedlotId ? Number(selectedFeedlotId) : null;

  // Fetch cows for the selected feedlot
  const {
    data: feedlotWithCows,
    isLoading: cowsLoading,
    isFetching,
  } = useQuery({
    queryKey: ["feedlot-with-cows", feedlotId],
    queryFn: async () => {
      const res = await feedlotApi.getWithCows(feedlotId!);
      return res.data.data ?? null;
    },
    enabled: feedlotId !== null,
    placeholderData: keepPreviousData,
  });

  const cows = feedlotWithCows?.cows ?? [];

  // Memoize currentCowIds to prevent new array reference each render
  const currentCowIds = useMemo(() => cows.map((c) => c.id), [cows]);

  const invalidateAll = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["feedlot-with-cows"] });
    qc.invalidateQueries({ queryKey: ["cows"] });
    qc.invalidateQueries({ queryKey: ["feedlots"] });
  }, [qc]);

  // Assign bulk mutation
  const assignBulkMutation = useMutation({
    mutationFn: (cowIds: number[]) => feedlotApi.assignBulk(feedlotId!, cowIds),
    onError: () => toast.error("Failed to assign cows"),
  });

  // Unassign bulk mutation
  const unassignMutation = useMutation({
    mutationFn: (cowIds: number[]) => feedlotApi.unassignBulk(cowIds),
    onError: () => toast.error("Failed to unassign cow(s)"),
  });

  // Combined handler - only invalidate once at the end
  const handleCowsConfirm = useCallback(
    async (toAssign: number[], toUnassign: number[]) => {
      try {
        if (toAssign.length > 0) {
          await assignBulkMutation.mutateAsync(toAssign);
        }
        if (toUnassign.length > 0) {
          await unassignMutation.mutateAsync(toUnassign);
        }
        invalidateAll();
        const parts: string[] = [];
        if (toAssign.length > 0) parts.push(`${toAssign.length} assigned`);
        if (toUnassign.length > 0)
          parts.push(`${toUnassign.length} unassigned`);
        toast.success(parts.join(", "));
      } catch {
        // Individual mutation error toasts already handle this
      }
    },
    [assignBulkMutation, unassignMutation, invalidateAll],
  );

  const handleUnassign = useCallback(
    (cowId: number) => {
      unassignMutation.mutate([cowId], {
        onSuccess: () => {
          invalidateAll();
          toast.success("Cow unassigned from feedlot");
        },
      });
    },
    [unassignMutation, invalidateAll],
  );

  const isPending = assignBulkMutation.isPending || unassignMutation.isPending;

  // Columns defined with useMemo - only recreated when isPending changes
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      }),
      columnHelper.accessor("tag", {
        header: "Tag",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("gender", {
        header: "Gender",
        cell: (info) => info.getValue() ?? "-",
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => {
          const role = info.getValue();
          if (!role) return "-";
          return <Badge variant="outline">{role}</Badge>;
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          if (!status) return "-";
          return <Badge variant="secondary">{status}</Badge>;
        },
      }),
      columnHelper.accessor("transponder", {
        header: "Transponder",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-muted-foreground">-</span>;
          return <Badge variant="destructive">{val}</Badge>;
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleUnassign(row.original.id)}
            disabled={isPending}
            title="Unassign from feedlot"
          >
            <X className="h-4 w-4" />
          </Button>
        ),
      }),
    ],
    [handleUnassign, isPending],
  );

  const table = useReactTable({
    data: cows,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feedlot Management</h1>
        <p className="text-muted-foreground">
          Assign and manage cows in feedlots
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-72">
          <Select
            value={selectedFeedlotId ?? ""}
            onValueChange={setUserSelectedId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a feedlot..." />
            </SelectTrigger>
            <SelectContent>
              {feedlotsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading feedlots...
                </SelectItem>
              ) : feedlots.length === 0 ? (
                <SelectItem value="empty" disabled>
                  No active feedlots
                </SelectItem>
              ) : (
                feedlots.map((feedlot: Feedlot) => (
                  <SelectItem key={feedlot.id} value={String(feedlot.id)}>
                    {feedlot.name} - {feedlot.remark}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {feedlotId !== null && (
        <Card>
          <CardHeader>
            <CardTitle>
              {feedlotWithCows?.name ?? "Loading..."} ({cows.length}{" "}
              {cows.length === 1 ? "cow" : "cows"})
              {isFetching && !cowsLoading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  Updating...
                </span>
              )}
            </CardTitle>
            <CardAction className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-60"
              />
              <Button
                onClick={() => setCowSelectOpen(true)}
                disabled={isPending}
              >
                <Plus className="mr-1 h-4 w-4" />
                Manage Cows
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {cowsLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading cows...
              </div>
            ) : (
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
                                  : flexRender(
                                      h.column.columnDef.header,
                                      h.getContext(),
                                    )}
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
                            No cows in this feedlot.
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
              </>
            )}
          </CardContent>
        </Card>
      )}

      {feedlotId === null && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Select a feedlot from the dropdown above to view and manage its
              cows.
            </p>
          </CardContent>
        </Card>
      )}

      <CowMultiSelectDialog
        open={cowSelectOpen}
        onOpenChange={setCowSelectOpen}
        onConfirm={handleCowsConfirm}
        currentFeedlotId={feedlotId ?? 0}
        currentCowIds={currentCowIds}
      />
    </div>
  );
}
