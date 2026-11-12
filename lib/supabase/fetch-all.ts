// lib/supabase/fetch-all.ts
import "server-only";

// PostgREST caps every response (1000 rows by default), so page until a
// short page comes back. The query must have a stable order (end it with a
// unique column such as id) or rows can repeat or be skipped across pages.
const PAGE_SIZE = 1000;

export async function fetchAll<T>(
  query: (
    from: number,
    to: number
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await query(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}
