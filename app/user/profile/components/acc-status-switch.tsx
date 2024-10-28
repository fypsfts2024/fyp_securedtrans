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
import DeactivatePinDialog from "@/components/deactivate-pin-dialog";
import { banUserAction } from "@/lib/actions";
import { createClient } from "@/utils/supabase/client";
import { set } from "date-fns";

type AccountStatusSwitchProps = {
    initialStatus: "active" | "inactive";
};

const AccountStatusSwitch = ({ initialStatus }: AccountStatusSwitchProps) => {
    const [isActive, setIsActive] = useState(initialStatus === "active");
    const [showDialog, setShowDialog] = useState(false);
    const [showDeactivatePinDialog, setShowDeactivatePinDialog] =
        useState(false);

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
        setShowDialog(false);
        setShowDialog(false);
        setShowDeactivatePinDialog(true);
    };

    const handleBanUser = async () => {
        const supabase = createClient();
        setIsActive(false);
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const response = await banUserAction(user?.id as string);
        if (response.success) {
            supabase.auth.signOut();
            //rediect to home page
            window.location.href = "/";
        } else {
            // Handle ban failure
            console.error("Failed to ban user:", response.message);
        }
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        setShowDeactivatePinDialog(false);
        setIsActive(true);
    };

    return (
        <div>
            <Switch checked={isActive} onCheckedChange={handleSwitchChange} />
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

            {showDeactivatePinDialog && (
                <DeactivatePinDialog
                    open={showDeactivatePinDialog}
                    onClose={() => handleDialogClose()}
                    onSuccess={() => {
                        handleBanUser();
                    }}
                    onFailure={() => {
                        handleDialogClose();
                    }}
                />
            )}
        </div>
    );
};

export default AccountStatusSwitch;
