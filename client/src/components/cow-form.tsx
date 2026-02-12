import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formApi } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const cowFormSchema = z.object({
  tag: z.string().min(1, "Tag number is required"),
  genderId: z.string().min(1, "Gender is required"),
  roleId: z.string().min(1, "Role is required"),
  colorId: z.string().min(1, "Color is required"),
  dob: z.date({ error: "Date of birth is required" }),
  weight: z.string().optional(),
  statusId: z.string().min(1, "Status is required"),
  addBirthRecord: z.boolean(),
  damId: z.string().optional(),
  semenId: z.string().optional(),
  remark: z.string().optional(),
});

type CowFormData = z.infer<typeof cowFormSchema>;

export function CowForm() {
  const form = useForm<CowFormData>({
    resolver: zodResolver(cowFormSchema),
    defaultValues: {
      tag: "",
      genderId: "",
      roleId: "",
      colorId: "",
      dob: new Date(),
      weight: "",
      statusId: "",
      addBirthRecord: false,
      damId: "",
      semenId: "",
      remark: "",
    },
  });

  const watchGenderId = form.watch("genderId");
  const watchAddBirthRecord = form.watch("addBirthRecord");

  // Fetch genders
  const { data: genders, isLoading: gendersLoading } = useQuery({
    queryKey: ["form-cow-genders"],
    queryFn: () => formApi.getCowGenders().then((r) => r.data.data!),
  });

  // Fetch roles based on selected gender
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["form-cow-roles", watchGenderId],
    queryFn: () =>
      formApi
        .getCowRoles(parseInt(watchGenderId))
        .then((r) => r.data.data!),
    enabled: !!watchGenderId,
  });

  // Fetch colors
  const { data: colors, isLoading: colorsLoading } = useQuery({
    queryKey: ["form-colors"],
    queryFn: () => formApi.getColors().then((r) => r.data.data!),
  });

  // Fetch statuses
  const { data: statuses, isLoading: statusesLoading } = useQuery({
    queryKey: ["form-cow-statuses"],
    queryFn: () => formApi.getCowStatuses().then((r) => r.data.data!),
  });

  // Fetch dams (only when birth record toggle is on)
  const { data: dams, isLoading: damsLoading } = useQuery({
    queryKey: ["form-dams"],
    queryFn: () => formApi.getDams().then((r) => r.data.data!),
    enabled: watchAddBirthRecord,
  });

  // Fetch semen (only when birth record toggle is on)
  const { data: semenList, isLoading: semenLoading } = useQuery({
    queryKey: ["form-semen"],
    queryFn: () => formApi.getSemen().then((r) => r.data.data!),
    enabled: watchAddBirthRecord,
  });

  // Reset role when gender changes
  useEffect(() => {
    form.setValue("roleId", "");
  }, [watchGenderId, form]);

  const mutation = useMutation({
    mutationFn: (data: CowFormData) =>
      formApi.createCow({
        tag: data.tag,
        genderId: parseInt(data.genderId),
        roleId: parseInt(data.roleId),
        colorId: parseInt(data.colorId),
        dob: format(data.dob, "yyyy-MM-dd"),
        weight: data.weight ? parseFloat(data.weight) : null,
        statusId: parseInt(data.statusId),
        damId: data.addBirthRecord && data.damId ? parseInt(data.damId) : null,
        semenId:
          data.addBirthRecord && data.semenId
            ? parseInt(data.semenId)
            : null,
        remark: data.remark || "",
      }),
    onSuccess: () => {
      toast.success("Cow record created successfully");
      form.reset();
    },
    onError: () => {
      toast.error("Failed to create cow record");
    },
  });

  const onSubmit = (data: CowFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Cow Form</CardTitle>
          <CardDescription>
            Quick submission form for new cow records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Row 1: Tag */}
              <FormField
                control={form.control}
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

              {/* Row 2: Gender + Role */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="genderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4 pt-1"
                        >
                          {gendersLoading ? (
                            <span className="text-sm text-muted-foreground">Loading...</span>
                          ) : (
                            genders?.map((gender) => (
                              <div key={gender.id} className="flex items-center gap-2">
                                <RadioGroupItem
                                  value={String(gender.id)}
                                  id={`gender-${gender.id}`}
                                />
                                <Label htmlFor={`gender-${gender.id}`}>
                                  {gender.name}
                                </Label>
                              </div>
                            ))
                          )}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!watchGenderId}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                !watchGenderId
                                  ? "Select gender first"
                                  : "Select role"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rolesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            roles?.map((role) => (
                              <SelectItem
                                key={role.id}
                                value={String(role.id)}
                              >
                                {role.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 3: Color + DOB */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="colorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            colors?.map((color) => (
                              <SelectItem
                                key={color.id}
                                value={String(color.id)}
                              >
                                {color.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
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
              </div>

              {/* Row 4: Weight + Status */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Optional"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="statusId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            statuses?.map((status) => (
                              <SelectItem
                                key={status.id}
                                value={String(status.id)}
                              >
                                {status.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Toggle: Add Birth Record */}
              <FormField
                control={form.control}
                name="addBirthRecord"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>Add Birth Record</Label>
                    </div>
                  </FormItem>
                )}
              />

              {/* Conditional birth record fields */}
              {watchAddBirthRecord && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="damId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dam</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select dam" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {damsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading...
                              </SelectItem>
                            ) : (
                              dams?.map((dam) => (
                                <SelectItem
                                  key={dam.id}
                                  value={String(dam.id)}
                                >
                                  {dam.tag}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="semenId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semen</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select semen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {semenLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading...
                              </SelectItem>
                            ) : (
                              semenList?.map((semen) => (
                                <SelectItem
                                  key={semen.id}
                                  value={String(semen.id)}
                                >
                                  {semen.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

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
