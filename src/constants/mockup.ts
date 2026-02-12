// Mockup proportions for programmatic iPhone frame drawing.
// All values are ratios relative to the phone width or height.
export const MOCKUP_PROPORTIONS = {
  // Frame thickness as ratio of phone width
  FRAME_THICKNESS: 0.035,
  // Outer corner radius as ratio of phone width
  CORNER_RADIUS: 0.12,
  // Inner corner radius offset from frame thickness
  INNER_RADIUS_FACTOR: 0.8,
  // Dynamic Island width as ratio of screen width
  DYNAMIC_ISLAND_WIDTH_RATIO: 0.32,
  // Dynamic Island height as ratio of phone height
  DYNAMIC_ISLAND_HEIGHT: 0.022,
  // Dynamic Island Y offset from top frame edge
  DYNAMIC_ISLAND_Y_OFFSET: 0.008,
  // Side button width as ratio of phone width
  BUTTON_WIDTH: 0.012,
  // Phone aspect ratio (width/height) for preview
  PHONE_ASPECT: 0.49,
  // Minimal style border width
  MINIMAL_BORDER: 0.02,
  MINIMAL_CORNER_RADIUS: 0.1,
  MINIMAL_DI_WIDTH: 0.28,
  MINIMAL_DI_HEIGHT: 0.018,
  MINIMAL_DI_Y_OFFSET: 0.01,
  // Outline style
  OUTLINE_BORDER: 0.025,
  OUTLINE_CORNER_RADIUS: 0.11,
  OUTLINE_DI_Y_OFFSET: 0.012,
} as const;
