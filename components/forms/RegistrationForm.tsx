"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitRegistrationAction } from "@/app/(public)/join/actions";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { SuccessState } from "@/components/ui/SuccessState";
import {
  REGISTRATION_CLOSED_MESSAGE,
  REGISTRATION_SUCCESS_MESSAGE,
  registrationErrorMap,
  registrationSubmissionSchema,
  type RegistrationSubmissionInput,
} from "@/lib/backend/registration";

type FieldName = keyof RegistrationSubmissionInput;

// preferred_department_id belum dirender: daftar departemen publik menunggu U02.
const RENDERED_FIELDS: ReadonlySet<string> = new Set<FieldName>([
  "full_name",
  "nim",
  "email",
  "phone",
  "faculty",
  "study_program",
  "batch",
  "skills",
  "experience",
  "motivation",
  "portfolio_url",
  "consent_data",
  "consent_accuracy",
]);

function isRenderedField(key: string): key is FieldName {
  return RENDERED_FIELDS.has(key);
}

const TEXTAREA_CLASS =
  "flex w-full min-h-28 rounded-lg border border-primary-200 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-600 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error";

/**
 * Form pendaftaran anggota publik. Server memvalidasi ulang seluruh input.
 */
export function RegistrationForm() {
  const [pending, startTransition] = useTransition();
  const [outcome, setOutcome] = useState<"form" | "success" | "closed">("form");
  const [banner, setBanner] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegistrationSubmissionInput>({
    // raw: server membutuhkan input asli (termasuk persetujuan), bukan hasil transform.
    resolver: zodResolver(
      registrationSubmissionSchema,
      { error: registrationErrorMap },
      { raw: true },
    ),
    defaultValues: {
      full_name: "",
      nim: "",
      email: "",
      phone: "",
      faculty: "",
      study_program: "",
      skills: "",
      experience: "",
      motivation: "",
      portfolio_url: "",
    },
  });

  const submit = handleSubmit((values) => {
    setBanner("");
    startTransition(async () => {
      const result = await submitRegistrationAction(values);
      if (result.ok) return setOutcome("success");
      if (result.error.code === "FORBIDDEN") return setOutcome("closed");
      let mapped = 0;
      for (const [name, messages] of Object.entries(
        result.error.field_errors ?? {},
      )) {
        if (!isRenderedField(name) || !messages.length) continue;
        setError(name, { message: messages[0] });
        mapped += 1;
      }
      // Pesan umum hanya bila tidak ada error field yang tampil (mis. CONFLICT pada NIM).
      if (!mapped) setBanner(result.error.message);
    });
  });

  if (outcome === "success")
    return (
      <SuccessState
        title="Pendaftaran terkirim"
        message={REGISTRATION_SUCCESS_MESSAGE}
      />
    );
  if (outcome === "closed")
    return <EmptyState message={REGISTRATION_CLOSED_MESSAGE} />;

  const a11y = (name: FieldName) => ({
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const error = (name: FieldName) =>
    errors[name]?.message ? (
      <p id={`${name}-error`} className="text-sm text-error">
        {errors[name]?.message}
      </p>
    ) : null;

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-6"
      noValidate
      aria-busy={pending}
    >
      {banner ? (
        <p
          role="alert"
          className="px-4 py-3 text-sm text-error bg-error/5 rounded-lg border border-error/30"
        >
          {banner}
        </p>
      ) : null}
      <fieldset disabled={pending} className="grid gap-5 md:grid-cols-2">
        <legend className="sr-only">Data pendaftar</legend>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="full_name" className="text-sm font-semibold">
            Nama lengkap
          </label>
          <Input
            id="full_name"
            autoComplete="name"
            {...register("full_name")}
            {...a11y("full_name")}
          />
          {error("full_name")}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="nim" className="text-sm font-semibold">
            NIM
          </label>
          <Input id="nim" {...register("nim")} {...a11y("nim")} />
          {error("nim")}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="batch" className="text-sm font-semibold">
            Angkatan
          </label>
          <Input
            id="batch"
            type="number"
            inputMode="numeric"
            {...register("batch", { valueAsNumber: true })}
            {...a11y("batch")}
          />
          {error("batch")}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            {...a11y("email")}
          />
          {error("email")}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-semibold">
            Nomor WhatsApp
          </label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="081234567890"
            {...register("phone")}
            {...a11y("phone")}
          />
          {error("phone")}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="faculty" className="text-sm font-semibold">
            Fakultas
          </label>
          <Input id="faculty" {...register("faculty")} {...a11y("faculty")} />
          {error("faculty")}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="study_program" className="text-sm font-semibold">
            Program studi
          </label>
          <Input
            id="study_program"
            {...register("study_program")}
            {...a11y("study_program")}
          />
          {error("study_program")}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="skills" className="text-sm font-semibold">
            Keahlian{" "}
            <span className="font-normal text-gray-600">(opsional)</span>
          </label>
          <textarea
            id="skills"
            className={TEXTAREA_CLASS}
            {...register("skills")}
            {...a11y("skills")}
          />
          {error("skills")}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="experience" className="text-sm font-semibold">
            Pengalaman{" "}
            <span className="font-normal text-gray-600">(opsional)</span>
          </label>
          <textarea
            id="experience"
            className={TEXTAREA_CLASS}
            {...register("experience")}
            {...a11y("experience")}
          />
          {error("experience")}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="motivation" className="text-sm font-semibold">
            Motivasi bergabung{" "}
            <span className="font-normal text-gray-600">(opsional)</span>
          </label>
          <textarea
            id="motivation"
            className={TEXTAREA_CLASS}
            {...register("motivation")}
            {...a11y("motivation")}
          />
          {error("motivation")}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="portfolio_url" className="text-sm font-semibold">
            URL portofolio{" "}
            <span className="font-normal text-gray-600">(opsional)</span>
          </label>
          <Input
            id="portfolio_url"
            type="url"
            placeholder="https://"
            {...register("portfolio_url")}
            {...a11y("portfolio_url")}
          />
          {error("portfolio_url")}
        </div>
        {(
          [
            [
              "consent_data",
              "Saya menyetujui data ini digunakan UVICS untuk proses rekrutmen.",
            ],
            ["consent_accuracy", "Saya menyatakan data yang saya isi benar."],
          ] as const
        ).map(([name, label]) => (
          <div key={name} className="flex flex-col gap-1 md:col-span-2">
            <div className="flex items-start gap-3">
              <input
                id={name}
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-primary"
                {...register(name)}
                {...a11y(name)}
              />
              <label htmlFor={name} className="text-sm text-gray-700">
                {label}
              </label>
            </div>
            {error(name)}
          </div>
        ))}
      </fieldset>
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Mengirim…" : "Kirim Pendaftaran"}
      </Button>
    </form>
  );
}
