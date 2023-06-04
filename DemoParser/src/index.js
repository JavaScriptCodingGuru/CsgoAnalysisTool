"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const demofile_1 = require("demofile");
const fs = __importStar(require("fs"));
//import { PlayerKillSnapshot, PlayerDeathSnapshot, GrenadeExplodeSnapshot, GrenadeThrowSnapshot } from "./utility/snapshots";
const PracticeFileCreator_1 = require("./utility/PracticeFileCreator");
//Parse a CS:GO demo file and create a new "controls" file to be used by the "Custom Demo Replay Tool" to mimic player controls in engine
//Consolidates all relevent game events and records player information each tick. || grenade thrown, weapon fired, player health, player pos, etc. 
//Create a "data" file that returns the end game stats of each player || Deaths, flashbangs thrown, players blinded, etc.
//NOTES: 
//Need to handle things like players reconnecting and disconnecting and still being able to track them || Will probably use "name" string off of demoFile.entities.players[i].name
//Make sure we save the old name when name changes happen
class DemoParser {
    constructor() {
        this.pFile = new PracticeFileCreator_1.PracticeFileCreator();
        this.user = "Whale";
    }
    parseDemoFile(path) {
        const stream = fs.createReadStream(path);
        const demoFile = new demofile_1.DemoFile();
        demoFile.on("start", ({ cancel }) => {
            console.log("Tick rate:", demoFile.tickRate);
            console.log("Duration (seconds):", demoFile.header.playbackTime);
            console.log("Playback frames: ", demoFile.header.playbackFrames);
            //playback.header = demoFile.header;
        });
        demoFile.on("tickstart", () => {
            //console.log(demoFile.currentTick)
        });
        demoFile.on("tickend", () => {
            //console.log(demoFile.currentTick)
        });
        demoFile.gameEvents.on("player_blind", (e) => {
        });
        demoFile.on("grenadeTrajectory", (e) => {
            if (e.thrower.name === this.user) {
                switch (e.projectile.grenadeType) {
                    case "flashbang":
                        this.pFile.addFlashbangThrowEvent({ type: "flashbang", thrower: e.thrower.userId, playerPos: demoFile.entities.players.map(p => { return p.position; }), playerEyes: demoFile.entities.players.map(p => { return p.eyeAngles; }), trajectory: e.trajectory });
                    case "molotov":
                        this.pFile.addMolotovThrowEvent({ type: "molotov", thrower: e.thrower.userId, playerPos: demoFile.entities.players.map(p => { return p.position; }), playerEyes: demoFile.entities.players.map(p => { return p.eyeAngles; }), trajectory: e.trajectory });
                    case "smoke":
                        this.pFile.addSmokeThrowEvent({ type: "smoke", thrower: e.thrower.userId, playerPos: demoFile.entities.players.map(p => { return p.position; }), playerEyes: demoFile.entities.players.map(p => { return p.eyeAngles; }), trajectory: e.trajectory });
                    case "explosive":
                        this.pFile.addHeGrenadeThrowEvent({ type: "explosive", thrower: e.thrower.userId, playerPos: demoFile.entities.players.map(p => { return p.position; }), playerEyes: demoFile.entities.players.map(p => { return p.eyeAngles; }), trajectory: e.trajectory });
                    case "decoy":
                        this.pFile.addDecoyThrowEvent({ type: "decoy", thrower: e.thrower.userId, playerPos: demoFile.entities.players.map(p => { return p.position; }), playerEyes: demoFile.entities.players.map(p => { return p.eyeAngles; }), trajectory: e.trajectory });
                    case "incendiary":
                        this.pFile.addIncendiaryThrowEvent({ type: "incendiary", thrower: e.thrower.userId, playerPos: demoFile.entities.players.map(p => { return p.position; }), playerEyes: demoFile.entities.players.map(p => { return p.eyeAngles; }), trajectory: e.trajectory });
                }
            }
        });
        demoFile.on("molotovDetonate", (e) => {
        });
        demoFile.gameEvents.on("smokegrenade_detonate", (e) => {
        });
        demoFile.gameEvents.on("hegrenade_detonate", (e) => {
        });
        demoFile.gameEvents.on("flashbang_detonate", (e) => {
            if (e.player.name === this.user)
                this.pFile.addFlashbangDetonateEvent({ type: "flashbang", thrower: e.player.userId, playerPos: demoFile.entities.players.map(p => { return p.position; }), playerEyes: demoFile.entities.players.map(p => { return p.eyeAngles; }), position: { x: e.x, y: e.y, z: e.z } });
        });
        demoFile.on("end", (e) => {
            if (e.error) {
                console.error("Error during parsing:", e.error);
                process.exitCode = 1;
            }
            this.pFile.createFiles();
        });
        demoFile.parseStream(stream);
    }
}
const parse = new DemoParser();
parse.parseDemoFile("../demos/match730_003618992909509984527_0796506629_129.dem");
