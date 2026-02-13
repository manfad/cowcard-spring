import { LogOut, ExternalLink } from "lucide-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const mainNav = [
  { title: "Dashboard", href: "/" },
  { title: "Cows", href: "/cows" },
];

const formNav = [
  { title: "Dam Form", href: "/dam-form" },
  { title: "Cow Form", href: "/cow-form" },
  { title: "Calf Form", href: "/calf-form" },
  { title: "AI Record Form", href: "/ai-record-form" },
];

const managementNav = [
  { title: "Feedlot Management", href: "/feedlot-management" },
  { title: "Semen", href: "/semen" },
  { title: "Transponders", href: "/transponders" },
];

const recordsNav = [
  { title: "Dam AI Record", href: "/dam-ai-record" },
  { title: "AI Records", href: "/ai-records" },
  { title: "Pregnancy Diagnosis", href: "/pregnancy-diagnosis" },
  { title: "Calf Records", href: "/calf-records" },
];

const libraryNav = [
  { title: "Feedlots", href: "/feedlots" },
  { title: "Inseminators", href: "/inseminators" },
  { title: "Colors", href: "/colors" },
  { title: "Cow Genders", href: "/cow-genders" },
  { title: "Cow Roles", href: "/cow-roles" },
  { title: "Cow Statuses", href: "/cow-statuses" },
  { title: "AI Statuses", href: "/ai-statuses" },
  { title: "PD Statuses", href: "/pd-statuses" },
];

const systemNav = [
  { title: "Users", href: "/users" },
  { title: "System Settings", href: "/system-settings" },
];

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { title: string; href: string }[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link to={item.href}>
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function FormNavGroup({ items }: { items: { title: string; href: string }[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Form</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <span>{item.title}</span>
                  <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">CowCard</h2>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Main" items={mainNav} pathname={location.pathname} />
        <NavGroup
          label="Records"
          items={recordsNav}
          pathname={location.pathname}
        />
        <NavGroup
          label="Management"
          items={managementNav}
          pathname={location.pathname}
        />
        {user?.admin && (
          <NavGroup
            label="Library"
            items={libraryNav}
            pathname={location.pathname}
          />
        )}
        {user?.admin && (
          <NavGroup
            label="System"
            items={systemNav}
            pathname={location.pathname}
          />
        )}
        <FormNavGroup items={formNav} />
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
