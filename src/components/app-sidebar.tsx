import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  CalendarRange,
  Compass,
  Mail,
  MessageSquare,
  ScrollText,
  Sparkles,
} from "lucide-react";
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

const items = [
  { title: "Overview", url: "/", icon: Compass },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Notes Summarizer", url: "/notes", icon: ScrollText },
  { title: "Task Planner", url: "/planner", icon: CalendarRange },
  { title: "Research Assistant", url: "/research", icon: Sparkles },
  { title: "Chat with Aria", url: "/chat", icon: MessageSquare },
] as const;

export function AppSidebar() {
  const currentPath = useRouterState({ select: (router) => router.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-sm">
            <Bot className="size-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Aria</span>
            <span className="text-[11px] text-muted-foreground">Workplace AI</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-1 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          AI outputs may need human review.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
