"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, MailCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-8" />
          </div>
          <h1 className="text-2xl font-extrabold">Compliance Copilot</h1>
          <p className="text-muted-foreground">
            Ask your safety manuals anything.
          </p>
        </div>

        <Card>
          {sent ? (
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-green-100 text-green-700">
                <MailCheck className="size-8" />
              </div>
              <h2 className="text-xl font-bold">Check your email</h2>
              <p className="text-base text-muted-foreground">
                We sent a sign-in link to <strong>{email}</strong>. Tap it to
                get started — no password needed.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="min-h-12 text-base font-semibold text-primary"
              >
                Use a different email
              </button>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Sign in</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                    />
                  </div>

                  {error && (
                    <p className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
                      {error}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="size-5 animate-spin" />}
                    Email me a sign-in link
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  No password. We&apos;ll email you a secure link.
                </p>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
