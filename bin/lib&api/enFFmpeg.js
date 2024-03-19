
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
import chalk from "chalk"

import { Spotify } from './spotify.js';



const { default: config } = await import("config");

import { embedImage } from './metaimage.js';









const EncodingAndDownloadAudio = async (audio, audioBitRate, Track_Info, passing_flag = "") => {


  try {

    // For the audio title
    const artist = (Track_Info.album_artist) ? ` - ${Track_Info.album_artist}` : "";
    const other_artist = ((Track_Info.contributing_artist) !== artist.replace(" - ", "")) ? (`_${Track_Info.contributing_artist}`) : "";
    const audio_title = (`${Track_Info.audio_name || ""}${artist}${other_artist}`).replaceAll(/[’'`|?"||]/g, "").replaceAll(/[,:/]/g, "_");



    // Checking if the songit folder exist or not 
    const dir = `${config.Download_location}\\songit`;

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
      const dirPath = path.join(os.homedir(), ".config", "songit", "images")
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



    //Logging the name of the track
    console.log(chalk.bgWhite.cyan(`Track = ${audio_title}, Album = ${Track_Info.album}(${Track_Info.year}) `))
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

      process.stdout.write(chalk.bgBlack.white(`Progressing ${percent}%\r`));





    })


    encoding
      .on("end", () => {

        embedImage(imagePath, outputPath);
        fs.unlinkSync(imagePath);  //It clear the image that was stored before from the PC after image is embedded

        console.log(chalk.green("  Music is ready to serve  "))

        if (passing_flag === "album") {

          let iteration = Track_Info.iteration + 1;
          const spotifyAPI = new Spotify();
          spotifyAPI.getAlbum(Track_Info.album_link, iteration, "call", Track_Info.Tracklength)

        }


      })
      .on("error", (error, stdout, stderr) => {
        console.log(chalk.red("Cannot process audio"), error.message)
      })


    encoding.save(outputPath);


  } catch (error) {

    console.log("Error in ffmpegjs", error)

  }


};

export { EncodingAndDownloadAudio };