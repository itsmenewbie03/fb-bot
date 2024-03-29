const fs = require("fs");
const http = require('https'); // or 'https' for https:// URLs
const login = require("fca-unofficial");
const axios = require("axios");
const YoutubeMusicApi = require('youtube-music-api')
const ytdl = require('ytdl-core');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const ffmpegs = require('fluent-ffmpeg');
const { fail } = require("assert");
ffmpegs.setFfmpegPath(ffmpeg.path);
const musicApi = new YoutubeMusicApi()
const sharp = require("sharp");
// GLOBAL MESSAGE STORAGE
let msgs = {};
let vips = ['100007909449910', '100011343529559'];
let cd = {};

/*==================================== LEECH tiktok FUNC ====================================*/

async function leechTT(link) {
    out = await axios.get("https://www.tiktokdownloader.org/check.php?v=" + link).then((response) => { return response.data.download_url }).catch((error) => { return "err" })
    return out
}
/*==================================== LEECH tiktok FUNC ====================================*/

/*==================================== LEECH MP3 FUNC ====================================*/
async function conv(v, t, e) {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-Key': 'de0cfuirtgf67a'
    }
    results = await axios.post("https://backend.svcenter.xyz/api/convert-by-45fc4be8916916ba3b8d61dd6e0d6994", "v_id=" + v + "&ftype=mp3&fquality=128&token=" + t + "&timeExpire=" + e + "&client=yt5s.com", { headers: headers }).then((response) => { return response.data.d_url }).catch((error) => { return error.message });
    return results
}
async function fetch(query) {
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    results = await axios.post("https://yt5s.com/api/ajaxSearch", "q=" + query + "&vt=mp3", { headers: headers }).then((response) => { return response.data }).catch((error) => { return error.message });
    return results
}

async function leechmp3(query) {
    var songs = fetch(query);
    let resp = await songs.then((response) => {
        let slist = response;
        if (slist == "err") {
            return "err"
        }
        else if (slist.t < 1300) {
            let d_url = conv(slist.vid, slist.token, slist.timeExpires).then((response) => {
                return [response, slist.title]
            });
            return d_url
        }
        else if (slist.p == "search") {
            return 'err'
        }
        else if (slist.mess.startsWith("The video you want to download is posted on TikTok.")) {
            return 'tiktok'
        }
        else {
            return 'pakyo'
        }
    });
    return resp
}

/*==================================== LEECH MP3 FUNC ====================================*/

/*==================================== RANDOM QOUTES FUNC ====================================*/

async function qt() {
    let qoute = await axios.get("https://zenquotes.io/api/random").then((response) => { return response.data[0] }).catch((err) => { return "err " });
    return qoute
}
/*==================================== RANDOM QOUTES FUNC ====================================*/
/*==================================== DICTIONARY FUNC ====================================*/

async function getDef(q) {
    out = await axios.get("https://api.dictionaryapi.dev/api/v2/entries/en/" + q).then((response) => { return response.data }).catch((error) => { return error.response.data })
    return out
}
/*==================================== DICTIONARY FUNC ====================================*/
// TTS FUNCTION
async function sayThis(word) {
    out = await axios.get(`https://freetts.com/Home/PlayAudio?Language=ja-JP&Voice=Mizuki_Female&TextMessage=${word}&id=Mizuki&type=1`).then((response) => { return response.data }).catch((error) => { console.log(error) });
    return out
}
// END

