//components/rules/payment-terms.tsx
// components/rules/payment-terms.tsx
"use client";

import { Button } from "@/components/ui/button";

export function PaymentTerms() {
  const sections = [
    {
      title: "Accepted Payment Methods",
      subTitle: "We accept the following payment methods:",
      items: [
        "Credit/Debit Cards (Visa, MasterCard, etc.)",
        "PayPal",
        "Google Pay",
      ],
    },
    {
      title: "Payment Dispute",
      subTitle:
        "If you have a dispute regarding a payment, please contact our support team at (support@example.com) within 30 days of the transaction date. We will investigate and resolve the issue promptly.",
      items: [],
    },
  ];

  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-2.5">
        <h2 className="text-[13px] font-semibold tracking-[0.5px] text-gray-800 uppercase">
          Payment Terms
        </h2>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className={`border-b-2 border-gray-200 bg-white ${
              idx === sections.length - 1 ? "border-b-0" : ""
            }`}
          >
            {/* Section Content */}
            <div className="px-5 py-4 space-y-2">
              <h3 className="text-[15px] font-semibold text-gray-800">
                {section.title}
              </h3>
              <p className="text-[13px] leading-[1.6] text-gray-700 font-normal">
                {section.subTitle}
              </p>
              {section.items.length > 0 && (
                <ul className="list-decimal list-inside text-[13px] leading-[1.6] text-gray-700 space-y-1">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="h-7 p-3 text-[12px] font-medium text-white bg-[#0586CF] hover:bg-blue-50"
              >
                Edit details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
