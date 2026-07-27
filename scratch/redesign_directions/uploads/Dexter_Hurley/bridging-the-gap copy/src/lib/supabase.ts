import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | any;

if (url && key) {
  supabase = createClient(url, key);
} else {
  // In development, avoid throwing during module eval so the app can run
  // when Supabase env vars are not provided. Log a warning and provide a
  // minimal stub that matches the small surface area the app expects.
  // eslint-disable-next-line no-console
  console.warn("Missing Supabase environment variables — using stub client");

  supabase = {
    channel: (_name: string) => ({
      on: (_event: any, _opts: any, _cb: any) => ({
        on: () => ({ on: () => ({ subscribe: () => ({}) }) }),
        subscribe: () => ({}),
      }),
      subscribe: () => ({}),
    }),
    removeChannel: (_chan: any) => {},
    from: (_table: string) => {
      // simple chainable builder stub: select().eq().order().single() etc.
      const builder: any = {
        select: (..._args: any[]) => builder,
        eq: (_col: string, _val: any) => builder,
        order: (_col: string, _opts?: any) => builder,
        single: async () => ({ data: null, error: null }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null }),
      };
      return builder;
    },
    auth: { user: () => null },
  } as any;
}

export { supabase };
