//lib/schemas/notification-schema.ts;

import { z } from "zod";

export const notificationSchema = z.object({
  id: z.number(),
  type: z.string(),
  message: z.string(),
  createdAt: z.string().datetime(),
});

export const notificationsArraySchema = z.array(notificationSchema);

export type Notification = z.infer<typeof notificationSchema>;
