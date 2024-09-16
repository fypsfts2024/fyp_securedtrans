"use client";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AccountStatusSwitchProps = {
    initialStatus: "active" | "inactive";
};

const AccountStatusSwitch = ({ initialStatus }: AccountStatusSwitchProps) => {
    const [isActive, setIsActive] = useState(initialStatus === "active");
    const [showDialog, setShowDialog] = useState(false);

    const handleSwitchChange = (checked: boolean) => {
        if (checked) {
            // Activating the account doesn't need confirmation
            setIsActive(true);
        } else {
            // Show confirmation dialog when trying to deactivate
            setShowDialog(true);
        }
    };

    const handleConfirmDeactivation = () => {
        setIsActive(false);
        setShowDialog(false);
    };

    return (
        <div>
            <Switch
                checked={isActive}
                onCheckedChange={handleSwitchChange}
            />
            <input
                type="hidden"
                name="acc-status"
                value={isActive ? "active" : "inactive"}
            />
            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Confirm Account Deactivation
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to deactivate your account?
                            You won't be able to enter the system anymore if you
                            deactivate your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDeactivation}>
                            Confirm Deactivation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AccountStatusSwitch;
