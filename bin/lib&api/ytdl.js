const ytdl = require("ytdl-core");
const fs = require('fs');

const {EncodingAndDownloadAudio} = require("./enFFmpeg.js");





const videoChunks = async (video_url,Track_Info)=>{

    try {

        
     
        const audioInfo = await ytdl.getInfo(video_url);
        let highestFormat = ytdl.chooseFormat(audioInfo.formats,{quality:'highestaudio'});
       

        const audio = ytdl(video_url, {format: highestFormat});
        

       const audioBitRate = highestFormat.audioBitrate || 192;
       console.log(audioBitRate);
        
        // NOTE thumbnail of video, Could be used in future.
        // console.log(audioInfo.videoDetails.thumbnails[3])

        //NOTE FFmpeg library where encoding happens and download also
        EncodingAndDownloadAudio(audio,audioBitRate,Track_Info);

        
    } catch (error) {

        console.log("here",error);
    }

}

// videoChunks();
module.exports = {videoChunks};
