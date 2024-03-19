
import path from "path";
import os from "os";
import axios from "axios";
import open from "open";
import chalk from "chalk";
import { LibAndAPICalling } from "../index.js"

let Configdir = path.join(os.homedir(), ".config", "songit")
process.env["NODE_CONFIG_DIR"] = Configdir;
const { default: config } = await import("config");

class Spotify {

    constructor() {

        this.client_id = config.Spotify.CLIENT_ID;
        this.client_pass = config.Spotify.CLIENT_SEC;



    }

    InitializeAPI = async () => {

        try {
            const response = await axios.post("https://accounts.spotify.com/api/token",
                `grant_type=client_credentials&client_id=${this.client_id}&client_secret=${this.client_pass}`,
                {
                    headers:
                    {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                })


            return response.data.access_token;

        } catch (error) {


            await open(`${Configdir}\\default.json`, { wait: true });//open config file automatically
            throw `${"Please Check your spotify CLIENT_ID and CLIENT_SECRET"}`


        }
    };



    APIRequest = async (url) => {
        try {
            const response = await axios.get(url,
                {
                    headers: {

                        Authorization: `Bearer ${await this.InitializeAPI()}`
                    }

                })


            if (response.status === 200) {

                return response;
            } else {

                throw `Invalid Authorization, try again:  ${response.data.error}`

            }
        } catch (error) {
            throw error
        }
    }

    Search = async (trackname = 'never gonna give you up', type = "track") => {

        try {

            const response = await this.APIRequest(`https://api.spotify.com/v1/search?q=${trackname}&type=${type}&offset=0&limit=1`);


            const res = response?.data?.tracks?.items[0];

            let Search_Info = {
                Spotifyid: res.id,
                uri: res.uri
            }

            return Search_Info;

        } catch (error) {
            throw `${error}`

        }

    }


    /////to get the track info for metadata
    fn_Track_Info = (res, extra_info = "") => {

        let Track_Info = {

            album: res.album?.name || extra_info?.album || "",
            track: res.track_number || "",
            audio_name: res.name || "",
            album_artist: res.artists[0].name || "",
            contributing_artist: res.album?.artists[0].name || "",
            year: res.album?.release_date || extra_info?.date || "",
            image: res.album?.images[0] || extra_info?.images || ""
        };

        if (extra_info.flag === "album") {
            Track_Info["iteration"] = extra_info.iteration;
            Track_Info["album_link"] = extra_info.album_link;
            Track_Info["Tracklength"] = extra_info.Tracklength;
        }

        return Track_Info;


    }


    /**
     * 
     * @param {*callSpotify} user_input 
     * @returns Info of the track
     */
    getTrack = async (user_input) => {

        try {


            const search_info = await this.Search(user_input);
            const response = await this.APIRequest(`https://api.spotify.com/v1/tracks/${search_info.Spotifyid}`);


            const res = response?.data;

            return this.fn_Track_Info(res);


        } catch (error) {


            console.log(chalk.bgRed.white(error))


        }
    }



    getAlbum = async (user_input, iteration = 0, flagFromffmpeg = "", trackLengthfromffmpeg) => {

        try {
            if (flagFromffmpeg === "call" && iteration < trackLengthfromffmpeg) {
                LibAndAPICalling("album", iteration)
            }

            const link = user_input.split("/")[4].split("?")[0];
            const response = await this.APIRequest(`https://api.spotify.com/v1/albums/${link}`);
            let Tracklength = response.data.total_tracks;


            let random = Math.floor(Math.random() * (response.data.images.length)
            );

            let extra_info = {
                flag: "album",
                album: response.data.name,
                images: response.data.images[random],
                date: response.data.release_date,
                album_link: user_input,
                iteration: "",
                Tracklength: "",

            }

            let list = response.data.tracks.items;
            const info_return = () => {

                if (iteration < Tracklength) {

                    extra_info.iteration = iteration;
                    extra_info.Tracklength = Tracklength;
                    return this.fn_Track_Info(list[iteration], extra_info);
                }
                else {
                    console.log(chalk.bgYellow(" Album download Completed "));
                    return;
                }
            }

            return info_return();

        } catch (error) {

            console.log(chalk.bgRed.white(error))

        }

    }



};



export { Spotify }








