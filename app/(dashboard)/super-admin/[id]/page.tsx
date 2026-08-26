// app/(dashboard)/super-admin/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Admin {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "Active" | "Inactive";
    lastLogin: string | null;
}

const fetchAdmin = async (id: string): Promise<Admin> => {
    const res = await fetch(`/api/admin/super-admins/${id}`);
    if (!res.ok) throw new Error("Failed to load admin");
    return res.json();
};

export default function AdminProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const { data: admin, isLoading } = useQuery({
        queryKey: ["superAdmin", id],
        queryFn: () => fetchAdmin(id),
    });

    if (isLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>;
    if (!admin) return <div className="p-6 text-center text-gray-500">Admin not found</div>;

    return (
        <div className="min-h-screen bg-white p-6 font-sans text-gray-900">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Admin Profile</h2>

            <div className="mb-8 w-full">
                <h3 className="text-base font-semibold uppercase text-gray-700 mb-4">Admin Personal Details</h3>
                <div className="flex flex-col w-[50%] gap-x-3 gap-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Admin Name:</span>
                        <span className="font-medium">{admin.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Email Address:</span>
                        <span className="font-medium">{admin.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Admin Role:</span>
                        <span className="font-medium">{admin.role}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`font-medium ${admin.status === "Active" ? "text-green-600" : "text-orange-500"}`}>{admin.status}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Last Login:</span>
                        <span className="font-medium">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "Never"}</span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4  border-gray-200 mt-8">
                <Link
                    href="/super-admin"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Super Admin
                </Link>
            </div>
        </div>
    );
}
