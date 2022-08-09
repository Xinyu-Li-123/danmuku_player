globalThis.verbose = false;          // debug option
globalThis.is_danmuku_on = true;  // hide all danmuku
globalThis.is_danmuku_player_init = false;
globalThis.is_danmuku_paused = false;
globalThis.is_video_waiting = true;
globalThis.is_fullscreen = false;


globalThis.seek_bar = document.getElementById("seek-bar")
globalThis.cur_time_label = document.getElementById("cur-time");
globalThis.full_time_label = document.getElementById("full-time");
globalThis.dplayer = document.getElementById("danmuku-player");
globalThis.player_wrapper = document.getElementById("player-wrapper");
globalThis.videoControls = document.getElementById("video-controls");
globalThis.hideControlsHandle = null;

globalThis.whileloop_count = 0;

// globalThis.pauseTimes = 20;      // pause all danmuku for 10 times in case some are missed
// globalThis.pauseDuration = 50;      // pause all danmuku for 10 times in case some are missed
globalThis.offset = 0;
// globalThis.video_size = 100;
globalThis.danmuku_container = document.getElementById("danmuku-container");
globalThis.danmuku_screen = {};
// get video
globalThis.cur_video = document.getElementById("b-video");

// danmuku_container.style.width = cur_video.clientWidth + "px";
// danmuku_container.style.height = cur_video.clientHeight + "px";

globalThis.interval = 0;
globalThis.top_count = 0;       // number of danmuku at the top
globalThis.default_danmuku_duration = 10;
globalThis.relative_speed = 1;
globalThis.relative_video_size = 1;
globalThis.opacity = 0.7;
globalThis.key_pressed = {
    " ": false,
    "ArrowLeft": false,
    "ArrowRight": false,

    // "ArrowUp": false,
    // "ArrowDown": false,
    // "Control": false,
    // "Shift": false,
};

document.getElementById("is-verbose").onchange = function(){
    verbose = document.getElementById("is-verbose").checked
};

function format_time(time){
    var hour = Math.floor(time / 3600);
    var minute = Math.floor((time % 3600) / 60);
    var second = Math.floor(time % 60);
    if(hour == 0){
        return (minute < 10 ? "0" + minute : minute) + ":" + (second < 10 ? "0" + second : second);
    }
    return (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute) + ":" + (second < 10 ? "0" + second : second);
}

// fired when the video is loaded or the buffering ends
cur_video.oncanplay = function(e){
    // document.getElementById("danmuku-container").style.width = cur_video.clientWidth + "px";
    // document.getElementById("danmuku-container").style.height = cur_video.clientHeight + "px";
    
    console.log("The video is ready to play")
    seek_bar.max = cur_video.duration;
    document.getElementById("seek-stage").innerText = "loaded";
    full_time_label.innerText = format_time(cur_video.duration);


    player_wrapper.style.width = cur_video.clientWidth + "px";
    player_wrapper.style.height = cur_video.clientHeight + "px";
    // alert(cur_video.clientWidth + "px" + ", " + cur_video.clientHeight + "px");

    if(!cur_video.paused){
        if (is_video_waiting) {
            console.log("The video finished buffering");
            reload_danmuku();
        }
        else if(is_danmuku_paused){
            for (id in danmuku_screen) {
                danmuku_screen[id].style.animationPlayState = "running";
            }
            console.log("oncanplay is fired not by buffering finished")
        }
    }
    is_video_waiting = false;
}

cur_video.ontimeupdate = function(e){
    cur_time_label.innerText = format_time(cur_video.currentTime);
    seek_bar.value = cur_video.currentTime;
    document.getElementById("video-status").innerText = cur_video.currentTime;
}

// vhide ideo controls if mouse stay still for 6 seconds
function hidePlayer(){
    videoControls.style.animation = "out 0.2s linear forwards";
}
document.onmousemove = async function(e){
    await sleep(100)
    videoControls.style.animation = "in linear forwards";
    if(hideControlsHandle == null){
        clearTimeout(hideControlsHandle);
    }
    hideControlsHandle = setTimeout(hidePlayer, 5000);
}

