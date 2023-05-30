import { Angle2D, DemoFile, Entities, GrenadeType, Player, Vector } from "demofile";
import { PlayerMedalsInfo } from "demofile/dist/protobufs/cstrike15_gcmessages";
import { IGrenadeTrajectoryEvent } from "demofile/dist/supplements/grenadetrajectory";
import * as fs from "fs";

import { PlayerKillSnapshot, PlayerDeathSnapshot, GrenadeExplodeSnapshot, GrenadeThrowSnapshot } from "./utility/snapshots";

//Parse a CS:GO demo file and create a new "controls" file to be used by the "Custom Demo Replay Tool" to mimic player controls in engine
//Consolidates all relevent game events and records player information each tick. || grenade thrown, weapon fired, player health, player pos, etc. 
//Create a "data" file that returns the end game stats of each player || Deaths, flashbangs thrown, players blinded, etc.

//NOTES: 
//Need to handle things like players reconnecting and disconnecting and still being able to track them || Will probably use "name" string off of demoFile.entities.players[i].name
//Make sure we save the old name when name changes happen





class PracticeFileCreator //Gather all the data needed for the practice file and write to a file
{
    private map!: string; //map events took place in || each demo should only ever be one map
    private userThrowGrenadeEvents: GrenadeThrowSnapshot[] = [];//all user throw grenade events
    private userGrenadeExplodes: GrenadeExplodeSnapshot[] = [];//all user grenade explosion events
    private userDeathEvents: PlayerDeathSnapshot[] = [];//all user death events
    private userKillEvents: PlayerKillSnapshot[] = [];//all user kill events

    public addThrowGrenadeEvent(event: GrenadeThrowSnapshot)
    {
        this.userThrowGrenadeEvents.push({ ...event });
    }
    public addGrenadeExplodeEvent(event: GrenadeExplodeSnapshot)
    {
        this.userGrenadeExplodes.push({ ...event });
    }
    public addUserDeathEvent(event: PlayerDeathSnapshot)
    {
        this.userDeathEvents.push({ ...event });
    }
    public addUserKillEvent(event: PlayerKillSnapshot)
    {
        this.userKillEvents.push(event);
    }
    public setMap(map:string)
    {
        this.map = map;
    }
    public createFile() //write all data that the practice tool needs from the demo to a file
    {

    }

}


interface HeaderData
{
    magic: string,
    protocol: number,
    networkProtocol: number,
    serverName: string,
    clientName: string,
    mapName: string,
    gameDirectory: string,
    playbackTime: number,
    playbackTicks: number,
    playbackFrames: number,
    signonLength: number,
}

class DemoPlaybackFrame
{
    tick!: number;
    playerData: any[] = [];
    grenadeEventList: grenadeEvent[] = []; //could be more than one grenade thrown in a frame
    
}

interface grenadeEvent 
{
    playerId: number,
    trajectory: readonly Vector[],
    type: GrenadeType,
    playerPos: Vector,
    playerEyes: Angle2D,
}

class DemoPlayback
{
    public header!: HeaderData;

    public FrameData: undefined | DemoPlaybackFrame[] = [];

    private CurrentFrame!:DemoPlaybackFrame;

    public AllGrenadeThrowEvents: grenadeEvent[] = [];
    

    public setPlayerData(arr: any[])
    {
        this.CurrentFrame.playerData.push(arr)
    }

    public addGrenadeThrowEvent(event: IGrenadeTrajectoryEvent)
    {
        this.AllGrenadeThrowEvents?.push({
            playerId: event.thrower.userId,
            trajectory: event.trajectory, 
            type: event.projectile.grenadeType, 
            playerPos: event.thrower.position, 
            playerEyes: event.thrower.eyeAngles
        });
    }

    public StartFrame(currentTick: number)
    {
        this.CurrentFrame = new DemoPlaybackFrame();
        this.CurrentFrame.tick = currentTick;
    }
    public EndFrame()
    {   
        this.FrameData?.push({...this.CurrentFrame});
        this.FrameData = undefined;
    }

}

class DemoDataParser
{
    
    public playerList: Player[] = []; //Holds All the HUMAN controlled player objects || We only care about playable character data

    private userId?: number;
    private isReady: boolean = false;

