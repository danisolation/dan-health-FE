/** Chart shared constants & utilities */

/** Tooltip style chung cho tất cả Recharts components */
export const CHART_TOOLTIP_STYLE = {
  background: "#1a2733",
  border: "1px solid #2a3f52",
  borderRadius: 8,
  color: "#e0e0e0",
} as const;

/** Grid stroke color */
export const CHART_GRID_STROKE = "#1e2d3d";

/** Axis tick style chung */
export const CHART_AXIS_TICK = { fill: "#78909c", fontSize: 11 } as const;

/** Bar radius cho top corners */
export const BAR_RADIUS_TOP: [number, number, number, number] = [4, 4, 0, 0];
