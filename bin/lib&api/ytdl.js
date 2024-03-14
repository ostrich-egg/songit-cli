process.env.YTDL_NO_UPDATE;
import ytdl from "ytdl-core"
import { EncodingAndDownloadAudio } from "./enFFmpeg.js";

const videoChunks = async (video_url, Track_Info) => {

    try {

        const audioInfo = await ytdl.getInfo(video_url);
        let highestFormat = ytdl.chooseFormat(audioInfo.formats, { quality: 'highestaudio' });

        const audio = ytdl(video_url, { format: highestFormat });
        const audioBitRate = highestFormat.audioBitrate || 192;

        //NOTE FFmpeg library where encoding happens and download also
        EncodingAndDownloadAudio(audio, audioBitRate, Track_Info);




    } catch (error) {

        console.log("Something went wrong with Youtube Downloader", error);
    }

}

export { videoChunks };
