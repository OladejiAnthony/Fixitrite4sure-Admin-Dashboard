//components/rules/general-rules.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button"; // Adjust this import if using a custom button

export function GeneralRules() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">General Rules</h2>

      {/* Box 1: Brief Introduction */}
      <div className="border rounded-lg shadow-sm p-5 bg-white">
        <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
          Brief Introduction About The Purpose Of The Rule
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Welcome To Our Platform! This Set Of Rules Is Designed To Ensure A
          Safe, Respectful, And Enjoyable Experience For All Users. By Outlining
          The Expected Standards Of Behavior And Content, We Aim To Create A
          Community Where Everyone Can Interact, Share, And Engage Positively.
          These Guidelines Help Maintain Order, Protect User Privacy, And Uphold
          The Integrity Of Our Platform. By Adhering To These Rules, You
          Contribute To A Better Experience For Everyone. Thank You For Your
          Cooperation And Commitment To Making Our Community A Welcoming And
          Trustworthy Space.
        </p>
        <div className="mt-4 flex justify-end">
          <Button className="bg-[#0586CF]">Edit details</Button>
        </div>
      </div>

      {/* Box 2: Content Guidelines */}
      <div className="border rounded-lg shadow-sm p-5 bg-white">
        <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
          Content Guidelines
        </h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>No Offensive Or Inappropriate Content</li>
          <li>Ensure All Content Is Original And Not Plagiarized</li>
          <li>Follow The Application Brand Standards.</li>
        </ul>
        <div className="mt-4 flex justify-end">
          <Button className="bg-[#0586CF]">Edit details</Button>
        </div>
      </div>

      {/* Box 3: Privacy And Security */}
      <div className="border rounded-lg shadow-sm p-5 bg-white">
        <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
          Privacy And Security
        </h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Protect Your Account Information.</li>
          <li>Do Not Share Personal Information.</li>
          <li>Report Any Suspicious Activity.</li>
        </ul>
        <div className="mt-4 flex justify-end">
          <Button className="bg-[#0586CF]">Edit details</Button>
        </div>
      </div>
    </div>
  );
}
