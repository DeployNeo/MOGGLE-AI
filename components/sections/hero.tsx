"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Scan, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden px-4 py-24 md:py-36">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-radial from-electric/8 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-electric/5 blur-[100px] rounded-full" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-muted-foreground"
        >
          <Sparkles className="h-4 w-4 text-electric" />
          Premium Facial Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
        >
          <span className="text-gradient">Understand your</span>
          <br />
          <span className="bg-gradient-to-r from-electric to-blue-400 bg-clip-text text-transparent">
            facial structure
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
        >
          AI-powered analysis with personalized grooming, style, and improvement
          guidance — sign in to analyze and save your progress.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          {user ? (
            <a href="#analyze">
              <Button size="lg" className="gap-2 h-12 px-8 glow-electric">
                <Scan className="h-4 w-4" />
                Analyze Your Face
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          ) : (
            <>
              <Link href="/signup">
                <Button size="lg" className="gap-2 h-12 px-8 glow-electric">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 glass">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-electric" />
            Live + Photo Analysis
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-electric" />
            Dual AI Engine
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-electric" />
            Progress Tracking
          </div>
        </motion.div>
      </div>
    </section>
  );
}
