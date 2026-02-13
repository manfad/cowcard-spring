import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiRecordApi, formApi, inseminatorApi } from "@/lib/api";
import { toast } from "sonner";
import { format, formatDate } from "date-fns";
import { AlertTriangle, CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const aiRecordFormSchema = z.object({
  aiDate: z.date({ error: "AI date is required" }),
  aiTime: z.string().min(1, "AI time is required"),
  damId: z.string().min(1, "Dam is required"),
  semenId: z.string().min(1, "Semen is required"),
  aiById: z.string().min(1, "AI by is required"),
  preparedById: z.string().min(1, "Prepared by is required"),
  remark: z.string().optional(),
});

type AiRecordFormValues = z.infer<typeof aiRecordFormSchema>;

export function AiRecordForm() {
  const queryClient = useQueryClient();
  const [damOpen, setDamOpen] = useState(false);
  const [semenOpen, setSemenOpen] = useState(false);
  const [aiByOpen, setAiByOpen] = useState(false);
  const [preparedByOpen, setPreparedByOpen] = useState(false);

  const form = useForm<AiRecordFormValues>({
    resolver: zodResolver(aiRecordFormSchema),
    defaultValues: {
      aiDate: new Date(),
      aiTime: formatDate(new Date(), "HH:mm"),
      damId: "",
      semenId: "",
      aiById: "",
      preparedById: "",
      remark: "",
    },
  });

  // Fetch next code
  const { data: nextCode } = useQuery({
    queryKey: ["ai-record-next-code"],
    queryFn: () => aiRecordApi.getNextCode().then((r) => r.data.data!),
  });

  // Fetch dams
  const { data: dams = [] } = useQuery({
    queryKey: ["form-dams"],
    queryFn: () => formApi.getDams().then((r) => r.data.data!),
  });

  // Fetch semen
  const { data: semenList = [] } = useQuery({
    queryKey: ["form-semen"],
    queryFn: () => formApi.getSemen().then((r) => r.data.data!),
  });

  // Fetch inseminators
  const { data: inseminators = [] } = useQuery({
    queryKey: ["inseminators"],
    queryFn: () => inseminatorApi.getAll().then((r) => r.data.data!),
  });

  // Fetch dam's non-bull AI count when dam is selected
  const selectedDamId = form.watch("damId");
  const { data: damAiCount } = useQuery({
    queryKey: ["dam-ai-count", selectedDamId],
    queryFn: () =>
      aiRecordApi
        .getDamAiCount(parseInt(selectedDamId))
        .then((r) => r.data.data!),
    enabled: !!selectedDamId,
  });

  // Filter semen: bull-only when dam has >= 3 non-bull AI records
  const bullOnly = damAiCount != null && damAiCount >= 3;
  const filteredSemenList = bullOnly
    ? semenList.filter((s) => s.bull === true)
    : semenList;

  const mutation = useMutation({
    mutationFn: (data: AiRecordFormValues) =>
      aiRecordApi.create({
        damId: parseInt(data.damId),
        semenId: parseInt(data.semenId),
        aiDate: format(data.aiDate, "yyyy-MM-dd"),
        aiTime: data.aiTime,
        aiById: parseInt(data.aiById),
        preparedById: parseInt(data.preparedById),
        remark: data.remark || "",
      }),
    onSuccess: () => {
      toast.success("AI record created successfully");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["ai-records"] });
      queryClient.invalidateQueries({ queryKey: ["ai-record-next-code"] });
    },
    onError: () => {
      toast.error("Failed to create AI record");
    },
  });

  const onSubmit = (data: AiRecordFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">AI Record Form</CardTitle>
          <CardDescription>
            Record a new artificial insemination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* AI Code (readonly) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Code</label>
                <Input
                  value={nextCode ?? "Loading..."}
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* AI Date + AI Time (side by side) */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="aiDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, "dd/MM/yyyy")
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aiTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dam (Combobox) + Feedlot (auto-filled) */}
              <div className="grid grid-cols-[1fr_30%] gap-4">
                <FormField
                  control={form.control}
                  name="damId"
                  render={({ field }) => {
                    const selectedDam = dams.find((d) => String(d.id) === field.value);
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Dam</FormLabel>
                        <Popover open={damOpen} onOpenChange={setDamOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={damOpen}
                                className={cn(
                                  "w-full justify-between font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {selectedDam?.tag ?? "Select dam..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search dam..." />
                              <CommandList>
                                <CommandEmpty>No dam found.</CommandEmpty>
                                <CommandGroup>
                                  {dams.map((dam) => (
                                    <CommandItem
                                      key={dam.id}
                                      value={dam.tag}
                                      onSelect={() => {
                                        field.onChange(String(dam.id));
                                        form.setValue("semenId", "");
                                        setDamOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === String(dam.id) ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {dam.tag}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormItem>
                  <FormLabel>Feedlot</FormLabel>
                  <Input
                    value={
                      dams.find((d) => String(d.id) === form.watch("damId"))
                        ?.currentFeedlot?.name ?? ""
                    }
                    disabled
                    placeholder="-"
                    className="bg-muted"
                  />
                </FormItem>
              </div>

              {/* Semen (Combobox) */}
              <FormField
                control={form.control}
                name="semenId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Semen</FormLabel>
                    <Popover open={semenOpen} onOpenChange={setSemenOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={semenOpen}
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? semenList.find((s) => String(s.id) === field.value)?.name
                              : "Select semen..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search semen..." />
                          <CommandList>
                            <CommandEmpty>No semen found.</CommandEmpty>
                            <CommandGroup>
                              {filteredSemenList.map((semen) => (
                                <CommandItem
                                  key={semen.id}
                                  value={semen.name}
                                  onSelect={() => {
                                    field.onChange(String(semen.id));
                                    setSemenOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === String(semen.id) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {semen.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {bullOnly && (
                      <p className="flex items-center gap-1 text-sm text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        This dam has {damAiCount} AI records — only bull semen
                        is available.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AI By + Prepared By (side by side, Combobox) */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="aiById"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>AI By</FormLabel>
                      <Popover open={aiByOpen} onOpenChange={setAiByOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={aiByOpen}
                              className={cn(
                                "w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span className="truncate">
                                {field.value
                                  ? inseminators.find((i) => String(i.id) === field.value)?.name
                                  : "Select..."}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search..." />
                            <CommandList>
                              <CommandEmpty>No inseminator found.</CommandEmpty>
                              <CommandGroup>
                                {inseminators.map((ins) => (
                                  <CommandItem
                                    key={ins.id}
                                    value={ins.name}
                                    onSelect={() => {
                                      field.onChange(String(ins.id));
                                      setAiByOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === String(ins.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {ins.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preparedById"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Prepared By</FormLabel>
                      <Popover open={preparedByOpen} onOpenChange={setPreparedByOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={preparedByOpen}
                              className={cn(
                                "w-full justify-between font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span className="truncate">
                                {field.value
                                  ? inseminators.find((i) => String(i.id) === field.value)?.name
                                  : "Select..."}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search..." />
                            <CommandList>
                              <CommandEmpty>No inseminator found.</CommandEmpty>
                              <CommandGroup>
                                {inseminators.map((ins) => (
                                  <CommandItem
                                    key={ins.id}
                                    value={ins.name}
                                    onSelect={() => {
                                      field.onChange(String(ins.id));
                                      setPreparedByOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === String(ins.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {ins.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Remark */}
              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remark</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Optional remark"
                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-full min-h-[80px] rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
