
import NodeID3 from 'node-id3';

const embedImage = (imagePath, outputPath) => {

    ////Adding image on the mp3
    const tags = {

        APIC: `${imagePath}`,

    }

    NodeID3.update(tags, outputPath, function (err, buffer) {
        if (err) {
            console.log(err)
        }

        if (buffer) {
            console.log("buffer", buffer);
        }
    })
}



export { embedImage }