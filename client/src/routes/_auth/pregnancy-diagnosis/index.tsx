import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
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
import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import { Pencil } from "lucide-react";
import { colorBtnMap } from "@/components/ui/color-picker";
import { toast } from "sonner";
import {
  pregnancyDiagnosisApi,
  pdStatusApi,
  inseminatorApi,
  systemSettingApi,
  colorApi,
  feedlotApi,
  cowGenderApi,
} from "@/lib/api";
import type { PregnancyDiagnosis, RegisterCalfData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export const Route = createFileRoute("/_auth/pregnancy-diagnosis/")({
  component: PregnancyDiagnosisPage,
});

const columnHelper = createColumnHelper<PregnancyDiagnosis>();

const linkClass = "text-primary underline";

const calfSchema = z.object({
  tag: z.string().min(1, "Tag is required"),
  genderId: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),
  weight: z.string(),
  colorId: z.string().min(1, "Color is required"),
  feedlotId: z.string(),
  remark: z.string(),
});

type CalfFormValues = z.infer<typeof calfSchema>;

function PregnancyDiagnosisPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [calfDialogOpen, setCalfDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<PregnancyDiagnosis | null>(null);
  const [selectedDiagnosisById, setSelectedDiagnosisById] = useState("");
  const [selectedPdStatusId, setSelectedPdStatusId] = useState("");
  const qc = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["pregnancy-diagnosis"],
    queryFn: async () => {
      const res = await pregnancyDiagnosisApi.getAll();
      return res.data.data ?? [];
    },
  });

  const { data: pdStatuses = [] } = useQuery({
    queryKey: ["pd-statuses"],
    queryFn: async () => {
      const res = await pdStatusApi.getAll();
      return res.data.data ?? [];
    },
  });

  const { data: inseminators = [] } = useQuery({
    queryKey: ["inseminators"],
    queryFn: async () => {
      const res = await inseminatorApi.getAll();
      return res.data.data ?? [];
    },
  });

  const { data: systemSettings = [] } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const res = await systemSettingApi.getAll();
      return res.data.data ?? [];
    },
  });

  const { data: colors = [] } = useQuery({
    queryKey: ["colors"],
    queryFn: async () => {
      const res = await colorApi.getAll();
      return res.data.data ?? [];
    },
  });

  const { data: feedlots = [] } = useQuery({
    queryKey: ["feedlots"],
    queryFn: async () => {
      const res = await feedlotApi.getAll();
      return res.data.data ?? [];
    },
  });

  const { data: genders = [] } = useQuery({
    queryKey: ["cow-genders"],
    queryFn: async () => {
      const res = await cowGenderApi.getAll();
      return res.data.data ?? [];
    },
  });

  const pdDaySetting = systemSettings.find((s) => s.id === 1);
  const pdDayTotal = pdDaySetting ? parseInt(pdDaySetting.value) : 0;
  const pregnantDaySetting = systemSettings.find((s) => s.id === 2);
  const pregnantDayTotal = pregnantDaySetting
    ? parseInt(pregnantDaySetting.value)
    : 0;

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { diagnosisById: number; pdStatusId: number };
    }) => pregnancyDiagnosisApi.updateStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pregnancy-diagnosis"] });
      toast.success("Status updated");
      setStatusDialogOpen(false);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const calfForm = useForm<CalfFormValues>({
    resolver: zodResolver(calfSchema),
    defaultValues: {
      tag: "",
      genderId: "",
      dob: format(new Date(), "yyyy-MM-dd"),
      weight: "",
      colorId: "",
      feedlotId: "",
      remark: "",
    },
  });

  const calfMutation = useMutation({
    mutationFn: ({ pdId, data }: { pdId: number; data: RegisterCalfData }) =>
      pregnancyDiagnosisApi.registerCalf(pdId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pregnancy-diagnosis"] });
      qc.invalidateQueries({ queryKey: ["calf-records"] });
      toast.success("Calf registered successfully");
      setCalfDialogOpen(false);
    },
    onError: () => toast.error("Failed to register calf"),
  });

  const handleStatusButtonClick = (record: PregnancyDiagnosis) => {
    const statusId = record.pdStatusId;
    if (statusId === 5) {
      setSelectedRecord(record);
      calfForm.reset({
        tag: "",
        genderId: "",
        dob: format(new Date(), "yyyy-MM-dd"),
        weight: "",
        colorId: "",
        feedlotId: "",
        remark: "",
      });
      setCalfDialogOpen(true);
    } else {
      handlePdStatusClick(record);
    }
  };

  const handlePdStatusClick = (record: PregnancyDiagnosis) => {
    setSelectedRecord(record);
    setSelectedDiagnosisById("");
    setSelectedPdStatusId("");
    setStatusDialogOpen(true);
  };

  const handleStatusSubmit = () => {
    if (!selectedRecord || !selectedDiagnosisById || !selectedPdStatusId)
      return;
    statusMutation.mutate({
      id: selectedRecord.id,
      data: {
        diagnosisById: parseInt(selectedDiagnosisById),
        pdStatusId: parseInt(selectedPdStatusId),
      },
    });
  };

  const handleCalfSubmit = (data: CalfFormValues) => {
    if (!selectedRecord) return;
    const payload: RegisterCalfData = {
      tag: data.tag,
      genderId: parseInt(data.genderId),
      dob: data.dob,
      weight: data.weight ? parseFloat(data.weight) : null,
      colorId: parseInt(data.colorId),
      feedlotId: data.feedlotId ? parseInt(data.feedlotId) : null,
      remark: data.remark,
    };
    calfMutation.mutate({ pdId: selectedRecord.id, data: payload });
  };

  const columns = [
    columnHelper.display({
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor("aiRecordCode", {
      header: "AI Record",
      cell: (info) => {
        const code = info.getValue();
        const id = info.row.original.aiRecordId;
        if (!code) return "-";
        return (
          <Link to={`/ai-records/${id}`} className={linkClass}>
            {code}
          </Link>
        );
      },
    }),
    columnHelper.accessor("aiDate", {
      header: "AI Date",
      cell: (info) => {
        const val = info.getValue();
        if (!val) return "-";
        const date = new Date(val);
        return (
          <div>
            {date.toLocaleDateString()}
            <span className="block text-xs text-muted-foreground">
              {formatDistanceToNow(date, { addSuffix: true })}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const isPending = row.original.pdStatusId === 1;
        const isPregnant = row.original.pdStatusId === 3 || row.original.pdStatusId === 5;
        const dateVal = isPregnant
          ? row.original.pregnantDate
          : row.original.aiDate;
        const totalDays = isPregnant ? pregnantDayTotal : pdDayTotal;
        if (!dateVal || !totalDays) return "-";
        const days = differenceInDays(new Date(), new Date(dateVal));
        const pct = Math.min(Math.round((days / totalDays) * 100), 100);
        return (
          <div className="min-w-24">
            <Progress
              value={pct}
              className="h-2"
              indicatorClassName={isPending ? "bg-yellow-500" : undefined}
            />
            <span className="text-xs text-muted-foreground">
              {days}/{totalDays} days
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("diagnosisBy", {
      header: "Diagnosis By",
      cell: (info) => info.getValue() ?? "-",
    }),
    columnHelper.display({
      id: "pdStatus",
      header: "PD Status",
      cell: ({ row }) => {
        const { pdStatusId, pdStatusName, pdStatusColor } = row.original;
        const isEnabled = pdStatusId === 1 || pdStatusId === 5;
        const colorClass = pdStatusColor ? colorBtnMap[pdStatusColor] : "";
        return (
          <Button
            size="sm"
            variant={pdStatusColor ? "default" : "outline"}
            className={"h-auto px-2 py-1 " + colorClass}
            disabled={!isEnabled}
            onClick={() => handleStatusButtonClick(row.original)}
          >
            {pdStatusName ?? "-"}
          </Button>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePdStatusClick(info.row.original)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: records,
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
        <h1 className="text-3xl font-bold">Pregnancy Diagnosis</h1>
        <p className="text-muted-foreground">
          Manage pregnancy diagnosis records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pregnancy Diagnosis List</CardTitle>
          <CardAction className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-60"
            />
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
                      No records found.
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

      {/* PD Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update PD Status - {selectedRecord?.aiRecordCode ?? ""}
            </DialogTitle>
            <DialogDescription>
              Update the diagnosis details for this pregnancy diagnosis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Diagnosis By</Label>
              <Select
                value={selectedDiagnosisById}
                onValueChange={setSelectedDiagnosisById}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select inseminator..." />
                </SelectTrigger>
                <SelectContent>
                  {inseminators
                    .filter((i) => i.active !== false)
                    .map((i) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>PD Status</Label>
              <Select
                value={selectedPdStatusId}
                onValueChange={setSelectedPdStatusId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {pdStatuses
                    .filter((s) => {
                      if (s.active === false) return false;
                      const currentId = selectedRecord?.pdStatusId;
                      if (currentId === 1) {
                        return s.id === 3 || s.id === 4;
                      }
                      return s.id !== 1 && s.id !== 3 && s.id !== 4;
                    })
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                statusMutation.isPending ||
                !selectedDiagnosisById ||
                !selectedPdStatusId
              }
              onClick={handleStatusSubmit}
            >
              {statusMutation.isPending ? "Saving..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calf Registration Dialog */}
      <Dialog open={calfDialogOpen} onOpenChange={setCalfDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Register Calf - {selectedRecord?.aiRecordCode ?? ""}
            </DialogTitle>
            <DialogDescription>
              Register a new calf from this pregnancy diagnosis.
            </DialogDescription>
          </DialogHeader>
          <Form {...calfForm}>
            <form
              onSubmit={calfForm.handleSubmit(handleCalfSubmit)}
              className="space-y-4"
            >
              <FormField
                control={calfForm.control}
                name="tag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tag number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={calfForm.control}
                name="genderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-4"
                      >
                        {genders
                          .filter((g) => g.active !== false)
                          .map((g) => (
                            <div
                              key={g.id}
                              className="flex items-center gap-2"
                            >
                              <RadioGroupItem
                                value={g.id.toString()}
                                id={`gender-${g.id}`}
                              />
                              <Label htmlFor={`gender-${g.id}`}>
                                {g.name}
                              </Label>
                            </div>
                          ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Dam</Label>
                  <Input
                    value={selectedRecord?.damTag ?? "-"}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Semen</Label>
                  <Input
                    value={selectedRecord?.semenName ?? "-"}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <FormField
                control={calfForm.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={calfForm.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter weight"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={calfForm.control}
                name="colorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select color..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors
                          .filter((c) => c.active !== false)
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={calfForm.control}
                name="feedlotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedlot</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select feedlot (optional)..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {feedlots
                          .filter((f) => f.active !== false)
                          .map((f) => (
                            <SelectItem key={f.id} value={f.id.toString()}>
                              {f.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={calfForm.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remark</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter remark (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCalfDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={calfMutation.isPending}>
                  {calfMutation.isPending ? "Registering..." : "Register Calf"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
