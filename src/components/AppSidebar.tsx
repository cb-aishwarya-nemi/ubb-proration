import { useState } from "react";
import {
  Home,
  Users,
  RefreshCw,
  FileText,
  FileSignature,
  Package,
  Activity,
  KeyRound,
  ScrollText,
  BarChart3,
  LayoutGrid,
  Settings,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Command,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type NavItem = {
  icon: typeof Home;
  label: string;
  to?: string;
  isNew?: boolean;
  chevron?: boolean;
  children?: { label: string; to?: string }[];
};

const SIDE_NAV: NavItem[] = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Users, label: "Customers" },
  { icon: RefreshCw, label: "Subscriptions", to: "/subscriptions" },
  { icon: FileText, label: "Invoices & Credit Notes" },
  { icon: FileSignature, label: "Quotes" },
  {
    icon: Package,
    label: "Product Catalog",
    children: [
      { label: "Product Families" },
      { label: "Plans", to: "/product-catalog/plans" },
      { label: "Addons" },
      { label: "Charges" },
      { label: "Coupons" },
      { label: "Coupon Sets" },
    ],
  },
  { icon: Activity, label: "Usage", chevron: true },
  { icon: KeyRound, label: "Entitlements", chevron: true },
  { icon: ScrollText, label: "Logs", chevron: true },
  { icon: BarChart3, label: "RevenueStory" },
  { icon: FileText, label: "Classic Reports" },
  { icon: LayoutGrid, label: "Apps" },
  {
    icon: Settings,
    label: "Settings",
    children: [{ label: "Configure Chargebee", to: "/" }],
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Settings: pathname === "/" || pathname.startsWith("/settings"),
  });

  return (
    <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r border-border bg-[#fbfaf7]">
      <Link
        to="/"
        className="flex h-12 items-center gap-2 border-b border-border bg-[#1f2a1f] px-4 text-sm font-semibold text-white"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded bg-rose-500 text-[10px] font-bold">
          C
        </span>
        Billing
      </Link>
      <div className="border-b border-border px-3 py-3">
        <div className="flex items-center justify-between rounded-md bg-white px-2.5 py-2 text-xs shadow-sm ring-1 ring-border">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground truncate">cb-cpq-internal</span>
              <span className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-bold uppercase text-rose-700">
                Test
              </span>
            </div>
            <div className="truncate text-[10px] text-muted-foreground">
              cb-cpq-internal.lovable.test
            </div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-1 pt-3 text-[11px] font-medium text-muted-foreground">
        <span>Go to</span>
        <span className="flex items-center gap-1 rounded border border-border bg-white px-1.5 py-0.5 text-[10px]">
          <Command className="h-2.5 w-2.5" />K
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1 text-sm">
        {SIDE_NAV.map((item) => {
          const Icon = item.icon;
          const className =
            "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-foreground/80 hover:bg-muted";
          const inner = (expanded?: boolean) => (
            <>
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.isNew && (
                <span className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-bold uppercase text-rose-700">
                  New
                </span>
              )}
              {(item.chevron || item.children) &&
                (expanded ? (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                ))}
            </>
          );

          if (item.children) {
            const isOpen = !!openGroups[item.label];
            return (
              <div key={item.label}>
                <button
                  className={className}
                  onClick={() =>
                    setOpenGroups((g) => ({ ...g, [item.label]: !g[item.label] }))
                  }
                >
                  {inner(isOpen)}
                </button>
                {isOpen && (
                  <div className="ml-7 mt-0.5 flex flex-col border-l border-border pl-2">
                    {item.children.map((c) => {
                      const active = c.to ? (pathname === c.to || (c.to === "/" && pathname.startsWith("/settings"))) : false;
                      const cls = `rounded-md px-2 py-1.5 text-left text-[12px] ${
                        active
                          ? "font-medium text-sky-700"
                          : "text-foreground/75 hover:bg-muted"
                      }`;
                      return c.to ? (
                        <Link key={c.label} to={c.to} className={cls}>
                          {c.label}
                        </Link>
                      ) : (
                        <button key={c.label} className={cls}>
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return item.to ? (
            <Link key={item.label} to={item.to} className={className}>
              {inner()}
            </Link>
          ) : (
            <button key={item.label} className={className}>
              {inner()}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border p-2 text-[13px]">
        <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-foreground/80 hover:bg-muted">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          What's new
        </button>
        <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-foreground/80 hover:bg-muted">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          Need Help?
        </button>
        <div className="mt-1 flex items-center gap-2 rounded-md px-2 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-[11px] font-semibold text-white">
            AN
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-medium">Aishwarya Nemi</div>
            <div className="truncate text-[10px] text-muted-foreground">aishwarya@chargebee</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
