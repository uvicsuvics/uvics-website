"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProgramAction,
  updateProgramAction,
} from "@/app/admin/(protected)/programs/actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  cmsErrorMap,
  cmsFailureView,
  programFormSchema,
  slugify,
  toProgramPayload,
  type FailureError,
  type ProgramFormValues,
} from "@/lib/admin/cms";
import type { AdminProgramDto } from "@/lib/backend/programs";
import { CmsFormShell, CmsSection } from "./CmsFormShell";
import { FormField } from "./FormField";

// Field departemen (U05, programs.department_id dari #30) ditambahkan di sini setelah kolomnya ada.
const FIELDS = [
  "name",
  "slug",
  "short_description",
  "description",
  "display_order",
] as const;

interface ProgramFormProps {
  /** Program yang diedit; tanpa nilai berarti program baru. */
  program?: AdminProgramDto;
  statusSlot?: ReactNode;
}

/** Form create/edit program. Gambar program belum bisa diubah di sini (K3). */
export function ProgramForm({ program, statusSlot }: ProgramFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState("");
  const defaults: ProgramFormValues = {
    name: program?.name ?? "",
    slug: program?.slug ?? "",
    short_description: program?.short_description ?? "",
    description: program?.description ?? "",
    display_order: program?.display_order ?? 0,
  };
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(
      programFormSchema,
      { error: cmsErrorMap },
      { raw: true },
    ),
    defaultValues: defaults,
  });
  const shortDescription = useWatch({ control, name: "short_description" });

  const fail = (error: FailureError) => {
    const view = cmsFailureView(error, FIELDS, "slug");
    if (view.kind === "banner") return setBanner(view.message);
    setBanner(
      `Program belum disimpan. Periksa ${view.fields.length} isian yang ditandai.`,
    );
    view.fields.forEach(([name, message], index) =>
      setError(name, { message }, { shouldFocus: index === 0 }),
    );
  };

  const submit = handleSubmit((values) => {
    setBanner("");
    startTransition(async () => {
      const payload = toProgramPayload(values);
      if (program) {
        const result = await updateProgramAction(program.id, payload);
        if (result.ok)
          router.replace(`/admin/programs/${program.id}?notice=saved`, {
            scroll: false,
          });
        else fail(result.error);
        return;
      }
      const result = await createProgramAction(payload);
      if (result.ok)
        router.replace(`/admin/programs/${result.data.id}?notice=created`);
      else fail(result.error);
    });
  });

  const name = register("name", {
    onChange: (event) => {
      // Saran slug hanya untuk program baru dan selama slug belum diubah manual.
      if (!program && !getFieldState("slug").isDirty)
        setValue("slug", slugify(event.target.value));
    },
  });

  return (
    <form onSubmit={submit} noValidate aria-busy={pending}>
      <CmsFormShell
        noun="program"
        status={program?.status}
        pending={pending}
        banner={banner}
        cancelHref="/admin/programs"
        statusSlot={statusSlot}
      >
        <CmsSection title="Program">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="program-name"
              label="Nama program"
              required
              error={errors.name?.message}
            >
              {(control) => (
                <Input {...control} {...name} defaultValue={defaults.name} />
              )}
            </FormField>
            <FormField
              id="program-slug"
              label="Slug"
              required
              error={errors.slug?.message}
              hint="Menjadi alamat /programs/slug."
            >
              {(control) => (
                <Input
                  {...control}
                  {...register("slug")}
                  defaultValue={defaults.slug}
                />
              )}
            </FormField>
          </div>
          <FormField
            id="program-short-description"
            label="Deskripsi singkat"
            error={errors.short_description?.message}
            aside={`${shortDescription.length}/500`}
          >
            {(control) => (
              <Textarea
                {...control}
                rows={3}
                {...register("short_description")}
                defaultValue={defaults.short_description}
              />
            )}
          </FormField>
          <FormField
            id="program-description"
            label="Deskripsi"
            error={errors.description?.message}
            hint="Teks polos. Baris kosong memisahkan paragraf."
          >
            {(control) => (
              <Textarea
                {...control}
                rows={8}
                {...register("description")}
                defaultValue={defaults.description}
              />
            )}
          </FormField>
          <FormField
            id="program-display-order"
            label="Urutan tampil"
            error={errors.display_order?.message}
            hint="Angka kecil tampil lebih dulu di halaman Program."
            className="max-w-48"
          >
            {(control) => (
              <Input
                {...control}
                type="number"
                inputMode="numeric"
                step={1}
                {...register("display_order", { valueAsNumber: true })}
                defaultValue={defaults.display_order}
              />
            )}
          </FormField>
        </CmsSection>
      </CmsFormShell>
    </form>
  );
}
