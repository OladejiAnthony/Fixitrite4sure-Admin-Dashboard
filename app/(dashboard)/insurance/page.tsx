// app/(dashboard)/insurance/page.tsx
"use client";
import React from "react";

const Insurance = () => {
  return (
    <div className="bg-[#FAFAFA] min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Heading */}
        <h1 className="text-lg font-semibold text-gray-900 mb-6 tracking-wide">
          INSURANCE
        </h1>

        {/* Sections */}
        <div className="space-y-6 text-gray-800 text-sm leading-6">
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="font-semibold mb-1">1. Acceptance of Terms</h2>
            <p>
              By accessing this website and using our services, you agree to be
              bound by these terms and conditions, all applicable laws, and
              regulations. If you disagree with any part of these terms and
              conditions, you may not access the website or use our services.
            </p>
          </section>

          {/* 2. User Responsibilities */}
          <section>
            <h2 className="font-semibold mb-1">2. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You are responsible for maintaining the confidentiality of your
                account and password.
              </li>
              <li>
                You agree to provide accurate and complete information when
                registering for an account.
              </li>
              <li>
                You must abide by all applicable laws and regulations while
                using our platform.
              </li>
            </ul>
          </section>

          {/* 3. Account Registration */}
          <section>
            <h2 className="font-semibold mb-1">3. Account Registration</h2>
            <p>
              To access certain features of the platform, you may be required to
              create an account. You must be [age or eligibility criteria] to
              create an account. You are responsible for all activities that
              occur under your account.
            </p>
          </section>

          {/* 4. Usage Restrictions */}
          <section>
            <h2 className="font-semibold mb-1">4. Usage Restrictions</h2>
            <p>You are prohibited from:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Violating any laws or regulations.</li>
              <li>
                Interfering with or disrupting the integrity or performance of
                the platform.
              </li>
              <li>Uploading or transmitting unauthorized content.</li>
            </ul>
          </section>

          {/* 5. Intellectual Property */}
          <section>
            <h2 className="font-semibold mb-1">5. Intellectual Property</h2>
            <p>
              The content and materials available on [Your Platform Name] are
              protected by intellectual property laws. You may not copy,
              reproduce, or distribute any content without prior written
              permission.
            </p>
          </section>

          {/* 6. Payments, Fees, and Billing */}
          <section>
            <h2 className="font-semibold mb-1">
              6. Payments, Fees, and Billing
            </h2>
            <p>
              Certain features of the platform may require payment. By using
              these features, you agree to pay all fees and charges incurred.
              Fees are subject to change with notice.
            </p>
          </section>

          {/* 7. Privacy Policy */}
          <section>
            <h2 className="font-semibold mb-1">7. Privacy Policy</h2>
            <p>
              Your use of [Your Platform Name] is also governed by our Privacy
              Policy. Please review our Privacy Policy [link to Privacy Policy]
              to understand how we collect, use, and protect your personal
              information.
            </p>
          </section>

          {/* 8. Dispute Resolution */}
          <section>
            <h2 className="font-semibold mb-1">8. Dispute Resolution</h2>
            <p>
              Any disputes arising out of or related to these terms and
              conditions will be governed by the laws of [Jurisdiction]. All
              disputes will be resolved through [arbitration/mediation/court
              proceedings] in [City, State/Country].
            </p>
          </section>

          {/* 9. Limitation of Liability */}
          <section>
            <h2 className="font-semibold mb-1">9. Limitation of Liability</h2>
            <p>
              [Your Platform Name] is not liable for any direct, indirect,
              incidental, special, or consequential damages arising out of or in
              any way connected with your use of the platform. This includes but
              is not limited to loss of data or profits.
            </p>
          </section>

          {/* 10. Changes to Terms and Conditions */}
          <section>
            <h2 className="font-semibold mb-1">
              10. Changes to Terms and Conditions
            </h2>
            <p>
              [Your Platform Name] reserves the right to update or modify these
              terms and conditions at any time without prior notice. Changes
              will be effective immediately upon posting. It is your
              responsibility to review these terms periodically for changes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Insurance;
