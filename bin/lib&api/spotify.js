
import path from "path";
import os from "os";
import axios from "axios";
import open from "open";

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


            console.log("Please Check your spotify CLIENT_ID and CLIENT_SECRET")
            await open(`${Configdir}\\default.json`, { wait: true });//open config file automatically
            return;

        }
    };



    APIRequest = async (url) => {

        const response = await axios.get(url,
            {
                headers: {
                    Authorization: `Bearer ${await this.InitializeAPI()}`
                }

            })


        if (response.status === 200) {

            return response;
        } else {

            console.log(`Invalid response, try again:  ${response.data.error}`)
            return;
        }

    }

    Search = async (trackname = 'never gonna give you up') => {

        try {

            const response = await this.APIRequest(`https://api.spotify.com/v1/search?q=${trackname}&type=track&offset=0&limit=1`);

            const res = response.data.tracks.items[0];

            let Search_Info = {
                Spotifyid: res.id,
                uri: res.uri
            }

            return Search_Info;

        } catch (error) {
            console.log(error.code, error.response?.data || "maybe error with syntax");
            return;
        }

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
            let Track_Info = {

                album: res.album?.name || "",
                track: res.track_number || "",
                audio_name: res.name || "",
                album_artist: res.artists[0].name || "",
                contributing_artist: res.album?.artists[0].name || "",
                year: res.album?.release_date || "",
                image: res.album?.images[0] || ""
            };


            return Track_Info;


        } catch (error) {


            // console.log(error.response?.data || error);
            console.log("Something went wrong with spotify")
            return;

        }
    }



};



export { Spotify }








