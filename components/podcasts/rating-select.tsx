import { Select } from "@/components/ui/select";

export function RatingSelect({ defaultValue }: { defaultValue?: number | null }) {
  return (
    <div>
      <Select name="personalRating" defaultValue={defaultValue?.toString() ?? ""}>
        <option value="">Без рейтинга</option>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
          <option key={rating} value={rating}>
            {rating}/10
          </option>
        ))}
      </Select>
    </div>
  );
}
