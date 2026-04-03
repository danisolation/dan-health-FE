import { daysAgo, today } from "@/utils/format";

interface UseDateRangeReturn {
  start: string;
  end: string;
}

/** Luôn trả về 90 ngày gần nhất. */
export function useDateRange(): UseDateRangeReturn {
  return {
    start: daysAgo(89),
    end: today(),
  };
}
