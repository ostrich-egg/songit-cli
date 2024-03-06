require("dotenv").config({path:"../../.env"})
   
const axios = require("axios");

class Spotify{

    constructor(){
        //  console.log("env",process.env.CLIENT_ID,process.env.CLIENT_SEC)
        
        this.client_id = process.env.CLIENT_ID;
        this.client_pass = process.env.CLIENT_SEC;
        
       
    
    }

    InitializeAPI = async()=>{

        try {
            const response = await axios.post("https://accounts.spotify.com/api/token",
            `grant_type=client_credentials&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SEC}`,
            {
            headers:
            {
                "Content-Type": "application/x-www-form-urlencoded"
            }
            })
           
    
        return response.data.access_token;
            
        } catch (error) {
            console.log(error.response);
            // console.log('error in spotify initialization')

        }};



    APIRequest = async(url)=>{

        const response=  await axios.get(url,
            {
                headers: {
                    Authorization: `Bearer ${await this.InitializeAPI()}`
                }
            
            })


            if(response.status === 200){
               
                return response;
            }else{

                console.log(`Invalid response, try again:  ${response.data.error}`)
            }

    }

    Search = async(trackname = 'never gonna give you up')=>{

       try {
        
        // let Search_Info = {Spotifyid: "", uri:"",audio_name:"",album_name:"",audio_type:"",contributing_artist:"",album_artist:""};
        const response = await this.APIRequest(`https://api.spotify.com/v1/search?q=${trackname}&type=track&offset=0&limit=1`);

        
       
        const res = response.data.tracks.items[0];

        let Search_Info = {
            Spotifyid:res.id,
            uri:res.uri
        }
       
      
        // audio_type:res.type || "",
        
         return Search_Info;
 
       } catch (error) {
        console.log(error.code, error.response?.data || "maybe error with syntax");
       }

    }


    getTrack = async(user_input)=>{

        try {

            // let Track_Info = {name:"", artist:""};
            const search_info = await this.Search(user_input);
           
            const response = await this.APIRequest(`https://api.spotify.com/v1/tracks/${search_info.Spotifyid}`);

            // console.log(response);
            // console.log(response.data.album.artists);
            const res = response?.data;
            let Track_Info = {
               
                 album: res.album?.name || "",
                 track: res.track_number || "",
                 audio_name: res.name || "",
                 album_artist: res.artists[0].name || "",
                 contributing_artist: res.album?.artists[0].name || "",
                 year: res.album?.release_date || "",
                 image : res.album?.images[0] || ""
            };

            
            // console.log("Track",Track_Info);
          
    
            return Track_Info;
            
        } catch (error) { 
            console.log(error.response?.data || error);
        }
    }



};



module.exports = {Spotify}






