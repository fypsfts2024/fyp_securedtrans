"use client";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

type PasswordInputProps = {
    name: string;
    placeholder: string;
};

export function PasswordInput({ name, placeholder }: PasswordInputProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <div className="relative">
            <Input
                type={isOpen ? "text" : "password"}
                name={name}
                placeholder={placeholder}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._])[A-Za-z\d@$!%*?&._]{8,}$"
                title="Password must contain at least 8 characters, including uppercase, lowercase, numbers, and symbols." //passwd format
                required
                className="mb-3"
            />
            {isOpen ? (
                <Eye
                    className="absolute top-5 right-2 transform -translate-y-1/2"
                    onClick={() => setIsOpen(!isOpen)}
                />
            ) : (
                <EyeOff
                    className="absolute top-5 right-2 transform -translate-y-1/2"
                    onClick={() => setIsOpen(!isOpen)}
                />
            )}
        </div>
    );
}
