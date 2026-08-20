import { useState, useMemo } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  accentClass?: string; // tailwind classes for header color
}

export function MultiSelect({ label, options, selected, onChange, accentClass }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const allSelected = selected.length === 0 || selected.length === options.length;

  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(q.toLowerCase())),
    [options, q]
  );

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((s) => s !== opt));
    else onChange([...selected, opt]);
  };

  const display = allSelected ? "All" : selected.length === 1 ? selected[0] : `${selected.length} selected`;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-border/60 shadow-sm">
      <div className="bg-card text-foreground text-center text-[11px] font-bold uppercase tracking-[0.2em] py-2 border-b border-border/60">
        {label}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold transition-all hover:brightness-110",
              accentClass ?? "bg-card text-foreground"
            )}
          >
            <span className="truncate">{display}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="pl-8 h-9"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="secondary" className="flex-1 h-7 text-xs"
                onClick={() => onChange(options)}>Select all</Button>
              <Button size="sm" variant="secondary" className="flex-1 h-7 text-xs"
                onClick={() => onChange([])}>Clear</Button>
            </div>
          </div>
          <ScrollArea className="h-72">
            <div className="p-1">
              {filtered.map((opt) => {
                const checked = selected.includes(opt) || (selected.length === 0);
                return (
                  <button
                    key={opt}
                    onClick={() => toggle(opt)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-secondary text-left"
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      selected.includes(opt) ? "bg-primary border-primary" : "border-muted-foreground/40"
                    )}>
                      {selected.includes(opt) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="truncate">{opt}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">No results</div>
              )}
            </div>
          </ScrollArea>
          <div className="p-2 border-t text-xs text-muted-foreground flex items-center justify-between">
            <span>{filtered.length} results</span>
            {selected.length > 0 && selected.length < options.length && (
              <Badge variant="secondary" className="gap-1">
                {selected.length}
                <X className="h-3 w-3 cursor-pointer" onClick={() => onChange([])} />
              </Badge>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
