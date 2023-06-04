import { Angle2D, GrenadeType, Player, Vector } from "demofile";
import { IGrenadeTrajectoryEvent } from "demofile/dist/supplements/grenadetrajectory";

export interface GrenadeExplodeSnapshot
{
    type: GrenadeType,
    thrower: Number,
    playerPos: Vector[],
    playerEyes: Angle2D[],
    position: Vector,
}
export interface GrenadeThrowSnapshot
{
    type: GrenadeType,
    trajectory: readonly Vector[],
    thrower: Number,
    playerPos: Vector[],
    playerEyes: Angle2D[],
}