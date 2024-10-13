"use client";
import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface UserProfile {
    username: string;
    email: string;
}

interface File {
    id: string;
    user_profile: UserProfile;
    file_name: string;
    file_path: string;
    status: "active" | "deleted" | "blocked" | "otp_sent";
    pin_attempts: number;
    last_pin_attempt: string;
    created_at: string;
}

interface AuditLog {
    id: string;
    action: string;
    created_at: string;
    file_id: string;
    file: File | null;
    user_id: string;
    user_profile: UserProfile;
}

type AuditLogProps = {
    log: AuditLog[];
};

type SortField = "created_at" | "file_name";
type SortOrder = "asc" | "desc";

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(date);
};

const ITEMS_PER_PAGE = 10;

const AuditLogTable: React.FC<AuditLogProps> = ({ log }) => {
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [currentPage, setCurrentPage] = useState(1);

    if (log.length === 0) {
        return null;
    }

    const sortedLogs = [...log].sort((a, b) => {
        if (sortField === "created_at") {
            return sortOrder === "asc"
                ? new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime()
                : new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime();
        } else {
            return sortOrder === "asc"
                ? (a.file?.file_name || "").localeCompare(
                      b.file?.file_name || ""
                  )
                : (b.file?.file_name || "").localeCompare(
                      a.file?.file_name || ""
                  );
        }
    });

    const totalPages = Math.ceil(sortedLogs.length / ITEMS_PER_PAGE);
    const paginatedLogs = sortedLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field)
            return <ArrowDownUp className="h-4 w-4 ml-1" />;
        return sortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4 ml-1" />
        ) : (
            <ArrowDown className="h-4 w-4 ml-1" />
        );
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => toggleSort("created_at")}
                                className="hover:bg-transparent px-0"
                            >
                                Created at
                                <SortIcon field="created_at" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button
                                variant="ghost"
                                onClick={() => toggleSort("file_name")}
                                className="hover:bg-transparent px-0"
                            >
                                Filename
                                <SortIcon field="file_name" />
                            </Button>
                        </TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedLogs.map((entry, index) => (
                        <TableRow key={entry.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                                {formatDateTime(entry.created_at)}
                            </TableCell>
                            <TableCell>{entry.file?.file_name}</TableCell>
                            <TableCell>{entry.user_profile.username}</TableCell>
                            <TableCell className="text-right">
                                {entry.action}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="mt-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() =>
                                    handlePageChange(
                                        Math.max(1, currentPage - 1)
                                    )
                                }
                                className={
                                    currentPage === 1
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }
                            />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 1 &&
                                    pageNumber <= currentPage + 1)
                            ) {
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            onClick={() =>
                                                handlePageChange(pageNumber)
                                            }
                                            isActive={
                                                currentPage === pageNumber
                                            }
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            } else if (
                                pageNumber === currentPage - 2 ||
                                pageNumber === currentPage + 2
                            ) {
                                return <PaginationEllipsis key={pageNumber} />;
                            }
                            return null;
                        })}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() =>
                                    handlePageChange(
                                        Math.min(totalPages, currentPage + 1)
                                    )
                                }
                                className={
                                    currentPage === totalPages
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </>
    );
};

export default AuditLogTable;