// wiki func
async function wiki(q) {
    let result = axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${q}`).then((response) => { return response.data }).catch((err) => { return err })
    return result
}
// end

// FACTS FUNC

async function addTextOnImage(t) {
    try {
        let img = await sharp("fact.png").metadata();
        const width = img.width;
        const height = img.height;
        const text = t;

        const svgImage = `
      <svg width="${width}" height="${height}">
        <style>
        .title { fill: #000; font-size: 20px; font-family: Tahoma;}
        </style>
        <text x="30%" y="60%" text-anchor="middle" class="title" transform="translate(100,100) rotate(15)">${text}</text>
      </svg>
      `;
        const svgBuffer = Buffer.from(svgImage);
        const image = await sharp(svgBuffer).toFile(`${t}_txt.png`);
        await sharp("fact.png")
            .composite([
                {
                    input: `${t}_txt.png`,
                    top: -10,
                    left: 50,
                },
            ])
            .toFile(`${t}_output.png`);
        return true

    } catch (error) {
        console.log(error.message);
        return false
    }
}
// END
login({ appState: JSON.parse(fs.readFileSync('fbstate.json', 'utf8')) }, (err, api) => {
    if (err) return console.error(err);
    api.setOptions({ listenEvents: true });
    const listenEmitter = api.listen(async (err, event) => {
        if (err) return console.error(err);
        switch (event.type) {
            case "message_reply":
                if (vips.includes(event.senderID)) {
                    api.setMessageReaction("😘", event.messageID, (err) => {
                    }, true);
                }
                else {
                    api.setMessageReaction("😆", event.messageID, (err) => {
                    }, true);
                }
                let msgid = event.messageID
                let input = event.body;
                msgs[msgid] = input;
                break
            case "message":
                if (vips.includes(event.senderID)) {
                    api.setMessageReaction("😘", event.messageID, (err) => {
                    }, true);
                }
                else {
                    api.setMessageReaction("😆", event.messageID, (err) => {
                    }, true);
                }
                if (event.attachments.length != 0) {
                    if (event.attachments[0].type == "photo") {
                        msgs[event.messageID] = ['img', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "video") {
                        msgs[event.messageID] = ['vid', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "audio") {
                        msgs[event.messageID] = ['vm', event.attachments[0].url]
                    }
                } else {
                    msgs[event.messageID] = event.body
                }
                if (event.body != null) {
                    let input = event.body;
                    if (input.startsWith("!leech")) {
                        let data = input.split(" ");
                        if (data.length < 2) {
                            api.sendMessage("⚠️Invalid Use Of Command!\n💡Usage: !leech yt_url", event.threadID);
                        } else {
                            api.sendMessage("🔃Trying to Download...", event.threadID, event.messageID);
                            try {
                                let s = leechmp3(data[1]);
                                s.then((response) => {
                                    if (response == "pakyo") {
                                        api.setMessageReaction("🖕🏾", event.messageID, (err) => {
                                        }, true);
                                        api.sendMessage("TANGINA MO PAKYOOO😠\nULOL 20mins Max Duration Only!😝", event.threadID, event.messageID);
                                    }
                                    else if (response == "err") {
                                        api.sendMessage("❌Invalid Input", event.threadID, event.messageID);
                                        api.setMessageReaction("😭", event.messageID, (err) => {

                                        }, true);
                                    }
                                    else if (response == "tiktok") {
                                        api.sendMessage("❌Youtube Only, Bawal Tiktok!", event.threadID, event.messageID);
                                        api.setMessageReaction("😡", event.messageID, (err) => {

                                        }, true);
                                    }
                                    else if (response[0] != undefined) {
                                        var file = fs.createWriteStream("song.mp3");
                                        var targetUrl = response[0];
                                        var gifRequest = http.get(targetUrl, function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading..')
                                                api.sendMessage('✅Download Complete! Uploading...', event.threadID)
                                                var message = {
                                                    body: "😚Here's what ya ordered senpai!\n🎶Song Title: " + response[1] + "\n👨🏻‍💻Coded with 🖤 by: Salvador",
                                                    attachment: fs.createReadStream(__dirname + '/song.mp3')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }
                                });
                            } catch (err) {
                                api.sendMessage("⚠️Error: " + err.message, event.threadID);
                            }
                        }
                    }
                    else if (input.startsWith("!tiktokdl")) {
                        let data = input.split(" ");
                        if (data.length < 2) {
                            api.sendMessage("⚠️Invalid Use Of Command!\n💡Usage: !tiktok vid_url", event.threadID);
                        } else {
                            api.sendMessage("🔃Trying to Download...", event.threadID, event.messageID);
                            try {
                                let s = leechTT(data[1]);
                                s.then((response) => {
                                    if (response == "err") {
                                        api.sendMessage("❌Invalid Input", event.threadID, event.messageID);
                                        api.setMessageReaction("😭", event.messageID, (err) => {

                                        }, true);
                                    }
                                    else {
                                        var file = fs.createWriteStream("tiktok.mp4");
                                        var targetUrl = response;
                                        var gifRequest = http.get(targetUrl, function (gifResponse) {
                                            gifResponse.pipe(file);
                                            file.on('finish', function () {
                                                console.log('finished downloading..')
                                                api.sendMessage('✅Download Complete! Uploading...', event.threadID)
                                                var message = {
                                                    body: "😚Here's what ya ordered senpai!\n👨🏻‍💻Coded with 🖤 by: Salvador",
                                                    attachment: fs.createReadStream(__dirname + '/tiktok.mp4')
                                                }
                                                api.sendMessage(message, event.threadID);
                                            });
                                        });
                                    }
                                });
                            } catch (err) {
                                api.sendMessage("⚠️Error: " + err.message, event.threadID);
                            }
                        }
                    }
                    else if (input.startsWith("!play")) {
                        let data = input.split(" ");
                        if (data.length < 2) {
                            api.sendMessage("⚠️Invalid Use Of Command!\n💡Usage: !play music_title", event.threadID);
                        } else {
                            if (!(vips.includes(event.senderID))) {
                                if (!(event.senderID in cd)) {
                                    cd[event.senderID] = Math.floor(Date.now() / 1000) + (60 * 3);
                                }
                                else if (Math.floor(Date.now() / 1000) < cd[event.senderID]) {
                                    api.sendMessage("Opps you're going to fast! Wait for " + Math.floor((cd[event.senderID] - Math.floor(Date.now() / 1000)) / 60) + " mins and " + (cd[event.senderID] - Math.floor(Date.now() / 1000)) % 60 + " seconds", event.threadID, event.messageID);
                                    return
                                }
                                else {
                                    cd[event.senderID] = Math.floor(Date.now() / 1000) + (60 * 3);
                                }
                            }
                            api.sendMessage("🔃Requesting...", event.threadID, event.messageID);
                            try {
                                data.shift();
                                await musicApi.initalize();
                                const musics = await musicApi.search(data.join(" ").replace(/[^\w\s]/gi, ''));
                                if (musics.content.length == 0) {
                                    throw new Error(`${data.join(" ").replace(/[^\w\s]/gi, '')} returned no result!`)
                                } else {
                                    if (musics.content[0].videoId === undefined) {
                                        throw new Error(`${data.join(" ").replace(/[^\w\s]/gi, '')} is not found on youtube music`)
                                    }
                                }
                                const url = `https://www.youtube.com/watch?v=${musics.content[0].videoId}`;
                                console.log(`connecting to yt ${url}`);
                                const strm = ytdl(url, {
                                    quality: "lowest"
                                });
                                const info = await ytdl.getInfo(url);
                                console.log(`converting`);
                                ffmpegs(strm)
                                    .audioBitrate(48)
                                    .save(`${__dirname}/music/${data.join(" ").replace(/[^\w\s]/gi, '')}.mp3`)
                                    .on("end", () => {
                                        console.log(`Playing ${data.join(" ").replace(/[^\w\s]/gi, '')}`);
                                        api.sendMessage({
                                            body: "😚Here's what ya ordered senpai!\n🎶Song Title: " + info.videoDetails.title + "\n👨🏻‍💻Coded with 🖤 by: Salvador",
                                            attachment: fs.createReadStream(`${__dirname}/music/${data.join(" ").replace(/[^\w\s]/gi, '')}.mp3`)
                                                .on("end", async () => {
                                                    if (fs.existsSync(`${__dirname}/music/${data.join(" ").replace(/[^\w\s]/gi, '')}.mp3`)) {
                                                        fs.unlink(`${__dirname}/music/${data.join(" ").replace(/[^\w\s]/gi, '')}.mp3`, function (err) {
                                                            if (err) console.log(err);
                                                            console.log(`${__dirname}/music/${data.join(" ").replace(/[^\w\s]/gi, '')}.mp3 is deleted!`);
                                                        });
                                                    }
                                                })
                                        }, event.threadID, event.messageID);
                                    })
                                    .on('error', function (err, stdout, stderr) {
                                        console.log(`https://www.youtube.com/watch?v=${musics.content[0].videoId} | ${err.message}`)
                                        api.sendMessage(`⚠️${err.message}`, event.threadID, event.messageID);
                                    })

                            } catch (err) {
                                api.sendMessage(`⚠️${err.message}`, event.threadID, event.messageID);
                            }
                        }

                    }
                    else if (input.startsWith("!motivation")) {
                        let rqt = qt();
                        rqt.then((response) => {
                            api.sendMessage(response.q + "\n- " + response.a, event.threadID, event.messageID);
                        })
                    }
                    else if (input.startsWith("!define")) {
                        let data = input.split(" ");
                        if (data.length < 2) {
                            api.sendMessage("⚠️Invalid Use Of Command!\n💡Usage: !define word", event.threadID);
                        } else {
                            try {
                                data.shift()
                                var txtdef = "";
                                let res = await getDef(data.join(" "));
                                if (res[0] === undefined) {
                                    throw new Error(`${res.title}`)
                                }
                                txtdef += `ℹ ${res[0].word} \\${res[0].phonetic}\\\n💡${res[0].origin}\n`
                                let defs = res[0].meanings;
                                for (var i = 0; i < defs.length; i++) {
                                    let mdef = defs[i];
                                    txtdef += `🔰${mdef['partOfSpeech']}\n`;
                                    let mdefs = mdef['definitions'];
                                    for (var j = 0; j < mdefs.length; j++) {
                                        txtdef += `\t·${mdefs[j]['definition']}\n`;
                                    }
                                }
                                api.sendMessage(`${txtdef}`, event.threadID, event.messageID);
                            }
                            catch (err) {
                                api.sendMessage(`⚠️${err.message}`, event.threadID, event.messageID);
                            }
                        }
                    }
                    else if (input.startsWith("!say")) {
                        let data = input.split(" ");
                        if (data.length < 2) {
                            api.sendMessage("⚠️Invalid Use Of Command!\n💡Usage: !say words", event.threadID);
                        } else {
                            data.shift();
                            let wordToSay = data.join(" ");
                            let tts = await sayThis(wordToSay.replace(/[^\w\s]/gi, ""));
                            try {
                                if (tts !== undefined) {
                                    let link = `https://freetts.com/audio/${tts.id}`
                                    var file = fs.createWriteStream(`${__dirname}/${wordToSay.replace(/[^\w\s]/gi, '')}.mp3`);
                                    var gifRequest = http.get(link, function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log(`Saying ${wordToSay.replace(/[^\w\s]/gi, '')}`);
                                            api.sendMessage({
                                                body: "",
                                                attachment: fs.createReadStream(`${__dirname}/${wordToSay.replace(/[^\w\s]/gi, '')}.mp3`)
                                                    .on("end", async () => {
                                                        if (fs.existsSync(`${__dirname}/${wordToSay.replace(/[^\w\s]/gi, '')}.mp3`)) {
                                                            fs.unlink(`${__dirname}/${wordToSay.replace(/[^\w\s]/gi, '')}.mp3`, function (err) {
                                                                if (err) console.log(err);
                                                                console.log(`${__dirname}/${wordToSay.replace(/[^\w\s]/gi, '')}.mp3 is deleted!`);
                                                            });
                                                        }
                                                    })
                                            }, event.threadID, event.messageID);
                                        });
                                    });

                                }
                                else {
                                    throw new Error("Failed To Generate Audio!")
                                }
                            } catch (err) {
                                api.sendMessage(`⚠️${err.message}`, event.threadID, event.messageID);
                            }
                        }
                    }
                    else if (input.startsWith("!fact")) {
                        let data = input.split(" ");
                        if (data.length < 2) {
                            api.sendMessage("⚠️Invalid Use Of Command!\n💡Usage: !fact say_something", event.threadID);
                        } else {
                            try {
                                data.shift()
                                let txt = data.join(" ").replace("\\","");
                                let img = await addTextOnImage(txt);
                                if(!img){
                                    throw new Error("Failed to Generate Image!")
                                } else{
                                    api.sendMessage({
                                        body: "",
                                        attachment: fs.createReadStream(`${__dirname}/${txt}_output.png`)
                                            .on("end", async () => {
                                                if (fs.existsSync(`${__dirname}/${txt}_output.png`)) {
                                                    fs.unlink(`${__dirname}/${txt}_output.png`, function (err) {
                                                        if (err) console.log(err);
                                                        console.log(`${__dirname}/${txt}_output.png is deleted!`);
                                                    });
                                                }
                                                if (fs.existsSync(`${__dirname}/${txt}_txt.png`)) {
                                                    fs.unlink(`${__dirname}/${txt}_txt.png`, function (err) {
                                                        if (err) console.log(err);
                                                        console.log(`${__dirname}/${txt}_txt.png is deleted!`);
                                                    });
                                                }
                                            })
                                    }, event.threadID, event.messageID);
                                }
                            }
                            catch (err) {
                                api.sendMessage(`⚠️${err.message}`, event.threadID, event.messageID);
                            }
                        }
                    }
                    else if (input.startsWith("!wiki")) {
                        let data = input.split(" ");
                        if (data.length < 2) {
                            api.sendMessage("⚠️Invalid Use Of Command!\n💡Usage: !wiki query", event.threadID);
                        } else {
                            try {
                                data.shift()
                                let query = data.join(" ")
                                let wikiresp = await wiki(query);
                                if(wikiresp.title === undefined){
                                    throw new Error(`No Results Found!`)
                                }
                                else{
                                    api.sendMessage(`ℹ${wikiresp.title}\n\t🔰${wikiresp.extract}`,event.threadID,event.messageID);
                                }
                            }
                            catch (err) {
                                api.sendMessage(`⚠️${err.message}`, event.threadID, event.messageID);
                            }
                        }
                    }
                }
                break;
            case "message_unsend":
                if (!vips.includes(event.senderID)) {
                    let d = msgs[event.messageID];
                    if (typeof (d) == "object") {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if (err) return console.error(err);
                            else {
                                if (d[0] == "img") {
                                    var file = fs.createWriteStream("photo.jpg");
                                    var gifRequest = http.get(d[1], function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('finished downloading photo..')
                                            var message = {
                                                body: data[event.senderID]['name'] + " unsent this photo🤣: \n",
                                                attachment: fs.createReadStream(__dirname + '/photo.jpg')
                                            }
                                            api.sendMessage(message, event.threadID);
                                        });
                                    });
                                }
                                else if (d[0] == "vid") {
                                    var file = fs.createWriteStream("video.mp4");
                                    var gifRequest = http.get(d[1], function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('finished downloading photo..')
                                            var message = {
                                                body: data[event.senderID]['name'] + " unsent this video🤣: \n",
                                                attachment: fs.createReadStream(__dirname + '/video.mp4')
                                            }
                                            api.sendMessage(message, event.threadID);
                                        });
                                    });
                                }
                                else if (d[0] == "vm") {
                                    var file = fs.createWriteStream("vm.mp3");
                                    var gifRequest = http.get(d[1], function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('finished downloading photo..')
                                            var message = {
                                                body: data[event.senderID]['name'] + " unsent this audio🤣: \n",
                                                attachment: fs.createReadStream(__dirname + '/vm.mp3')
                                            }
                                            api.sendMessage(message, event.threadID);
                                        });
                                    });
                                }
                            }
                        });
                    }
                    else {
                        api.getUserInfo(event.senderID, (err, data) => {
                            if (err) return console.error(err);
                            else {
                                api.sendMessage(data[event.senderID]['name'] + " unsent this🤣: \n" + msgs[event.messageID], event.threadID);
                            }
                        });
                    }
                    break;
                }
        }
    });
});