import React from "react";
import { Composition } from "remotion";
import { DSADeltaLaunch } from "./DSADeltaLaunch";
import { FPS, W, H, DURATION } from "./theme";
import "./index.css";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DSADeltaLaunch"
      component={DSADeltaLaunch}
      durationInFrames={DURATION}
      fps={FPS}
      width={W}
      height={H}
    />
  );
};
