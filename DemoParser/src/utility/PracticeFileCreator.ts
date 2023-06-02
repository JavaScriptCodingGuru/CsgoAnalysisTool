import { IGrenadeTrajectoryEvent } from "demofile/dist/supplements/grenadetrajectory";
import { GrenadeExplodeSnapshot, GrenadeThrowSnapshot } from "../snapshots/grenades";

import * as fs from 'fs';
import { DemoFile } from "demofile";

export class PracticeFileCreator
{
    private map!: string;
    private userThrowGrenadeEventList: GrenadeThrowSnapshot[] = [];
    private userGrenadeExplodesEventList: GrenadeExplodeSnapshot[] = [];
    private eventCount = 0;

    public CreateFile()
    {
        /*
            Need to figure out 
        */

        const path = "./PracticeFileOut/test.json";
        const writeStream = fs.createWriteStream(path);

        writeStream.on("ready", ()=>
        {
            console.log("Creating the practice file...");
            this.writeEventArray(writeStream, this.userThrowGrenadeEventList);
            writeStream.end();
        });
        writeStream.on("error", (error)=>
        {
            console.error("An error occured while writing the practice file: ", error)
        });
        writeStream.on("finish", ()=>
        {
            console.log("Practice file creation completed");
        });
    }

    public addGrenadeExplodeEvent(event: GrenadeThrowSnapshot)
    {
        this.userThrowGrenadeEventList.push({ ...event });
    }
    public addGrenadeThrowEvent(e:IGrenadeTrajectoryEvent, df: DemoFile)
    {
        const event: GrenadeThrowSnapshot = {type: e.projectile.grenadeType, thrower:e.thrower.userId, throwerPos:e.thrower.position, throwerEyeAngles:e.thrower.eyeAngles, trajectory: e.trajectory, tick: df.currentTick};
        this.userThrowGrenadeEventList.push({ ...event });
    }
    public setMap(map: string)
    {
        this.map = map;
    }

    private writeEventArray(stream: fs.WriteStream, eventArray: any[])
    {
        console.log("Writing grenade throw events... ")
        for(const event of eventArray)
        {
            stream.write(JSON.stringify(event), 'utf-8');
        }
    }

}