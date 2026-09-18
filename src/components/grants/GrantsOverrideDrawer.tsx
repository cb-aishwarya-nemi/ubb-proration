import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Pencil, Check, ChevronDown, Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";

type OverrideOption = string | { value: string; description: string };

type OverrideContextValue = {
  get: (id: string) => string | undefined;
  set: (id: string, value: string | undefined) => void;
};
const OverrideContext = createContext<OverrideContextValue | null>(null);

const OverriddenPill = () => (
  <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[hsl(217_100%_95%)] text-[hsl(var(--link))]">
    Overridden
  </span>
);

type OverridableCellProps = {
  id?: string;
  defaultValue: string;
  type?: "text" | "number" | "select";
  options?: OverrideOption[];
  align?: "left" | "right";
  rowEditing?: boolean;
  tooltipExtra?: React.ReactNode;
  hideDiff?: boolean;
};

const OverridableCell = ({
  id,
  defaultValue,
  type = "text",
  options,
  align = "left",
  rowEditing = false,
  tooltipExtra,
  hideDiff = false,
}: OverridableCellProps) => {
  const ctx = useContext(OverrideContext);
  const [localValue, setLocalValue] = useState<string | null>(null);
  const ctxValue = id && ctx ? ctx.get(id) : undefined;
  const value = ctxValue !== undefined ? ctxValue : localValue;
  const setValue = (v: string) => {
    if (id && ctx) ctx.set(id, v === defaultValue ? undefined : v);
    else setLocalValue(v);
  };
  const display = value ?? defaultValue;
  const isOverridden = value != null && value !== defaultValue;

  if (rowEditing) {
    if (type === "select" && options) {
      const normalized = options.map((o) =>
        typeof o === "string" ? { value: o, description: "" } : o
      );
      const hasDescriptions = normalized.some((o) => o.description);
      return (
        <Select value={display} onValueChange={(v) => setValue(v)}>
          <SelectTrigger className="h-7 text-[13px] px-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={hasDescriptions ? "max-w-[360px]" : ""}>
            {normalized.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="relative flex w-full cursor-default select-none flex-col items-start gap-0.5 rounded-sm py-2 pl-8 pr-2 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground"
              >
                <SelectPrimitive.ItemText>
                  <span className="text-[13px] font-medium text-foreground">{o.value}</span>
                </SelectPrimitive.ItemText>
                {o.description && (
                  <span className="text-[12px] text-muted-foreground leading-snug">
                    {o.description}
                  </span>
                )}
              </SelectPrimitive.Item>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <Input
        type="text"
        inputMode={type === "number" ? "decimal" : undefined}
        value={display}
        onChange={(e) => setValue(e.currentTarget.value)}
        className="h-7 text-[13px] px-2"
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[13px] ${align === "right" ? "justify-end" : ""}`}
    >
      {isOverridden ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-foreground font-medium underline decoration-dotted decoration-muted-foreground/70 underline-offset-4 cursor-help">
                {display}
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="p-2">
              <div className="flex flex-col gap-0.5 text-[12px]">
                <div>
                  <span className="text-muted-foreground">Default value:</span>{" "}
                  <span className="text-foreground">{defaultValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Overridden value:</span>{" "}
                  <span className="text-foreground font-medium">{display}</span>
                </div>
                {!hideDiff && (
                  <div>
                    <span className="text-muted-foreground">Diff:</span>{" "}
                    <span className="text-foreground font-medium">
                      {defaultValue} → {display}
                    </span>
                  </div>
                )}
                {tooltipExtra}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span>{display}</span>
      )}
    </div>
  );
};

const ROLLOVER_OPTIONS = [
  { value: "No rollover", description: "Grant expire at the end of each billing period" },
  { value: "Unlimited rollover", description: "Unused grant carry forward indefinitely" },
  { value: "Time-limited rollover", description: "Grant carries forward and expire after a set duration" },
  { value: "Capped rollover", description: "Unused grant carry forward up to a specified limit" },
];

type CappedRolloverSettings = {
  capValue: string;
  expirationType: string;
  expiryAmount: string;
  expiryUnit: string;
};

const DEFAULT_CAPPED_SETTINGS: CappedRolloverSettings = {
  capValue: "25",
  expirationType: "Set expiry duration",
  expiryAmount: "10",
  expiryUnit: "Months",
};

const CappedRolloverForm = ({
  initialSettings,
  onCancel,
  onApply,
}: {
  initialSettings: CappedRolloverSettings;
  onCancel: () => void;
  onApply: (s: CappedRolloverSettings) => void;
}) => {
  const [capValue, setCapValue] = useState(initialSettings.capValue);
  const [expirationType, setExpirationType] = useState(initialSettings.expirationType);
  const [expiryAmount, setExpiryAmount] = useState(initialSettings.expiryAmount);
  const [expiryUnit, setExpiryUnit] = useState(initialSettings.expiryUnit);

  return (
    <div className="flex flex-col">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[13px] font-semibold text-foreground">
            Set cap value <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              type="number"
              value={capValue}
              onChange={(e) => setCapValue(e.currentTarget.value)}
              className="h-9 text-[13px] pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
              %
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground leading-snug">
            Set the cap in percentage of the original grant.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[13px] font-semibold text-foreground">
            Grant expiration <span className="text-destructive">*</span>
          </Label>
          <Select value={expirationType} onValueChange={setExpirationType}>
            <SelectTrigger className="h-9 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Set expiry duration">Set expiry duration</SelectItem>
              <SelectItem value="Never expire">Never expire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {expirationType === "Set expiry duration" && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-[13px] font-semibold text-foreground">
              Set expiry duration <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={expiryAmount}
                onChange={(e) => setExpiryAmount(e.currentTarget.value)}
                className="h-9 text-[13px]"
              />
              <Select value={expiryUnit} onValueChange={setExpiryUnit}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Days">Days</SelectItem>
                  <SelectItem value="Weeks">Weeks</SelectItem>
                  <SelectItem value="Months">Months</SelectItem>
                  <SelectItem value="Years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => onApply({ capValue, expirationType, expiryAmount, expiryUnit })}
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

const RolloverCell = ({
  id,
  defaultValue,
  rowEditing,
}: {
  id: string;
  defaultValue: string;
  rowEditing: boolean;
}) => {
  const ctx = useContext(OverrideContext);
  const ctxValue = ctx?.get(id);
  const value = ctxValue ?? defaultValue;
  const shouldOpen = rowEditing && value !== "No rollover";
  const [popoverOpen, setPopoverOpen] = useState(shouldOpen);
  const [settings, setSettings] = useState<CappedRolloverSettings>(DEFAULT_CAPPED_SETTINGS);

  useEffect(() => {
    setPopoverOpen(shouldOpen);
  }, [shouldOpen]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverAnchor asChild>
        <div className="flex flex-col gap-1 w-full">
          <OverridableCell
            id={id}
            defaultValue={defaultValue}
            type="select"
            options={ROLLOVER_OPTIONS}
            rowEditing={rowEditing}
            hideDiff
          />
          {rowEditing && value !== "No rollover" && (
            <button
              type="button"
              onClick={() => setPopoverOpen((o) => !o)}
              className="text-[12px] text-primary hover:underline underline-offset-2 text-left"
            >
              Rollover settings
            </button>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-[380px] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="px-4 py-3 border-b border-border">
          <div className="text-[13px] font-semibold text-foreground">Rollover settings</div>
        </div>
        {value === "Capped rollover" ? (
          <CappedRolloverForm
            initialSettings={settings}
            onCancel={() => setPopoverOpen(false)}
            onApply={(s) => {
              setSettings(s);
              setPopoverOpen(false);
            }}
          />
        ) : (
          <div className="p-4 flex flex-col gap-3">
            <div className="text-[13px] text-muted-foreground">
              Configure {value.toLowerCase()} options here.
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setPopoverOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setPopoverOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

const EditableRow = ({
  children,
  colCount,
}: {
  children: (editing: boolean) => React.ReactNode;
  colCount: number;
}) => {
  const parentCtx = useContext(OverrideContext);
  const [editing, setEditing] = useState(false);
  const pendingRef = useRef<Record<string, string | undefined>>({});
  const [, forceUpdate] = useState(0);

  const bufferedCtx: OverrideContextValue | null = parentCtx
    ? {
        get: (id) => {
          if (editing && id in pendingRef.current) return pendingRef.current[id];
          return parentCtx.get(id);
        },
        set: (id, value) => {
          if (editing) {
            pendingRef.current[id] = value;
            forceUpdate((n) => n + 1);
          } else {
            parentCtx.set(id, value);
          }
        },
      }
    : null;

  const handleToggle = () => {
    if (editing) {
      if (parentCtx) {
        Object.entries(pendingRef.current).forEach(([id, value]) => {
          parentCtx.set(id, value);
        });
      }
      pendingRef.current = {};
      setEditing(false);
    } else {
      pendingRef.current = {};
      setEditing(true);
    }
  };

  void colCount;

  const content = (
    <TableRow className="group">
      {children(editing)}
      <TableCell className="px-3 py-2 w-10 text-right align-top pt-3">
        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex items-center justify-center w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground ${editing ? "text-foreground" : ""}`}
          aria-label={editing ? "Done editing" : "Edit row"}
        >
          {editing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
        </button>
      </TableCell>
    </TableRow>
  );

  return bufferedCtx ? (
    <OverrideContext.Provider value={bufferedCtx}>{content}</OverrideContext.Provider>
  ) : (
    content
  );
};

export interface GrantsOverrideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  billingFrequency?: string;
  grants?: string[];
  rowKey: string;
  overrides: Record<string, string>;
  onOverridesChange: (next: Record<string, string>) => void;
}

const CREDIT_KEYWORDS = ["credit", "token", "point"];
const METERED_KEYWORDS = ["gb", "tb", "mb", "api", "calls", "events", "emails", "seat", "seats", "bandwidth", "hours", "webhooks", "envs", "sandbox"];

type ParsedGrant = {
  raw: string;
  feature: string;
  amount: string;
  kind: "credit" | "metered" | "feature";
};

const parseGrant = (raw: string): ParsedGrant => {
  const m = raw.match(/^([\d,.]+(?:\s*[KMB])?)\s+(.*)$/i);
  let amount = "";
  let feature = raw;
  if (m) {
    amount = m[1].trim();
    feature = m[2].trim();
  }
  const lower = raw.toLowerCase();
  let kind: ParsedGrant["kind"] = "feature";
  if (CREDIT_KEYWORDS.some((k) => lower.includes(k))) kind = "credit";
  else if (amount && METERED_KEYWORDS.some((k) => lower.includes(k))) kind = "metered";
  else if (amount) kind = "metered";
  return { raw, feature: feature || raw, amount, kind };
};

export const GrantsOverrideDrawer = ({
  open,
  onOpenChange,
  itemName,
  billingFrequency,
  grants = [],
  rowKey,
  overrides,
  onOverridesChange,
}: GrantsOverrideDrawerProps) => {
  const ctx: OverrideContextValue = {
    get: (id) => overrides[`${rowKey}:${id}`],
    set: (id, value) => {
      const key = `${rowKey}:${id}`;
      const next = { ...overrides };
      if (value === undefined) delete next[key];
      else next[key] = value;
      onOverridesChange(next);
    },
  };
  const isRowOverridden = (prefix: string) =>
    Object.keys(overrides).some((k) => k.startsWith(`${rowKey}:${prefix}`));

  const [addedMetered, setAddedMetered] = useState<ParsedGrant[]>([]);
  const parsed = grants.map((g, i) => ({ ...parseGrant(g), idx: i }));
  const credits = parsed.filter((g) => g.kind === "credit");
  const meteredBase = parsed.filter((g) => g.kind === "metered");
  const metered = [
    ...meteredBase,
    ...addedMetered.map((g, i) => ({ ...g, idx: 1000 + i })),
  ];
  const features = parsed.filter((g) => g.kind === "feature");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-1/2 sm:max-w-none p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="text-[15px] font-semibold">
            Grants for {itemName}
          </SheetTitle>
        </SheetHeader>
        <OverrideContext.Provider value={ctx}>
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5">
            <p className="text-[13px] text-foreground">
              You can override {itemName}'s grants for this subscription below. Changes will apply only to this subscription.
            </p>

            {credits.length > 0 && (
              <section>
                <h3 className="text-[14px] font-semibold text-foreground">Credit grants</h3>
                <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
                  Customers on this plan are granted the below credits. Any usage beyond this limit will be priced at a per unit fee by an add-on.
                </p>
                <div className="mt-3 border border-border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="h-9 px-3 text-[12px] font-medium text-muted-foreground w-[28%]">Credit unit</TableHead>
                        <TableHead className="h-9 px-3 text-[12px] font-medium text-muted-foreground w-[20%]">Grant</TableHead>
                        <TableHead className="h-9 px-3 text-[12px] font-medium text-muted-foreground w-[22%]">Grant frequency</TableHead>
                        <TableHead className="h-9 px-3 text-[12px] font-medium text-muted-foreground w-[30%]">Rollover</TableHead>
                        <TableHead className="h-9 px-3 w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {credits.map((g) => {
                        const id = `credit:${g.idx}`;
                        return (
                          <EditableRow key={g.idx} colCount={4}>
                            {(editing) => (
                              <>
                                <TableCell className="px-3 py-2 text-[13px] align-top pt-3">
                                  {g.feature}
                                  {isRowOverridden(`${id}_`) && <OverriddenPill />}
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <div className={editing ? "w-1/2" : ""}>
                                    <OverridableCell id={`${id}_grant`} defaultValue={g.amount || "—"} type="number" rowEditing={editing} />
                                  </div>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <OverridableCell
                                    id={`${id}_frequency`}
                                    defaultValue={billingFrequency || "Monthly"}
                                    type="select"
                                    options={["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]}
                                    rowEditing={editing}
                                  />
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <RolloverCell id={`${id}_rollover`} defaultValue="No rollover" rowEditing={editing} />
                                </TableCell>
                              </>
                            )}
                          </EditableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            <section>
              <h3 className="text-[14px] font-semibold text-foreground">Metered feature grants</h3>
              <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
                Customers on this plan are granted the below features every{" "}
                {billingFrequency?.toLowerCase().includes("year") ? "year" : "month"}. Any usage beyond this limit will be priced at a per unit fee by an add-on.
              </p>
              {metered.length > 0 && (
                <div className="mt-4 border border-border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="h-9 px-3 text-[12px] font-medium text-muted-foreground w-[28%]">Metered feature</TableHead>
                        <TableHead className="h-9 px-3 text-[12px] font-medium text-muted-foreground w-[20%]">Included usage</TableHead>
                        <TableHead className="h-9 px-3 text-[12px] font-medium text-muted-foreground w-[22%]">Proration</TableHead>
                        <TableHead className="h-9 px-3 text-[12px] font-medium text-muted-foreground w-[30%]">Prorated grant</TableHead>
                        <TableHead className="h-9 px-3 w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metered.map((g) => {
                        const id = `usage:${g.idx}`;
                        const prorationId = `${id}_proration`;
                        const grantOverride = ctx.get(id);
                        const currentGrantStr = grantOverride ?? (g.amount || "—");
                        const prorationValue = ctx.get(prorationId) ?? "Grant based on time";
                        const parseNum = (s: string) => {
                          const m = String(s).replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/i);
                          if (!m) return NaN;
                          const n = parseFloat(m[1]);
                          const mult = m[2]?.toUpperCase() === "K" ? 1_000 : m[2]?.toUpperCase() === "M" ? 1_000_000 : m[2]?.toUpperCase() === "B" ? 1_000_000_000 : 1;
                          return n * mult;
                        };
                        const baseNum = parseNum(currentGrantStr);
                        const prorated = prorationValue === "Grant in full" ? baseNum : baseNum * 0.5;
                        const formatNum = (n: number) =>
                          isNaN(n) ? "—" : Math.round(n).toLocaleString("en-US");
                        return (
                          <EditableRow key={g.idx} colCount={4}>
                            {(editing) => (
                              <>
                                <TableCell className="px-3 py-2 text-[13px]">
                                  {g.feature}
                                  {isRowOverridden(id) && <OverriddenPill />}
                                </TableCell>
                                <TableCell className="px-3 py-2">
                                  <OverridableCell id={id} defaultValue={g.amount || "—"} type="number" rowEditing={editing} />
                                </TableCell>
                                <TableCell className="px-3 py-2">
                                  <OverridableCell
                                    id={prorationId}
                                    defaultValue="Grant based on time"
                                    type="select"
                                    options={["Grant based on time", "Grant in full"]}
                                    rowEditing={editing}
                                  />
                                </TableCell>
                                <TableCell className="px-3 py-2 text-[13px] text-foreground">
                                  {isNaN(baseNum) ? (
                                    <span className="text-muted-foreground">—</span>
                                  ) : (
                                    <span>
                                      <span className="text-muted-foreground">{formatNum(baseNum)}</span>
                                      <span className="mx-1.5 text-muted-foreground">→</span>
                                      <span className="font-medium">{formatNum(prorated)}</span>
                                    </span>
                                  )}
                                </TableCell>
                              </>
                            )}
                          </EditableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setAddedMetered((prev) => [
                      ...prev,
                      { raw: "", feature: "New feature", amount: "0", kind: "metered" },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[hsl(var(--link))] hover:underline underline-offset-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add feature
                </button>
              </div>
            </section>

            {features.length > 0 && (
              <section>
                <h3 className="text-[14px] font-semibold text-foreground">Non-metered features</h3>
                <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
                  Customers on this plan have access to the below features.
                </p>
                <div className="mt-3 border border-border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="h-9 px-3 text-[12px] font-medium text-muted-foreground w-[60%]">Feature</TableHead>
                        <TableHead className="h-9 px-3 text-[12px] font-medium text-muted-foreground w-[40%]">Entitlement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {features.map((g) => (
                        <TableRow key={g.idx}>
                          <TableCell className="px-3 py-2 text-[13px]">{g.feature}</TableCell>
                          <TableCell className="px-3 py-2 text-[13px]">Available</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            )}

            {parsed.length === 0 && (
              <p className="text-[13px] text-muted-foreground">No grants for this item.</p>
            )}
          </div>
          <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 bg-card">
            <button
              onClick={() => onOpenChange(false)}
              className="px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-[hsl(var(--sidebar-hover))] rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="px-3.5 py-1.5 text-[13px] font-semibold bg-[hsl(var(--primary))] text-primary-foreground rounded-md hover:bg-[hsl(var(--primary))]/90"
            >
              Save
            </button>
          </div>
        </OverrideContext.Provider>
      </SheetContent>
    </Sheet>
  );
};

export default GrantsOverrideDrawer;
