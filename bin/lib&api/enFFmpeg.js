
// Import the path property from '@ffmpeg-installer/ffmpeg' module
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

// Import 'fluent-ffmpeg' module dynamically
const { default: ffmpeg } = await import('fluent-ffmpeg');

// Set the FFMpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

import axios from "axios"
import os from "os"
import fs from "fs"
import path from "path"

import { embedImage } from './metaimage.js';




const EncodingAndDownloadAudio = async (audio, audioBitRate, Track_Info) => {

  try {

    console.log("Track info", Track_Info);

    // For the audio title
    const artist = (Track_Info.album_artist) ? ` - ${Track_Info.album_artist}` : "";
    const other_artist = ((Track_Info.contributing_artist) !== artist.replace(" - ", "")) ? (`_${Track_Info.contributing_artist}`) : "";
    const audio_title = (`${Track_Info.audio_name || ""}${artist}${other_artist}`).replaceAll(/[’'`|?"||]/g, "").replaceAll(/[,:/]/g, "_");

    // Checking if the songit folder exist or not 
    const dir = `C:\\Users\\User\\Downloads\\songit`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const outputPath = `${dir}\\${audio_title}.mp3`;


    let imagePath;
    const DownloadImage = async () => {


      //Image Buffer
      const imageData = await axios({
        method: 'get',
        url: `${Track_Info.image.url}`,
        responseType: 'stream',
      })


      // Path to directoy
      const dirPath = path.join(os.tmpdir() + "\\songit\\images")
      imagePath = `${dirPath}\\${audio_title}.jpg`;


      //Make the directoryc
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      //Writing image on path and piping the data
      const imagefile = fs.createWriteStream(imagePath);
      imageData.data.pipe(imagefile);

      imagefile.on("finish", () => {

        imagefile.close();
      })

    }
    DownloadImage();




    //////////////////////ffmpeg encoding
    const encoding = new ffmpeg(audio)

      .withAudioCodec('libmp3lame')
      .toFormat('mp3')
      .audioBitrate(audioBitRate || 192)
      .outputOptions("-id3v2_version", "4")
      .outputOptions(

        '-metadata', `date=${Track_Info.year}`,
        '-metadata', `artist=${Track_Info.album_artist}`,
        '-metadata', `track=${Track_Info.track}`,
        '-metadata', `album=${Track_Info.album}`,


      )





    encoding.on("progress", (progress) => {

      const duration = Track_Info.duration / 1000; //duration from ms to s

      const time_array = progress.timemark.split(":");

      const current_time =
        Number(time_array[0]) * 60 * 60 +
        Number(time_array[1]) * 60 +
        Math.floor(Number(time_array[2]));

      let percent = Math.ceil((current_time / duration) * 100);

      process.stdout.write(`Progressing ${percent}%\r`);



    })


    encoding
      .on("end", () => {

        embedImage(imagePath, outputPath);
        fs.unlinkSync(imagePath);  //It clear the image that was stored before from the PC after image is embedded

        console.log("Music is ready to serve")


      })
      .on("error", (error, stdout, stderr) => {
        console.log("Cannot process audio", error.message)
      })
      .save(outputPath);


  } catch (error) {

    console.log("Error in ffmpegjs", error)

  }


};

export { EncodingAndDownloadAudio };