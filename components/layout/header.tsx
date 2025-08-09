//components/layout/header.tsx
"use client";

import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { logout } from "@/store/slices/auth-slice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { LogoutDialog } from "@/components/ui/logout-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

export function Header() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutDialogOpen(false);
    localStorage.removeItem("auth-token");
    dispatch(logout());
    router.push("/login");
  };

  const goToProfile = () => {
    setOpen(false);
    router.push("/profile");
  };

  const goToSettings = () => {
    setOpen(false);
    router.push("/general-settings");
  };

  return (
    <>
      <header className="flex h-[112px] items-center justify-center gap-4 border-b border-[#CCC] bg-background px-6">
        <SidebarTrigger />

        <div className="flex flex-1 items-center gap-4 h-[48px] !w-[60%]">
          <div className="relative max-w-[100%] flex-1">
            <Search className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#363538]" />
            <Input
              placeholder="Search..."
              className="pl-10 pr-4 py-3 rounded-3xl h-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-between w-[22%]">
          <div className="flex items-center gap-[10px]">
            <Link href="/mail">
              <Button variant="ghost" size="icon">
                <Image
                  src="/images/mail.png"
                  alt="Mail"
                  width={36}
                  height={36}
                />
              </Button>
            </Link>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Image
                    src="/images/notification.png"
                    alt="Notifications"
                    width={36}
                    height={36}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-0">
                <NotificationDropdown />
              </PopoverContent>
            </Popover>
          </div>

          {/* Dropdown section */}
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center relative cursor-pointer w-[161px] gap-[6px]">
                <Avatar className="h-10 w-10 border border-[#CCC] rounded-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  {/* <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback> */}
                </Avatar>

                <div className="flex flex-col space-y-1">
                  <p className="text-[#1A1A1A] font-nunito-sans text-xs font-bold leading-none">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[#333] font-nunito-sans text-xs font-normal leading-none">
                    {user?.role || "User Role"}
                  </p>
                </div>

                <Image
                  src="/images/More-icon.png"
                  alt="More"
                  width={20}
                  height={20}
                />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[220px] rounded-2xl border border-[#E5E5E5] bg-white shadow-lg p-4"
              align="end"
              forceMount
            >
              {/* User info header */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 border border-[#CCC]">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  {/* <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback> */}
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">
                    {user?.name || "User"}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-none">
                    {user?.role || "User Role"}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={goToProfile}
                  className="w-full rounded-md border border-[#DDD] bg-white py-2 text-sm font-medium hover:bg-gray-50 transition"
                >
                  View Profile
                </button>
                <button
                  onClick={goToSettings}
                  className="w-full rounded-md border border-[#DDD] bg-white py-2 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Settings
                </button>
                <button
                  onClick={() => setIsLogoutDialogOpen(true)}
                  className="w-full rounded-md bg-[#F5F5F5] py-2 text-sm font-medium hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Add the LogoutDialog component */}
      <LogoutDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      />
    </>
  );
}
