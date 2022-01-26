globalThis.verbose = true;          // debug option

// globalThis.pauseTimes = 20;      // pause all danmuku for 10 times in case some are missed
// globalThis.pauseDuration = 50;      // pause all danmuku for 10 times in case some are missed
globalThis.offset = 0;
globalThis.container = document.getElementById("danmuku-container");

// get video
globalThis.cur_video = document.getElementById("b-video");
globalThis.interval = 0;




document.getElementById("offset").innerText = offset;
// e.g. let offset = 100
//      then at video timestamp 23 play danmuku of timestamp 123

document.getElementById("offset-slider").onchange = function(){
    offset = parseFloat(this.value);
    document.getElementById("offset").innerText = offset;
    container.innerHTML = "";
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


let videoInput = document.getElementById('videoInput')
const videoReader = new FileReader();

videoInput.addEventListener('change', function(e1){
      // The file reader gives us an ArrayBuffer:

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

let urlInput = document.getElementById('videoUrlInput');
let urlInputButton = document.getElementById('videoUrlInputSubmit');
urlInputButton.onclick = function(e){
    document.getElementById('b-video').src = urlInput.value;
    urlInput.value = "";
};


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function reload_danmuku(){
    // reload danmuku based on current time

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
    if (verbose){
        console.log("current timestamp: " + cur_video.currentTime
                    + ", jump to " + n + "th danmuku with tiimestamp: " + danmuku_list[n].getAttribute("timestamp")
                    + ", offset = " + offset);
    }
    // await sleep(100);
    // await sleep((danmuku_schedule[n]-cur_video.currentTime)*1000);
    send_danmuku_from(n); 
}

async function send_danmuku(xml_txt) {
    // await sleep(5000);


    // get danmuku
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xml_txt, 'text/xml');

    globalThis.danmuku_list = xmlDoc.getElementsByTagName('d');

    if (verbose){ 
        console.log(danmuku_list.length + " danmukus are coming...");
    }


    globalThis.danmuku_schedule = [];
    for (let i=0; i<danmuku_list.length; i++){
        danmuku_schedule.push(danmuku_list[i].getAttribute('timestamp'));
    };

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
        // for (let i=0; i<pauseTimes; i++){
        //     await sleep(pauseDuration/pauseTimes);
        //     if (verbose){
        //         console.log("pause for " + i + " times");
        //     }
        //     cur_danmuku_list.forEach(function(d){
        //         d.style.animationPlayState = "paused";      // there should be a more economical way to do this
        //     });
        // };
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
        container.innerHTML = "";
        if (verbose){
            console.log("seeking starts, clear danmuku-container");
        }    
    };

    cur_video.onseeked = function(){
        reload_danmuku();

    };

    await sleep(danmuku_schedule[0]*1000);
    send_danmuku_from(0);
    };

function addAnimation(body) {
    let dynamicStyles = document.createElement('style');
    dynamicStyles.type = 'text/css';
    document.head.appendChild(dynamicStyles);
    dynamicStyles.sheet.insertRule(body, dynamicStyles.length);
    }
      


async function send_danmuku_from(start){
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

            
            for (let i=document.getElementById("danmuku-container").getElementsByClassName("danmuku").length-1; i>-1; i--){
                document.getElementById("danmuku-container").getElementsByClassName("danmuku")[i].style.animationPlayState = "paused";
            }
            await sleep(200);
            continue;
        };
        cur_time = danmuku_schedule[j];
        // mode = danmuku_list[j].getAttribute('mode');

        let d = document.createElement("div");

        // if (danmuku_list[j].getAttribute('mode')==1){
        //     d.className = "danmuku rolling";
        // }
        // else if (danmuku_list[j].getAttribute('mode')==5){
        //     d.className = "danmuku top";
        //     d.style.translate       
        // }

        d.className = "danmuku rolling";

        d.innerText = danmuku_list[j].textContent;
        if (verbose){ 
            d.innerText += "  " + Math.floor(danmuku_schedule[j]/60)%60 + ": " + Math.floor(danmuku_schedule[j])%60;
        };

        // d.style.top = Math.floor(Math.random()*10)*(danmuku_container_height/trackNum) + "px";
        // d.style.top = Math.floor(Math.random()*10)*35 + "px";

        d.style.top = Math.floor(Math.random()*10)*35 + "px";
        d.style.color = danmuku_list[j].getAttribute('rgb');

        d.addEventListener("animationend", function(){
            if (verbose){
                console.log("danmuu deleted, content: " + d.innerText);
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
        container.appendChild(d);


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