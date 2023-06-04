import { IGrenadeTrajectoryEvent } from "demofile/dist/supplements/grenadetrajectory";
import { GrenadeExplodeSnapshot, GrenadeThrowSnapshot } from "../snapshots/grenades";

import * as fs from 'fs';
import { DemoFile } from "demofile";

/** 
 Should probably create more than one file each containing different information
 and parse it all back together again using C++ to make it more platable for the
 practice tool to work with
 We don't want to break it down here because:
    1. Typescript sucks with parsing data to bytes in large chunks
    2. The .json format can be used with node.js to push relvenant data into a database
 */


export class PracticeFileCreator
{
    private map!: string;
    private userThrowGrenadeEventList: GrenadeThrowSnapshot[] = [];
    private userGrenadeExplodeEventList: GrenadeExplodeSnapshot[] = [];

    private userFlashbangThrowEvent: GrenadeThrowSnapshot[] = [];
    private userFlashbangDetonateEvent: GrenadeExplodeSnapshot[] = [];

    private userMolotovThrowEvent: GrenadeThrowSnapshot[] = [];
    private userMolotovDetonateEvent: GrenadeExplodeSnapshot[] = [];

    private userHeGrenadeThrowEvent: GrenadeThrowSnapshot[] = [];
    private userHeGrenadeDetonateEvent: GrenadeExplodeSnapshot[] = [];

    private userSmokeThrowEvent: GrenadeThrowSnapshot[] = [];
    private userSmokeDetonateEvent: GrenadeExplodeSnapshot[] = [];

    private userDecoyThrowEvent: GrenadeThrowSnapshot[] = [];
    private userDecoyDetonateEvent: GrenadeExplodeSnapshot[] = [];

    private eventCount = 0;

    private eventFired: boolean = false; //checks that at least one event fired

    public createFile()
    {
        const path:string = "./PracticeFileOut/test.json";
        const userMolotoveDetonate:string = "./PracticeFileOut/molotoves.json";
        const userHe_GranadeDetonate:string = "./PracticeFileOut/he_grenades.json";

        this.createFlashbangFile();
        this.createMolotovFile();
        const writeStream = fs.createWriteStream(path);

        writeStream.on("ready", ()=>
        {
            console.log("Creating the practice file...");

            //Grenade Events
            console.log("Writing grenade events...")
            this.writeEventArray(writeStream, this.userThrowGrenadeEventList);
            console.log("Grenade throws finished writing!");
            console.log("Writing grande explode events");
            this.writeEventArray(writeStream, this.userGrenadeExplodeEventList);
            writeStream.end();
        });
        writeStream.on("error", (error)=>
        {
            console.error("An error occured while writing the practice file: ", error)
        });
        writeStream.on("finish", ()=>
        {
            this.userGrenadeExplodeEventList = [];
            console.log("Practice file creation completed");
        });
    }

    private createFlashbangFile() :void
    {
        const path: string = "./PracticeFileOut/flashes.json";
        const stream = fs.createWriteStream(path);

        stream.on("ready", ()=>
        {
            console.log("Writing the flashbang file...");
            //Collect data
            this.writeEventArray(stream, this.userThrowGrenadeEventList);
            stream.end();
        });
        stream.on("error", (error)=>
        {
            console.error("There was an error creating the flashbang file", error);
        });
        stream.on("finish", ()=>
        {
            console.log("Flashbang file finished writing");
        });
    }
    private createMolotovFile(): void
    {
        const path: string = "./PracticeFileOut/molotoves.json";
        const stream = fs.createWriteStream(path);

        stream.on("ready", ()=>
        {
            console.log("Starting to write molotov file...");
            this.writeEventArray(stream, this.userGrenadeExplodeEventList);
        });
        stream.on("error", (error)=>
        {
            console.error("There was an issue creating the molotov file", error)
        });
        stream.on("finish", ()=>
        {
            console.log("Molotov file finsihed writing");
        });
    }

    public addGrenadeExplodeEvent(event: GrenadeExplodeSnapshot)
    {
        this.userGrenadeExplodeEventList.push({ ...event });
    }
    public addGrenadeThrowEvent(e:IGrenadeTrajectoryEvent, df: DemoFile)
    {
        const event: GrenadeThrowSnapshot = {type: e.projectile.grenadeType, thrower:e.thrower.userId, playerPos: df.entities.players.map(p=>{return p.position}), playerEyes: df.entities.players.map(p=>{return p.eyeAngles}), trajectory: e.trajectory};
        this.userThrowGrenadeEventList.push({ ...event });
    }

    public addFlashbangThrowEvent(event: GrenadeThrowSnapshot)
    {
        this.userFlashbangThrowEvent.push({...event});
    }
    public addFlashbangDetonateEvent(event: GrenadeExplodeSnapshot)
    {
        this.userFlashbangDetonateEvent.push({...event});
    }

    public addMolotovThrowEvent(event: GrenadeThrowSnapshot)
    {

        this.userMolotovThrowEvent.push({ ...event })
    }
    public addMolotovDetonateEvent(event: GrenadeExplodeSnapshot)
    {
        this.userMolotovDetonateEvent.push({...event});
    }

    public addHeGrenadeThrowEvent(event: GrenadeThrowSnapshot)
    {
        this.userHeGrenadeThrowEvent.push({...event});
    }
    public addHeGrenadeDetonateEvent(event: GrenadeExplodeSnapshot)
    {
        this.userHeGrenadeDetonateEvent.push({...event});
    }

    public addSmokeThrowEvent(event: GrenadeThrowSnapshot)
    {
        this.userSmokeThrowEvent.push({...event});
    }
    public addSmokeDetonateEvent(event: GrenadeExplodeSnapshot)
    {
        this.userSmokeDetonateEvent.push({...event});
    }

    public addDecoyThrowEvent(event: GrenadeThrowSnapshot)
    {
        this.userDecoyThrowEvent.push({...event});
    }
    public addDecoyDetonateEvent(event: GrenadeExplodeSnapshot)
    {
        this.userDecoyDetonateEvent.push({...event});
    }

    public setMap(map: string)
    {
        this.map = map;
    }

    private writeEventArray(stream: fs.WriteStream, eventArray: any[])
    {
        for(const event of eventArray)
        {
            stream.write(JSON.stringify(event) + "\n", 'utf-8');
        }
    }

}