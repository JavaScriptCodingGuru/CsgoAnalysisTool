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
class PracticeFileCreator {
    constructor() {
        this.userThrowGrenadeEventList = [];
        this.userGrenadeExplodesEventList = [];
        this.eventCount = 0;
    }
    CreateFile() {
        /*
            Need to figure out
        */
        const path = "./PracticeFileOut/test.json";
        const writeStream = fs.createWriteStream(path);
        writeStream.on("ready", () => {
            console.log("Creating the practice file...");
            this.writeEventArray(writeStream, this.userThrowGrenadeEventList);
            writeStream.end();
        });
        writeStream.on("error", (error) => {
            console.error("An error occured while writing the practice file: ", error);
        });
        writeStream.on("finish", () => {
            console.log("Practice file creation completed");
        });
    }
    addGrenadeExplodeEvent(event) {
        this.userThrowGrenadeEventList.push(Object.assign({}, event));
    }
    addGrenadeThrowEvent(e, df) {
        const event = { type: e.projectile.grenadeType, thrower: e.thrower.userId, throwerPos: e.thrower.position, throwerEyeAngles: e.thrower.eyeAngles, trajectory: e.trajectory, tick: df.currentTick };
        this.userThrowGrenadeEventList.push(Object.assign({}, event));
    }
    setMap(map) {
        this.map = map;
    }
    writeEventArray(stream, eventArray) {
        console.log("Writing grenade throw events... ");
        for (const event of eventArray) {
            stream.write(JSON.stringify(event), 'utf-8');
        }
    }
}
exports.PracticeFileCreator = PracticeFileCreator;
