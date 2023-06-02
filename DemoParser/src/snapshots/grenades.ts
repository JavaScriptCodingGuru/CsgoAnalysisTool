import { GrenadeType, Player, Vector } from "demofile";
import { IGrenadeTrajectoryEvent } from "demofile/dist/supplements/grenadetrajectory";

export interface GrenadeExplodeSnapshot
{
    type: GrenadeType,
    thrower: Player[],
    players: Player[],
    position: Vector,
}
export interface GrenadeThrowSnapshot
{
    type: GrenadeType,
    trajectory: readonly Vector[],
    thrower: Number,
    throwerPos: Player["position"],
    throwerEyeAngles: Player["eyeAngles"],
    tick: Number, 
}