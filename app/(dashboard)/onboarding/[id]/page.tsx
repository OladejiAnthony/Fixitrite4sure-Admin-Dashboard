//app/(dashboard)/onboarding/[id]/page.tsx
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";


interface Onboarding {
    id: number;
    dateTime: string;
    surname: string;
    otherNames: string;
    phone: string;
    accountType: "Customer" | "Repairer" | "Repair Company" | "Vendor";
    status: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    profilePicture: string;
    govIdType: string;
    govIdFront: string;
    govIdBack: string;
    dob: string;
    cardAddress: string;
    occupation: string;
    pollingUnit: string;
    vin: string;
    businessName?: string;
    businessPhone?: string;
    repairCategory?: string;
    repairSkills?: string[];
    yearsExperience?: number;
    associationName?: string;
    certificationUrl?: string;
    numberOfRepairers?: number;
    businessLicenseUrl?: string;
    proofOfInsuranceUrl?: string;
    registeredBusinessName?: string;
    typeOfBusiness?: string;
    cacRegistrationNumber?: string;
    dateOfRegistration?: string;
    cacDocumentUrl?: string;
    proofOfAddressUrl?: string;
}

async function fetchOnboardingDetails(id: string) {
    const { data } = await apiClient.get(`/onboarding/${id}`);
    return data as Onboarding;
}

