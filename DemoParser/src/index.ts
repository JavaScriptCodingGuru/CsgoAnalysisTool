import { Angle2D, DemoFile, Entities, GrenadeType, Player, Vector } from "demofile";
import { PlayerMedalsInfo } from "demofile/dist/protobufs/cstrike15_gcmessages";
import { IGrenadeTrajectoryEvent } from "demofile/dist/supplements/grenadetrajectory";
import * as fs from "fs";

//import { PlayerKillSnapshot, PlayerDeathSnapshot, GrenadeExplodeSnapshot, GrenadeThrowSnapshot } from "./utility/snapshots";
import { PracticeFileCreator } from "./utility/PracticeFileCreator"
import { CMsgVector } from "demofile/dist/protobufs/netmessages";

//Parse a CS:GO demo file and create a new "controls" file to be used by the "Custom Demo Replay Tool" to mimic player controls in engine
//Consolidates all relevent game events and records player information each tick. || grenade thrown, weapon fired, player health, player pos, etc. 
//Create a "data" file that returns the end game stats of each player || Deaths, flashbangs thrown, players blinded, etc.

//NOTES: 
//Need to handle things like players reconnecting and disconnecting and still being able to track them || Will probably use "name" string off of demoFile.entities.players[i].name
//Make sure we save the old name when name changes happen






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

class DemoParser
{
    private pFile = new PracticeFileCreator();
    private user: string = "Whale";
    public parseDemoFile(path: string)
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
        });
        demoFile.on("tickend", ()=>
        {
            const data = gatherEndFrameData(demoFile);
            if(data?.length)
            demoParser.setFramePlayerData(data)
            demoParser.endFrame();
            //console.log(demoFile.currentTick)
        });
        demoFile.gameEvents.on("player_blind", (e)=>
        {
        });
        demoFile.on("grenadeTrajectory", (e)=>
        {
            if(e.thrower.name === this.user)
                this.pFile.addGrenadeThrowEvent(e, demoFile);
            //console.log(e.thrower.name, "threw a ", e.projectile.grenadeType)
        });
        demoFile.on("molotovDetonate", (e)=>
        {
        });
        demoFile.gameEvents.on("smokegrenade_detonate", (e)=>
        {
        });
        demoFile.gameEvents.on("hegrenade_detonate",(e)=>
        {
        });
        demoFile.gameEvents.on("flashbang_detonate", (e)=>
        {
            if(e.player.name === this.user)
                this.pFile.addGrenadeExplodeEvent({type: "flashbang", thrower: e.player.userId, playerPos: demoFile.entities.players.map(p=>{return p.position;}), playerEyes: demoFile.entities.players.map(p=>{return p.eyeAngles}), position: {x: e.x, y: e.y, z: e.z}});
        });
        demoFile.on("end", (e)=>
        {
            if(e.error)
            {
                console.error("Error during parsing:", e.error);
                process.exitCode = 1;
            }
            this.pFile.createFile();
        });



        demoFile.parseStream(stream);
    }
}

const parse = new DemoParser();

parse.parseDemoFile("../demos/match730_003618992909509984527_0796506629_129.dem");