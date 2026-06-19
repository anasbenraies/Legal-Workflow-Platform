"use client";

import React from "react";
import { useAuth } from "./AuthProvider";

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="w-full border-b bg-white/60 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold">Ketrone</div>
                </div>
                <div>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-zinc-700">{user.username}</div>
                            <a href="/admin/auth">
                                <button
                                    onClick={() => logout()}
                                    className="rounded-md bg-zinc-900 px-3 py-1 text-sm text-white hover:opacity-95"
                                >
                                    Sign out
                                </button>
                            </a>

                        </div>
                    ) : (
                        <a href="/admin/auth" className="rounded-md border px-3 py-1 text-sm">
                            Sign in
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
}
