// Every scene is designed on a canvas of this size. The editor and the published page both
// draw this same canvas and only scale it to the screen, which is what keeps every item in
// the same place in both.
export const STAGE_WIDTH = 1000;
export const STAGE_HEIGHT = 760;

export type StageSize = {
  width: number;
  height: number;
};
