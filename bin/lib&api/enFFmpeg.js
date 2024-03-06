const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { embedImage } = require("./metaimage.js")




const EncodingAndDownloadAudio = async (audio, audioBitRate, Track_Info) => {

  try {

    console.log("Encoding", Track_Info);

    // For the audio title
    const artist = Track_Info.album_artist;
    const other_artist = (Track_Info.contributing_artist != artist) ? (`_${Track_Info.contributing_artist}`) : "";
    const audio_title = (`${Track_Info.audio_name} - ${artist}${other_artist}`).replaceAll(/\/"||'`]/g, "").replaceAll(/,:/g, "_");

    console.log(audio_title);

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


      //Make the directory
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

      percent = Math.ceil((current_time / duration) * 100);

      process.stdout.write(`Progressing ${percent}%\r`);



    })


    encoding
      .on("end", () => {

        embedImage(imagePath, outputPath);
        fs.unlinkSync(imagePath);  //It clear the image that was stored before from the PC after image is embedded

        console.log("Uploaded")


      })
      .on("error", (error, stdout, stderr) => {
        console.log("Cannot process audio", error.message)
      })
      .save(outputPath);


  } catch (error) {

    console.log("Error in ffmpegjs", error)

  }


};

module.exports = { EncodingAndDownloadAudio };