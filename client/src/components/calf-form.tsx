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
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const calfFormSchema = z.object({
  tag: z.string().min(1, "Tag number is required"),
  genderId: z.string().min(1, "Gender is required"),
  damId: z.string().optional(),
  semenId: z.string().optional(),
  dob: z.date({ required_error: "Date of birth is required" }),
  weight: z.string().optional(),
  colorId: z.string().min(1, "Color is required"),
  remark: z.string().optional(),
});

type CalfFormData = z.infer<typeof calfFormSchema>;

export function CalfForm() {
  const form = useForm<CalfFormData>({
    resolver: zodResolver(calfFormSchema),
    defaultValues: {
      tag: "",
      genderId: "",
      damId: "",
      semenId: "",
      dob: new Date(),
      weight: "",
      colorId: "",
      remark: "",
    },
  });

  // Fetch genders
  const { data: genders, isLoading: gendersLoading } = useQuery({
    queryKey: ["form-cow-genders"],
    queryFn: () => formApi.getCowGenders().then((r) => r.data.data!),
  });

  // Fetch dams
  const { data: dams, isLoading: damsLoading } = useQuery({
    queryKey: ["form-dams"],
    queryFn: () => formApi.getDams().then((r) => r.data.data!),
  });

  // Fetch semen
  const { data: semenList, isLoading: semenLoading } = useQuery({
    queryKey: ["form-semen"],
    queryFn: () => formApi.getSemen().then((r) => r.data.data!),
  });

  // Fetch colors
  const { data: colors, isLoading: colorsLoading } = useQuery({
    queryKey: ["form-colors"],
    queryFn: () => formApi.getColors().then((r) => r.data.data!),
  });

  const mutation = useMutation({
    mutationFn: (data: CalfFormData) =>
      formApi.createCalf({
        tag: data.tag,
        genderId: parseInt(data.genderId),
        damId: data.damId ? parseInt(data.damId) : null,
        semenId: data.semenId ? parseInt(data.semenId) : null,
        dob: format(data.dob, "yyyy-MM-dd"),
        weight: data.weight ? parseFloat(data.weight) : null,
        colorId: parseInt(data.colorId),
        remark: data.remark || "",
      }),
    onSuccess: () => {
      toast.success("Calf record created successfully");
      form.reset();
    },
    onError: () => {
      toast.error("Failed to create calf record");
    },
  });

  const onSubmit = (data: CalfFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Calf Form</CardTitle>
          <CardDescription>
            Quick submission form for new calf records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Tag */}
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

              {/* Gender */}
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
                        className="flex gap-4"
                      >
                        {genders?.map((gender) => (
                          <div
                            key={gender.id}
                            className="flex items-center gap-2"
                          >
                            <RadioGroupItem
                              value={String(gender.id)}
                              id={`gender-${gender.id}`}
                            />
                            <Label htmlFor={`gender-${gender.id}`}>
                              {gender.name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dam */}
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

              {/* Semen */}
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

              {/* DOB */}
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

              {/* Weight */}
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

              {/* Color */}
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
