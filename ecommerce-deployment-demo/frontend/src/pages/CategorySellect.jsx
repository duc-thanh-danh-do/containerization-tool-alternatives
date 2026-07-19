import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategorySelect({ categories = [], category, setCategory }) {
  return (
    <Select value={category} onValueChange={setCategory}>
      <SelectTrigger className="w-full max-w-xs rounded-full bg-background text-foreground shadow-sm">
        <SelectValue placeholder="All categories" />
      </SelectTrigger>

      <SelectContent className="max-h-72 rounded-xl border border-border bg-card shadow-lg">
        {categories.map((cat) => (
          <SelectItem key={cat} value={cat}>
            {cat === "all"
              ? "All categories"
              : cat.replaceAll("-", " ").replaceAll("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
