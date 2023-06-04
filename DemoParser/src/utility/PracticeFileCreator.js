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
exports.PracticeFileCreator = void 0;
const fs = __importStar(require("fs"));
/**
 Should probably create more than one file each containing different information
 and parse it all back together again using C++ to make it more platable for the
 practice tool to work with
 We don't want to break it down here because:
    1. Typescript sucks with parsing data to bytes in large chunks
    2. The .json format can be used with node.js to push relvenant data into a database
 */
class PracticeFileCreator {
    constructor() {
        this.userThrowGrenadeEventList = [];
        this.userGrenadeExplodeEventList = [];
        this.userFlashbangThrowEvent = [];
        this.userFlashbangDetonateEvent = [];
        this.userMolotovThrowEvent = [];
        this.userMolotovDetonateEvent = [];
        this.userIncendiaryThrowEvent = [];
        this.userIncendiaryDetonateEvent = [];
        this.userHeGrenadeThrowEvent = [];
        this.userHeGrenadeDetonateEvent = [];
        this.userSmokeThrowEvent = [];
        this.userSmokeDetonateEvent = [];
        this.userDecoyThrowEvent = [];
        this.userDecoyDetonateEvent = [];
        this.eventCount = 0;
        this.eventFired = false; //checks that at least one event fired
    }
    createFiles() {
        this.createFlashbangFile();
        this.createMolotovFile();
        this.createHeGrenadeFile();
        this.createSmokeFile();
        this.createDecoyFile();
    }
    createFlashbangFile() {
        const path = "./PracticeFileOut/flashes.json";
        const stream = fs.createWriteStream(path);
        stream.on("ready", () => {
            console.log("Writing the flashbang file...");
            //Collect data
            this.writeEventArray(stream, this.userFlashbangThrowEvent);
            this.writeEventArray(stream, this.userFlashbangDetonateEvent);
            stream.end();
        });
        stream.on("error", (error) => {
            console.error("There was an error creating the flashbang file", error);
        });
        stream.on("finish", () => {
            console.log("Flashbang file finished writing");
        });
    }
    createMolotovFile() {
        const path = "./PracticeFileOut/molotoves.json";
        const stream = fs.createWriteStream(path);
        stream.on("ready", () => {
            console.log("Starting to write molotov file...");
            this.writeEventArray(stream, this.userMolotovThrowEvent);
            this.writeEventArray(stream, this.userMolotovDetonateEvent);
            this.writeEventArray(stream, this.userIncendiaryThrowEvent);
            this.writeEventArray(stream, this.userIncendiaryDetonateEvent);
            stream.end();
        });
        stream.on("error", (error) => {
            console.error("There was an issue creating the molotov file", error);
        });
        stream.on("finish", () => {
            console.log("Molotov file finsihed writing");
        });
    }
    createHeGrenadeFile() {
        const path = "./PracticeFileOut/he_grenades.json";
        const stream = fs.createWriteStream(path);
        stream.on("ready", () => {
            console.log("Starting to write he_grenade.json...");
            this.writeEventArray(stream, this.userHeGrenadeThrowEvent);
            this.writeEventArray(stream, this.userHeGrenadeDetonateEvent);
            stream.end();
        });
        stream.on("error", (error) => {
            console.error("Error writing he_grenade.json", error);
        });
        stream.on("finish", () => {
            console.log("he_grenade.json finished writing");
        });
    }
    createSmokeFile() {
        const path = "./PracticeFileOut/smokes.json";
        const stream = fs.createWriteStream(path);
        stream.on("ready", () => {
            console.log("Starting to write smokes.json...");
            this.writeEventArray(stream, this.userSmokeThrowEvent);
            this.writeEventArray(stream, this.userSmokeDetonateEvent);
            stream.end();
        });
        stream.on("error", (error) => {
            console.error("There was an error creating smokes.json", error);
        });
        stream.on("finish", () => {
            console.log("Finished writing smokes.json");
        });
    }
    createDecoyFile() {
        const path = "./PracticeFileOut/decoys.json";
        const stream = fs.createWriteStream(path);
        stream.on("ready", () => {
            console.log("Starting to write decoys.json...");
            this.writeEventArray(stream, this.userDecoyThrowEvent);
            this.writeEventArray(stream, this.userDecoyDetonateEvent);
            stream.end();
        });
        stream.on("error", (error) => {
            console.error("There was an error trying to create decoy.json");
        });
        stream.on("finish", () => {
            console.log("Finished writing decoys.json");
        });
    }
    addGrenadeExplodeEvent(event) {
        this.userGrenadeExplodeEventList.push(Object.assign({}, event));
    }
    addGrenadeThrowEvent(e, df) {
        const event = { type: e.projectile.grenadeType, thrower: e.thrower.userId, playerPos: df.entities.players.map(p => { return p.position; }), playerEyes: df.entities.players.map(p => { return p.eyeAngles; }), trajectory: e.trajectory };
        this.userThrowGrenadeEventList.push(Object.assign({}, event));
    }
    addFlashbangThrowEvent(event) {
        this.userFlashbangThrowEvent.push(Object.assign({}, event));
    }
    addFlashbangDetonateEvent(event) {
        this.userFlashbangDetonateEvent.push(Object.assign({}, event));
    }
    addMolotovThrowEvent(event) {
        this.userMolotovThrowEvent.push(Object.assign({}, event));
    }
    addMolotovDetonateEvent(event) {
        this.userMolotovDetonateEvent.push(Object.assign({}, event));
    }
    addIncendiaryThrowEvent(event) {
        this.userIncendiaryThrowEvent.push(Object.assign({}, event));
    }
    addIncendiaryDetonateEvent(event) {
        this.userIncendiaryDetonateEvent.push(Object.assign({}, event));
    }
    addHeGrenadeThrowEvent(event) {
        this.userHeGrenadeThrowEvent.push(Object.assign({}, event));
    }
    addHeGrenadeDetonateEvent(event) {
        this.userHeGrenadeDetonateEvent.push(Object.assign({}, event));
    }
    addSmokeThrowEvent(event) {
        this.userSmokeThrowEvent.push(Object.assign({}, event));
    }
    addSmokeDetonateEvent(event) {
        this.userSmokeDetonateEvent.push(Object.assign({}, event));
    }
    addDecoyThrowEvent(event) {
        this.userDecoyThrowEvent.push(Object.assign({}, event));
    }
    addDecoyDetonateEvent(event) {
        this.userDecoyDetonateEvent.push(Object.assign({}, event));
    }
    setMap(map) {
        this.map = map;
    }
    writeEventArray(stream, eventArray) {
        for (const event of eventArray) {
            stream.write(JSON.stringify(event) + "\n", 'utf-8');
        }
    }
}
exports.PracticeFileCreator = PracticeFileCreator;
