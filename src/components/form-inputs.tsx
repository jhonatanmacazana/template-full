import { format } from "date-fns";
import { CalendarIcon, CheckIcon, ChevronDownIcon } from "lucide-react";
import React, { useId, useState } from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { validateEmailFormat, validatePhoneFormat } from "@/lib/validators";

export function ToggleButtonGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  options,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label: string;
  options: { label: string; value: string }[];
}) {
  const id = useId();
  return (
    <Controller
      {...props}
      //@ts-expect-error value type will always be string for this component
      defaultValue={props.defaultValue || options[0]?.value}
      render={({ field }) => (
        <div>
          <label
            className="mb-1 block text-[14px] leading-[22px] text-white/50 capitalize"
            htmlFor={id}
          >
            {label}
          </label>
          <div className="flex overflow-hidden border border-white/15">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => field.onChange(option.value)}
                id={id}
                className={cn(
                  "w-1/2 py-2 text-center text-[14px] font-medium transition-colors",
                  field.value === option.value
                    ? "bg-white/15 text-white"
                    : "bg-background text-white/50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    />
  );
}

export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  placeholder,
  disabled,
  type = "text",
  startAdornment,
  withValidation,
  leftIcon,
  rightIcon,
  isLeftIconButton = false,
  isRightIconButton = false,
  max,
  inputClassName,
  onBlur,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  startAdornment?: string;
  withValidation?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLeftIconButton?: boolean;
  isRightIconButton?: boolean;
  max?: string;
  inputClassName?: string;
  onBlur?: () => void;
}) {
  const shouldValidateEmail = type === "email" && withValidation;

  const withAdornment = !!startAdornment || shouldValidateEmail;

  return (
    <FormField
      {...props}
      render={({ field, formState }) => {
        const isValid = shouldValidateEmail && validateEmailFormat(field.value);

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            {withAdornment ? (
              <div className="relative">
                <FormControl>
                  <Input
                    className={cn("scheme-dark", startAdornment && "pl-8", inputClassName)}
                    data-error={!!formState.errors[props.name]}
                    placeholder={placeholder}
                    type={type}
                    max={max}
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                {startAdornment ? (
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    {startAdornment}
                  </span>
                ) : null}

                {isValid ? (
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <CheckIcon
                      className="bg-highlight-green-1/20 text-highlight-green-1 rounded-full p-[2px]"
                      size={20}
                    />
                  </span>
                ) : null}
              </div>
            ) : (
              <FormControl>
                <Input
                  className={`scheme-dark ${inputClassName}`}
                  data-error={!!formState.errors[props.name]}
                  placeholder={placeholder}
                  type={type}
                  max={max}
                  // leftIcon={leftIcon}
                  // rightIcon={rightIcon}
                  // isLeftIconButton={isLeftIconButton}
                  // isRightIconButton={isRightIconButton}
                  {...field}
                  onChange={(evt) => {
                    if (type === "number") field.onChange(evt.target.valueAsNumber);
                    else field.onChange(evt.target.value);
                  }}
                  onBlur={(evt) => {
                    field.onBlur();
                    onBlur?.();
                  }}
                  disabled={disabled}
                />
              </FormControl>
            )}

            <FormMessage className="font-normal" />
          </FormItem>
        );
      }}
    />
  );
}

export function FormTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  placeholder,
  disabled,
  inputClassName,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label: string;
  placeholder?: string;
  inputClassName?: string;
}) {
  return (
    <FormField
      {...props}
      render={({ field, formState }) => {
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Textarea
                className={`scheme-dark ${inputClassName}`}
                data-error={!!formState.errors[props.name]}
                placeholder={placeholder}
                {...field}
                disabled={disabled}
              />
            </FormControl>

            <FormMessage className="font-normal" />
          </FormItem>
        );
      }}
    />
  );
}

export function FormInputDate<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  placeholder,
  disabled,
  type = "text",
  startAdornment,
  withValidation,
  max,
  inputClassName,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  startAdornment?: string;
  withValidation?: boolean;
  max?: string;
  inputClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [navDate, setNavDate] = useState(selectedDate || new Date());

  return (
    <FormField
      {...props}
      render={({ field, formState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <div className="relative w-full">
                  <Input
                    {...field}
                    data-error={!!formState.errors[props.name]}
                    placeholder={placeholder}
                    className={cn(
                      "border-brand-white/30 placeholder:text-brand-white/50 w-full cursor-pointer rounded-none pl-3 text-left font-normal",
                      inputClassName,
                    )}
                    onChange={(evt) => {
                      const d = new Date(evt.target.value);
                      if (!isValidDate(d)) setSelectedDate(d);
                      field.onChange();
                    }}
                    value={formatDate(field.value)}
                  />
                  <CalendarIcon
                    fillOpacity={0.5}
                    className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="z-50 w-auto pt-0" align="center" side="right">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function formatDate(d: Date) {
  if (!d) return "";
  return format(d, "dd/MM/yyyy");
}
function isValidDate(d: Date | undefined) {
  if (!d) return false;
  return !Number.isNaN(d.getTime());
}

export function FormPhoneInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  placeholder,
  disabled,
  required,
  startAdornment,
  inputClassName,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label: string;
  placeholder?: string;
  startAdornment?: string;
  inputClassName?: string;
  required?: boolean;
}) {
  return (
    <FormField
      {...props}
      render={({ field, formState }) => {
        const isValidNumber = /^\(\d{3}\)\s?\d{3}-\d{4}$/.test(field.value || "");

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>

            <div className="relative">
              <FormControl>
                <Input
                  className={`placeholder:text-brand-white/50 scheme-dark ${inputClassName}`}
                  data-error={!!formState.errors[props.name]}
                  placeholder={placeholder}
                  maxLength={14}
                  pattern="^\(\d{3}\)\s?\d{3}-\d{4}$"
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                  value={field.value}
                  onChangeCapture={(evt) => {
                    const formattedValue = validatePhoneFormat(evt.currentTarget.value);
                    field.onChange(formattedValue);
                  }}
                  type="tel"
                  required={required}
                  disabled={disabled}
                />
              </FormControl>
              {field.value && isValidNumber && (
                <CheckIcon
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-[#53CF18]/20 p-[2px] text-[#53CF18]"
                  size={20}
                />
              )}
            </div>

            <FormMessage className="font-normal" />
          </FormItem>
        );
      }}
    />
  );
}

export function FormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  options,
  label,
  placeholder,
  disabled,
  className,
  onValueChange,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  options: { value: string; label: React.ReactNode }[];
  label: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}) {
  return (
    <FormField
      {...props}
      render={({ field, formState }) => (
        <FormItem className={className}>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger data-error={!!formState.errors[props.name]}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[50vh]">
              {options.length === 0 && (
                <div className="mx-auto max-w-[60%] text-center text-sm text-white/40">
                  There are no options
                </div>
              )}
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormMessage className="font-normal" />
        </FormItem>
      )}
    />
  );
}

