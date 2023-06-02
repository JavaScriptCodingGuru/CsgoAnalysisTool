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
class DemoPlaybackFrame {
    constructor() {
        this.playerData = [];
        this.grenadeEventList = []; //could be more than one grenade thrown in a frame
    }
}
class DemoPlayback {
    constructor() {
        this.FrameData = [];
        this.AllGrenadeThrowEvents = [];
    }
    setPlayerData(arr) {
        this.CurrentFrame.playerData.push(arr);
    }
    addGrenadeThrowEvent(event) {
        var _a;
        (_a = this.AllGrenadeThrowEvents) === null || _a === void 0 ? void 0 : _a.push({
            playerId: event.thrower.userId,
            trajectory: event.trajectory,
            type: event.projectile.grenadeType,
            playerPos: event.thrower.position,
            playerEyes: event.thrower.eyeAngles
        });
    }
    StartFrame(currentTick) {
        this.CurrentFrame = new DemoPlaybackFrame();
        this.CurrentFrame.tick = currentTick;
    }
    EndFrame() {
        var _a;
        (_a = this.FrameData) === null || _a === void 0 ? void 0 : _a.push(Object.assign({}, this.CurrentFrame));
        this.FrameData = undefined;
    }
}
class DemoDataParser {
    constructor() {
        this.playerList = []; //Holds All the HUMAN controlled player objects || We only care about playable character data
        this.isReady = false;
        //Variables for entire game stats file
        this.allGrenadeEventList = [];
        //Variables for user game stats file
        //Variables for "hacked" playback file
        this.pushedFrames = [];
        //Variables for "hacked" practice file
        //Variables that can be shared (labled with what)
        this.userGrenadeEventList = []; //  "hacked" practice file || user game stats file 
    }
    //Functions for gathering entire game stats
    //Functions for gathering user game stats
    //Functions for "hacked" playback file
    setFramePlayerData(arr) {
        var _a;
        (_a = this.currentFrame) === null || _a === void 0 ? void 0 : _a.playerData.push(...arr);
    }
    beginFrame(currentTick) {
        this.currentFrame = new DemoPlaybackFrame();
        if (this.currentFrame)
            this.isReady = true;
        this.currentFrame.tick = currentTick;
    }
    endFrame() {
        if (this.currentFrame) {
            this.pushedFrames.push(Object.assign({}, this.currentFrame)); //make a copy of the current frame
            this.currentFrame = undefined;
        }
        else if (this.isReady) {
            throw new Error("No current frame to end");
        }
    }
    //Functions for "hacked" practice file
    addGrenadeEvent(event) {
        var _a;
        if (this.userId) {
            this.userGrenadeEventList.push({
                playerId: event.thrower.userId,
                playerEyes: event.thrower.eyeAngles,
                playerPos: event.thrower.position,
                trajectory: event.trajectory,
                type: event.projectile.grenadeType,
            });
        }
        this.allGrenadeEventList.push({
            playerId: event.thrower.userId,
            playerEyes: event.thrower.eyeAngles,
            playerPos: event.thrower.position,
            trajectory: event.trajectory,
            type: event.projectile.grenadeType,
        });
        (_a = this.currentFrame) === null || _a === void 0 ? void 0 : _a.grenadeEventList.push({
            playerId: event.thrower.userId,
            playerEyes: event.thrower.eyeAngles,
            playerPos: event.thrower.position,
            trajectory: event.trajectory,
            type: event.projectile.grenadeType,
        });
    }
    //Utiltiy Functions
    setUserId(id) {
        this.userId = id;
    }
}
const demoParser = new DemoDataParser();
function gatherPlayerData(demoFile) {
    var _a;
    if (!demoFile.entities.players[0])
        return null;
    else {
        const players = [];
        for (let i = 0; i < demoFile.entities.players.length; i++) {
            if (((_a = demoFile.entities.players[i]) === null || _a === void 0 ? void 0 : _a.name) !== "GOTV") {
                players.push(demoFile.entities.players[i].name);
            }
        }
        return players;
    }
}
function gatherEndFrameData(demoFile) {
    const playerData = gatherPlayerData(demoFile);
    return playerData;
    //console.log(playerData);
}
class DemoParser {
    constructor() {
        this.pFile = new PracticeFileCreator_1.PracticeFileCreator();
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
            demoParser.beginFrame(demoFile.currentTick);
        });
        demoFile.on("tickend", () => {
            const data = gatherEndFrameData(demoFile);
            if (data === null || data === void 0 ? void 0 : data.length)
                demoParser.setFramePlayerData(data);
            demoParser.endFrame();
            //console.log(demoFile.currentTick)
        });
        demoFile.gameEvents.on("player_blind", (e) => {
        });
        demoFile.on("grenadeTrajectory", (e) => {
            if (demoFile.entities.getByUserId(e.thrower.userId) != null)
                e.thrower = demoFile.entities.getByUserId(e.thrower.userId);
            this.pFile.addGrenadeThrowEvent(e, demoFile);
            //console.log(e.thrower.name, "threw a ", e.projectile.grenadeType)
        });
        demoFile.on("molotovDetonate", (e) => {
        });
        demoFile.gameEvents.on("smokegrenade_detonate", (e) => {
        });
        demoFile.gameEvents.on("hegrenade_detonate", (e) => {
        });
        demoFile.gameEvents.on("flashbang_detonate", (e) => {
            //console.log(e.player.name);
        });
        demoFile.on("end", (e) => {
            if (e.error) {
                console.error("Error during parsing:", e.error);
                process.exitCode = 1;
            }
            this.pFile.CreateFile();
        });
        demoFile.parseStream(stream);
    }
}
const parse = new DemoParser();
parse.parseDemoFile("../demos/match730_003618992909509984527_0796506629_129.dem");
