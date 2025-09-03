//app/(dashboard)/e-repair/e-bookings/[id]/assign-repairer-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";

interface Repairer {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    repairCategory?: string;
    repairSkills?: string[];
}

interface AssignRepairerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingId: string;
    onAssign: (repairerId: string, repairerName: string) => void;
    currentRepairer?: string;
}

export function AssignRepairerDialog({
    open,
    onOpenChange,
    bookingId,
    onAssign,
    currentRepairer
}: AssignRepairerDialogProps) {
    const [selectedRepairer, setSelectedRepairer] = useState("");
    const [repairers, setRepairers] = useState<Repairer[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAvailableRepairers = async () => {
        try {
            setLoading(true);
            // Fetch repairers from your API
            const { data } = await apiClient.get("/booking-repairers");
            setRepairers(data);
        } catch (error) {
            console.error("Error fetching repairers:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch repairers when dialog opens
    useEffect(() => {
        if (open) {
            fetchAvailableRepairers();
        }
    }, [open]);

    const handleAssign = () => {
        if (selectedRepairer) {
            const repairer = repairers.find(r => r.id === selectedRepairer);
            if (repairer) {
                onAssign(repairer.id, repairer.name);
                setSelectedRepairer("");
                onOpenChange(false);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Repairer</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Select Repairer</label>
                        <Select
                            value={selectedRepairer}
                            onValueChange={setSelectedRepairer}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={loading ? "Loading repairers..." : "Choose a repairer"} />
                            </SelectTrigger>
                            <SelectContent>
                                {repairers.map((repairer) => (
                                    <SelectItem key={repairer.id} value={repairer.id}>
                                        {repairer.name} - {repairer.repairCategory || "General Repair"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedRepairer || loading}
                        >
                            {loading ? "Loading..." : "Assign"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}