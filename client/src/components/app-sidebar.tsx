import {
  Home,
  Users,
  LogOut,
  Tag,
  Warehouse,
  FlaskConical,
  UserCheck,
  Radio,
  FileText,
  Baby,
  Activity,
  Palette,
  Settings,
  ClipboardEdit,
  ClipboardPlus,
  ExternalLink,
} from "lucide-react";
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
  { title: "Dashboard", href: "/", icon: Home },
  { title: "Cows", href: "/cows", icon: Tag },
];

const formNav = [
  { title: "Dam Form", href: "/dam-form", icon: ClipboardEdit },
  { title: "Cow Form", href: "/cow-form", icon: ClipboardPlus },
  { title: "Calf Form", href: "/calf-form", icon: Baby },
];

const managementNav = [
  { title: "Feedlots", href: "/feedlots", icon: Warehouse },
  { title: "Semen", href: "/semen", icon: FlaskConical },
  { title: "Transponders", href: "/transponders", icon: Radio },
];

const recordsNav = [
  { title: "AI Records", href: "/ai-records", icon: FileText },
  { title: "Calf Records", href: "/calf-records", icon: Baby },
  {
    title: "Pregnancy Diagnosis",
    href: "/pregnancy-diagnosis",
    icon: Activity,
  },
];

const configNav = [
  { title: "Inseminators", href: "/inseminators", icon: UserCheck },
  { title: "Colors", href: "/colors", icon: Palette },
  { title: "Cow Genders", href: "/cow-genders", icon: Settings },
  { title: "Cow Roles", href: "/cow-roles", icon: Settings },
  { title: "Cow Statuses", href: "/cow-statuses", icon: Settings },
  { title: "AI Statuses", href: "/ai-statuses", icon: Settings },
  { title: "Calf Statuses", href: "/calf-statuses", icon: Settings },
  { title: "PD Statuses", href: "/pd-statuses", icon: Settings },
];

const systemNav = [{ title: "Users", href: "/users", icon: Users }];

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { title: string; href: string; icon: React.ComponentType }[];
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

function FormNavGroup({
  items,
}: {
  items: { title: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Form</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <item.icon className="h-4 w-4" />
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
        <FormNavGroup items={formNav} />
        <NavGroup
          label="Management"
          items={managementNav}
          pathname={location.pathname}
        />
        <NavGroup
          label="Records"
          items={recordsNav}
          pathname={location.pathname}
        />
        {user?.admin && (
          <NavGroup
            label="Data Management"
            items={configNav}
            pathname={location.pathname}
          />
        )}
        <NavGroup
          label="System"
          items={systemNav}
          pathname={location.pathname}
        />
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
