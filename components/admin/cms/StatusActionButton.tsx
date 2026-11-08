"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { callAction, statusAction, type CmsNoun } from "@/lib/admin/cms";
import type { OperationResult } from "@/lib/backend/errors";
import type { ContentStatus } from "@/types/cms";
import { dismissNotice } from "./CmsNotice";
import { ConfirmDialog } from "./ConfirmDialog";

interface StatusActionButtonProps {
  status: ContentStatus;
  noun: CmsNoun;
  title: string;
  /** Server Action terbit atau arsip yang sudah di-bind ke id entri. */
  action: () => Promise<OperationResult<null>>;
  /** Tujuan setelah sukses, membawa parameter `notice`. */
  successHref: string;
}

/** Tombol aksi status (terbit, arsip, terbit ulang) dengan konfirmasi bila berisiko. */
export function StatusActionButton({
  status,
  noun,
  title,
  action,
  successHref,
}: StatusActionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const plan = statusAction(status, noun, title);

  const run = () =>
    startTransition(async () => {
      setError("");
      const result = await callAction(action);
      setOpen(false);
      if (result.ok) return router.replace(successHref, { scroll: false });
      dismissNotice();
      setError(result.error.message);
    });

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={plan.kind === "archive" ? "danger" : "outline"}
        aria-label={`${plan.label} ${title}`}
        disabled={pending}
        aria-busy={pending}
        onClick={() => (plan.confirm ? setOpen(true) : run())}
      >
        {plan.label}
      </Button>
      {error ? (
        <p role="alert" className="basis-full text-xs text-error">
          {error}
        </p>
      ) : null}
      {plan.confirm ? (
        <ConfirmDialog
          open={open}
          {...plan.confirm}
          pending={pending}
          onConfirm={run}
          onCancel={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
