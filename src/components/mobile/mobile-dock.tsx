import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Mail, Menu, Moon, Plus, Shield, Sun, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";

import logo from "@/assets/udd-logo.png";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { TextRoll } from "@/components/mobile/text-roll";
import { AccountMenu } from "@/components/account-menu";
import { CartMenu } from "@/components/cart-menu";

const BASE_MENU_ITEMS = [
  { name: "Shop now", href: "/" },
  { name: "Market Place", href: "/market-place" },
  { name: "Stores", href: "/stores" },
  { name: "Subscription", href: "/subscription" },
] as const;

const DASHBOARD_MENU_ITEM = { name: "Dashboard", href: "/dashboard" } as const;

export function MobileDock() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { dark, toggle: toggleTheme } = useTheme();
  const { isAdmin } = useAuth();

  // Same rule as the desktop sidebar: Dashboard only appears for the admin
  // account, and the route itself is separately guarded.
  const menuItems = isAdmin
    ? [...BASE_MENU_ITEMS.slice(0, 3), DASHBOARD_MENU_ITEM, BASE_MENU_ITEMS[3]]
    : BASE_MENU_ITEMS;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] md:hidden">
      <div className="px-3 pt-3">
        <div className="mobile-dock flex items-center justify-between gap-3 rounded-full px-4 py-2">
          <Link to="/" className="flex shrink-0 items-center">
            <img src={logo} alt="Uni Door Dash" className="h-6 w-auto object-contain" />
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <CartMenu size={36} />
            <button
              type="button"
              title="Menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
            >
              {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
            </button>
            <button
              type="button"
              title="Mail"
              className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
            >
              <Mail className="size-[18px]" />
            </button>
            <AccountMenu size={36} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="sheet"
              className="px-3 pt-2"
              initial={{ opacity: 0, y: -18, scaleY: 0.85 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -18, scaleY: 0.85 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.42 }}
              style={{ transformOrigin: "top center" }}
            >
              <div className="mobile-sheet rounded-3xl px-6 py-7">
                <nav className="flex flex-col gap-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="block py-1 text-[26px] font-black uppercase tracking-tight text-foreground"
                      style={{ opacity: pathname === item.href ? 1 : 0.72 }}
                    >
                      <TextRoll>{item.name}</TextRoll>
                    </Link>
                  ))}
                </nav>
              </div>

              <motion.div
                className="mobile-dock mt-3 flex items-center justify-between gap-2 rounded-full px-3 py-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35, delay: 0.06 }}
              >
                {[
                  { label: "Invite members", Icon: UserPlus },
                  { label: "Privacy and terms", Icon: Shield },
                  { label: "Invite someone", Icon: Plus },
                  { label: "Support us", Icon: Heart },
                ].map(({ label, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
                  >
                    <Icon className="size-[18px]" />
                  </button>
                ))}
                <button
                  type="button"
                  title="Toggle theme"
                  onClick={(event) => toggleTheme(event)}
                  className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
                >
                  {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
