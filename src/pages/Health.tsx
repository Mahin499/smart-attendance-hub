import React, { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export default function Health() {
  const [status, setStatus] = useState<string>("Checking...");
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    async function check() {
      if (!isSupabaseConfigured()) {
        setStatus("Supabase not configured (use Setup page)");
        return;
      }
      try {
        setStatus("Connecting to Supabase...");
        // Try a simple count of profiles and students to verify schema
        const [{ data: profiles }, { data: students }] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('students').select('id', { count: 'exact', head: true }),
        ]);

        setDetails([
          `Profiles table count: ${profiles?.length ?? 0} (fetched head)`,
          `Students table count: ${students?.length ?? 0} (fetched head)`,
        ]);
        setStatus('OK');
      } catch (err: any) {
        setStatus('Error');
        setDetails([String(err?.message ?? err)]);
      }
    }
    check();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-4">Health Check</h1>
        <p className="mb-2">Status: <strong>{status}</strong></p>
        <div className="bg-card p-4 rounded">
          {details.map((d, i) => (
            <div key={i} className="text-sm text-muted-foreground">{d}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
