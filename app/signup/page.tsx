"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/hooks/use-toast";

export default function SignupPage() {
  const { signUp, configured } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      toast({ title: "Account created", variant: "success" });
      router.push("/dashboard");
    } catch {
      toast({
        title: "Sign up failed",
        description: "Email may already be in use or password too weak.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!configured) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardHeader>
            <CardTitle>Firebase not configured</CardTitle>
            <CardDescription>Add Firebase env vars to enable authentication.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-electric/10 via-transparent to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-electric/15 border border-electric/20">
              <Sparkles className="h-6 w-6 text-electric" />
            </div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Start tracking your facial analysis journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="text-xs text-muted-foreground mb-1.5 block">
                  Display name
                </label>
                <input
                  id="name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-xs text-muted-foreground mb-1.5 block">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-xs text-muted-foreground mb-1.5 block">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-electric/50"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-electric hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
