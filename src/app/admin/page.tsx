/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { AlertTriangle, Trash2, ArrowUpDown, Search, Mail, X, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../components/ui/alert-dialog";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

interface ClerkUser {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
}

export default function AdminPage() {
    const { user, isSignedIn, isLoaded } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<ClerkUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [userToDelete, setUserToDelete] = useState<ClerkUser | null>(null);
    const [sortBy, setSortBy] = useState<string>("name"); // 'name' or 'email'
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Ascending or Descending
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false); // Track sending state
    const [isVerifying, setIsVerifying] = useState(true);
    const [lastGameSync, setLastGameSync] = useState<string | null>(null);
    const [isGameSyncing, setIsGameSyncing] = useState(false);
    const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded) {
            console.log('Clerk not loaded yet');
            return;
        }
        if (!isSignedIn) {
            console.log('User not signed in');
            return router.push("/sign-in");
        }

        // Debug user metadata
        console.log('User object:', {
            id: user?.id,
            isSignedIn,
            publicMetadata: user?.publicMetadata
        });

        if (!user?.publicMetadata || user.publicMetadata.role !== "admin") {
            console.log('Access denied - User metadata:', {
                hasMetadata: !!user?.publicMetadata,
                role: user?.publicMetadata?.role
            });
            alert("Access denied. Admins only.");
            return router.push("/");
        }

        const fetchUsers = async () => {
            try {
                if (!isSignedIn || !user) {
                    console.warn('[Client] User not signed in');
                    router.push("/sign-in");
                    return;
                }

                const token = await getToken();
                if (!token) {
                    console.error('[Client] No authentication token available');
                    throw new Error('Authentication token not available');
                }

                console.log('[Client] Making request to fetch users');
                const response = await fetch("/admin/get-users", {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('[Client] Response status:', response.status);
                
                if (response.status === 401) {
                    console.error('[Client] Unauthorized access');
                    router.push("/sign-in");
                    return;
                }

                if (response.status === 403) {
                    console.error('[Client] Access forbidden - Not an admin');
                    const responseData = await response.json();
                    console.error('[Client] Server response:', responseData);
                    alert("Access denied. Admins only.");
                    router.push("/");
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('[Client] API Error:', errorData);
                    throw new Error(`Failed to fetch users. Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('[Client] Fetched users data:', data);
                
                if (!Array.isArray(data)) {
                    console.error('[Client] Invalid response format:', data);
                    throw new Error('Invalid response format: expected an array of users');
                }

                if (data.length === 0) {
                    console.log('[Client] No users returned from API');
                } else {
                    console.log(`[Client] Successfully fetched ${data.length} users`);
                }

                setUsers(data);
                setError(null);
            } catch (error) {
                console.error("[Client] Error fetching users:", error);
                setError(error instanceof Error ? error.message : 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
        setIsVerifying(false);
    }, [isSignedIn, user, isLoaded, getToken, router]);

    // Function to sync games
    const syncGames = async () => {
        setIsGameSyncing(true);
        try {
            const token = await getToken();
            const response = await fetch('/api/admin/syncSportsRadarData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ gameIds: [] }), // Empty array to sync all games
            });

            if (!response.ok) {
                throw new Error('Failed to sync games');
            }

            setLastGameSync(new Date().toLocaleString());
        } catch (error) {
            console.error('Error syncing games:', error);
            alert('Failed to sync games');
        } finally {
            setIsGameSyncing(false);
        }
    };

    // Set up auto-sync interval
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        
        if (autoSyncEnabled) {
            // Run immediately when enabled
            syncGames();
            
            // Set up interval for every 6 hours
            intervalId = setInterval(syncGames, 6 * 60 * 60 * 1000);
            
            // Log next sync time
            const nextSync = new Date(Date.now() + 6 * 60 * 60 * 1000);
            console.log('Next sync scheduled for:', nextSync.toLocaleString());
        }
        
        // Cleanup interval on component unmount or when autoSync is disabled
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [autoSyncEnabled]);

    if (!isLoaded || isVerifying) {
        return (
            <div className="h-screen flex items-center justify-center text-black dark:text-white text-lg font-bold">
                <p className="text-xl">Verifying...</p>
            </div>
        );
    }

    const removeUser = async () => {
        if (!userToDelete) return;

        try {
            const token = await getToken();
            const response = await fetch(`/admin/delete-user`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: userToDelete.id }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            setUsers(users.filter(user => user.id !== userToDelete.id));
            alert("User deleted successfully.");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        } finally {
            setUserToDelete(null);
        }
    };

    // Sorting function
    const sortedUsers = [...users].sort((a, b) => {
        let keyA = "";
        let keyB = "";

        if (sortBy === "name") {
            keyA = `${a.firstName} ${a.lastName}`.toLowerCase();
            keyB = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else if (sortBy === "email") {
            keyA = a.email.toLowerCase();
            keyB = b.email.toLowerCase();
        }

        return sortOrder === "asc" ? keyA.localeCompare(keyB) : keyB.localeCompare(keyA);
    });

    const toggleSort = (field: "name" | "email") => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle sorting order
        } else {
            setSortBy(field);
            setSortOrder("asc"); // Default to ascending when switching fields
        }
    };

    // Search function
    const filteredUsers = searchQuery
        ? sortedUsers
            .filter((user) => {
                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                const email = user.email.toLowerCase();
                return fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
            })
            .sort((a, b) => {
                // Bring search matches to the top
                const fullNameA = `${a.firstName} ${a.lastName}`.toLowerCase();
                const fullNameB = `${b.firstName} ${b.lastName}`.toLowerCase();
                const emailA = a.email.toLowerCase();
                const emailB = b.email.toLowerCase();

                const aMatch = fullNameA.includes(searchQuery.toLowerCase()) ? 1 : emailA.includes(searchQuery.toLowerCase()) ? 1 : 0;
                const bMatch = fullNameB.includes(searchQuery.toLowerCase()) ? 1 : emailB.includes(searchQuery.toLowerCase()) ? 1 : 0;

                return bMatch - aMatch;
            })
        : sortedUsers;

    // Highlight search term in name and email
    const highlightMatch = (text: string) => {
        if (!searchQuery) return text;
        const regex = new RegExp(`(${searchQuery})`, "gi");
        return text.split(regex).map((part, i) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
                <span key={i} className="bg-yellow-300 text-black px-1 rounded">{part}</span>
            ) : (
                part
            )
        );
    };

    const toggleSelectUser = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    // Select or deselect all users
    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]); // Deselect all
        } else {
            setSelectedUsers(users.map((user) => user.id)); // Select all
        }
    };

    // Open Email Modal
    const openEmailModal = () => {
        if (selectedUsers.length === 0) {
            alert("Please select at least one user.");
            return;
        }
        setIsEmailModalOpen(true);
    };

    // Send Email Function
    const sendMassEmail = async () => {
        if (!emailSubject || !emailBody) {
            alert("Subject and email body cannot be empty.");
            return;
        }

        const selectedEmails = users
            .filter((user) => selectedUsers.includes(user.id))
            .map((user) => user.email);

        try {
            setIsSending(true);
            const response = await fetch("/admin/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: emailSubject,
                    body: emailBody,
                    recipients: selectedEmails,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send emails.");
            }

            alert("Emails sent successfully!");
            setIsEmailModalOpen(false);
            setEmailSubject("");
            setEmailBody("");
        } catch (error) {
            console.error("Error sending emails:", error);
            alert("Failed to send emails.");
        } finally {
            setIsSending(false); // Re-enable button
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-black text-white rounded-lg shadow-lg">
            {/* Game Sync Section */}
            <div className="mb-8 p-4 border border-gray-700 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Game Synchronization</h2>
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                        className={`${autoSyncEnabled ? 'bg-green-600' : 'bg-blue-500'} text-white`}
                    >
                        {autoSyncEnabled ? 'Disable Auto-Sync' : 'Enable Auto-Sync'}
                    </Button>
                    <Button
                        onClick={syncGames}
                        disabled={isGameSyncing}
                        className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={`${isGameSyncing ? 'animate-spin' : ''}`} />
                        {isGameSyncing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                </div>
                <div className="text-sm text-gray-400">
                    {autoSyncEnabled && <p>Auto-sync is enabled (every 6 hours)</p>}
                    {lastGameSync && <p>Last synced: {lastGameSync}</p>}
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Users</h1>
                <div className="flex items-center gap-3 pl-2">
                    <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2" onClick={openEmailModal} disabled={selectedUsers.length === 0}>
                                <Mail size={16} />
                                <span className="hidden sm:block">Send Email</span>
                            </Button>
                        </DialogTrigger>

                        {/* Email Modal */}
                        <DialogContent className="text-white border border-gray-600">
                            <DialogHeader>
                                <DialogTitle>Compose Email</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Sending to <b>{selectedUsers.length}</b> recipients.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Email Subject */}
                            <input
                                type="text"
                                placeholder="Subject"
                                className="w-full p-2 text-black rounded-lg text-sm border border-gray-400"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                            />

                            {/* Email Body */}
                            <textarea
                                placeholder="Write your email here..."
                                className="w-full h-40 p-2 text-black rounded-lg text-sm border border-gray-400"
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                            />

                            {/* Modal Actions */}
                            <DialogFooter>
                                <Button className="bg-gray-500 hover:bg-gray-600 text-white" variant="outline" onClick={() => setIsEmailModalOpen(false)}>
                                    <X size={16} /> Cancel
                                </Button>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={sendMassEmail} disabled={isSending}>
                                    {isSending ? "Sending..." : "Send Email"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <div className="relative w-50">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full p-2 pl-9 text-black rounded-lg text-sm border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                </div>
            </div>

            <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-800 text-white hover:bg-gray-800">
                            <TableHead className="p-4 text-left border-b border-gray-700 cursor-pointer">
                                <input className="cursor-pointer" type="checkbox" checked={selectedUsers.length === users.length} onChange={toggleSelectAll} />
                            </TableHead>
                            <TableHead className="p-4 text-left border-b border-gray-700 cursor-pointer"
                                onClick={() => toggleSort("name")}>
                                Name
                                <ArrowUpDown size={16} className="inline ml-2" />
                            </TableHead>
                            <TableHead className="p-4 text-left border-b border-gray-700 cursor-pointer"
                                onClick={() => toggleSort("email")}>
                                Email
                                <ArrowUpDown size={16} className="inline ml-2" />
                            </TableHead>
                            <TableHead className="p-4 text-left border-b border-gray-700">Username</TableHead>

                            <TableHead className="p-4 text-left border-b border-gray-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, index) => (
                                <TableRow key={index} className="border-b border-gray-700">
                                    <TableCell className="p-4"><Skeleton className="h-4 w-32 bg-gray-700" /></TableCell>
                                    <TableCell className="p-4"><Skeleton className="h-4 w-40 bg-gray-700" /></TableCell>
                                    <TableCell className="p-4"><Skeleton className="h-4 w-20 bg-gray-700" /></TableCell>
                                    <TableCell className="p-4"><Skeleton className="h-4 w-20 bg-gray-700" /></TableCell>
                                    <TableCell className="p-4"><Skeleton className="h-4 w-20 bg-gray-700" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                                <TableRow key={u.id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <TableCell className="p-4"><input className="cursor-pointer" type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleSelectUser(u.id)} /></TableCell>
                                    <TableCell className="p-4 text-white">{highlightMatch(`${u.firstName} ${u.lastName}`)}</TableCell>
                                    <TableCell className="p-4">{highlightMatch(u.email)}</TableCell>
                                    <TableCell className="p-4">{u.username}</TableCell>
                                    <TableCell className="p-4">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    className="flex items-center gap-2"
                                                    onClick={() => setUserToDelete(u)}
                                                >
                                                    <Trash2 size={16} /> Remove
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-gray-900 text-white border border-gray-700">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-gray-300">
                                                        This action cannot be undone. This will permanently delete <b>{u.firstName} {u.lastName}</b> from your system.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-gray-500 hover:bg-gray-600 text-white">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={removeUser}>
                                                        Yes, Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="p-6 text-center text-gray-400">
                                    <AlertTriangle className="inline-block mr-2 text-yellow-500" />
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
