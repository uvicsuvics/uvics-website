"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AdminLogoutButtonProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "outline" | "dropdown-item";
  className?: string;
}

export function AdminLogoutButton({
  size = "sm",
  variant = "outline",
  className,
}: AdminLogoutButtonProps = {}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleLogout = () => {
    startTransition(async () => {
      setError("");
      const result = await logoutAction();
      if (result && !result.ok) setError(result.error.message);
    });
  };

  if (variant === "dropdown-item") {
    return (
      <div>
        <button
          type="button"
          disabled={pending}
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-error transition-colors hover:bg-red-50/80 focus-visible:outline-2 focus-visible:outline-error text-left disabled:opacity-50",
            className
          )}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{pending ? "Keluar…" : "Keluar dari sesi ini"}</span>
        </button>
        {error && (
          <p role="alert" className="mt-1 px-2.5 text-[11px] text-error">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="outline"
        size={size}
        disabled={pending}
        className={cn(
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
          className
        )}
        onClick={handleLogout}
      >
        {pending ? "Keluar…" : "Keluar dari sesi ini"}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