export default function OnboardingDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [step, setStep] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ["onboarding", id],
        queryFn: () => fetchOnboardingDetails(id),
    });

    const updateStatusMutation = useMutation({
        mutationFn: (newStatus: string) =>
            apiClient.patch(`/onboarding/${id}`, { status: newStatus }),
        onSuccess: (data, variables) => {
            const action = variables === "approved" ? "approved" : "rejected";
            toast.success(`User ${action} successfully`);
            router.push("/onboarding");
        },
        onError: (error) => {
            toast.error("Failed to update user status");
            console.error("Error updating status:", error);
        }
    });

    if (isLoading || !data) {
        return <div className="p-6 text-center text-gray-600">Loading...</div>;
    }

    let maxStep = data.accountType === "Customer" ? 2 : 3;

    let title;
    switch (data.accountType) {
        case "Repair Company":
            title = "REPAIR COMPANY DETAILS";
            break;
        case "Vendor":
            title = "VENDOR DETAILS";
            break;
        default:
            title = `${data.accountType.toUpperCase()} USER DETAILS`;
    }

    const handleNext = () => {
        if (step < maxStep) setStep(step + 1);
    };

    let content;

    if (step === 1) {
        let personalTitle = ["Customer", "Repairer"].includes(data.accountType) ? "USER PERSONAL DETAILS" : "PERSONAL DETAILS";
        let addressTitle = data.accountType === "Repair Company" ? "COMPANY'S ADDRESS" : ["Customer", "Repairer"].includes(data.accountType) ? "WORK ADDRESS" : "BUSINESS ADDRESS";

        let personalContent;
        switch (data.accountType) {
            case "Customer":
                personalContent = (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.firstName}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.lastName}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.phone}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.email}</p>
                        </div>
                    </div>
                );
                break;
            case "Repairer":
                personalContent = (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.firstName}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.lastName}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Business Phone Number</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.businessPhone}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.email}</p>
                        </div>
                    </div>
                );
                break;
            case "Repair Company":
                personalContent = (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Company's Name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.businessName}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Contact Person Phone Number</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.phone}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Contact Person First Name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.firstName}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Company's Phone Number</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.businessPhone}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Contact Person Last Name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.lastName}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Company's Email Address</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.email}</p>
                        </div>
                    </div>
                );
                break;
            case "Vendor":
                personalContent = (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.firstName}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Business Phone Number</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.businessPhone}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.lastName}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Business Email Address</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.email}</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Business Name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.businessName}</p>
                        </div>
                    </div>
                );
                break;
        }

        content = (
            <div className="w-full">
                <h2 className="text-base font-semibold text-blue-800 mb-4">{personalTitle}</h2>
                {personalContent}
                <h2 className="text-base font-semibold text-blue-800 mb-4">{addressTitle}</h2>
                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800 mb-4">{data.address}</p>
                <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">Map Placeholder with Pin</div>
                <button
                    onClick={handleNext}
                    className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                    Next
                </button>
            </div>
        );
    } else if (step === 2) {
        let verificationTitle = ["Customer", "Repairer"].includes(data.accountType) ? "USER VERIFICATION" : "CONTACT PERSON VERIFICATION";

        content = (
            <div className="w-full">
                <h2 className="text-base font-semibold text-blue-800 mb-4">{verificationTitle}</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Profile Picture</label>
                        <img src={data.profilePicture} alt="Profile" className="w-24 h-32 object-cover rounded-md" />
                        <label className="block text-xs font-medium text-gray-600 mt-6 mb-2">Government Issued ID</label>
                        <p className="text-xs font-medium text-gray-600 mb-2">{data.govIdType}</p>
                        <div className="flex gap-4">
                            <div>
                                <img src={data.govIdFront} alt="Front" className="w-32 h-20 object-cover rounded-md" />
                                <p className="text-xs text-gray-500 mt-1">(Front)</p>
                            </div>
                            <div>
                                <img src={data.govIdBack} alt="Back" className="w-32 h-20 object-cover rounded-md" />
                                <p className="text-xs text-gray-500 mt-1">(Back)</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Holder's first name</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.firstName}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Holder's other names</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.otherNames}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Date of birth</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.dob}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Address on the Card</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.cardAddress}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Occupation</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.occupation}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Polling unit</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.pollingUnit}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Voter's Identification Number (VIN)</label>
                            <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.vin}</p>
                        </div>
                    </div>
                </div>
                {data.accountType === "Customer" ? (
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => updateStatusMutation.mutate("approved")}
                            disabled={updateStatusMutation.isPending}
                            className={`bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors ${updateStatusMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {updateStatusMutation.isPending ? "Processing..." : "Accept User"}
                        </button>
                        <button
                            onClick={() => updateStatusMutation.mutate("rejected")}
                            disabled={updateStatusMutation.isPending}
                            className={`bg-red-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors ${updateStatusMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {updateStatusMutation.isPending ? "Processing..." : "Reject User"}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleNext}
                        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                        Next
                    </button>
                )}
            </div>
        );
    } else if (step === 3) {
        let profContent;
        switch (data.accountType) {
            case "Repairer":
                profContent = (
                    <>
                        <h2 className="text-base font-semibold text-blue-800 mb-4">PROFESSIONAL INFORMATION</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Repair Category</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.repairCategory}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Repair Skills</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800 whitespace-pre-line">{data.repairSkills?.join("\n")}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Years of Experience</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.yearsExperience} years</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Association Name</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.associationName}</p>
                            </div>
                        </div>
                        <h2 className="text-base font-semibold text-blue-800 mb-4">CERTIFICATION AND WORK LICENSE</h2>
                        <img src={data.certificationUrl} alt="Certificate" className="w-64 h-40 object-cover rounded-md mb-6" />
                    </>
                );
                break;
            case "Repair Company":
                profContent = (
                    <>
                        <h2 className="text-base font-semibold text-blue-800 mb-4">COMPANY'S INFORMATION</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Number of Repairers</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.numberOfRepairers}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Repair Category</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.repairCategory}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Repair Skills</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800 whitespace-pre-line">{data.repairSkills?.join("\n")}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Years in Service</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.yearsExperience} years</p>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Company Registration Number</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.associationName}</p>
                            </div>
                        </div>
                        <h2 className="text-base font-semibold text-blue-800 mb-4">DOCUMENT VERIFICATION</h2>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Company's Business License</label>
                                <img src={data.businessLicenseUrl} alt="Business License" className="w-64 h-40 object-cover rounded-md" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Company's Proof of Insurance</label>
                                <img src={data.proofOfInsuranceUrl} alt="Proof of Insurance" className="w-64 h-40 object-cover rounded-md" />
                            </div>
                        </div>
                    </>
                );
                break;
            case "Vendor":
                profContent = (
                    <>
                        <h2 className="text-base font-semibold text-blue-800 mb-4">BUSINESS INFORMATION</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Registered Business Name</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.registeredBusinessName}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Type of Business</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.typeOfBusiness}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">CAC Registration Number</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.cacRegistrationNumber}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Date of Registration</label>
                                <p className="bg-white border border-gray-300 p-2 rounded-md text-sm text-gray-800">{data.dateOfRegistration}</p>
                            </div>
                        </div>
                        <h2 className="text-base font-semibold text-blue-800 mb-4">DOCUMENT VERIFICATION</h2>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">CAC Registration Document</label>
                                <img src={data.cacDocumentUrl} alt="CAC Document" className="w-64 h-40 object-cover rounded-md" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Proof of Address</label>
                                <img src={data.proofOfAddressUrl} alt="Proof of Address" className="w-64 h-40 object-cover rounded-md" />
                            </div>
                        </div>
                    </>
                );
                break;
        }

        content = (
            <div className="w-full">
                {profContent}
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => updateStatusMutation.mutate("approved")}
                        disabled={updateStatusMutation.isPending}
                        className={`bg-blue-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors ${updateStatusMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {updateStatusMutation.isPending ? "Processing..." : "Accept User"}
                    </button>
                    <button
                        onClick={() => updateStatusMutation.mutate("rejected")}
                        disabled={updateStatusMutation.isPending}
                        className={`bg-red-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors ${updateStatusMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {updateStatusMutation.isPending ? "Processing..." : "Reject User"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="px-6 py-4 border-b border-gray-200">
                <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Onboarding Page
                </Link>
            </div>

            <div className=" mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6">
                <h1 className="text-xl font-bold text-gray-800 mb-6">{title}</h1>
                {content}
            </div>
        </div>
    );
}

