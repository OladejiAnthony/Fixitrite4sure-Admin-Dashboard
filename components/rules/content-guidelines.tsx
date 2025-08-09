// components/rules/content-guidelines.tsx
"use client";

import { Button } from "@/components/ui/button";

export function ContentGuidelines() {
  const sections = [
    {
      title: "Prohibited Content",
      subTitle: "The following types of content are strictly prohibited:",
      items: [
        "Hate speech, discrimination, and offensive language",
        "Harassment, threats, and bullying",
        "Pornographic, sexually explicit, or adult content",
        "Violent or graphic content; Misinformation and false news",
        "Illegal activities or content promoting illegal activities",
        "Copyrighted material without permission",
        "Spam, scams, and deceptive practices",
      ],
    },
    {
      title: "Quality Standard",
      subTitle:
        "To ensure the quality of content on our platform, please adhere to the following standards: ",
      items: [
        "Content must be relevant and on-topic",
        "Use clear and proper language",
        "Ensure content is truthful and accurate",
        "Provide value and useful information to other users",
      ],
    },
    {
      title: "Users' responsibilities",
      subTitle: "Users are responsible for:",
      items: [
        "Following these content guidelines",
        "Ensuring their content does not violate any laws",
        "Respecting the rights and dignity of other users",
        "Regularly reviewing and updating their content",
        "Reporting any violations they encounter",
      ],
    },
    {
      title: "Review and Moderation Process",
      subTitle:
        "Our platform employs a review and moderation process to ensure compliance with these guidelines:",
      items: [
        "Automated systems and human moderators review content",
        "Content flagged by users is prioritized for review",
        "Violations may result in content removal, warnings, or account suspension",
        "Repeated or severe violations can lead to permanent account bans",
      ],
    },
    {
      title: "Consequences of violation",
      subTitle:
        "Users who violate these guidelines may face the following consequences: ",
      items: [
        "Warnings issued by the moderation team",
        "Temporary suspension of account privileges",
        "Permanent banning of accounts for severe or repeated violations.",
      ],
    },
  ];

  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-2.5">
        <h2 className="text-[13px] font-semibold tracking-[0.5px] text-gray-800 uppercase">
          Content Guidelines
        </h2>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {sections.map((section, idx) => (
          <div key={idx} className="border-b-2 border-gray-200 bg-white ">
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
            <div className=" px-5 py-2 flex justify-end">
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
