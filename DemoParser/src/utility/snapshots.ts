import { GrenadeType, Player, Vector } from "demofile";

export interface PlayerKillSnapshot
{
    player: Player,
    killed: Player,
    players: Player[],
}

export interface PlayerDeathSnapshot
{
    player: Player,
    killer: Player,
    players: Player[],
}

export interface GrenadeExplodeSnapshot
{
    type: GrenadeType,
    thrower: Player,
    players: Player[],
    position: Vector,  
}

export interface GrenadeThrowSnapshot
{
    type: GrenadeType,
    trajectory: readonly Vector[],
    thrower: Player,
}