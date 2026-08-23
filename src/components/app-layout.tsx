import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  CreditCard,
  Heart,
  LayoutDashboard,
  Mail,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Store,
  Sun,
  UserPlus,
} from "lucide-react";
import type { ReactNode } from "react";

import logo from "@/assets/udd-logo.png";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { useSidebar } from "@/components/sidebar-provider";
import { MobileDock } from "@/components/mobile/mobile-dock";
import { AccountMenu } from "@/components/account-menu";


function ShopNowButton({ collapsed = false }: { collapsed?: boolean }) {
  const isActive = useRouterState({ select: (s) => s.location.pathname }) === "/";

  return (
    <Link
      to="/"
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? "Shop now" : undefined}
      className="nav-item mb-1 w-full border text-white"
      style={{
        background: "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)",
        borderColor: isActive ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
        justifyContent: collapsed ? "center" : undefined,
        paddingInline: collapsed ? 0 : undefined,
      }}
    >
      <ShoppingBag className="size-4 shrink-0" />
      <span
        className={`truncate font-semibold transition-all duration-200 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
        style={{ overflow: "hidden" }}
      >
        Shop now
      </span>
    </Link>
  );
}

const BASE_NAV_ITEMS = [
  { label: "Market Place", to: "/market-place", icon: Building2 },
  { label: "Stores", to: "/stores", icon: Store },
] as const;

const DASHBOARD_NAV_ITEM = { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard } as const;

const SECONDARY_ACTIONS = [
  { label: "Invite members", icon: UserPlus },
  { label: "Privacy and terms", icon: Shield },
];

const COLLAPSED_WIDTH = "76px";

export function AppLayout({
  children,
  variant = "flat",
}: {
  children: ReactNode;
  variant?: "flat" | "gradient";
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { dark, toggle: toggleTheme } = useTheme();
  const { collapsed, toggle: toggleSidebar } = useSidebar();
  const { isAdmin } = useAuth();

  // The Dashboard link — and the route behind it — is completely invisible
  // to anyone signed in as someone other than the admin account. Direct
  // navigation to /dashboard is separately blocked in routes/dashboard.tsx.
  const navItems = isAdmin ? [...BASE_NAV_ITEMS, DASHBOARD_NAV_ITEM] : BASE_NAV_ITEMS;

  return (
    <div
      className="relative flex h-screen w-full overflow-hidden text-foreground"
      style={{ backgroundColor: "var(--app-sidebar-flat)" }}
    >
      <aside
        className="hidden shrink-0 flex-col justify-between overflow-hidden px-4 pb-5 pt-4 transition-[width] duration-300 ease-in-out md:flex"
        style={{
          backgroundColor: "var(--app-sidebar-flat)",
          width: collapsed ? COLLAPSED_WIDTH : "var(--sidebar-width)",
        }}
      >
        <div>
          <Link
            to="/"
            className={`mb-4 flex items-start px-1 ${collapsed ? "justify-center" : ""}`}
          >
            <img
              src={logo}
              alt="Uni Door Dash"
              className={`w-auto shrink-0 object-contain transition-all duration-300 ${collapsed ? "h-7" : "h-9"}`}
            />
          </Link>

          <div className="mb-2">
            <ShopNowButton collapsed={collapsed} />
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className="nav-item"
                  style={{
                    backgroundColor: isActive ? "var(--cherry-deep)" : undefined,
                    color: isActive ? "var(--primary-foreground)" : undefined,
                    justifyContent: collapsed ? "center" : undefined,
                    paddingInline: collapsed ? 0 : undefined,
                  }}
                >
                  <Icon className="size-4 shrink-0" />
                  <span
                    className={`truncate transition-all duration-200 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
                    style={{ overflow: "hidden" }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <Link
            to="/subscription"
            title={collapsed ? "Subscription" : undefined}
            className="nav-item mb-2"
            style={{
              backgroundColor:
                pathname === "/subscription" ? "var(--cherry-deep)" : undefined,
              color:
                pathname === "/subscription" ? "var(--primary-foreground)" : undefined,
              justifyContent: collapsed ? "center" : undefined,
              paddingInline: collapsed ? 0 : undefined,
            }}
          >
            <CreditCard className="size-4 shrink-0" />
            <span
              className={`truncate transition-all duration-200 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
              style={{ overflow: "hidden" }}
            >
              Subscription
            </span>
          </Link>

          <div className={`flex items-center gap-2 ${collapsed ? "flex-col" : ""}`}>
            {SECONDARY_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  title={action.label}
                  className="grid size-9 shrink-0 place-items-center rounded-full border transition-colors hover:bg-accent"
                  style={{ borderColor: "var(--sidebar-border)" }}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleSidebar}
            className={`mt-3 flex w-full items-center gap-2 rounded-lg border py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${collapsed ? "justify-center px-0" : "justify-center px-3"}`}
            style={{ borderColor: "var(--sidebar-border)" }}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="size-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <MobileDock />

      <div className="flex min-w-0 flex-1 flex-col">
        <main
          className={
            variant === "gradient"
              ? "panel-surface mobile-main min-h-0 flex-1 overflow-hidden"
              : "mobile-main min-h-0 flex-1 overflow-hidden"
          }
          style={{
            marginTop: "var(--panel-gap)",
            marginRight: "var(--panel-gap)",
            marginLeft: 0,
            marginBottom: 0,
            borderTopLeftRadius: "var(--panel-radius)",
            borderTopRightRadius: "var(--panel-radius)",
            backgroundColor: variant === "flat" ? "var(--app-main-flat)" : undefined,
            transition: "margin 300ms ease-in-out",
          }}
        >
          {variant === "gradient" && <div className="panel-veil" />}
          <div className="relative z-10 h-full overflow-y-auto">
            <div className="page-enter mobile-page px-5 py-8 sm:px-8 md:px-12">{children}</div>
          </div>
        </main>
      </div>

      <div className="fixed right-6 top-6 z-50 hidden gap-3 md:flex">
        <button
          type="button"
          title="Cart"
          className="grid size-11 place-items-center rounded-full text-white shadow-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--cherry-deep)" }}
        >
          <ShoppingCart className="size-5" />
        </button>
        <button
          type="button"
          title="Mail"
          className="grid size-11 place-items-center rounded-full text-white shadow-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--cherry-deep)" }}
        >
          <Mail className="size-5" />
        </button>
        <AccountMenu size={44} />
      </div>

      <div className="fixed bottom-6 right-6 z-50 hidden gap-3 md:flex">
        <button
          type="button"
          title="Toggle theme"
          onClick={(event) => toggleTheme(event)}
          className={`grid size-11 place-items-center rounded-full shadow-lg transition-colors ${dark ? "bg-white text-[#111111] hover:bg-zinc-200" : "bg-[#111111] text-white hover:bg-zinc-800"}`}
        >
          {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
        <button
          type="button"
          title="Invite someone"
          className="grid size-11 place-items-center rounded-full bg-card text-foreground shadow-lg transition-colors hover:bg-accent"
        >
          <Plus className="size-5" />
        </button>
        <button
          type="button"
          title="Support us"
          className="grid size-11 place-items-center rounded-full bg-cherry-deep text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
        >
          <Heart className="size-5" />
        </button>
      </div>

    </div>
  );
}
