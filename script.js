globalThis.verbose = false;          // debug option
globalThis.is_danmuku_on = true;  // hide all danmuku

// globalThis.pauseTimes = 20;      // pause all danmuku for 10 times in case some are missed
// globalThis.pauseDuration = 50;      // pause all danmuku for 10 times in case some are missed
globalThis.offset = 0;
globalThis.video_size = "100%";
globalThis.danmuku_container = document.getElementById("danmuku-container");
globalThis.video_container = document.getElementById("video-container");

// get video
globalThis.cur_video = document.getElementById("b-video");
globalThis.interval = 0;
globalThis.top_count = 0;       // number of danmuku at the top
globalThis.relative_speed = 1;
// globalThis.video_width = container.style.width;
// globalThis.video_height = container.style.height;
// console.log(video_width, video_height, 12);

document.getElementById("is-verbose").onchange = function(){
    verbose = document.getElementById("is-verbose").checked
};


// video player setting
danmuku_container.onclick = function(e){
    // if (this.width)

    if (verbose){
        console.log("video is clicked", e.clientX, e.clientY);
    }
    if (cur_video.paused){
        cur_video.play();
    }
    else{
        cur_video.pause();
    }
};

document.onkeydown = function(e){
    // bind "pressing SPACE" to "pausing video"
    if (e.key == " "){
        e.preventDefault();
        if (verbose){
            console.log("space is clicked");
        }
        if (cur_video.paused){
            cur_video.play();
        }
        else{
            cur_video.pause();
        }
    }
}

// danmuku player setting
document.getElementById("danmuku-speed").innerText = 100;
document.getElementById("danmuku-speed-slider").onchange = function(){
    // adjust damuku speed according to user input
    relative_speed = this.value/100;        
    document.documentElement.style.setProperty("--danmuku-duration", 8/relative_speed+"s");
    document.getElementById("danmuku-speed").innerText = this.value;
    console.log("relative speed: "+relative_speed, document.documentElement.style.getPropertyValue('--danmuku-duration'));
}




document.getElementById("video-size").innerText = 100;
document.getElementById("video-size-slider").onchange = function(){
    // adjust danmuku speed according to size of video
    document.documentElement.style.setProperty("--danmuku-duration", 8*this.value/100/relative_speed+"s");

    document.getElementById("video-size").innerText = this.value;
    danmuku_container.style.width = this.value*0.98 + '%';
    danmuku_container.style.height = this.value + '%';
    video_container.style.width = this.value + '%';
    video_container.style.height = this.value/16*9 + '%';
    
    
    if (verbose){
        console.log("size changed to: " + this.value);
        console.log(danmuku_container.style.width, 
                    danmuku_container.style.height, 
                    video_container.style.width,
                    video_container.style.height)
    }
}



document.getElementById("offset").innerText = offset;

// e.g. let offset = 100
//      then at video timestamp 23 play danmuku of timestamp 123

document.getElementById("offset-slider").onchange = function(){
    offset = parseFloat(this.value);
    document.getElementById("offset").innerText = offset;
    danmuku_container.innerHTML = "";
    // cur_danmuku_list = [];
    
    if (verbose){
        console.log("set offset to: " + offset);
    }

    if (verbose){
        console.log("clear danmuku-container, danmuku reloaded at video timestamp: " + cur_video.currentTime + " with offset: " + offset);
    }
    reload_danmuku();
};



// upload danmuku.xml

let xml_txt = '';
// let isDanmukuLoaded = false;

let danmukuInput = document.getElementById('danmukuInput');
const danmukuReader = new FileReader();

danmukuInput.addEventListener('change', function(e){
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

    danmuku_container.innerHTML = '';        // clear current danmuku
    if (verbose){
        console.log("danmuku clear");
    }

    const file = e.target.files[0];

    danmukuReader.readAsText(file);
    danmukuReader.onloadend = () => {
        xml_txt  = danmukuReader.result;
    //    isDanmukuLoaded = true;
        if (verbose){
            console.log(xml_txt);
        }
        send_danmuku(xml_txt);
    };
});

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
let urlInput = document.getElementById('videoUrlInput');
let urlInputButton = document.getElementById('videoUrlInputSubmit');
urlInputButton.onclick = function(e){
    danmuku_container.innerHTML = '';        // clear current danmuku
    document.getElementById('b-video').src = urlInput.value;
    urlInput.value = "";
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function reload_danmuku(){
    // reload danmuku based on current timestamp of the video

    // find starting danmuku (the nth danmuku should be the starting one)
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
        console.log(n, danmuku_list[n]);
        console.log("current timestamp: " + cur_video.currentTime
                    + ", jump to " + n + "th danmuku with tiimestamp: " + danmuku_list[n].timestamp
                    + ", offset = " + offset);
    }
    send_danmuku_from(n); 
}

// this is the js_xml branch

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
        timestamp: parseFloat(p[0]),
        mode: parseInt(p[1]),
        color: numberToColour(p[3]),
        textContent: d.textContent,
    };
}

