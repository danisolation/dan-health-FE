import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LoadingState } from "@/components/LoadingState";

const OverviewPage = lazy(() => import("@/pages/OverviewPage").then(m => ({ default: m.OverviewPage })));
const HeartRatePage = lazy(() => import("@/pages/HeartRatePage").then(m => ({ default: m.HeartRatePage })));
const SleepPage = lazy(() => import("@/pages/SleepPage").then(m => ({ default: m.SleepPage })));
const ActivityPage = lazy(() => import("@/pages/ActivityPage").then(m => ({ default: m.ActivityPage })));
const StressPage = lazy(() => import("@/pages/StressPage").then(m => ({ default: m.StressPage })));
const SpO2Page = lazy(() => import("@/pages/SpO2Page").then(m => ({ default: m.SpO2Page })));
const ReadinessPage = lazy(() => import("@/pages/ReadinessPage").then(m => ({ default: m.ReadinessPage })));
const WorkoutsPage = lazy(() => import("@/pages/WorkoutsPage").then(m => ({ default: m.WorkoutsPage })));

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">🔍</span>
      <h1 className="text-2xl font-bold text-white mb-2">404 — Không tìm thấy</h1>
      <p className="text-gray-400 mb-4">Trang bạn tìm không tồn tại.</p>
      <a href="/" className="text-accent-blue hover:underline">← Về trang chủ</a>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Suspense fallback={<LoadingState />}><OverviewPage /></Suspense>} />
        <Route path="heart-rate" element={<Suspense fallback={<LoadingState />}><HeartRatePage /></Suspense>} />
        <Route path="sleep" element={<Suspense fallback={<LoadingState />}><SleepPage /></Suspense>} />
        <Route path="activity" element={<Suspense fallback={<LoadingState />}><ActivityPage /></Suspense>} />
        <Route path="stress" element={<Suspense fallback={<LoadingState />}><StressPage /></Suspense>} />
        <Route path="spo2" element={<Suspense fallback={<LoadingState />}><SpO2Page /></Suspense>} />
        <Route path="readiness" element={<Suspense fallback={<LoadingState />}><ReadinessPage /></Suspense>} />
        <Route path="workouts" element={<Suspense fallback={<LoadingState />}><WorkoutsPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
