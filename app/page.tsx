import { AltitudeMeter } from "@/components/scenes/AltitudeMeter";
import { BaseCamp } from "@/components/scenes/BaseCamp";
import { BlueprintRoom } from "@/components/scenes/BlueprintRoom";
import { PeaksConquered } from "@/components/scenes/PeaksConquered";
import { Preloader } from "@/components/scenes/Preloader";
import { Summit } from "@/components/scenes/Summit";
import { TheClimb } from "@/components/scenes/TheClimb";
import { ThePath } from "@/components/scenes/ThePath";
import { Voices } from "@/components/scenes/Voices";

/**
 * Home — The Ascent (brief §5): one continuous climb from Base Camp (0m) to
 * The Summit (8,848m), guided by the Dot.
 *
 *   0 Preloader (first visit) · 1 Base Camp · 2 The Path · 3 The Climb ·
 *   4 Peaks Conquered · 5 The Blueprint Room · 6 Voices · 7 The Summit → night-sky footer
 *
 * Every stage is real server-rendered HTML; motion modules load per scene as you approach.
 */
export default function HomePage() {
  return (
    <>
      <Preloader />
      <AltitudeMeter />
      <BaseCamp />
      <ThePath />
      <TheClimb />
      <PeaksConquered />
      <BlueprintRoom />
      <Voices />
      <Summit />
    </>
  );
}
