"use client";

import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

export function Header() {
  const { user } = useSelector((state: RootState) => state.auth);
  console.log({ user });
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header className="flex h-[112px]  items-center justify-center gap-4 border-b border-[#CCC] bg-background px-6">
      <SidebarTrigger />

      <div className="flex flex-1 items-center gap-4 h-[48px] !w-[60%] ">
        <div className="relative max-w-[100%] flex-1 ">
          <Search className="absolute left-3 top-1/2 h-6 w-6  -translate-y-1/2 text-[#363538] " />
          <Input
            placeholder="Search..."
            className="pl-10 pr-4 py-3   rounded-3xl h-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between  w-[22%]">
        {/* <ThemeToggle /> */}

        <div className="flex items-center gap-[20px]">
          <Link href="/mail">
            <Button variant="ghost" size="icon">
              <Image src="/images/mail.png" alt="Mail" width={36} height={36} />
            </Button>
          </Link>

          <Link href="/notifications">
            <Button variant="ghost" size="icon">
              <Image
                src="/images/notification.png"
                alt="Notifications"
                width={36}
                height={36}
              />
            </Button>
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center relative cursor-pointer w-[161px] gap-[6px]">
              <Avatar className="h-12 w-12 border border-[#CCC] rounded-full">
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
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.role || "User Role"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
