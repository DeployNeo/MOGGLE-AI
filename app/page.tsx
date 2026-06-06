import { Suspense } from "react";
import { AnalysisSection } from "@/components/sections/analysis-section";
import { Hero } from "@/components/sections/hero";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LoadingSpinner } from "@/components/loading-spinner";

function AnalysisFallback() {
  return (
    <div className="flex justify-center py-20">
      <LoadingSpinner size="lg" label="Loading analysis tools..." />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-electric/5 via-transparent to-transparent" />
      <Header />
      <Hero />
      <Suspense fallback={<AnalysisFallback />}>
        <AnalysisSection />
      </Suspense>
      <Footer />
    </main>
  );
}
