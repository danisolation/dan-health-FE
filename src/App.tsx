import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { OverviewPage } from "@/pages/OverviewPage";
import { HeartRatePage } from "@/pages/HeartRatePage";
import { SleepPage } from "@/pages/SleepPage";
import { ActivityPage } from "@/pages/ActivityPage";
import { StressPage } from "@/pages/StressPage";
import { SpO2Page } from "@/pages/SpO2Page";
import { ReadinessPage } from "@/pages/ReadinessPage";
import { WorkoutsPage } from "@/pages/WorkoutsPage";

export function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="heart-rate" element={<HeartRatePage />} />
        <Route path="sleep" element={<SleepPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="stress" element={<StressPage />} />
        <Route path="spo2" element={<SpO2Page />} />
        <Route path="readiness" element={<ReadinessPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
      </Route>
    </Routes>
  );
}
