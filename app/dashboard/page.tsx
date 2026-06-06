import { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" label="Loading dashboard..." />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
