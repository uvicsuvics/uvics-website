"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginAction } from "@/app/admin/actions";
import { loginSchema } from "@/lib/backend/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
export function AdminLoginForm() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<
    z.input<typeof loginSchema>,
    unknown,
    z.output<typeof loginSchema>
  >({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const submit = handleSubmit((values) => {
    setMessage("");
    startTransition(async () => {
      const result = await loginAction(values);
      if (result && !result.ok) {
        setMessage(result.error.message);
        for (const name of ["email", "password"] as const) {
          const error = result.error.field_errors?.[name];
          if (error?.length) setError(name, { message: error[0] });
        }
      }
    });
  });
  return (
    <form
      onSubmit={submit}
      className="space-y-5"
      noValidate
      aria-busy={pending}
    >
      <div className="space-y-2">
        <label htmlFor="admin-email" className="text-sm font-semibold">
          Email
        </label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="username"
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={pending}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-error">
            Masukkan alamat email yang valid.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-password" className="text-sm font-semibold">
          Password
        </label>
        <Input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          disabled={pending}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-error">
            Password wajib diisi.
          </p>
        )}
      </div>
      {message && (
        <p
          role="alert"
          className="rounded-lg bg-error/10 p-3 text-sm text-error"
        >
          {message}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-60"
      >
        {pending ? "Memproses…" : "Masuk"}
      </Button>
    </form>
  );
}
