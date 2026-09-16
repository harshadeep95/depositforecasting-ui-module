import { useEffect, useState } from "react";
import { Building2, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  PERSONAS,
  PRODUCTS,
  REGIONS,
  SEGMENTS,
  type Filters,
  type ProductId,
  type RegionId,
  type SegmentId,
} from "@/lib/deposit-data";

interface Props {
  personaId: string;
  onPersona: (id: string) => void;
  filters: Filters;
  onFilters: (f: Filters) => void;
  horizon: number;
  onHorizon: (h: number) => void;
}

function MultiFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { id: T; name: string }[];
  selected: T[];
  onChange: (v: T[]) => void;
}) {
  const all = selected.length === options.length;
  const none = selected.length === 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 justify-between gap-2 border-border bg-background text-foreground"
        >
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className="text-xs font-semibold">
            {all ? "All" : none ? "None" : `${selected.length} selected`}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={all ? true : none ? false : "indeterminate"}
          onCheckedChange={(checked) => onChange(checked ? options.map((o) => o.id) : [])}
          onSelect={(e) => e.preventDefault()}
          className="font-semibold"
        >
          (Select all)
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.id}
            checked={selected.includes(o.id)}
            onCheckedChange={(checked) => {
              onChange(checked ? [...selected, o.id] : selected.filter((s) => s !== o.id));
            }}
            onSelect={(e) => e.preventDefault()}
          >
            {o.name}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1">
          <button
            className="text-xs font-medium text-primary hover:underline disabled:opacity-40 disabled:no-underline"
            disabled={all}
            onClick={() => onChange(options.map((o) => o.id))}
          >
            Select all
          </button>
          <button
            className="text-xs font-medium text-primary hover:underline disabled:opacity-40 disabled:no-underline"
            disabled={none}
            onClick={() => onChange([])}
          >
            Deselect all
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function TopBar({ personaId, onPersona, filters, onFilters, horizon, onHorizon }: Props) {
  const activePersona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]!;
  const [stamp, setStamp] = useState("");

  useEffect(() => {
    const tick = () =>
      setStamp(
        new Intl.DateTimeFormat("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="gradient-brand">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-background/15">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground/70">
                Advisory · Retail Banking
              </p>
              <h1 className="text-lg font-semibold leading-tight text-primary-foreground">
                DepositIQ <span className="font-normal text-primary-foreground/70">· Deposit Forecasting</span>
              </h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary-foreground/70">
              As of
            </p>
            <p className="text-sm font-semibold tabular-nums text-primary-foreground">{stamp}</p>
          </div>
        </div>

      </div>

      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-2 px-5 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="h-9 justify-between gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span className="text-xs font-medium opacity-75">Persona</span>
              <span className="text-xs font-semibold">{activePersona.role}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-75" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
              View as persona
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PERSONAS.map((p) => (
              <DropdownMenuCheckboxItem
                key={p.id}
                checked={personaId === p.id}
                onCheckedChange={() => onPersona(p.id)}
              >
                <span className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">{p.role}</span>
                  <span className="text-[11px] text-muted-foreground">{p.name}</span>
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="mx-1 h-6 w-px bg-border" />

        <MultiFilter
          label="Segment"
          options={SEGMENTS}
          selected={filters.segments}
          onChange={(segments: SegmentId[]) => onFilters({ ...filters, segments })}
        />
        <MultiFilter
          label="Product"
          options={PRODUCTS}
          selected={filters.products}
          onChange={(products: ProductId[]) => onFilters({ ...filters, products })}
        />
        <MultiFilter
          label="Region"
          options={REGIONS}
          selected={filters.regions}
          onChange={(regions: RegionId[]) => onFilters({ ...filters, regions })}
        />
        <div className="ml-auto flex items-center gap-1 rounded-md border border-border p-0.5">
          <span className="px-2 text-xs font-medium text-muted-foreground">Horizon</span>
          {[6, 12, 24, 60].map((h) => (
            <button
              key={h}
              onClick={() => onHorizon(h)}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-semibold transition-colors",
                horizon === h ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {h}m
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
