"use client";
import { useState, useTransition } from "react";
import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AdminLogoutButtonProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AdminLogoutButton({
  size = "sm",
  className,
}: AdminLogoutButtonProps = {}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
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
        onClick={() =>
          startTransition(async () => {
            setError("");
            const result = await logoutAction();
            if (result && !result.ok) setError(result.error.message);
          })
        }
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
