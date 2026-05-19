import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
};

export function SearchInput({
  name = "q",
  defaultValue,
  placeholder = "Поиск",
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 pl-9 md:h-10"
      />
    </div>
  );
}
