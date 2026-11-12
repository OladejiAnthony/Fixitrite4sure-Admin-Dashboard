// components/sos/confirm-delete-dialog.tsx
"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  title: string;
  description: ReactNode;
  pending: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  pending,
  error,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && !pending && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={pending}
            onClick={(e) => {
              // Keep the dialog open until the request finishes.
              e.preventDefault();
              onConfirm();
            }}
          >
            {pending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
