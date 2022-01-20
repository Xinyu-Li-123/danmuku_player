// import jquery
let script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

globalThis.verbose = false;          // debug option

// globalThis.pauseTimes = 20;      // pause all danmuku for 10 times in case some are missed
// globalThis.pauseDuration = 50;      // pause all danmuku for 10 times in case some are missed


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


async function send_danmuku(xml_txt) {
    // await sleep(5000);


    // get danmuku
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xml_txt, 'text/xml');

    globalThis.danmuku_list = xmlDoc.getElementsByTagName('d');

    if (verbose){ 
        console.log(danmuku_list.length + " danmukus are coming...");
    }

    globalThis.cur_danmuku_list = [];
    globalThis.danmuku_schedule = [];
    for (let i=0; i<danmuku_list.length; i++){
        danmuku_schedule.push(danmuku_list[i].getAttribute('timestamp'));
    };
    globalThis.container = document.getElementById("danmuku-container");

    // get video
    globalThis.cur_video = document.getElementById("b-video");



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
        cur_danmuku_list.forEach(function(d){
            d.style.animationPlayState = "running";
        });
    });

    cur_video.onseeking = function(e){
        container.innerHTML = "";
        if (verbose){
            console.log("seeking starts, clear danmuku-container");
        }
    };

    cur_video.onseeked = function(e){
        if (verbose){
            console.log("seeking finished, current timestamp: " + cur_video.currentTime);
        }
        // find starting danmuku (the nth danmuku should be the starting one)
        let el = cur_video.currentTime;
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

        // await sleep(100);
        if (verbose){
            console.log("jump to " + n + "th danmuku with tiimestamp: " + danmuku_list[n].getAttribute("timestamp"));
        }
        send_danmuku_from(n); 
    };
    send_danmuku_from(0);
    };

async function send_danmuku_from(start){
    globalThis.j = start;
    let cur_time = 0;
    let last_time = danmuku_schedule[j];
    while (j < danmuku_list.length){
        if (cur_video.paused){

            // cur_danmuku_list.forEach(function(d){       // tjere should be a more economic way to stop all danmuku
            //     d.style.animationPlayState = "paused";
            // });

            for (let i=cur_danmuku_list.length-1; i>-1; i--){
                cur_danmuku_list[i].style.animationPlayState = "paused";
            }

            await sleep(200);
            continue;
        };
        cur_time = danmuku_schedule[j];
        // mode = danmuku_list[j].getAttribute('mode');

        let d = document.createElement("div");
        d.className = "danmuku";
        d.innerText = danmuku_list[j].textContent;
        if (verbose){ 
            d.innerText += "  " + Math.floor(danmuku_schedule[j]/60)%60 + ": " + Math.floor(danmuku_schedule[j])%60;
        };

        // d.style.top = Math.floor(Math.random()*10)*(danmuku_container_height/trackNum) + "px";
        // d.style.top = Math.floor(Math.random()*10)*35 + "px";

        d.style.top = Math.floor(Math.random()*10)*35 + "px";
        d.style.color = danmuku_list[j].getAttribute('rgb');

        container.appendChild(d);
        if (verbose){
            console.log("One danmuku has been sent at top: " + d.style.top);
        }
        await sleep((cur_time-last_time)*1000);
        
        if (verbose){
            console.log((cur_time-last_time), j);
        }
        cur_danmuku_list.push(d);
        if (cur_danmuku_list.length > 600){     // clear loaded danmuku
            for (let i=0; i<300; i++){
                df = cur_danmuku_list.shift();  // first in first out
                df.remove();
            };
        }
        last_time = cur_time;
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