// components/rules/privacy-security.tsx
"use client";

import { Button } from "@/components/ui/button";

export function PrivacySecurity() {
  const sections = [
    {
      title: "Data Collection",
      subTitle: "We collect the following types of information:",
      items: [
        "Personal Information: Name, email address, phone number, etc.",
        "Transaction Information: Purchase history, payment details, etc.",
        "Usage Data: Logins, activities, preferences, etc.",
        "Device Information: IP address, browser type, device identifiers, etc.",
      ],
    },
    {
      title: "Data Usage",
      subTitle: "We use your data for the following purposes:",
      items: [
        "To provide and improve our services",
        "To process transactions and send related information",
        "To communicate with you, including sending updates and promotional materials",
        "To personalize your experience and offer tailored content",
        "To enhance security and prevent fraud",
        "To comply with legal obligations",
      ],
    },
    {
      title: "Data Protection",
      subTitle: "We implement the following measures to protect your data:",
      items: [
        "Encryption: Protecting data in transit and at rest",
        "Access Controls: Limiting access to personal information to authorized personnel only",
        "Security Protocols: Regular updates and audits to maintain security",
        "Data Retention: Storing data only for as long as necessary for the purposes outlined in this policy",
      ],
    },
    {
      title: "Cookies and Tracking",
      subTitle: "We use cookies and similar tracking technologies to:",
      items: [
        "Enhance your user experience",
        "Analyze usage and performance",
        "Deliver targeted advertising",
        "You can manage your cookie preferences through your browser settings",
      ],
    },
  ];

  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-2.5">
        <h2 className="text-[13px] font-semibold tracking-[0.5px] text-gray-800 uppercase">
          Privacy and Security
        </h2>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {sections.map((section, idx) => (
          <div key={idx} className="border-b-2 border-gray-200 bg-white">
            {/* Section Content */}
            <div className="px-5 py-4 space-y-2">
              <h3 className="text-[15px] font-semibold text-gray-800">
                {section.title}
              </h3>
              <p className="text-[13px] leading-[1.6] text-gray-700 font-normal">
                {section.subTitle}
              </p>
              <ul className="list-decimal list-inside text-[13px] leading-[1.6] text-gray-700 space-y-1">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
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
