//app\(dashboard)\e-commerce\product\[id]\page.tsx
"use client";

import { useEcommerceItem } from "@/hooks/use-admin-ecommerce";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Product {
  id: string;
  productName: string;
  description?: string;
  category: string;
  quantity: number;
  price: number;
  discountPercent: number;
  status: string;
  listingStatus: string;
  storeId: string;
  storeName: string;
  dateAdded: string;
  lastUpdated?: string;
  purchasedCount: number;
  freeDelivery: boolean;
  deliveryFee: number;
  deliveryDays: number | null;
  rating: number | null;
  reviewCount: number;
  media: ProductMedia[];
}

interface ProductMedia {
  id: string;
  type: "image" | "video";
  url: string;
  thumbUrl?: string;
  variant?: string;
}

// Plain <img>/<video> on purpose: the files are on the Supabase storage
// domain, which next/image would need whitelisting for in next.config.
/* eslint-disable @next/next/no-img-element */
function ProductGallery({ media, name }: { media: ProductMedia[]; name: string }) {
  const [index, setIndex] = React.useState(0);
  const [failed, setFailed] = React.useState<Record<string, boolean>>({});

  if (media.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-500">
        No images uploaded for this product.
      </div>
    );
  }

  const current = media[Math.min(index, media.length - 1)];

  return (
    <div>
      <div className="flex h-80 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        {failed[current.id] ? (
          <p className="text-sm text-gray-500">This file could not be loaded.</p>
        ) : current.type === "video" ? (
          <video
            key={current.id}
            src={current.url}
            poster={current.thumbUrl}
            controls
            className="h-full w-full object-contain"
            onError={() => setFailed((f) => ({ ...f, [current.id]: true }))}
          />
        ) : (
          <a href={current.url} target="_blank" rel="noopener noreferrer" title="Open full size">
            <img
              src={current.url}
              alt={`${name}, image ${index + 1} of ${media.length}`}
              className="max-h-80 w-auto object-contain"
              onError={() => setFailed((f) => ({ ...f, [current.id]: true }))}
            />
          </a>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {index + 1} of {media.length}
        {current.variant ? ` · Variant: ${current.variant}` : ""}
        {current.type === "image" && !failed[current.id] ? " · Click the image to open full size" : ""}
      </p>

      {media.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {media.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${m.type} ${i + 1}`}
              className={`relative h-16 w-16 overflow-hidden rounded border-2 bg-gray-100 ${
                i === index ? "border-blue-500" : "border-transparent hover:border-gray-300"
              }`}
            >
              {m.type === "image" || m.thumbUrl ? (
                <img
                  src={m.thumbUrl ?? m.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                  Video
                </span>
              )}
              {m.type === "video" && (
                <span className="absolute bottom-0 right-0 rounded-tl bg-black/60 px-1 text-[10px] text-white">
                  ▶
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
/* eslint-enable @next/next/no-img-element */

const naira = (n: number) => `₦${(n || 0).toLocaleString("en-US")}`;

function Field({
  label,
  value,
  badge,
  className,
}: {
  label: string;
  value: React.ReactNode;
  badge?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-500">{label}:</label>
      <p
        className={
          badge
            ? `inline-block rounded px-2 py-1 text-sm ${badge}`
            : "break-words text-sm text-gray-900"
        }
      >
        {value ?? "N/A"}
      </p>
    </div>
  );
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { data: product, isLoading, error } = useEcommerceItem<Product>("products", id);

  const back = (
    <Button
      variant="ghost"
      className="mb-4 p-0 text-sm text-blue-600 hover:text-blue-800"
      onClick={() => router.back()}
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> BACK
    </Button>
  );

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !product)
    return (
      <div className="p-6">
        {back}
        <p className="text-sm text-red-600">
          Could not load product: {(error as Error)?.message ?? "Not found"}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-6">
      {back}
      <h1 className="mb-6 text-lg font-semibold text-gray-800">PRODUCT DETAILS</h1>
      <div className="mb-6 max-w-2xl rounded-lg bg-white p-6 shadow-sm">
        <label className="text-xs font-medium text-gray-500">
          Product Images ({product.media?.length ?? 0}):
        </label>
        <div className="mt-2">
          <ProductGallery media={product.media ?? []} name={product.productName} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 rounded-lg bg-white p-6 shadow-sm">
        <Field label="Product Id" value={product.id} />
        <Field label="Product Name" value={product.productName} />
        <Field label="Category" value={product.category} />
        <Field label="Quantity In Stock" value={product.quantity} badge="bg-blue-100 text-blue-800" />
        <div>
          <label className="text-xs font-medium text-gray-500">Price:</label>
          <p className="text-xl font-bold text-orange-600">{naira(product.price)}</p>
        </div>
        <Field label="Discount" value={`${product.discountPercent}%`} />
        <Field label="Status" value={product.status} badge="bg-green-100 text-green-800" />
        <Field label="Listing Status" value={product.listingStatus} />
        <Field label="Units Sold" value={product.purchasedCount} />
        <div>
          <label className="text-xs font-medium text-gray-500">Store:</label>
          <p
            className="cursor-pointer text-sm text-blue-600 hover:underline"
            onClick={() => router.push(`/e-commerce/store/${product.storeId}`)}
          >
            {product.storeName}
          </p>
        </div>
        <Field label="Store Id" value={product.storeId} />
        <Field
          label="Rating"
          value={
            product.rating !== null
              ? `${product.rating} (${product.reviewCount} reviews)`
              : "No reviews"
          }
        />
        <Field
          label="Delivery"
          value={product.freeDelivery ? "Free" : naira(product.deliveryFee)}
        />
        <Field
          label="Delivery Time"
          value={product.deliveryDays !== null ? `${product.deliveryDays} days` : "N/A"}
        />
        <Field label="Date Added" value={product.dateAdded} />
        <Field className="col-span-3" label="Description" value={product.description} />
      </div>
    </div>
  );
}
