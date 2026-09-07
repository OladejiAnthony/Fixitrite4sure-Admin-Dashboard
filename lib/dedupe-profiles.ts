// lib/dedupe-profiles.ts
//
// Duplicate signups can leave more than one `profiles` row for the same
// real person (same email/phone, different id). Once any of those rows
// gets verified, admin list views shouldn't keep showing a leftover
// unverified row for that same person. This collapses rows by identity
// (email, falling back to phone), keeping whichever row has the
// highest-priority verification_status.

type IdentityRow = {
  id: string;
  email?: string | null;
  phone_number?: string | null;
  verification_status?: string | null;
};

const STATUS_RANK: Record<string, number> = {
  verified: 3,
  pending: 2,
  rejected: 1,
  unverified: 0,
};

function statusRank(status: string | null | undefined): number {
  return STATUS_RANK[status ?? "unverified"] ?? 0;
}

export function dedupeProfilesByIdentity<T extends IdentityRow>(rows: T[]): T[] {
  const byIdentity = new Map<string, T>();

  for (const row of rows) {
    const key = row.email?.toLowerCase().trim() || row.phone_number?.trim() || row.id;
    const existing = byIdentity.get(key);
    if (!existing || statusRank(row.verification_status) > statusRank(existing.verification_status)) {
      byIdentity.set(key, row);
    }
  }

  return Array.from(byIdentity.values());
}
