"use client";
import { useState, useTransition } from "react";
import { logoutAction } from "@/src/app/admin/actions";
import { Button } from "@/src/components/atoms/Button/Button";
export function AdminLogoutButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return (
    <div>
      <Button
        variant="outline"
        disabled={pending}
        className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
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
        <p role="alert" className="mt-3 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
