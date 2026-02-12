import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { CowView } from "@/lib/types";
import { cowApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface CowMultiSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (toAssign: number[], toUnassign: number[]) => void;
  currentFeedlotId: number;
  currentCowIds: number[];
}

const columnHelper = createColumnHelper<CowView>();

export function CowMultiSelectDialog({
  open,
  onOpenChange,
  onConfirm,
  currentCowIds,
}: CowMultiSelectDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  // Track the snapshot of currentCowIds when dialog opened
  const initialCowIdsRef = useRef<Set<number>>(new Set());

  const { data: cows = [], isLoading } = useQuery({
    queryKey: ["cows"],
    queryFn: async () => {
      const res = await cowApi.getAll();
      return res.data.data ?? [];
    },
    enabled: open,
  });

  // Bug fix #2: Use useEffect to properly initialize selectedIds when dialog opens.
  // The previous approach relied on onOpenChange (which only fires on user-initiated
  // changes) and a render-time ref check (which can't call setState). This effect
  // watches the `open` prop directly and initializes state when it becomes true.
  useEffect(() => {
    if (open) {
      const snapshot = new Set(currentCowIds);
      initialCowIdsRef.current = snapshot;
      setSelectedIds(new Set(snapshot));
      setSearch("");
    }
  }, [open, currentCowIds]);

  // Use the snapshot for diff comparison, not the live prop
  const currentCowIdSet = initialCowIdsRef.current;

  const filteredCows = useMemo(() => {
    if (!search.trim()) return cows;
    const term = search.toLowerCase();
    return cows.filter(
      (cow) =>
        cow.tag?.toLowerCase().includes(term) ||
        cow.gender?.toLowerCase().includes(term) ||
        cow.role?.toLowerCase().includes(term) ||
        cow.status?.toLowerCase().includes(term) ||
        cow.feedlot?.toLowerCase().includes(term) ||
        cow.transponder?.toLowerCase().includes(term)
    );
  }, [cows, search]);

  // Compute diff against the snapshot, not the live prop
  const toAssign = useMemo(() => {
    return [...selectedIds].filter((id) => !currentCowIdSet.has(id));
  }, [selectedIds, currentCowIdSet]);

  const toUnassign = useMemo(() => {
    return [...currentCowIdSet].filter((id) => !selectedIds.has(id));
  }, [selectedIds, currentCowIdSet]);

  const hasChanges = toAssign.length > 0 || toUnassign.length > 0;

  const allFilteredSelected =
    filteredCows.length > 0 &&
    filteredCows.every((c) => selectedIds.has(c.id));

  const someFilteredSelected =
    filteredCows.some((c) => selectedIds.has(c.id)) && !allFilteredSelected;

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const c of filteredCows) next.delete(c.id);
      } else {
        for (const c of filteredCows) next.add(c.id);
      }
      return next;
    });
  }, [allFilteredSelected, filteredCows]);

  const handleToggle = useCallback((cowId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cowId)) {
        next.delete(cowId);
      } else {
        next.add(cowId);
      }
      return next;
    });
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: "#",
        cell: ({ row }) => row.index + 1,
      }),
      columnHelper.accessor("tag", {
        header: "Tag",
        cell: (info) => (
          <span className="font-medium">{info.getValue()}</span>
        ),
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
      columnHelper.accessor("feedlot", {
        header: "Feedlot",
        cell: (info) => {
          const val = info.getValue();
          if (!val) return <span className="text-muted-foreground">-</span>;
          return <Badge variant="outline">{val}</Badge>;
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredCows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const handleClose = () => {
    setSearch("");
    setSelectedIds(new Set());
    onOpenChange(false);
  };

  const handleConfirmClick = () => {
    onConfirm(toAssign, toUnassign);
    handleClose();
  };

  // Build button label
  const buttonLabel = useMemo(() => {
    if (!hasChanges) return "No Changes";
    const parts: string[] = [];
    if (toAssign.length > 0) parts.push(`${toAssign.length} assign`);
    if (toUnassign.length > 0) parts.push(`${toUnassign.length} unassign`);
    return `Apply Changes (${parts.join(", ")})`;
  }, [hasChanges, toAssign.length, toUnassign.length]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Feedlot Cows</DialogTitle>
          <DialogDescription>
            Check cows to assign them to this feedlot. Uncheck cows to remove
            them.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search by tag, gender, role, status, feedlot, or transponder..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="rounded-md border overflow-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading cows...
            </div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          allFilteredSelected
                            ? true
                            : someFilteredSelected
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder
                          ? null
                          : flexRender(
                              h.column.columnDef.header,
                              h.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => {
                    const cow = row.original;
                    const isChecked = selectedIds.has(cow.id);
                    const wasInFeedlot = currentCowIdSet.has(cow.id);
                    const isNewAssign = isChecked && !wasInFeedlot;
                    const isUnassign = !isChecked && wasInFeedlot;
                    return (
                      <TableRow
                        key={row.id}
                        className={cn(
                          "cursor-pointer",
                          isNewAssign && "bg-green-500/10",
                          isUnassign && "bg-red-500/10",
                          isChecked &&
                            !isNewAssign &&
                            !isUnassign &&
                            "bg-primary/5"
                        )}
                        onClick={() => handleToggle(cow.id)}
                      >
                        <TableCell className="w-10">
                          {/* Bug fix #1: stopPropagation prevents the row onClick
                              from also firing, which caused a double-toggle
                              (toggle on then immediately off). */}
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggle(cow.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${cow.tag}`}
                          />
                        </TableCell>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center"
                    >
                      No cows found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        <div className="flex items-center justify-between">
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
            <span className="text-sm text-muted-foreground self-center">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmClick}
              disabled={!hasChanges}
            >
              {buttonLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