    //Variables for entire game stats file
    public allGrenadeEventList: grenadeEvent[] = []; 
    //Variables for user game stats file
    //Variables for "hacked" playback file
    private pushedFrames: DemoPlaybackFrame[] = [];
    private currentFrame?:DemoPlaybackFrame;
    
    //Variables for "hacked" practice file
    
    //Variables that can be shared (labled with what)
    public userGrenadeEventList: grenadeEvent[] = [];    //  "hacked" practice file || user game stats file 
    
    //Functions for gathering entire game stats

    //Functions for gathering user game stats

    //Functions for "hacked" playback file
    public setFramePlayerData(arr: any[])
    {
        this.currentFrame?.playerData.push(...arr);
    }

    public beginFrame(currentTick: number) //start recording events for the frame
    {
        this.currentFrame = new DemoPlaybackFrame();
        if(this.currentFrame) this.isReady = true;
        this.currentFrame.tick = currentTick;
    }
    public endFrame()//stop recording and push the events recorded
    {   
        if(this.currentFrame)
        {
        this.pushedFrames.push({...this.currentFrame})//make a copy of the current frame
        this.currentFrame = undefined;
        }
        else if(this.isReady)
        {
            throw new Error("No current frame to end");
        }
    }
    //Functions for "hacked" practice file
    public addGrenadeEvent(event: IGrenadeTrajectoryEvent)
    {   
        if(this.userId)
        {
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
            type:event.projectile.grenadeType,
            });
        this.currentFrame?.grenadeEventList.push({
            playerId: event.thrower.userId,
            playerEyes: event.thrower.eyeAngles,
            playerPos: event.thrower.position,
            trajectory: event.trajectory,
            type:event.projectile.grenadeType,
        })
    }
    //Utiltiy Functions

    setUserId(id: number)
    {
        this.userId = id;
    }

}   


const demoParser = new DemoDataParser();

function gatherPlayerData(demoFile: DemoFile)
{
    if(!demoFile.entities.players[0])
        return null;
    else
    {
        const players: any[] = [];
        for(let i = 0; i < demoFile.entities.players.length; i++)
        {
            if(demoFile.entities.players[i]?.name !== "GOTV")
            {
                players.push(demoFile.entities.players[i].name)
            }
        }
        return players;
    }
}

function gatherEndFrameData(demoFile: DemoFile)
{
    const playerData = gatherPlayerData(demoFile);
    return playerData;
    //console.log(playerData);
}

function parseDemoFile(path: string)
{
    const stream = fs.createReadStream(path);
    const demoFile = new DemoFile();

    demoFile.on("start", ({ cancel })=>
    {
        console.log("Tick rate:", demoFile.tickRate);
        console.log("Duration (seconds):", demoFile.header.playbackTime);
        console.log("Playback frames: ", demoFile.header.playbackFrames);
        //playback.header = demoFile.header;
    });


    demoFile.on("tickstart", ()=>
    {
        //console.log(demoFile.currentTick)
        demoParser.beginFrame(demoFile.currentTick);
    })

    demoFile.on("tickend", ()=>
    {
        const data = gatherEndFrameData(demoFile);
        if(data?.length)
        demoParser.setFramePlayerData(data)
        demoParser.endFrame();
        //console.log(demoFile.currentTick)
    })

    demoFile.gameEvents.on("player_blind", (e)=>
    {

    })

    demoFile.on("grenadeTrajectory", (e)=>
    {
        demoParser.addGrenadeEvent(e);
       //console.log(e.thrower.name, "threw a ", e.projectile.grenadeType)
    })

    demoFile.on("molotovDetonate", (e)=>
    {
        
    });
    
    demoFile.gameEvents.on("smokegrenade_detonate", (e)=>
    {

    })
    demoFile.gameEvents.on("hegrenade_detonate",(e)=>
    {

    })
    demoFile.gameEvents.on("flashbang_detonate", (e)=>
    {
        //console.log(e.player.name);
    })

    demoFile.on("end", (e)=>
    {
        if(e.error)
        {
            console.error("Error during parsing:", e.error);
            process.exitCode = 1;
        }
        console.log(demoParser.playerList, demoParser.allGrenadeEventList[1].trajectory[3])
    });

    demoFile.parseStream(stream);
}

parseDemoFile("../demos/match730_003618992909509984527_0796506629_129.dem")