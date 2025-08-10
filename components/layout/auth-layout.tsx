//components/layout/auth-layout.tsx
import type React from "react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A3B6F] p-4">
      <div className=" w-full max-w-[630px] h-[90%]">{children}</div>
    </div>
  );
}
