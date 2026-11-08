"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPageAction,
  updatePageAction,
} from "@/app/admin/(protected)/pages/actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  callAction,
  cmsErrorMap,
  cmsFailureView,
  pageFormSchema,
  slugify,
  toPagePayload,
  type FailureError,
  type PageFormValues,
} from "@/lib/admin/cms";
import type { AdminPageDto } from "@/lib/backend/pages";
import { CmsFormShell, CmsSection } from "./CmsFormShell";
import { dismissNotice } from "./CmsNotice";
import { FormField } from "./FormField";

const FIELDS = [
  "title",
  "slug",
  "content",
  "meta_title",
  "meta_description",
] as const;

interface PageFormProps {
  /** Halaman yang diedit; tanpa nilai berarti halaman baru. */
  page?: AdminPageDto;
  statusSlot?: ReactNode;
}

/** Form create/edit halaman. Server memvalidasi ulang seluruh input (#30). */
export function PageForm({ page, statusSlot }: PageFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState("");
  const defaults: PageFormValues = {
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    content: page?.content ?? "",
    meta_title: page?.meta_title ?? "",
    meta_description: page?.meta_description ?? "",
  };
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getFieldState,
    control,
    formState: { errors, isDirty },
  } = useForm<PageFormValues>({
    resolver: zodResolver(
      pageFormSchema,
      { error: cmsErrorMap },
      { raw: true },
    ),
    defaultValues: defaults,
  });
  const metaTitle = useWatch({ control, name: "meta_title" });
  const metaDescription = useWatch({ control, name: "meta_description" });

  const fail = (error: FailureError) => {
    dismissNotice();
    const view = cmsFailureView(error, FIELDS, "slug");
    if (view.kind === "banner") return setBanner(view.message);
    setBanner(
      `Halaman belum disimpan. Periksa ${view.fields.length} isian yang ditandai.`,
    );
    view.fields.forEach(([name, message], index) =>
      setError(name, { message }, { shouldFocus: index === 0 }),
    );
  };

  const submit = handleSubmit((values) => {
    setBanner("");
    startTransition(async () => {
      const payload = toPagePayload(values);
      if (page) {
        const result = await callAction(() =>
          updatePageAction(page.id, payload),
        );
        if (result.ok)
          router.replace(`/admin/pages/${page.id}?notice=saved`, {
            scroll: false,
          });
        else fail(result.error);
        return;
      }
      const result = await callAction(() => createPageAction(payload));
      if (result.ok)
        router.replace(`/admin/pages/${result.data.id}?notice=created`);
      else fail(result.error);
    });
  });

  const title = register("title", {
    onChange: (event) => {
      // Saran slug hanya untuk halaman baru dan selama slug belum diubah manual.
      if (!page && !getFieldState("slug").isDirty)
        setValue("slug", slugify(event.target.value));
    },
  });

  return (
    <form onSubmit={submit} noValidate aria-busy={pending}>
      <CmsFormShell
        noun="halaman"
        status={page?.status}
        pending={pending}
        banner={banner}
        cancelHref="/admin/pages"
        statusSlot={statusSlot}
        statusLocked={isDirty}
      >
        <CmsSection title="Konten">
          <FormField
            id="page-title"
            label="Judul"
            required
            error={errors.title?.message}
          >
            {(control) => (
              <Input {...control} {...title} defaultValue={defaults.title} />
            )}
          </FormField>
          <FormField
            id="page-slug"
            label="Slug"
            required
            error={errors.slug?.message}
            hint="Huruf kecil, angka, dan tanda hubung. Mengubah slug mengubah alamat halaman."
          >
            {(control) => (
              <Input
                {...control}
                {...register("slug")}
                defaultValue={defaults.slug}
              />
            )}
          </FormField>
          <FormField
            id="page-content"
            label="Isi halaman"
            error={errors.content?.message}
            hint="Teks polos. Baris kosong memisahkan paragraf."
          >
            {(control) => (
              <Textarea
                {...control}
                rows={12}
                {...register("content")}
                defaultValue={defaults.content}
              />
            )}
          </FormField>
        </CmsSection>
        <CmsSection title="SEO (opsional)">
          <FormField
            id="page-meta-title"
            label="Meta title"
            error={errors.meta_title?.message}
            aside={`${metaTitle.length}/255`}
          >
            {(control) => (
              <Input
                {...control}
                {...register("meta_title")}
                defaultValue={defaults.meta_title}
              />
            )}
          </FormField>
          <FormField
            id="page-meta-description"
            label="Meta description"
            error={errors.meta_description?.message}
            aside={`${metaDescription.length}/500`}
            hint="Ringkasan untuk hasil mesin pencari dan pratinjau tautan."
          >
            {(control) => (
              <Textarea
                {...control}
                rows={3}
                {...register("meta_description")}
                defaultValue={defaults.meta_description}
              />
            )}
          </FormField>
        </CmsSection>
      </CmsFormShell>
    </form>
  );
}
