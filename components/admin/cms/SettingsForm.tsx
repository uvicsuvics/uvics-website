"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSettingsAction } from "@/app/admin/(protected)/settings/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cmsErrorMap, cmsFailureView } from "@/lib/admin/cms";
import {
  changedSettings,
  SETTINGS_CLEARED_MESSAGE,
  SETTINGS_KEYS,
  settingsFormSchema,
  type SettingsFormValues,
} from "@/lib/admin/settings";
import { cn } from "@/lib/utils";
import { CmsBanner } from "./CmsBanner";
import { ConfirmDialog } from "./ConfirmDialog";
import { FormField } from "./FormField";

type TextKey = Exclude<keyof SettingsFormValues, "registration_open">;
interface FieldSpec {
  key: TextKey;
  label: string;
  type?: "email" | "tel" | "url";
  multiline?: boolean;
  hint?: string;
  placeholder?: string;
}

const GROUPS: Array<{
  id: string;
  title: string;
  description: string;
  fields: FieldSpec[];
}> = [
  {
    id: "identitas",
    title: "Identitas",
    description: "Nama yang tampil di judul tab dan footer.",
    fields: [
      { key: "organization_name", label: "Nama organisasi" },
      { key: "website_title", label: "Judul website" },
      { key: "footer_text", label: "Teks footer", multiline: true },
    ],
  },
  {
    id: "kontak",
    title: "Kontak",
    description: "Kontak resmi organisasi, bukan kontak pribadi pengurus.",
    fields: [
      {
        key: "email",
        label: "Email",
        type: "email",
        placeholder: "nama@domain.ac.id",
      },
      {
        key: "phone",
        label: "Telepon",
        type: "tel",
        hint: "Awali dengan +62 atau 08; disimpan sebagai +62.",
      },
      { key: "address", label: "Alamat", multiline: true },
    ],
  },
  {
    id: "sosial",
    title: "Media sosial",
    description: "Tautan lengkap yang diawali https://.",
    fields: [
      {
        key: "instagram_url",
        label: "Instagram",
        type: "url",
        placeholder: "https://",
      },
      {
        key: "linkedin_url",
        label: "LinkedIn",
        type: "url",
        placeholder: "https://",
      },
      {
        key: "github_url",
        label: "GitHub",
        type: "url",
        placeholder: "https://",
      },
      {
        key: "youtube_url",
        label: "YouTube",
        type: "url",
        placeholder: "https://",
      },
    ],
  },
  {
    id: "seo",
    title: "SEO",
    description: "Dipakai halaman yang tidak punya meta sendiri.",
    fields: [
      { key: "default_meta_title", label: "Meta title bawaan" },
      {
        key: "default_meta_description",
        label: "Meta description bawaan",
        multiline: true,
      },
    ],
  },
];

const REGISTRATION_CONFIRM = {
  true: {
    title: "Buka pendaftaran anggota?",
    description:
      "Form di halaman Join akan menerima pendaftaran baru sampai pendaftaran ditutup lagi.",
    confirmLabel: "Buka pendaftaran",
    tone: "primary",
  },
  false: {
    title: "Tutup pendaftaran anggota?",
    description: "Form di halaman Join tidak lagi menerima pendaftaran baru.",
    confirmLabel: "Tutup pendaftaran",
    tone: "danger",
  },
} as const;