async function send_danmuku(xml_txt) {
    // parse xml file and send danmuku
    
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xml_txt, 'text/xml');

    globalThis.raw_danmuku_list = xmlDoc.getElementsByTagName('d');
    

    // if (verbose){ 
    //     console.log(danmuku_list.length + " danmukus are coming...");
    // }

    globalThis.danmuku_list = [];
    globalThis.danmuku_schedule = [];

    console.log(raw_danmuku_list.length);
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

    // display video timestamp
    cur_video.ontimeupdate = function(){
        document.getElementById("video-status").innerText = cur_video.currentTime;
    };

    // pause all danmuku
    cur_video.addEventListener("pause", async function(){
        await sleep(200);
        if (verbose){
            console.log("The video is paused.");
        }
    });

    // play all danmuku
    cur_video.addEventListener('play', function(){
        // cur_danmuku_list.forEach(function(d){

        for (let i=document.getElementById("danmuku-container").getElementsByClassName("danmuku").length-1; i>-1; i--){
            document.getElementById("danmuku-container").getElementsByClassName("danmuku")[i].style.animationPlayState = "running";
        }
        console.log("Continue to play the video.");
    });

    cur_video.onseeking = function(e){
        danmuku_container.innerHTML = "";
        if (verbose){
            console.log("seeking starts, clear danmuku-container");
        }    
    };

    cur_video.onseeked = function(){
        reload_danmuku();
    };

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

    globalThis.j = start;
    globalThis.cur_time = danmuku_schedule[j];
    // globalThis.cur_danmuku_list = [];
    // if (start == 0){
    //     globalThis.last_time = 0;
    // }
    // else{
    //     globalThis.last_time = danmuku_schedule[j-1];
    // }
    while (j < danmuku_list.length){
        if (cur_video.paused){

            // cur_danmuku_list.forEach(function(d){       // tjere should be a more economic way to stop all danmuku
            //     d.style.animationPlayState = "paused";
            // });
            
            for (let i=danmuku_container.getElementsByClassName("danmuku").length-1; i>-1; i--){
                danmuku_container.getElementsByClassName("danmuku")[i].style.animationPlayState = "paused";
            }
            await sleep(200);
            continue;

        };

        if (!is_danmuku_on){
            danmuku_container.innerHTML = '';        // clear current danmuku
            await sleep(200);
            continue;
        }

        cur_time = danmuku_schedule[j];
        // mode = danmuku_list[j].getAttribute('mode');

        let d = document.createElement("div");


        d.innerText = danmuku_list[j].textContent;
        if (verbose){ 
            d.innerText += "  " + Math.floor(danmuku_schedule[j]/60)%60 + ": " + Math.floor(danmuku_schedule[j])%60;
        };


        if (danmuku_list[j].mode==1){
            d.className = "danmuku rolling";
            d.style.top = Math.floor(Math.random()*10)*35*document.getElementById("video-size-slider").value/100 + "px";       // randomly placed at one row
        }
        else if (danmuku_list[j].mode==5){
            d.className = "danmuku rolling"; 
        }
        // else if (danmuku_list[j].getAttribute('mode')==5){
        //     d.className = "danmuku top";
        //     d.style.top = (top_count%10)*35 + "px";          // place the danmuku at top;
            
        //     d.style.left = (900 - 22*d.innerText.length)/2 + "px"
        //     console.log("A top danmuku has been placed at: " + d.style.top + " ," + d.style.left + " " + container.style.width + container.style.height);
        //     top_count += 1;
        // }

        
        d.style.fontSize = Math.ceil(22*Math.pow((document.getElementById("video-size-slider").value/100), 0.3)) + "px"

        d.style.color = danmuku_list[j].color;

        d.addEventListener("animationend", function(){
            if (verbose){
                console.log("danmuku deleted, content: " + d.innerText);
            }
            d.remove();
        });

        
        cur_time_w_offset = cur_video.currentTime + offset;
        if (cur_time_w_offset < 0){
            cur_time_w_offset = 0;
        }
        await sleep((cur_time-cur_time_w_offset)*1000);
        if (verbose){
            console.log(j + "th:　cur: " + cur_time + " with offset: " + offset
                          + "  ||  video: " + cur_video.currentTime
                          + " || gap: " + (cur_time - (cur_video.currentTime + offset)));
        }     
        document.getElementById("danmuku-status").innerText= cur_time;
        danmuku_container.appendChild(d);


        // cur_danmuku_list.push(d);
        // if (cur_danmuku_list.length > 600){     // clear loaded danmuku
        //     for (let i=0; i<300; i++){
        //         df = cur_danmuku_list.shift();  // first in first out
        //         df.remove();
        //     };
        // }
        // last_time = cur_time;
        j += 1;
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
//         console.log("Danmuku is refreshed to timestamp: " + "  " + Math.floor(danmuku_schedule[j]/60)%60 + ": " + Math.floor(danmuku_schedule[j])%60);
//     }
//     send_danmuku_from(n);
// }

// document.getElementById("refresh-button").onclick = refreshDanmuku();