import { useState, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface CowSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (cow: CowView) => void;
}

const columnHelper = createColumnHelper<CowView>();

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
];

export function CowSelectDialog({
  open,
  onOpenChange,
  onSelect,
}: CowSelectDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedCowId, setSelectedCowId] = useState<number | null>(null);
  const [confirmCow, setConfirmCow] = useState<CowView | null>(null);

  const { data: cows = [], isLoading } = useQuery({
    queryKey: ["cows"],
    queryFn: async () => {
      const res = await cowApi.getAll();
      return res.data.data ?? [];
    },
    enabled: open,
  });

  const filteredCows = useMemo(() => {
    if (!search.trim()) return cows;
    const term = search.toLowerCase();
    return cows.filter(
      (cow) =>
        cow.tag?.toLowerCase().includes(term) ||
        cow.gender?.toLowerCase().includes(term) ||
        cow.role?.toLowerCase().includes(term) ||
        cow.status?.toLowerCase().includes(term)
    );
  }, [cows, search]);

  const table = useReactTable({
    data: filteredCows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const selectedCow =
    filteredCows.find((c) => c.id === selectedCowId) ?? null;

  const handleConfirm = () => {
    if (selectedCow) {
      if (selectedCow.transponder) {
        setConfirmCow(selectedCow);
      } else {
        onSelect(selectedCow);
        handleClose();
      }
    }
  };

  const handleConfirmAssign = () => {
    if (confirmCow) {
      onSelect(confirmCow);
      setConfirmCow(null);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearch("");
    setSelectedCowId(null);
    setConfirmCow(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Cow</DialogTitle>
          <DialogDescription>
            Search and select a cow to assign to this transponder.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search by tag, gender, role, or status..."
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "cursor-pointer",
                        row.original.id === selectedCowId && "bg-primary/10"
                      )}
                      onClick={() => setSelectedCowId(row.original.id)}
                      onDoubleClick={() => {
                        if (row.original.transponder) {
                          setSelectedCowId(row.original.id);
                          setConfirmCow(row.original);
                        } else {
                          onSelect(row.original);
                          handleClose();
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
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
              onClick={handleConfirm}
              disabled={selectedCowId === null}
            >
              Select
            </Button>
          </div>
        </div>
      </DialogContent>

      <AlertDialog
        open={confirmCow !== null}
        onOpenChange={(alertOpen) => {
          if (!alertOpen) setConfirmCow(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cow Already Assigned</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmCow?.tag} is currently assigned to transponder{" "}
              {confirmCow?.transponder}. Selecting this cow will reassign it.
              Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAssign}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
