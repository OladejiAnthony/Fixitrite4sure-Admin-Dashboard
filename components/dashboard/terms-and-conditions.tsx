// components/dashboard/terms-and-conditions.tsx
"use client";
import React from "react";

export function TermsAndCondition() {
  return (
    <div className="mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">TERMS AND CONDITIONS</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <ol className="list-decimal list-inside space-y-4 text-sm text-gray-700">
          <li>
            <strong>Acceptance of Terms</strong>
            <p className="mt-1">
              By accessing this website and using our services, you agree to be
              bound by these terms and conditions, all applicable laws, and
              regulations. If you disagree with any part of these terms and
              conditions, you may not access the website or use our services.
            </p>
          </li>

          <li>
            <strong>User Responsibilities</strong>
            <p className="mt-1">
              • You are responsible for maintaining the confidentiality of your
              account and password.
              <br />
              • You agree to provide accurate and complete information when
              registering for an account.
              <br />• You must abide by all applicable laws and regulations
              while using our platform.
            </p>
          </li>

          <li>
            <strong>Account Registration</strong>
            <p className="mt-1">
              To access certain features of the platform, you may be required to
              create an account. You must be [age or eligibility criteria] to
              create an account. You are responsible for all activities that
              occur under your account.
            </p>
          </li>

          <li>
            <strong>Usage Restrictions</strong>
            <p className="mt-1">
              You are prohibited from:
              <br />
              • Violating any laws or regulations.
              <br />
              • Interfering with or disrupting the integrity or performance of
              the platform.
              <br />• Uploading or transmitting unauthorized content.
            </p>
          </li>

          <li>
            <strong>Intellectual Property</strong>
            <p className="mt-1">
              The content and materials available on [Your Platform Name] are
              protected by intellectual property laws. You may not copy,
              reproduce, or distribute any content without prior written
              permission.
            </p>
          </li>

          <li>
            <strong>Payments, Fees, and Billing</strong>
            <p className="mt-1">
              Certain features of the platform may require payment. By using
              these features, you agree to pay all fees and charges incurred.
              Fees are subject to change with notice.
            </p>
          </li>

          <li>
            <strong>Privacy Policy</strong>
            <p className="mt-1">
              Your use of [Your Platform Name] is also governed by our Privacy
              Policy. Please review our Privacy Policy [link to Privacy Policy]
              to understand how we collect, use, and protect your personal
              information.
            </p>
          </li>

          <li>
            <strong>Dispute Resolution</strong>
            <p className="mt-1">
              Any disputes arising out of or related to these terms and
              conditions will be governed by the laws of [Jurisdiction]. All
              disputes will be resolved through [mediation, arbitration, or
              other proceeding] in [City, State/Country].
            </p>
          </li>

          <li>
            <strong>Limitation of Liability</strong>
            <p className="mt-1">
              [Your Platform Name] is not liable for any direct, indirect,
              incidental, special, or consequential damages arising out of or in
              any way connected with your use of the platform. This includes but
              is not limited to loss of data or profits.
            </p>
          </li>

          <li>
            <strong>Changes to Terms and Conditions</strong>
            <p className="mt-1">
              [Your Platform Name] reserves the right to update or modify these
              terms and conditions at any time without prior notice. Changes
              will be effective immediately upon posting. It is your
              responsibility to review these terms periodically for changes.
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
}