/** Form pengaturan website (K5): hanya key yang berubah dikirim ke server. */
export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const [baseline, setBaseline] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [confirming, setConfirming] =
    useState<Partial<SettingsFormValues> | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema, { error: cmsErrorMap }),
    defaultValues: initial,
  });
  const values = useWatch({ control }) as SettingsFormValues;
  const pendingChanges = changedSettings(baseline, { ...baseline, ...values });
  const changeCount =
    Object.keys(pendingChanges.changes).length + pendingChanges.cleared.length;
  const registrationOpen =
    values.registration_open ?? baseline.registration_open;

  const save = (changes: Partial<SettingsFormValues>) =>
    startTransition(async () => {
      setConfirming(null);
      const result = await updateSettingsAction(changes);
      if (result.ok) {
        const next = { ...baseline, ...changes };
        setBaseline(next);
        reset(next);
        setBanner({
          tone: "success",
          message: "Pengaturan berhasil disimpan.",
        });
        return;
      }
      const view = cmsFailureView(result.error, SETTINGS_KEYS);
      if (view.kind === "banner")
        return setBanner({ tone: "error", message: view.message });
      setBanner({
        tone: "error",
        message: `Pengaturan belum disimpan. Periksa ${view.fields.length} isian yang ditandai.`,
      });
      view.fields.forEach(([name, message], index) =>
        setError(name, { message }, { shouldFocus: index === 0 }),
      );
    });

  const submit = handleSubmit((form) => {
    setBanner(null);
    const { changes, cleared } = changedSettings(baseline, form);
    if (cleared.length) {
      setBanner({
        tone: "error",
        message: `Pengaturan belum disimpan. Periksa ${cleared.length} isian yang ditandai.`,
      });
      cleared.forEach((key, index) =>
        setError(
          key,
          { message: SETTINGS_CLEARED_MESSAGE },
          { shouldFocus: index === 0 },
        ),
      );
      return;
    }
    if (!Object.keys(changes).length)
      return setBanner({
        tone: "success",
        message: "Tidak ada perubahan untuk disimpan.",
      });
    // Membuka atau menutup pendaftaran langsung berlaku di /join, jadi minta konfirmasi.
    if ("registration_open" in changes) return setConfirming(changes);
    save(changes);
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-busy={pending}
      className="flex flex-col gap-5"
    >
      {banner ? (
        <CmsBanner tone={banner.tone}>{banner.message}</CmsBanner>
      ) : null}
      <div className="flex flex-wrap items-start gap-6">
        <nav
          aria-label="Bagian pengaturan"
          className="hidden flex-[0_0_12rem] flex-col gap-1 lg:sticky lg:top-20 lg:flex"
        >
          {[...GROUPS, { id: "pendaftaran", title: "Pendaftaran" }].map(
            (group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-white hover:text-primary"
              >
                {group.title}
              </a>
            ),
          )}
        </nav>
        <div className="flex min-w-0 flex-[999_1_32rem] flex-col gap-5">
          {GROUPS.map((group) => (
            <section
              key={group.id}
              id={group.id}
              aria-labelledby={`${group.id}-title`}
              className="scroll-mt-20 rounded-xl border border-gray-200 bg-white p-6"
            >
              <h2
                id={`${group.id}-title`}
                className="text-base font-bold text-gray-900"
              >
                {group.title}
              </h2>
              <p className="mt-1 mb-5 text-sm text-gray-600">
                {group.description}
              </p>
              <div className="grid gap-5 md:grid-cols-2">
                {group.fields.map((field) => (
                  <FormField
                    key={field.key}
                    id={`setting-${field.key}`}
                    label={field.label}
                    hint={field.hint}
                    error={errors[field.key]?.message}
                    className={cn(field.multiline && "md:col-span-2")}
                  >
                    {(control) =>
                      field.multiline ? (
                        <Textarea
                          {...control}
                          rows={3}
                          {...register(field.key)}
                          defaultValue={initial[field.key]}
                        />
                      ) : (
                        <Input
                          {...control}
                          type={field.type ?? "text"}
                          placeholder={field.placeholder}
                          {...register(field.key)}
                          defaultValue={initial[field.key]}
                        />
                      )
                    }
                  </FormField>
                ))}
              </div>
            </section>
          ))}
          <section
            id="pendaftaran"
            aria-labelledby="pendaftaran-title"
            className="scroll-mt-20 rounded-xl border border-gray-200 bg-white p-6"
          >
            <h2
              id="pendaftaran-title"
              className="text-base font-bold text-gray-900"
            >
              Pendaftaran
            </h2>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p
                  id="registration-open-label"
                  className="font-semibold text-gray-900"
                >
                  Pendaftaran anggota dibuka
                </p>
                <p className="text-xs text-gray-600">
                  Mengatur form di halaman Join. Perubahan meminta konfirmasi.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={registrationOpen}
                aria-labelledby="registration-open-label"
                onClick={() =>
                  setValue("registration_open", !registrationOpen, {
                    shouldDirty: true,
                  })
                }
                className={cn(
                  "relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  registrationOpen ? "bg-primary" : "bg-gray-300",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform",
                    registrationOpen && "translate-x-6",
                  )}
                />
              </button>
            </div>
          </section>
        </div>
      </div>
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <p className="text-sm text-gray-600">
          {changeCount
            ? `${changeCount} perubahan belum disimpan.`
            : "Tidak ada perubahan."}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending || !changeCount}
            onClick={() => reset(baseline)}
          >
            Batalkan
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Menyimpan..." : "Simpan pengaturan"}
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirming !== null}
        {...REGISTRATION_CONFIRM[
          String(confirming?.registration_open ?? true) as "true" | "false"
        ]}
        pending={pending}
        onConfirm={() => confirming && save(confirming)}
        onCancel={() => setConfirming(null)}
      />
    </form>
  );
}
