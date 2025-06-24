import type React from "react"
import { Wrench } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wrench className="h-6 w-6" />
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-bold">FixIt Admin</h2>
            <p className="mt-2 text-muted-foreground">Manage your repair services platform</p>
          </div>
          {children}
        </div>
      </div>
      <div className="hidden lg:block flex-1 bg-muted">
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold">Welcome to FixIt Dashboard</h3>
            <p className="text-muted-foreground max-w-md">
              Streamline your repair service operations with our comprehensive admin platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
