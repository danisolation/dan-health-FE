import { useState, useCallback } from "react";
import { daysAgo, today } from "@/utils/format";

interface DateRange {
  start: string;
  end: string;
}

interface UseDateRangeReturn {
  start: string;
  end: string;
  days: number;
  setDays: (n: number) => void;
  setRange: (start: string, end: string) => void;
}

export function useDateRange(defaultDays = 30): UseDateRangeReturn {
  const [days, setDaysState] = useState(defaultDays);
  const [range, setRangeState] = useState<DateRange>({
    start: daysAgo(defaultDays - 1),
    end: today(),
  });

  const setDays = useCallback((n: number) => {
    setDaysState(n);
    setRangeState({ start: daysAgo(n - 1), end: today() });
  }, []);

  const setRange = useCallback((start: string, end: string) => {
    setRangeState({ start, end });
  }, []);

  return { ...range, days, setDays, setRange };
}
