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

    private userIncendiaryThrowEvent: GrenadeThrowSnapshot[] = [];
    private userIncendiaryDetonateEvent: GrenadeExplodeSnapshot[] = [];

    private userHeGrenadeThrowEvent: GrenadeThrowSnapshot[] = [];
    private userHeGrenadeDetonateEvent: GrenadeExplodeSnapshot[] = [];

    private userSmokeThrowEvent: GrenadeThrowSnapshot[] = [];
    private userSmokeDetonateEvent: GrenadeExplodeSnapshot[] = [];

    private userDecoyThrowEvent: GrenadeThrowSnapshot[] = [];
    private userDecoyDetonateEvent: GrenadeExplodeSnapshot[] = [];

    private eventCount = 0;

    private eventFired: boolean = false; //checks that at least one event fired

    public createFiles()
    {
       this.createFlashbangFile();
       this.createMolotovFile();
       this.createHeGrenadeFile();
       this.createSmokeFile();
       this.createDecoyFile();
    }

    private createFlashbangFile() :void
    {
        const path: string = "./PracticeFileOut/flashes.json";
        const stream = fs.createWriteStream(path);

        stream.on("ready", ()=>
        {
            console.log("Writing the flashbang file...");
            //Collect data
            this.writeEventArray(stream, this.userFlashbangThrowEvent);
            this.writeEventArray(stream, this.userFlashbangDetonateEvent);
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
            this.writeEventArray(stream, this.userMolotovThrowEvent);
            this.writeEventArray(stream, this.userMolotovDetonateEvent);
            this.writeEventArray(stream, this.userIncendiaryThrowEvent);
            this.writeEventArray(stream, this.userIncendiaryDetonateEvent);
            stream.end();
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
    private createHeGrenadeFile(): void
    {
        const path: string = "./PracticeFileOut/he_grenades.json";
        const stream = fs.createWriteStream(path);

        stream.on("ready", ()=>
        {
            console.log("Starting to write he_grenade.json...");
            this.writeEventArray(stream, this.userHeGrenadeThrowEvent);
            this.writeEventArray(stream, this.userHeGrenadeDetonateEvent);
            stream.end();
        });
        stream.on("error", (error)=>
        {
            console.error("Error writing he_grenade.json", error);
        });
        stream.on("finish", ()=>
        {
            console.log("he_grenade.json finished writing");
        });
    }
    private createSmokeFile(): void
    {
        const path: string = "./PracticeFileOut/smokes.json";
        const stream = fs.createWriteStream(path);

        stream.on("ready", ()=>
        {
            console.log("Starting to write smokes.json...");
            this.writeEventArray(stream, this.userSmokeThrowEvent);
            this.writeEventArray(stream, this.userSmokeDetonateEvent);
            stream.end();
        });
        stream.on("error", (error)=>
        {
            console.error("There was an error creating smokes.json", error);
        });
        stream.on("finish", ()=>
        {
            console.log("Finished writing smokes.json");
        });
    }
    private createDecoyFile(): void
    {
        const path: string = "./PracticeFileOut/decoys.json";
        const stream = fs.createWriteStream(path);

        stream.on("ready", ()=>
        {
            console.log("Starting to write decoys.json...");
            this.writeEventArray(stream, this.userDecoyThrowEvent);
            this.writeEventArray(stream, this.userDecoyDetonateEvent);
            stream.end();
        })
        stream.on("error",(error)=>
        {
            console.error("There was an error trying to create decoy.json");
        });
        stream.on("finish", ()=>
        {
            console.log("Finished writing decoys.json");
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
    public addIncendiaryThrowEvent(event: GrenadeThrowSnapshot)
    {
        this.userIncendiaryThrowEvent.push({...event});
    }
    public addIncendiaryDetonateEvent(event: GrenadeExplodeSnapshot)
    {
        this.userIncendiaryDetonateEvent.push({...event});
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