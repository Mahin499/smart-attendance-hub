import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const CONFIG_STORAGE_KEY = "sah_supabase_config";

export interface SupabaseConfig {
  url: string;
  key: string;
}

export function getStoredConfig(): SupabaseConfig | null {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function storeConfig(config: SupabaseConfig) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function clearConfig() {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
}

export default function SetupPage() {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!url.trim() || !key.trim()) {
      setError("Please enter both Supabase URL and Publishable Key");
      return;
    }

    if (!url.includes("supabase.co")) {
      setError("Invalid Supabase URL. Must be in format: https://xxx.supabase.co");
      return;
    }

    setLoading(true);
    try {
      // Store the config
      storeConfig({ url: url.trim(), key: key.trim() });
      setSuccess(true);
      
      // Reload the page to apply the config
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError("Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-elevated">
          <CardHeader className="pb-4">
            <h1 className="text-2xl font-bold text-foreground">Smart Attendance Hub</h1>
            <p className="text-muted-foreground text-sm mt-2">Configuration Required</p>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">First-time setup</p>
                  <p>Enter your Supabase project credentials to get started. These will be stored locally in your browser.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Supabase Project URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://xxx.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Found in Supabase Dashboard → Project Settings → API
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">Supabase Publishable Key (anon)</Label>
                <Input
                  id="key"
                  type="password"
                  placeholder="eyJ0eXAiOiJKV1QiLC..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  disabled={loading}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use the "anon" key, NOT "service_role". Found in Supabase Dashboard → Project Settings → API → Project API keys
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm p-3 rounded-lg flex gap-2">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <div>Saved! Reloading the app...</div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || success}>
                {loading ? "Saving..." : success ? "Success!" : "Save and Continue"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <details className="text-sm">
                <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">
                  Need help finding your credentials?
                </summary>
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <p>
                    <strong>1. Open Supabase Dashboard</strong>
                  </p>
                  <p className="ml-2">Go to https://app.supabase.com and click your project</p>
                  
                  <p className="mt-3">
                    <strong>2. Find Project URL</strong>
                  </p>
                  <p className="ml-2">Click "Settings" (gear icon) → "API" → Copy "Project URL"</p>
                  
                  <p className="mt-3">
                    <strong>3. Find Publishable Key</strong>
                  </p>
                  <p className="ml-2">In the same "Settings → API" page, copy "anon public" key (NOT "service_role")</p>
                  
                  <p className="mt-3">
                    <strong>Note:</strong> For production (Vercel), set these as environment variables instead of storing in browser.
                  </p>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This setup is temporary. For production, set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your hosting provider (Vercel, Netlify, etc.).
        </p>
      </div>
    </div>
  );
}
