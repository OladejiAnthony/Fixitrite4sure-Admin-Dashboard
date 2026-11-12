// components/sos/message-media.tsx
"use client";

import { useState } from "react";

type MediaMessage = {
  media_type: "image" | "video" | null;
  media_url: string | null;
};

// One chat attachment. src is a stable admin /media URL, so periodic refetches
// don't reload the image or restart a playing video.
export function MessageMedia({ message }: { message: MediaMessage }) {
  const [failed, setFailed] = useState(false);
  if (!message.media_type) return null;
  if (!message.media_url || failed) {
    return <p className="mb-2 text-xs italic">Attachment unavailable</p>;
  }
  if (message.media_type === "video") {
    return (
      <video
        src={message.media_url}
        controls
        preload="metadata"
        onError={() => setFailed(true)}
        className="mb-2 max-h-64 rounded"
      />
    );
  }
  return (
    <a href={message.media_url} target="_blank" rel="noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={message.media_url}
        alt="Attachment"
        loading="lazy"
        onError={() => setFailed(true)}
        className="mb-2 max-h-64 rounded"
      />
    </a>
  );
}
