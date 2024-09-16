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
                min={8}
                required
                className="mb-3"
            />
            {isOpen ? (
                <EyeOff
                    className="absolute top-5 right-2 transform -translate-y-1/2"
                    onClick={() => setIsOpen(!isOpen)}
                />
            ) : (
                <Eye
                    className="absolute top-5 right-2 transform -translate-y-1/2"
                    onClick={() => setIsOpen(!isOpen)}
                />
            )}
        </div>
    );
}