export function FormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  labelClassName,
  disabled,
  allowIndeterminate = false,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label: string;
  labelClassName?: string;
  disabled?: boolean;
  allowIndeterminate?: boolean;
}) {
  const getNextCheckboxValue = (current: boolean | null): boolean | null => {
    if (!allowIndeterminate) return !(current ?? false);

    if (current === null) return true;
    if (current === true) return false;
    return null;
  };

  return (
    <FormField
      {...props}
      render={({ field }) => {
        return (
          <FormItem className="flex flex-row items-center gap-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={() => field.onChange(getNextCheckboxValue(field.value))}
                disabled={disabled}
              />
            </FormControl>

            <FormLabel
              className={cn(
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                labelClassName,
              )}
            >
              {label}
            </FormLabel>

            <FormMessage className="font-normal" />
          </FormItem>
        );
      }}
    />
  );
}

export function FormSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  labelClassName,
  disabled,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  label: string;
  labelClassName?: string;
}) {
  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center gap-x-2">
          <FormControl>
            <Switch
              className="peer"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>

          <FormLabel
            className={cn(
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              labelClassName,
            )}
          >
            {label}
          </FormLabel>

          <FormMessage className="font-normal" />
        </FormItem>
      )}
    />
  );
}

/**
 * This is a multi-select with tags. It will only work if the value is a string array
 */
export function FormMultiSelectTags<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  options,
  label,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  options: { value: string; label: React.ReactNode }[];
  label: string;
}) {
  return (
    <FormField
      {...props}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>

          <div className="flex flex-wrap gap-x-2 gap-y-3">
            {options.map((item) => (
              <FormField
                key={item.value}
                control={props.control}
                name={props.name}
                render={({ field }) => {
                  const isActive = field.value?.includes(item.value);
                  return (
                    <FormItem
                      key={item.value}
                      className={cn(
                        "flex flex-row items-center gap-x-1 gap-y-0 rounded-2xl border border-input px-3 py-1",
                        isActive && "bg-input",
                      )}
                    >
                      <FormControl>
                        <Checkbox
                          className={cn(
                            "border-0 text-white/50 data-[state=checked]:bg-transparent",
                            !isActive && "hidden",
                          )}
                          checked={isActive}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, item.value])
                              : field.onChange(
                                  // @ts-expect-error we know this is a string array
                                  field.value?.filter((value) => value !== item.value),
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-white/90 hover:cursor-pointer">
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>

          <FormMessage className="font-normal" />
        </FormItem>
      )}
    />
  );
}

export function FormMultiSelect<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  options,
  label,
  placeholder = "",
  disabled,
  ...props
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & {
  options: { value: string; label: React.ReactNode }[];
  label: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      {...props}
      render={({ field }) => {
        const selected: string[] = field.value || [];

        const toggleValue = (value: string) => {
          const newValue = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value];
          field.onChange(newValue);
        };

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div
                  role="combobox"
                  aria-expanded={open}
                  tabIndex={0}
                  className="focus-visible:ring-cerulean-blue-1 flex h-10 w-full cursor-pointer items-center justify-between rounded-none border border-white/30 bg-transparent px-3 py-2 text-white hover:bg-transparent focus:outline-none focus-visible:ring-1"
                >
                  {selected.length > 0 ? (
                    options
                      .filter((opt) => selected.includes(opt.value))
                      .map((opt) => opt.label)
                      .join(", ")
                  ) : (
                    <span className="text-white/50">{placeholder}</span>
                  )}

                  <ChevronDownIcon
                    className={cn(
                      "size-4",
                      open || selected.length > 0 ? "text-white" : "text-white/50",
                      open && "rotate-180",
                    )}
                  />
                </div>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                sideOffset={4}
                className="px-0 py-4"
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <div className="flex max-h-60 flex-col overflow-auto">
                  {options.map((opt) => {
                    const isChecked = selected.includes(opt.value);

                    return (
                      <div
                        key={opt.value}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleValue(opt.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            toggleValue(opt.value);
                          }
                        }}
                        className={cn(
                          "flex h-10 w-full cursor-pointer items-center gap-2 px-4 transition-colors",
                          "hover:bg-white/5 focus:outline-none",
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleValue(opt.value)}
                          className="pointer-events-none"
                        />
                        <span className="text-base leading-5 font-normal">{opt.label}</span>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
