import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { OverviewPage } from "@/pages/OverviewPage";
import { HeartRatePage } from "@/pages/HeartRatePage";
import { SleepPage } from "@/pages/SleepPage";
import { ActivityPage } from "@/pages/ActivityPage";
import { WorkoutsPage } from "@/pages/WorkoutsPage";

export function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="heart-rate" element={<HeartRatePage />} />
        <Route path="sleep" element={<SleepPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
      </Route>
    </Routes>
  );
}
