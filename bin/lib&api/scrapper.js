
import yt from '@yimura/scraper'

class Scrapped {

    constructor(Track_i) {
        this.Youtube = new yt.default();

        this.Track_Info = Track_i;


    }


    YTdata = async () => {


        const artist = (this.Track_Info.album_artist) ? `by ${this.Track_Info.album_artist}` : "";
        const support = (this.Track_Info.contributing_artist) ? `and ${this.Track_Info.contributing_artist}` : "";

        const response = this.Youtube.search(`${this.Track_Info.audio_name} ${artist} ${support}`);

        return response;

    }


}
export { Scrapped };
