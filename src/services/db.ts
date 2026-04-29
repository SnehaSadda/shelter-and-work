/**
 * Generic data access layer for Supabase tables.
 * Provides reusable CRUD primitives plus typed table-specific helpers.
 *
 * Every function returns `{ data, error }` to keep error handling consistent
 * and to support loading / empty states in the UI.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type TableName = keyof Tables;

// We type our generic helpers loosely against the Supabase client because
// supabase-js infers literal table names; using a string variable widens to
// `never`. This wrapper preserves a typed return shape while keeping the
// helpers reusable across any table.
const db = supabase as unknown as {
  from: (table: string) => any;
};

export type ListOptions<T extends TableName> = {
  select?: string;
  filters?: Partial<Record<keyof Tables[T]["Row"], unknown>>;
  search?: { column: keyof Tables[T]["Row"]; query: string };
  orderBy?: { column: keyof Tables[T]["Row"]; ascending?: boolean };
  page?: number;
  pageSize?: number;
};

function log(scope: string, payload: unknown) {
  // eslint-disable-next-line no-console
  console.debug(`[db:${scope}]`, payload);
}

export async function getAll<T extends TableName>(
  table: T,
  opts: ListOptions<T> = {},
) {
  const { select = "*", filters, search, orderBy, page = 0, pageSize = 50 } = opts;
  let q = db.from(table).select(select, { count: "exact" });

  if (filters) {
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null && v !== "") q = q.eq(k, v);
    }
  }
  if (search?.query) q = q.ilike(search.column as string, `%${search.query}%`);
  if (orderBy) q = q.order(orderBy.column as string, { ascending: orderBy.ascending ?? true });

  const from = page * pageSize;
  q = q.range(from, from + pageSize - 1);

  const { data, error, count } = await q;
  if (error) log(`getAll:${String(table)}`, error);
  return { data: (data ?? []) as Tables[T]["Row"][], error, count: count ?? 0 };
}

export async function getById<T extends TableName>(table: T, id: string) {
  const { data, error } = await db.from(table).select("*").eq("id", id).maybeSingle();
  if (error) log(`getById:${String(table)}`, error);
  return { data: data as Tables[T]["Row"] | null, error };
}

export async function createRecord<T extends TableName>(
  table: T,
  values: Tables[T]["Insert"],
) {
  const { data, error } = await db.from(table).insert(values).select().single();
  if (error) log(`create:${String(table)}`, error);
  return { data: data as Tables[T]["Row"] | null, error };
}

export async function updateRecord<T extends TableName>(
  table: T,
  id: string,
  values: Tables[T]["Update"],
) {
  const { data, error } = await db.from(table).update(values).eq("id", id).select().single();
  if (error) log(`update:${String(table)}`, error);
  return { data: data as Tables[T]["Row"] | null, error };
}

export async function deleteRecord<T extends TableName>(table: T, id: string) {
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) log(`delete:${String(table)}`, error);
  return { error };
}
