// components/dashboard/help.tsx
"use client";
import React from "react";

export function Help() {
  return (
    <div className="mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">HELP</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-700 mb-6">
          Welcome to the Help Center for Fixitright4sure. Here you can find
          answers to frequently asked questions and get assistance on using our
          platform.
        </p>

        {/* Getting Started Guide */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Getting Started Guide</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>
              Learn how to set up your account and get started with
              Fixitright4sure.
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">
                [Link to Getting Started Guide]
              </a>
            </li>
          </ul>
        </div>

        {/* Account Setup */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Account Setup</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Instructions on how to create and manage your account.</li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">
                [Link to Account Setup Guide]
              </a>
            </li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Payment Methods</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>
              Information on accepted payment methods and how payments are
              processed.
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">
                [Link to Payment Methods Guide]
              </a>
            </li>
          </ul>
        </div>

        {/* Data Protection */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Data Protection</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>How we protect your data and ensure your privacy.</li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">
                [Link to Data Protection Policy]
              </a>
            </li>
          </ul>
        </div>

        {/* Security Practices */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Security Practices</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>
              Information on our security measures and best practices for
              keeping your account safe.
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">
                [Link to Security Practices Guide]
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="font-semibold mb-2">Contact Us</h3>
          <p className="text-sm text-gray-700 mb-1">
            Need further assistance? Contact our support team.
          </p>
          <ul className="list-none text-sm text-gray-700 space-y-1">
            <li>
              Email:{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:underline"
              >
                support@example.com
              </a>
            </li>
            <li>Phone: [123-456-7890]</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
