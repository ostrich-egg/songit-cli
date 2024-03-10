#!/usr/bin/env node
import { Scrapped } from "./lib&api/scrapper.js";
import { videoChunks } from "./lib&api/ytdl.js";


import path from "path";
import os from "os"
import fs from "fs"
import open from "open";

import { Spotify } from "./lib&api/spotify.js";



let final_input;

let Configdir = path.join(os.homedir(), ".config", "songit")
/**
 * To add your valuable id and password in your computer
 * @returns the path to shit hole
 */
const configuration = () => {


    if (!fs.existsSync(Configdir)) {

        fs.mkdirSync(Configdir, { recursive: true })

    }

    let ConfigPath = `${Configdir}\\default.json`;

    let content = `
   {

    "Warning":"Use '/' while entering custom download_location",
    "Download_location": "C:/Users/User/Downloads",

    "Spotify":{

        "CLIENT_ID" : "<-Enter Spotify Client ID inside this Quotation->",
        "CLIENT_SEC" : "<-Enter Spotify Client SECRET KEY inside this Quotation->"
    }
   }
   
    `

    try {


        if (!fs.existsSync(ConfigPath)) {
            fs.writeFileSync(ConfigPath, content);
        }

    } catch (error) {

        console.log(error)

    }

    return ConfigPath;

}





/**
 * When user input the shitty music
 * @returns exit
 */
const User_argument = async () => {

    const user_input = process.argv.slice(2)

    //NOTE // CONFIGURATION
    if (user_input[0].startsWith("-c")) {

        const ConfigPath = configuration();
        console.log(`Find the Path of Config:`, `${Configdir}\\default.json`);

        await open(ConfigPath);//open config file automatically
        return;
    }

    //NOTE // Search for the song with name ///////// NO USE OF SPOTIFY /////////
    if (user_input[0].startsWith("-raw")) {

        let _input = user_input.slice(1);
        final_input = _input.join(" ");
        LibAndAPICalling("noSpotify");


    }
    /////////USE OF SPOTIFY////////////
    else {

        final_input = user_input.join(" ");
        LibAndAPICalling();
    }

}
User_argument();



///////////////////////////////////////////////////////////////////////////////////

function LibAndAPICalling(flag = "") {


    // let Track_info;
    let Track_info = {
        audio_name: final_input || "",
    };



    let chooseVideoLink;

    //Init  spotify and get the track info from there
    const spotifyCaller = async () => {
        try {
            if (flag !== "noSpotify") {

                const spotifyAPI = new Spotify();
                Track_info = await spotifyAPI.getTrack(final_input);

                if (!Track_info) {
                    console.log("Didnot get track info");
                    return;
                }

            }

            scraperCaller();

        } catch (error) {

            console.log("Something wrong with spotify")
        }
    }


    //Init scrapper and get the link from there with the info from spotify
    const scraperCaller = async () => {

        const YTscrapper = new Scrapped(Track_info);
        const data = await YTscrapper.YTdata();
        chooseVideoLink = data.videos[0].link;

        //////////////If No Spotify is used//////////////////////
        const res = data?.videos[0];

        if (flag === "noSpotify") {
            noSpotify(res);
        }

        /////////////////Calling ytdl to download/////////////
        Track_info.duration = res.duration;
        ytdlCaller();

    }



    /**
     * When user donot add spotify account info
     * @param {scraperCaller} res 
     */
    const noSpotify = (res) => {

        const release_date = ((new Date()).getFullYear()) - Number(res.uploaded.split(" ")[0]);
        Track_info = {

            album: res.channel.name || "",
            track: "",
            audio_name: res.title || "",
            album_artist: res.channel.name || "",
            contributing_artist: "",
            year: release_date || "",
            image: {
                url: res.thumbnail || "",
            }
        };



    }


    //Send those data to the ytdl for downloading
    const ytdlCaller = () => {
        videoChunks(chooseVideoLink, Track_info);
    }




    ///////////Initiator///////
    spotifyCaller();


}



