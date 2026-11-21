// app/(dashboard)/sos-requests/payment-request/page.tsx
// Placeholder: the Supabase schema (fixit-app-mobile migrations) has no
// payment request / payout table yet. Wire this page up once it does.

export default function PaymentRequestPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-900">PAYMENT REQUEST</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-12 text-center">
        <p className="text-base font-medium text-[#202224]">
          Payment requests are not available yet
        </p>
        <p className="mt-2 text-sm text-gray-500">
          The database does not store payment requests yet. This page will show
          them once that data exists.
        </p>
      </div>
    </div>
  );
}
