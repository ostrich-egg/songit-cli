#!/usr/bin/env node

const express = require("express");
const axios = require("axios");
// const inquirer = require("inquirer");
const app = express();
const { Scrapped } = require("./lib&api/scrapper.js")
const { videoChunks } = require("./lib&api/ytdl.js");
require("dotenv").config();
const path = require("path");



let final_input;

const User_argument = () => {

    const user_input = process.argv.slice(2)

    if (user_input[0].startsWith("-")) {
        console.log("Features is yet to add.")
        final_input = user_input.slice(1).join(" ")
    } else {

        final_input = user_input.join(" ")
    }

    console.log(final_input)

}
User_argument();


// console.log(__dirname)

const get_YTlink = async () => {

    const YTscrapper = new Scrapped();

    const response = await YTscrapper.YTlink(final_input);

    // console.log("Scrapper",YTscrapper.Track_Info);

    // const duration_raw = response.videos[0].duration;
    const Track_Info = YTscrapper.Track_Info;
    Track_Info.duration = response.videos[0].duration;

    // NOTE 
    console.log(response.videos[0].link);
    videoChunks(response.videos[0].link, Track_Info)
}

get_YTlink();


