import {
  WISHLIST_PRIORITY_DEFAULT,
  WISHLIST_PRIORITY_LABELS,
  WISHLIST_PRIORITY_OPTIONS,
} from "@/lib/wishlist";

type PrioritySelectProps = {
  id: string;
  name?: string;
  defaultValue?: number;
  className?: string;
  required?: boolean;
};

export function PrioritySelect({
  id,
  name = "priority",
  defaultValue = WISHLIST_PRIORITY_DEFAULT,
  className,
  required = true,
}: PrioritySelectProps) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
      required={required}
      className={className}
    >
      {WISHLIST_PRIORITY_OPTIONS.map((priority) => (
        <option key={priority} value={priority}>
          {WISHLIST_PRIORITY_LABELS[priority]}
        </option>
      ))}
    </select>
  );
}
