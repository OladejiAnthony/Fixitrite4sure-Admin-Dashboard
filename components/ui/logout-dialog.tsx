"use client"

import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { logout } from "@/store/slices/auth-slice"
import { authService } from "@/lib/auth-service"

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const router = useRouter()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    await authService.logout()
    dispatch(logout())
    onOpenChange(false)
    router.push("/login")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to logout? You will be redirected to the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} className="bg-[#5D92E4]">Logout</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
