// components/dashboard/faq.tsx
"use client";
import React from "react";

export function FAQ() {
  return (
    <div className=" mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">FREQUENTLY ASKED QUESTIONS</h2>
      <div className="bg-white rounded-lg shadow p-6">
        {/* General Questions */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">General Questions</h3>
          <ul className="space-y-4 text-sm text-gray-700">
            <li>
              <strong>Q:</strong> What is Fixitright4sure about?
              <br />
              <span>
                A: Fixitright4sure is a platform designed to help users to
                [describe the main purpose or function of your application].
              </span>
            </li>
            <li>
              <strong>Q:</strong> Do I have to create an account?
              <br />
              <span>
                A: Yes, all features require an account. Sign-up options and
                tools are available to begin using your application.
              </span>
            </li>
            <li>
              <strong>Q:</strong> Is there a subscription/free trial?
              <br />
              <span>
                A: [Your Application Name] offers a free trial if there are any
                costs involved. If no fees were charged, no trial is needed.
              </span>
            </li>
          </ul>
        </div>

        {/* Account and Settings */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Account and Settings</h3>
          <ul className="space-y-4 text-sm text-gray-700">
            <li>
              <strong>Q:</strong> How can I reset my password?
              <br />
              <span>
                A: You can reset your password by following instructions on the
                login screen or through email verification.
              </span>
            </li>
            <li>
              <strong>Q:</strong> Can I change my account settings?
              <br />
              <span>
                A: Yes, all account settings can be updated under your profile
                section.
              </span>
            </li>
          </ul>
        </div>

        {/* Payments and Billing */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Payments and Billing</h3>
          <ul className="space-y-4 text-sm text-gray-700">
            <li>
              <strong>Q:</strong> What payment methods do you accept?
              <br />
              <span>
                A: We accept all major payment methods (credit cards, PayPal,
                bank transfers).
              </span>
            </li>
            <li>
              <strong>Q:</strong> Is my payment information secure?
              <br />
              <span>
                A: Yes, we process all payments through secure and encrypted
                gateways.
              </span>
            </li>
          </ul>
        </div>

        {/* Features and Functionality */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Features and Functionality</h3>
          <ul className="space-y-4 text-sm text-gray-700">
            <li>
              <strong>Q:</strong> How do I perform specific actions?
              <br />
              <span>
                A: You can find detailed guides in our help center and
                tutorials.
              </span>
            </li>
            <li>
              <strong>Q:</strong> Are there any advanced features?
              <br />
              <span>
                A: Yes, advanced features are available depending on your
                subscription plan.
              </span>
            </li>
          </ul>
        </div>

        {/* Security and Privacy */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Security and Privacy</h3>
          <ul className="space-y-4 text-sm text-gray-700">
            <li>
              <strong>Q:</strong> How is my data protected?
              <br />
              <span>
                A: We follow industry-standard security protocols, including
                encryption and secure storage.
              </span>
            </li>
            <li>
              <strong>Q:</strong> Do you share my information?
              <br />
              <span>
                A: No, we do not share or sell your personal information.
              </span>
            </li>
          </ul>
        </div>

        {/* Support and Assistance */}
        <div>
          <h3 className="font-semibold mb-2">Support and Assistance</h3>
          <ul className="space-y-4 text-sm text-gray-700">
            <li>
              <strong>Q:</strong> How can I contact customer support?
              <br />
              <span>
                A: You can contact us via email, phone, or live chat support.
              </span>
            </li>
            <li>
              <strong>Q:</strong> Is there a help center or knowledge base?
              <br />
              <span>
                A: Yes, you can find detailed articles, FAQs, and tutorials in
                our help center.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
