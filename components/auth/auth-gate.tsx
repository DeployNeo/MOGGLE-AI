"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { LoadingSpinner } from "@/components/loading-spinner";

interface AuthGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AuthGate({
  children,
  title = "Sign in to analyze your face",
  description = "Create a free account to run live webcam or photo analysis, save scans, and track your progress over time.",
}: AuthGateProps) {
  const { user, loading, configured } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!configured) {
    return (
      <Card className="glass-card max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Firebase not configured</CardTitle>
          <CardDescription>Add your Firebase keys to `.env` to enable the app.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <Card className="glass-card border-electric/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-electric/15 border border-electric/25">
              <Lock className="h-7 w-7 text-electric" />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/login" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full glass">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="flex-1 sm:flex-none">
              <Button className="w-full gap-2 glow-electric">
                <Scan className="h-4 w-4" />
                Create Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return <>{children}</>;
}
