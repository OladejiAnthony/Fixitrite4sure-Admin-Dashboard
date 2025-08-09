//components/dashboard/language-settings.tsx
"use client";

import React, { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api-client";
import clsx from "clsx";

/**
 * Replace this with your real external languages endpoint.
 * Note: passing a full URL to apiClient will bypass baseURL and call the absolute URL.
 */
const EXTERNAL_LANG_API = "https://restcountries.com/v3.1/all?fields=languages";

/* -----------------------------
   Types
   ----------------------------- */
type Language = {
  code: string;
  name: string;
};

type LanguageSettings = {
  default: string;
  supported: string[];
};

/* -----------------------------
   Validation schema
   ----------------------------- */
const formSchema = z.object({
  changeLanguage: z.string().min(1, "Please select a language"),
});

type FormValues = z.infer<typeof formSchema>;

/* -----------------------------
   Fallback languages (used if external API fails)
   ----------------------------- */
const fallbackLanguages: Language[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "zh", name: "Chinese" },
];

export function LanguageSettings() {
  const queryClient = useQueryClient();

  // Fetch the current language settings from local backend (db.json)
  const {
    data: currentSettings,
    isLoading: loadingCurrent,
    isError: errorCurrent,
  } = useQuery<LanguageSettings>({
    queryKey: ["settings", "language"],
    queryFn: async () => {
      // Expecting response shape: { default: "en", supported: ["Spanish","French"] }
      const res = await apiClient.get<LanguageSettings>("/settings/language");
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
    // onError has been removed in v5
  });

  // Fetch external language options
  const {
    data: extLanguages,
    isLoading: loadingExt,
    isError: errorExt,
  } = useQuery<Language[]>({
    queryKey: ["external", "languages"],
    queryFn: async (): Promise<Language[]> => {
      // Explicit return type
      const res = await apiClient.get<
        Array<{ languages: Record<string, string> }>
      >(EXTERNAL_LANG_API);

      const languagesMap = res.data.reduce(
        (acc: Record<string, string>, country) => {
          if (country.languages) {
            Object.entries(country.languages).forEach(([code, name]) => {
              acc[code] = name; // name is already typed as string from the response
            });
          }
          return acc;
        },
        {}
      );

      return Object.entries(languagesMap).map(([code, name]) => ({
        code,
        name,
      }));
    },
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const languages = useMemo(() => {
    if (Array.isArray(extLanguages) && extLanguages.length > 0)
      return extLanguages;
    return fallbackLanguages;
  }, [extLanguages]);

  /* -----------------------------
       Form setup
       ----------------------------- */
  const defaultValues = {
    // Set this to empty string instead of the current language
    changeLanguage: "",
  };

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // keep form in sync when current settings load
  React.useEffect(() => {
    if (currentSettings) {
      reset({ changeLanguage: currentSettings.default });
    }
  }, [currentSettings, reset]);

  /* -----------------------------
       Mutation to save language settings
       ----------------------------- */

  const mutation = useMutation({
    mutationFn: async (payload: { default: string; supported?: string[] }) => {
      try {
        // Get current settings first
        const current = await apiClient.get("/settings");
        const updatedSettings = {
          ...current.data,
          language: {
            ...current.data.language,
            ...payload,
          },
        };

        // Update the entire settings object
        const res = await apiClient.put("/settings", updatedSettings);
        return res.data.language;
      } catch (error) {
        console.error("Update failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "language"], data);
      queryClient.invalidateQueries({ queryKey: ["settings", "language"] });
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Map selected code to display name (find in languages)
      const selected = languages.find((l) => l.code === values.changeLanguage);
      const displayName = selected?.name ?? values.changeLanguage;

      await mutation.mutateAsync({
        default: values.changeLanguage,
        supported: currentSettings?.supported ?? [displayName],
      });
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  /* -----------------------------
       Supported list removal
       ----------------------------- */
  const removeSupported = async (item: string) => {
    try {
      const prev = currentSettings?.supported ?? [];
      const updated = prev.filter((s) => s !== item);

      const payload = {
        default: currentSettings?.default ?? "en",
        supported: updated,
      };

      console.log("Payload being sent:", payload);

      const res = await apiClient.put<LanguageSettings>(
        "/settings/language",
        payload
      );

      queryClient.setQueryData(["settings", "language"], res.data);
      queryClient.invalidateQueries({ queryKey: ["settings", "language"] });
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  console.log("Current settings:", currentSettings);

  return (
    <section className="text-[13px] leading-[16px] text-[#0B1220]">
      <div className="mb-6">
        <h3 className="text-[14px] font-semibold tracking-[0.02em]">
          LANGUAGE SETTINGS
        </h3>
      </div>

      <div className="bg-white rounded-[10px] border border-[#eef0f2] p-6 md:p-8 shadow-sm">
        {/* Default Language */}
        <div className="mb-6">
          <label className="block text-[12px] text-[#88909a] mb-2">
            Default Language
          </label>

          <div
            className={clsx(
              "relative rounded-md border border-[#e6e9eb] bg-[#ffffff] px-4 py-3 h-11",
              "focus-within:ring-0"
            )}
            aria-hidden
          >
            {loadingCurrent ? (
              <div className="animate-pulse text-[14px] text-[#2b2b2b]">
                Loading...
              </div>
            ) : errorCurrent ? (
              <div className="text-[14px] text-[#2b2b2b]">English</div>
            ) : (
              <div className="text-[14px] leading-[20px] text-[#2b2b2b]">
                {/* show display name for default language */}
                {(() => {
                  const code = currentSettings?.default ?? "en";
                  const found = languages.find((l) => l.code === code);
                  return found?.name ?? code;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Change Language */}
        <div className="mb-6">
          <label className="block text-[12px] text-[#88909a] mb-2">
            Change Language
          </label>

          <div className="relative">
            <select
              {...register("changeLanguage")}
              className={clsx(
                "appearance-none w-[30%] h-11 rounded-md px-4 pr-10 border border-[#e6e9eb]",
                "text-[14px] leading-[20px] bg-white",
                errors.changeLanguage
                  ? "ring-1 ring-red-400"
                  : "focus:ring-2 focus:ring-[#dbeafe]"
              )}
              aria-invalid={!!errors.changeLanguage}
            >
              <option value="">Select Language</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            {errors.changeLanguage && (
              <p className="text-xs text-red-600 mt-2">
                {errors.changeLanguage.message}
              </p>
            )}
          </div>

          {/* Supported Currencies (looks like labels with remove link in screenshot) */}
          <div className="mb-8 w-[30%]">
            <p className="text-[12px] text-[#88909a] mb-3">
              Supported Currencies
            </p>

            <div className="flex flex-col gap-y-2">
              {(
                currentSettings?.supported ?? ["Spanish", "French", "Chinese"]
              ).map((s: string, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-[14px] text-[#2b2b2b]">{s}</span>
                  <button
                    type="button"
                    onClick={() => removeSupported(s)}
                    className="text-[12px] text-[#0b72d0] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer area with Update button aligned right */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || mutation.isPending}
              className={clsx(
                "inline-flex items-center justify-center h-9 px-4 rounded-md text-[14px] font-medium",
                "bg-[#1183d6] text-white shadow-sm hover:bg-[#0f6fb6] disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {mutation.isPending || isSubmitting ? (
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : null}
              Update
            </button>
          </div>

          {/* small status messages */}
          <div className="mt-3">
            {mutation.isSuccess && (
              <p className="text-sm text-green-600">
                Language updated successfully.
              </p>
            )}
            {mutation.isError && (
              <p className="text-sm text-red-600">
                Failed to update. Try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
