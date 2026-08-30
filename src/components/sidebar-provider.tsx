import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type SidebarContextValue = { collapsed: boolean; toggle: () => void };

const SidebarContext = createContext<SidebarContextValue | null>(null);

function readCollapsed() {
  try {
    return localStorage.getItem("udd-sidebar-collapsed") === "1";
  } catch {
    return false;
  }
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem("udd-sidebar-collapsed", collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggle: () => setCollapsed((value) => !value) }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar must be used inside a SidebarProvider");
  return context;
}
