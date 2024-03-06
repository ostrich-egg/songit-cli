const Scrapper = require("@yimura/scraper").default;
// const { user_input } = require("../index.js");
const {Spotify} = require("./spotify.js");



class Scrapped{

    constructor(){
        this.Youtube = new Scrapper();
        this.SpotifyAPI = new Spotify();
        this.Track_Info;
        
    }

        
YTlink =async (user_input)=>{

   
    this.Track_Info = await this.SpotifyAPI.getTrack(user_input);

    const response = this.Youtube.search(`${this.Track_Info.audio_name} by ${this.Track_Info.album_artist} and  ${this.Track_Info.contributing_artist}`);
   
    
    return response;

}


}

module.exports ={Scrapped};
