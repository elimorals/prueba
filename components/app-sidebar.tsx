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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  FileImage,
  Users,
  FileText,
  MessageSquare,
  Stethoscope,
  Activity,
  Package,
  UserCheck,
  ShoppingCart,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuItems = [
  {
    title: "Inicio",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Estudios Médicos",
    url: "/estudios",
    icon: FileImage,
  },
  {
    title: "Pacientes",
    url: "/pacientes",
    icon: Users,
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: FileText,
  },
  {
    title: "Chat IA Médico",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Inventarios",
    url: "/inventarios",
    icon: Package,
  },
  {
    title: "Personal",
    url: "/personal",
    icon: UserCheck,
  },
  {
    title: "Órdenes de Compra",
    url: "/ordenes",
    icon: ShoppingCart,
  },
]

const aiFeatures = [
  {
    title: "Análisis DICOM",
    url: "/ia/dicom",
    icon: Activity,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">RADIX</h2>
            <p className="text-xs text-muted-foreground">Inteligencia Médica</p>
          </div>
        </a>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Herramientas IA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiFeatures.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <a href="/perfil" className="block">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Dr. María González</p>
              <p className="text-xs text-muted-foreground truncate">Radióloga</p>
            </div>
          </div>
        </a>
      </SidebarFooter>
    </Sidebar>
  )
}
