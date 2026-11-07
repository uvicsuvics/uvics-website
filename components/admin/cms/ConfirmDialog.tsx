"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/Button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone: "primary" | "danger";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialog konfirmasi modal memakai `<dialog>` native: fokus terkunci di dialog,
 * Escape membatalkan, dan fokus awal di tombol Batal (pilihan aman).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl bg-white p-6 text-left shadow-xl backdrop:bg-gray-900/45"
    >
      <h2 id={`${id}-title`} className="text-lg font-bold text-gray-900">
        {title}
      </h2>
      <p id={`${id}-description`} className="mt-2 text-sm text-gray-600">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={pending}
        >
          Batal
        </Button>
        <Button
          type="button"
          variant={tone === "danger" ? "danger" : "primary"}
          size="sm"
          onClick={onConfirm}
          disabled={pending}
          aria-busy={pending}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
