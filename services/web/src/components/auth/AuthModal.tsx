import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { login, register } from "../../api/auth.ts";
import { useAuthStore } from "../../store/useAuthStore.ts";

export default function AuthModal() {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const setAuth = useAuthStore((s) => s.setAuth);
    const closeAuthModal = useAuthStore((s) => s.closeAuthModal);

    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameFocused, setUsernameFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const usernameRules = [
        { label: "3–20 characters", met: username.length >= 3 && username.length <= 20 },
        { label: "Only letters, numbers, _ and -", met: /^[a-zA-Z0-9_-]+$/.test(username) },
    ];

    const passwordRules = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(password) },
        { label: "One lowercase letter", met: /[a-z]/.test(password) },
        { label: "One number", met: /\d/.test(password) },
        { label: "One special character (@$!%*?&)", met: /[@$!%*?&]/.test(password) },
        { label: "No unsupported symbols (only A-Z, a-z, 0-9, @$!%*?&)", met: /^[A-Za-z\d@$!%*?&]*$/.test(password) },
    ];

    const showUsernameRules = mode === "register" && (usernameFocused || username.length > 0);
    const showPasswordRules = mode === "register" && (passwordFocused || password.length > 0);
    const isRegisterValid =
        usernameRules.every((rule) => rule.met) && passwordRules.every((rule) => rule.met);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (!dialog.open) {
            dialog.showModal();
        }

        if ("closedBy" in HTMLDialogElement.prototype) return;

        let pressedOutside = false;
        const isOutside = (e: PointerEvent) => {
            const rect = dialog.getBoundingClientRect();
            return (
                e.clientX < rect.left ||
                e.clientX > rect.right ||
                e.clientY < rect.top ||
                e.clientY > rect.bottom
            );
        };

        const onPointerDown = (e: PointerEvent) => {
            pressedOutside = isOutside(e);
        };
        const onPointerUp = (e: PointerEvent) => {
            if (pressedOutside && isOutside(e)) {
                dialog.close();
            }
        };

        dialog.addEventListener("pointerdown", onPointerDown);
        dialog.addEventListener("pointerup", onPointerUp);
        return () => {
            dialog.removeEventListener("pointerdown", onPointerDown);
            dialog.removeEventListener("pointerup", onPointerUp);
        };
    }, []);

    const switchMode = () => {
        setMode((prev) => (prev === "login" ? "register" : "login"));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data =
                mode === "login"
                    ? await login(email.trim(), password)
                    : await register(email.trim(), username.trim(), password);
            setAuth(data.token, data.user);
            dialogRef.current?.close();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error ?? "Authentication failed");
            } else {
                setError("Authentication failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog
            ref={dialogRef}
            closedby="any"
            aria-labelledby="auth-dialog-title"
            onClose={closeAuthModal}
            className="m-auto w-full max-w-md rounded-2xl bg-neutral-900 border border-white/10 p-6 text-white shadow-2xl"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 id="auth-dialog-title" className="text-2xl font-bold tracking-tight">
                    {mode === "login" ? "Sign in to Matify" : "Create account"}
                </h2>
                <button
                    type="button"
                    onClick={() => dialogRef.current?.close()}
                    aria-label="Close"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-neutral-300 font-medium">Email</span>
                    <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                    />
                </label>

                {mode === "register" && (
                    <div className="flex flex-col gap-1.5 text-sm">
                        <label className="flex flex-col gap-1.5">
                            <span className="text-neutral-300 font-medium">Username</span>
                            <input
                                type="text"
                                required
                                minLength={3}
                                maxLength={20}
                                pattern="[a-zA-Z0-9_-]+"
                                value={username}
                                onFocus={() => setUsernameFocused(true)}
                                onBlur={() => setUsernameFocused(false)}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                            />
                        </label>
                        {showUsernameRules && (
                            <div className="flex flex-col">
                                {usernameRules.map((rule) => (
                                    <div
                                        key={rule.label}
                                        className={`grid transition-all duration-200 ${
                                            rule.met
                                                ? "grid-rows-[0fr] opacity-0"
                                                : "grid-rows-[1fr] opacity-100 mt-1"
                                        }`}
                                    >
                                        <span className="overflow-hidden text-xs text-amber-300/90">
                                            • {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-1.5 text-sm">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-neutral-300 font-medium">Password</span>
                        <input
                            type="password"
                            required
                            minLength={mode === "register" ? 8 : 1}
                            value={password}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400"
                        />
                    </label>
                    {showPasswordRules && (
                        <div className="flex flex-col">
                            {passwordRules.map((rule) => (
                                <div
                                    key={rule.label}
                                    className={`grid transition-all duration-200 ${
                                        rule.met
                                            ? "grid-rows-[0fr] opacity-0"
                                            : "grid-rows-[1fr] opacity-100 mt-1"
                                    }`}
                                >
                                    <span className="overflow-hidden text-xs text-amber-300/90">
                                        • {rule.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="px-3.5 py-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || (mode === "register" && !isRegisterValid)}
                    className="mt-2 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold transition-colors cursor-pointer"
                >
                    {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10 text-center text-sm text-neutral-400">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                    type="button"
                    onClick={switchMode}
                    className="text-white font-medium hover:underline cursor-pointer"
                >
                    {mode === "login" ? "Register" : "Sign In"}
                </button>
            </div>
        </dialog>
    );
}
