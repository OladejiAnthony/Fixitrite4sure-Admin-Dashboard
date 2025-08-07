//components/layout/app-sidebar.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Users,
  Store,
  Wrench,
  FileText,
  Calendar,
  LogOut,
  ChevronDown,
  Building2,
  ShoppingCart,
  CreditCard,
  Truck,
  UserCheck,
  Shield,
  Settings,
  ShoppingBag,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LogoutDialog } from "@/components/ui/logout-dialog";
import Image from "next/image";

type NavigationItem = {
  title: string;
  url?: string;
  hasDropdown?: boolean;
  subItems?: Array<{
    title: string;
    url: string;
    icon: string | React.ComponentType<{ className?: string }>;
  }>;
  icon: string | React.ComponentType<{ className?: string }>;
};

const navigationItems: NavigationItem[] = [
  {
    title: "HOME",
    icon: Home,
    hasDropdown: true,
    subItems: [
      {
        title: "Dashboard",
        icon: ShoppingBag,
        url: "/dashboard",
      },
      {
        title: "Analytics",
        icon: "/images/e-repair.png",
        url: "/analytics",
      },
      {
        title: "Onboarding",
        icon: "/images/content.png",
        url: "/onboarding",
      },
    ],
    //url: "/dashboard",
  },
  {
    title: "MEMBERS",
    icon: Users,
    //url: "/members",
    hasDropdown: true,
    subItems: [
      {
        title: "Admin",
        icon: ShoppingBag,
        url: "/admin",
      },
      {
        title: "Customers",
        icon: "/images/e-repair.png",
        url: "/customers",
      },
      {
        title: "Repairers",
        icon: "/images/content.png",
        url: "/repairers",
      },
      {
        title: "Repair Companies",
        icon: "/images/e-repair.png",
        url: "/repair-companies",
      },
      {
        title: "Vendors",
        icon: "/images/content.png",
        url: "/vendors",
      },
    ],
  },
  {
    title: "SERVICES",
    icon: Settings,
    hasDropdown: true,
    subItems: [
      {
        title: "E-Commerce",
        icon: ShoppingBag,
        url: "/e-commerce",
      },
      {
        title: "E-Repair",
        icon: "/images/e-repair.png",
        url: "/e-repair",
      },
      {
        title: "Content Management",
        icon: "/images/content.png",
        url: "/content-management",
      },
    ],
  },

  {
    title: "Super Admin",
    icon: Shield,
    url: "/super-admin",
  },
  {
    title: "User Management",
    icon: Users,
    hasDropdown: true,
    subItems: [
      {
        title: "Repairers",
        icon: Wrench,
        url: "/repairers",
      },
      {
        title: "Repair Companies",
        icon: Building2,
        url: "/repair-companies",
      },
      {
        title: "Vendors",
        icon: Store,
        url: "/vendors",
      },
      {
        title: "Customers",
        icon: UserCheck,
        url: "/customers",
      },
    ],
  },
  {
    title: "Transactions",
    icon: CreditCard,
    url: "/transactions",
  },
  {
    title: "Orders & Bookings",
    icon: Calendar,
    hasDropdown: true,
    subItems: [
      {
        title: "Repair Bookings",
        icon: Calendar,
        url: "/repair-bookings",
      },
      {
        title: "Product Orders",
        icon: ShoppingCart,
        url: "/product-orders",
      },
    ],
  },
  {
    title: "Invoices",
    icon: FileText,
    url: "/invoices",
  },
  {
    title: "Logistics",
    icon: Truck,
    url: "/logistics",
  },
];

export function AppSidebar() {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  return (
    <div className="bg-[#1A3B6F]">
      <Sidebar className="bg-[#1A3B6F] border-r-0">
        <SidebarHeader className="p-6  h-[112px]">
          <div className="flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red text-[#1A3B6F]">
              <Wrench className="h-6 w-6 text-white" />
              <Image
                src="/images/header-logo.png"
                alt="FixIt Logo"
                width={40}
                height={40}
                className="ml-2"
              />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 py-2 ">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title} className="  ">
                    {item.hasDropdown ? (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full h-[48px] justify-between text-white hover:bg-[#2A4B7F] hover:text-white data-[state=open]:bg-[#2A4B7F] data-[state=open]:text-white py-3 px-4 text-sm font-medium">
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              <span className="text-left">{item.title}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {item.subItems && (
                          <CollapsibleContent className="ml-4 mt-1">
                            <SidebarMenu className="space-y-1">
                              {item.subItems.map((subItem) => (
                                <SidebarMenuItem key={subItem.title}>
                                  <SidebarMenuButton
                                    onClick={() =>
                                      handleNavigation(subItem.url)
                                    }
                                    className={`w-full h-[42px] gap-2  text-left py-2 px-4 text-sm font-medium transition-colors cursor-pointer ${
                                      pathname === subItem.url
                                        ? "bg-white text-[#1A3B6F] hover:bg-white hover:text-[#1A3B6F]"
                                        : "text-white hover:bg-[#2A4B7F] hover:text-white"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {typeof subItem.icon === "string" ? (
                                        <Image
                                          src={subItem.icon}
                                          alt="icon"
                                          width={16}
                                          height={16}
                                        />
                                      ) : (
                                        <subItem.icon className="h-4 w-4" />
                                      )}
                                      <span>{subItem.title}</span>
                                    </div>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </SidebarMenu>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ) : item.url ? (
                      <SidebarMenuButton
                        onClick={() => handleNavigation(item.url!)}
                        className={`w-full  py-3 px-3 text-sm font-medium cursor-pointer ${
                          pathname === item.url
                            ? "bg-white text-[#1A3B6F] hover:bg-white hover:text-[#1A3B6F]"
                            : "text-white hover:bg-[#2A4B7F] hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-[#2A4B7F]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogoutClick}
                className="w-full text-white hover:bg-[#2A4B7F] hover:text-white py-3 px-4 text-sm font-medium cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <LogoutDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      />
    </div>
  );
}