document.getElementById("play-pause").onclick = function(e){
    if(cur_video != null){
        if(cur_video.paused){
            cur_video.play();
            document.getElementById("play-pause").innerText = "Pause";
        }
        else{
            cur_video.pause();
            document.getElementById("play-pause").innerText = "Play";
        }
    }
}

player_wrapper.onclick = function(e){
    if(e.clientY / cur_video.clientHeight < 0.9){
        document.getElementById("play-pause").onclick();
    }
}


seek_bar.onchange = async function(){
    cur_video.currentTime = this.value;
    danmuku_container.innerHTML = "";
    danmuku_screen = {};
}


document.getElementById("mute").onclick = function(e){
    if(cur_video != null){
        if(cur_video.muted){
            cur_video.muted = false;
            document.getElementById("mute").innerText = "Mute";
        }
        else{
            cur_video.muted = true;
            document.getElementById("mute").innerText = "Unmute";
        }
    }
}

document.getElementById("volume-bar").onchange = function(){
    if(cur_video != null){
        cur_video.volume = this.value;
    }
}

document.getElementById("full-screen").onclick = function(e){
    if(cur_video != null){
        if(is_fullscreen) {
            // browser is fullscreen
            if(document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if(document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            is_fullscreen = false;
        }
        else{
            // browser is not fullscreen
            if(dplayer.requestFullscreen){
                dplayer.requestFullscreen();
            }
            else if(dplayer.webkitRequestFullscreen){
                dplayer.webkitRequestFullscreen();
            }
            else if(dplayer.mozRequestFullScreen){
                dplayer.mozRequestFullScreen();
            }
            else if(dplayer.msRequestFullscreen){
                dplayer.msRequestFullscreen();
            }
            is_fullscreen = true;
        }
        
    }
}



// video player setting
// danmuku_container.onclick = function(e){
//     if (verbose){
//         console.log("video is clicked", e.clientX, e.clientY);
//     }
//     if (cur_video.paused){
//         cur_video.play();
//     }
//     else{
//         cur_video.pause();
//     }
// };

// document.onkeyup = function(e){
//     if (verbose){
//         console.log("key up: "+e.key+".");
//     }
//     key_pressed[e.key] = false;
// }

document.onkeydown = function(e){
    if (verbose){
        console.log("key down: "+e.key+".");
    }
    // bind "pressing SPACE" to "pausing video"
    // if (e.key == " "){
    //     e.preventDefault();
    //     if (cur_video.paused){
    //         cur_video.play();
    //     }
    //     else{
    //         cur_video.pause();
    //     }
    // }
    if (e.key == "ArrowLeft"){
        e.preventDefault();
        // cur_video.currentTime -= 5;
        seek_bar.value = parseInt(seek_bar.value) - 5;
        seek_bar.onchange();
        if (is_danmuku_player_init){
            // reload_danmuku();
            danmuku_screen = {};
            danmuku_container.innerHTML = "";
        }
        if (verbose){
            console.log("backward 5s");
        }
    }
    else if (e.key == "ArrowRight"){   
        e.preventDefault();
        // cur_video.currentTime += 5;
        seek_bar.value = parseInt(seek_bar.value) + 5;
        seek_bar.onchange();
        if (is_danmuku_player_init){
            // reload_danmuku();
            danmuku_screen = {};
            danmuku_container.innerHTML = "";
        }       
        if (verbose){
            console.log("forward 5s");
        }
    }

    else if (e.key == " ") {
        e.preventDefault();
        if (cur_video.paused){
            cur_video.play();
            document.getElementById("play-pause").innerText = "Pause";
        }
        else{
            cur_video.pause();
            document.getElementById("play-pause").innerText = "Play";
        }
    }
    
    else if (e.key == "f") {
        document.getElementById("full-screen").onclick()
    }
}


document.getElementById("video-size").innerText = 100;
document.getElementById("video-size-slider").onchange = function(){
    // adjust danmuku speed according to size of video
    // let cur_duration = parseFloat(document.documentElement.style.getPropertyValue("--danmuku-duration"))
            
    // document.documentElement.style.setProperty("--danmuku-duration", default_danmuku_duration*this.value/100+"s");

    // document.getElementById("video-size").innerText = this.value;
    // danmuku_container.style.width = this.value + '%';
    // danmuku_container.style.height = this.value + '%';
    // dplayer.style.width = this.value + '%';
    // dplayer.style.height = this.value + '%';
    
    
    // if (verbose){
    //     console.log("size changed to: " + this.value);
    //     console.log(danmuku_container.style.width, 
    //                 danmuku_container.style.height, 
    //                 dplayer.style.width,
    //                 dplayer.style.height)
    // }
}


// danmuku player setting
document.getElementById("danmuku-speed").innerText = 100;

// document.documentElement.style.setProperty("--danmuku-duration", 8+"s");

document.getElementById("danmuku-speed-slider").onchange = function(){
    // adjust damuku speed according to user input
    relative_speed = this.value/100;
    document.documentElement.style.setProperty("--danmuku-duration", default_danmuku_duration/relative_speed+"s");

    document.getElementById("danmuku-speed").innerText = this.value;
    console.log("relative speed: "+relative_speed, document.documentElement.style.getPropertyValue('--danmuku-duration'));
}

    document.getElementById("danmuku-opacity").innerText = 0.7;
    document.getElementById("danmuku-opacity-slider").onchange = function(){
    document.getElementById("danmuku-opacity").innerText = this.value;
    opacity = this.value;
}


document.getElementById("offset").innerText = offset;

// e.g. let offset = 100
//      then at video timestamp 23 play danmuku of timestamp 123

document.getElementById("offset-slider").onchange = function(){
    offset = parseFloat(this.value);
    document.getElementById("offset").innerText = offset;
    danmuku_container.innerHTML = "";
    
    if (verbose){
        console.log("set offset to: " + offset);
    }

    if (verbose){
        console.log("clear danmuku-container, danmuku reloaded at video timestamp: " + cur_video.currentTime + " with offset: " + offset);
    }
    reload_danmuku();
};


document.getElementById("danmuku-switch").onchange = function(){
    is_danmuku_on = this.checked;
    if (verbose){
        console.log("Show Danmuku? " + is_danmuku_on);
    }
    if (is_danmuku_on){
        reload_danmuku();        // clear current danmuku
    }
    else if (!is_danmuku_on){
        danmuku_container.innerHTML = '';        // clear current danmuku
    }
}


// upload danmuku.xml file
let danmukuInput = document.getElementById('danmukuInput');
const danmukuReader = new FileReader();
danmukuInput.addEventListener('change', function(e){

    danmuku_container.innerHTML = '';        // clear current danmuku
    if (verbose){
        console.log("danmuku clear");
    }

    const file = e.target.files[0];

    danmukuReader.readAsText(file);
    danmukuReader.onloadend = () => {
        let xml_txt  = danmukuReader.result;
        if (verbose){
            console.log(xml_txt);
        }
        send_danmuku(xml_txt);
    };
});

let danmukuInputFromClipboard = document.getElementById("danmukuInputFromClipboard");
danmukuInputFromClipboard.onclick =  () => {
    navigator.clipboard.readText()
      .then(text => {
        alert(text)
        danmuku_container.innerHTML = '';        // clear current danmuku
        if (verbose){
            console.log("danmuku clear");
            console.log(text);
        }
        send_danmuku(text);
      })
      .catch(err => {
        alert("error: " + err)
      });
}


// // upload danmuku url
// let danmukuUrlInput = document.getElementById('danmukuUrlInput');
// let danmukuUrlInputButton = document.getElementById('danmukuUrlInputSubmit');
// danmukuUrlInputButton.onclick = function(e){
//     let danmukuSrc = danmukuUrlInput.value;
//     danmukuUrlInput = "";



// }



// load video based on video input
let videoInput = document.getElementById('videoInput')
const videoReader = new FileReader();

videoInput.addEventListener('change', function(e1){
    // The file reader gives us an ArrayBuffer:
    danmuku_container.innerHTML = '';        // clear current danmuku
    const file = e1.target.files[0];
    videoReader.readAsArrayBuffer(file);

    videoReader.onload = function(e) {
        // The file reader gives us an ArrayBuffer:

        let buffer = e.target.result;

        // We have to convert the buffer to a blob:
        let videoBlob = new Blob([new Uint8Array(buffer)], { type: 'video/mp4' });
      
        // The blob gives us a URL to the video file:
        let url = window.URL.createObjectURL(videoBlob);
        document.getElementById('b-video').src = url;
      }

});

// load video based on url input
let videoUrlInput = document.getElementById('videoUrlInput');
let videoUrlInputButton = document.getElementById('videoUrlInputButton');
console.log(videoUrlInputButton)
videoUrlInputButton.onclick = function(e){
    danmuku_container.innerHTML = '';        // clear current danmuku
    let videoSrc = videoUrlInput.value;
    videoUrlInput.value = "";
    document.getElementById("seek-stage").innerText = "loading";
    
    videoFormat = videoSrc.split(".").pop()
    if(videoFormat == "mp4"){
        cur_video.src = videoUrlInput.value;
    }

    // use Hls.js to stream an m3u8 video file
    else if(videoFormat == "m3u8"){
        if (Hls.isSupported()) {
            console.log("Hls is supported. " + videoSrc)
            let hls = new Hls({
              debug: true,
            });
            hls.loadSource(videoSrc)
            hls.attachMedia(cur_video);
            // hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            //   cur_video.play();
            // });
          }
    }  
    else {
        alert("Unsupported video format" + videoFormat + ". Please upload a mp4 or m3u8 video file.")
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function reload_danmuku(){
    // reload danmuku based on current timestamp of the video

    // binary search for the starting danmuku (the nth danmuku should be the starting one)
    danmuku_screen = {};
    danmuku_container.innerHTML = "";

    let el = cur_video.currentTime + offset;

    let m = 0;
    let n = danmuku_schedule.length - 1;
    while (m <= n) {
        let k = (n + m) >> 1;
        let cmp = el - danmuku_schedule[k];
        if (cmp > 0) {
            m = k + 1;
        } else if(cmp < 0) {
            n = k - 1;
        } else {
            break;
        }
    }
    n += 1;
    
    if (verbose){
        if(n == danmuku_list.length){
            console.log("no danmuku at video timestamp: " + cur_video.currentTime + " with offset: " + offset);
        }
        else{
            console.log(n, danmuku_list[n]);
            console.log("current timestamp: " + cur_video.currentTime
                        + ", jump to " + n + "th danmuku with tiimestamp: " + danmuku_list[n].timestamp
                        + ", offset = " + offset);
        }
    }
    send_danmuku_from(n); 
}

// reformat a danmuku into an eaiser-to-use object
function reformat_danmuku(d){

    let p = d.getAttribute('p').split(",");

    function numberToColour(number) {
        const r = (number & 0xff0000) >> 16;
        const g = (number & 0x00ff00) >> 8;
        const b = (number & 0x0000ff);
       
        //return [b, g, r];
        return `rgb(${b},${g},${r})`;
    }

    return {
        id: parseInt(p[7]),
        timestamp: parseFloat(p[0]),
        mode: parseInt(p[1]),
        color: numberToColour(p[3]),
        textContent: d.textContent,
    };
}

async function send_danmuku(xml_txt) {
    // parse xml file and send danmuku
    is_danmuku_player_init = true;

    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xml_txt, 'text/xml')

    globalThis.raw_danmuku_list = xmlDoc.getElementsByTagName('d');
    // alert(raw_danmuku_list[0].innerHTML)
  
    globalThis.danmuku_list = [];
    globalThis.danmuku_schedule = [];

    console.log(`${raw_danmuku_list.length} danmukus are coming...`);
    // parse property
    for (let i=0; i<raw_danmuku_list.length; i++){
        danmuku_list.push(reformat_danmuku(raw_danmuku_list[i]))
        // danmuku_schedule.push(danmuku_list[i].getAttribute('timestamp'));
    };
    
    // sort danmuku list
    danmuku_list.sort(function(d1, d2){
        return parseFloat(d1.timestamp) - parseFloat(d2.timestamp);
    });

    // set up schedule (an array of timestamps)
    for (let i=0; i<danmuku_list.length; i++){
        danmuku_schedule.push(danmuku_list[i].timestamp);
    };

    if (verbose){
        console.log(danmuku_schedule);
        console.log(danmuku_list[0], danmuku_list[1], danmuku_list[2]);
    }

    // pause all danmuku
    cur_video.addEventListener("pause", async function(){
        await sleep(200);
        if (verbose){
            console.log("The video is paused.");
        }
    });

    // play all danmuku
    cur_video.addEventListener('play', function(){
        if(is_danmuku_paused){
            for (id in danmuku_screen) {
                danmuku_screen[id].style.animationPlayState = "running";
            }
            is_danmuku_paused = false;
        }
        if (verbose){
            console.log("Continue to play the video.");
        }
    });

    // pause when the video is buffering
    cur_video.onwaiting = function(){
        is_video_waiting = true;
        console.log("video is loading");
        if(Object.keys(danmuku_screen).length > 0 && !is_danmuku_paused) {
            for(id in danmuku_screen){
                danmuku_screen[id].style.animationPlayState = "paused";
            }
            is_danmuku_paused = true;
            console.log("danmukus on screen are paused due to waiting")
        }
        document.getElementById("seek-stage").innerText = "loading";
    }

    cur_video.onplaying = function(){
        if(is_danmuku_paused){
            for (id in danmuku_screen) {
                danmuku_screen[id].style.animationPlayState = "running";
            }
            is_danmuku_paused = false;
        }
        document.getElementById("seek-stage").innerText = "loaded";
    }


    // // play when the video is loaded
    // cur_video.addEventListener('buffered', function(){
    //     setTimeout(function(){cur_video.play()}, 100);
    //     console.log("video is loaded");
    // })

    // cur_video.onseeking = function(e){
    //     danmuku_container.innerHTML = "";
    //     console.log("seeking starts, clear danmuku-container");   
    // };

    // cur_video.onseeked = function(){
    //     reload_danmuku();
    // };

    await sleep(danmuku_schedule[0]*1000);

    // start danmuku (equivalent to reload danmuku from 0:00, thus no need for an extra function)
    reload_danmuku();
    };

function addAnimation(body) {
    let dynamicStyles = document.createElement('style');
    dynamicStyles.type = 'text/css';
    document.head.appendChild(dynamicStyles);
    dynamicStyles.sheet.insertRule(body, dynamicStyles.length);
    }
      
async function send_danmuku_from(start){
    // send danmukus from the nth danmku (start = n)
    let cur_index = start;
    danmuku_screen = {};
    whileloop_count += 1;
    let this_count = whileloop_count;
    while (this_count == whileloop_count && cur_index < danmuku_list.length){
    // while (cur_index < danmuku_list.length){

        console.log("is_video_waiting: " + is_video_waiting);

        if (!is_danmuku_on){
            if (Object.keys(danmuku_screen).length > 0){
                danmuku_container.innerHTML = '';        // clear current danmuku
                danmuku_screen = {};
            }
            await sleep(200);
            continue;
        }

        if (cur_video.paused || is_video_waiting){
            // if there exists at least one danmuku and is_danmuku_paused is false, pause all danmuku
            if(Object.keys(danmuku_screen).length > 0 && !is_danmuku_paused) {
                for(id in danmuku_screen){
                    danmuku_screen[id].style.animationPlayState = "paused";
                }
                is_danmuku_paused = true;
                console.log("danmukus on screen are paused")
            }
            await sleep(200);
            continue;
        };

        cur_danmuku_time = danmuku_schedule[cur_index];
        // mode = danmuku_list[cur_index].getAttribute('mode');

        let d = document.createElement("div");

        d.innerText = danmuku_list[cur_index].textContent;
        d.id = danmuku_list[cur_index].id;
        if (verbose){ 
            d.innerText += "  " + Math.floor(danmuku_schedule[cur_index]/60)%60 + ": " + Math.floor(danmuku_schedule[cur_index])%60;
        };

        d.style.fontSize = Math.ceil(30*Math.pow((document.getElementById("video-size-slider").value/100), 0.3)) + "px"
        d.style.opacity = opacity;
        d.style.color = danmuku_list[cur_index].color;

        // rolling danmuku
        if (danmuku_list[cur_index].mode==1){
            d.className = "danmuku rolling";
            d.style.top = Math.floor(Math.random()*10)*35*document.getElementById("video-size-slider").value/100 + "px";       // randomly placed at one row
        }

        
        else if (danmuku_list[cur_index].mode==5){
            d.className = "danmuku top"; 
            d.style.top = (top_count%10) * 35 * document.getElementById("video-size-slider").value/100 + "px";       // randomly placed at one row
            // use clientWidth to calculate danmuku position dynamically (as the user resize the video / window)
            d.style.left = Math.floor(danmuku_container.clientWidth/2
                            - parseInt(d.style.fontSize)*(d.textContent.length/2-1)) + "px";
            top_count += 1;
        }

        d.addEventListener("animationend", function(){
            if (verbose){
                console.log("danmuku deleted, content: " + d.innerText);
            }
            if (d.className == "danmuku top"){
                top_count -= 1;
            }
            d.remove();
            delete danmuku_screen[d.id];
        });

        cur_time_w_offset = cur_video.currentTime + offset;
        if (cur_time_w_offset < 0){
            cur_time_w_offset = 0;
        }

        // TODO: 
        // Problem: cur_danmuku_time and cur_video.currentTime don't match up after video seeking (excluding forward / backward)
        // Reason: currentTime is not changed when reloading the danmuku
        // 
        await sleep((cur_danmuku_time - cur_time_w_offset)*1000);
        if (verbose){
            let d = new Date(); // for now
            d.getHours(); // => 9
            d.getMinutes(); // =>  30
            d.getSeconds(); // => 51
            console.log(cur_index + "th:　cur: " + cur_danmuku_time + " with offset: " + offset
                          + "  ||  video: " + cur_video.currentTime
                          + " || gap: " + (cur_danmuku_time - (cur_video.currentTime + offset))
                          + "sent at" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds()
                          );
        }     
        document.getElementById("danmuku-status").innerText= cur_danmuku_time;
        danmuku_container.appendChild(d);
        danmuku_screen[d.id] = d;

        cur_index += 1;
    };

}

// async function refreshDanmuku(){
//     container.innerHTML = "";
//     let el = cur_video.currentTime;
//     let m = 0;
//     let n = danmuku_schedule.length - 1;
//     while (m <= n) {
//         let k = (n + m) >> 1;
//         let cmp = el - danmuku_schedule[k];
//         if (cmp > 0) {
//             m = k + 1;
//         } else if(cmp < 0) {
//             n = k - 1;
//         } else {
//             break;
//         }
//     };
//     if (verbose){
//         console.log("Danmuku is refreshed to timestamp: " + "  " + Math.floor(danmuku_schedule[cur_index]/60)%60 + ": " + Math.floor(danmuku_schedule[cur_index])%60);
//     }
//     send_danmuku_from(n);
// }

// document.getElementById("refresh-button").onclick = refreshDanmuku();