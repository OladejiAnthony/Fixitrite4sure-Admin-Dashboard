//components/dashboard/currency-settings.tsx
//components/dashboard/currency-settings.tsx
"use client";

import React, { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api-client";
import clsx from "clsx";

/**
 * Free currency API endpoint
 */
const EXTERNAL_CURRENCY_API = "https://api.exchangerate-api.com/v4/latest/USD";

/* -----------------------------
   Types
   ----------------------------- */
type Currency = {
  code: string;
  name: string;
  symbol: string;
};

type CurrencySettings = {
  default: string;
  supported: string[];
};

/* -----------------------------
   Validation schema
   ----------------------------- */
const formSchema = z.object({
  changeCurrency: z.string().min(1, "Please select a currency"),
});

type FormValues = z.infer<typeof formSchema>;

/* -----------------------------
   Fallback currencies (used if external API fails)
   ----------------------------- */
const fallbackCurrencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
];

export function CurrencySettings() {
  const queryClient = useQueryClient();

  // Fetch the current currency settings from local backend (db.json)
  const {
    data: currentSettings,
    isLoading: loadingCurrent,
    isError: errorCurrent,
  } = useQuery<CurrencySettings>({
    queryKey: ["settings", "currency"],
    queryFn: async () => {
      // Expecting response shape: { default: "USD", supported: ["USD", "EUR"] }
      const res = await apiClient.get<CurrencySettings>("/settings/currency");
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  // Fetch external currency options
  const {
    data: extCurrencies,
    isLoading: loadingExt,
    isError: errorExt,
  } = useQuery<Currency[]>({
    queryKey: ["external", "currencies"],
    queryFn: async (): Promise<Currency[]> => {
      // First try the exchangerate-api
      try {
        const res = await apiClient.get<
          Record<string, { name: string; symbol: string }>
        >("https://api.exchangerate-api.com/v4/latest/USD");

        // This API doesn't provide names/symbols, so we'll combine with our fallback data
        return Object.keys(res.data.rates).map((code) => {
          const found = fallbackCurrencies.find((c) => c.code === code);
          return found || { code, name: code, symbol: code };
        });
      } catch (error) {
        // If that fails, try a different API
        try {
          const res = await apiClient.get<
            Record<string, { currency_name: string; currency_symbol: string }>
          >(
            "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies.json"
          );

          return Object.entries(res.data).map(([code, data]) => ({
            code: code.toUpperCase(),
            name: data.currency_name,
            symbol: data.currency_symbol || code,
          }));
        } catch (err) {
          // If both APIs fail, return fallback
          return fallbackCurrencies;
        }
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });

  const currencies = useMemo(() => {
    if (Array.isArray(extCurrencies) && extCurrencies.length > 0)
      return extCurrencies;
    return fallbackCurrencies;
  }, [extCurrencies]);

  /* -----------------------------
       Form setup
       ----------------------------- */
  const defaultValues = {
    changeCurrency: "",
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
      reset({ changeCurrency: currentSettings.default });
    }
  }, [currentSettings, reset]);

  /* -----------------------------
       Mutation to save currency settings
       ----------------------------- */

  const mutation = useMutation({
    mutationFn: async (payload: { default: string; supported?: string[] }) => {
      try {
        // Get current settings first
        const current = await apiClient.get("/settings");
        const updatedSettings = {
          ...current.data,
          currency: {
            ...current.data.currency,
            ...payload,
          },
        };

        // Update the entire settings object
        const res = await apiClient.put("/settings", updatedSettings);
        return res.data.currency;
      } catch (error) {
        console.error("Update failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "currency"], data);
      queryClient.invalidateQueries({ queryKey: ["settings", "currency"] });
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Map selected code to display name (find in currencies)
      const selected = currencies.find((c) => c.code === values.changeCurrency);
      const displayName = selected
        ? `${selected.name} (${selected.symbol})`
        : values.changeCurrency;

      await mutation.mutateAsync({
        default: values.changeCurrency,
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
        default: currentSettings?.default ?? "USD",
        supported: updated,
      };

      const res = await apiClient.put<CurrencySettings>(
        "/settings/currency",
        payload
      );

      queryClient.setQueryData(["settings", "currency"], res.data);
      queryClient.invalidateQueries({ queryKey: ["settings", "currency"] });
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  return (
    <section className="text-[13px] leading-[16px] text-[#0B1220]">
      <div className="mb-6">
        <h3 className="text-[14px] font-semibold tracking-[0.02em]">
          CURRENCY SETTINGS
        </h3>
      </div>

      <div className="bg-white rounded-[10px] border border-[#eef0f2] p-6 md:p-8 shadow-sm">
        {/* Default Currency */}
        <div className="mb-6">
          <label className="block text-[12px] text-[#88909a] mb-2">
            Default Currency
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
              <div className="text-[14px] text-[#2b2b2b]">US Dollar ($)</div>
            ) : (
              <div className="text-[14px] leading-[20px] text-[#2b2b2b]">
                {(() => {
                  const code = currentSettings?.default ?? "USD";
                  const found = currencies.find((c) => c.code === code);
                  return found ? `${found.name} (${found.symbol})` : code;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Change Currency */}
        <div className="mb-6">
          <label className="block text-[12px] text-[#88909a] mb-2">
            Change Currency
          </label>

          <div className="relative">
            <select
              {...register("changeCurrency")}
              className={clsx(
                "appearance-none w-[30%] h-11 rounded-md px-4 pr-10 border border-[#e6e9eb]",
                "text-[14px] leading-[20px] bg-white",
                errors.changeCurrency
                  ? "ring-1 ring-red-400"
                  : "focus:ring-2 focus:ring-[#dbeafe]"
              )}
              aria-invalid={!!errors.changeCurrency}
            >
              <option value="">Select Currency</option>
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.symbol})
                </option>
              ))}
            </select>

            {errors.changeCurrency && (
              <p className="text-xs text-red-600 mt-2">
                {errors.changeCurrency.message}
              </p>
            )}
          </div>
        </div>

        {/* Supported Currencies */}
        <div className="mb-8 w-[30%]">
          <p className="text-[12px] text-[#88909a] mb-3">
            Supported Currencies
          </p>

          <div className="flex flex-col gap-y-2">
            {(
              currentSettings?.supported ?? [
                "US Dollar ($)",
                "Euro (€)",
                "British Pound (£)",
              ]
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
              Currency updated successfully.
            </p>
          )}
          {mutation.isError && (
            <p className="text-sm text-red-600">Failed to update. Try again.</p>
          )}
        </div>
      </div>
    </section>
  );
}
