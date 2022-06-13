# Danmuku Player
[![license-shield](https://img.shields.io/apm/l/vim-mode)](https://mit-license.org/)
## About
This is a fun little project that aims to bring you a clear and bilibili-free experience of watching animes with danmuku (弹幕，bullet chat). It's mainly for self-entertainment and for practicing my frontend skills. Since I'm a total beginner to frontend development, there are probably tons of problems in my code, but luckily it works: the performance is acceptable and I don't have to give away my money to 叔叔 anymore!

“番剧不能失去弹幕，就像西方不能失去耶路撒冷”. For me, danmuku is an essential part in my experience of watching animes. However, today, there really aren't many animes to watch on Bilibili if you don't pay for the Bilibili Premium. I don't want to pay for a website where my favourite yuri animes are either taken down (e.g. Sakura Trick, Citrus, Slow Start...) or got the most important love scenes deleted by Bilibili (Bloom into You)! Luckily, some of the Bilibili api are stil usable. That's the motivation for this project. 

Below is a screenshot of the current version.

<img src="./res/demo.png">

## Bugs
This is just an alpha version. To use this version, you should be aware of the following bugs:
-   you can pause the video, but they won't stop simutaneously;
-   switching to another page for too long will make many danmukus stack together
-   danmukus may occlude each other
-   you have to manually
    -   get the media id of anime 
    -   get the source of anime
    besides all these problems, enjoy!

## To-do List
Besides fixing these bugs, here are some other functionality I want to implement:
-   find an efficient way that guarantees to stop all danmukus.
-   resizable video player window
-   blocked list

## User Guide 
To use this player, you can either go to [this webpage](https://xinyu-li-123.github.io/danmuku_player/) or clone this repo and open the [index.html](./index.html).

Below is the workflow to properly play a video with danmuku in edge explorer:

1. Get Danmuku

   The danmuku of a video is stored in an xml file. To get the xml file, you can either use the bilibili api or search for the video directly from [biliplus](https://www.biliplus.com/) or [jijidown](https://www.jijidown.com/). Either way, you should have an xml file of danmuku.

2. Get video
   
   Well... this part is up to you 😐. You can either upload a local video file or an url to a video.

3. Upload Danmuku and Video

   The webpage is quite self-explanatory, open the [webpage]() and youhttps://xinyu-li-123.github.io/danmuku_player/ will know where to upload.

## More on Bilibili Api
This is an optional section. You should read it **if  you want to download a huge number of danmuku files**, otherwise [biliplus](https://www.biliplus.com/) or [jijidown](https://www.jijidown.com/) would suffice.

By far, bilibili still has its api open to the public. I will introduce those I used. The source of this section is [this blog](https://www.bilibili.com/read/cv5293665?from=search&spm_id_from=333.337.0.0).

Belows are some types of ids that you will come across when using bilibili api 
-   cid / oid: chat id
-   media id (md): one that identifies a bangumi
-   season id (ss): one that identifies a bangumi (I don't know the the diff between md and ss, probably some internal use)
-   episode id (ep): one that identifies an episode of a bangumi

This is a list of usable api
-   cid -> danmuku
-   
    Current danmuku (?): 
    ```
    https://api.bilibili.com/x/v1/dm/list.so?oid=
    ```
    
    Danmuku on a specific date: 
    ```
    https://api.bilibili.com/x/v2/dm/history?type=1&oid=&date=
    ```
-   media id -> cids of every episode of the bangumi
    ```
    https://api.bilibili.com/pgc/review/user?media_id=
    ```
-   av number -> cid
   
    (**Note that bilibili has stopped using av number anymore since March 23, 2020. av number to bv number is an injective mapping, meaning that for every av number, there is always a corresponding bv number. To convert av number back to bv number, see [this Zhihu blog](https://www.zhihu.com/question/381784377/answer/1099438784)**)
    ```
    https://api.bilibili.com/x/player/pagelist?aid=
    ```
-   bv numnber -> cid
    ```
    https://api.bilibili.com/x/player/pagelist?bvid=
    ```

## More on the danmuku file
Bilibili api can return an xml file that contains all danmukus of a video. Below is an example
```xml
<i>
    <!-- ... -->
    <d p="783.55800,1,25,16777215,1642178620,0,7339dd1c,965423257139019776,7">This is a friendly danmuku.</d>
</i>
```

A `<d>` element represents a danmuku. Its text content is the content of the danmuku. The mysterious `p` attribute represents all info we needed to create this danmuku player. Below is my guess on the meaning of `p` attribute.
```xml
<i>
    <!-- ... -->
    <d p="783.55800,    // timestamp
          1,            // type (1 is rolling danmuku, 5 is danmuku at the top of the video)
          25,           // unknown
          16777215,     // decimal value of rgb color
          1642178620,   // unix time
          0,            // unknown
          7339dd1c,     // unknown
          965423257139019776,       // unknown
          7                         // unknown, maybe the batch of danmuku
          ">This is a friendly danmuku.</d>
</i>
```
In the [script.js](./script.js), I reformat each `<d>` element into an object with four attributes. This object represents all the information we need to send one danmuku. I then sort these objects according to their timestamps. Below is an example of such an object
```js
danmuku_example = {
    timestamp=783.55800,
    mode= 1,
    rgb="rgb(60,168,225)",
    textContent="This is a friendly danmuku."
}
```

## Related Work
This section lists some other source of historical danmuku.
* [a blog about bangumi history](https://www.biliplus.com/html/bangumi_history_william9933.htm) on biliplus
* [jijidown](https://www.jijidown.com/)


## Some Exciting Findings
### Danmuku of a Deleted Video
You may find **danmuku of a deleted video** on these two websites: **biliplus** and **jijidown**. These two websites doesn't provides any video or audio sources, they only provides statistics of bilibili videos like video title, view count, and most importantly, danmuku file. It seems that they store the danmuku on their servers, thus it's possible to find the danmuku file of a deleted bilibili video.

In my case, the video I found is a movie called *为美好的世界献上祝福！红传说* (*KonoSuba: Legend of Crimson*). It was uploaded to bilibili silently on April 19, 2020, received a 9.9 rating, and removed by bilibili silently few month later for reasons known to no one. To me, it is the movie **combined with its danmuku** that makes my watching experience so fantastic, and the loss of those precious danmuku is tragic and outraging! **Danmuku is created by the users and should belong to the users!** 

Luckily, I find out the BV number of this movie by accident (BV1ix411E7AE). So, if you are a fan of KonoSuba like me, then please enjoy this precious treasure created jointly by **us**,  fans of KonoSuba.

### Cid's of a bangumi (a series of videos)
cid is (probably) short for chat id, it identifies the danmuku of a video. What's nice about cid is that, within one bangumi, the cid of each episode grows with the ordinal of the episode. That is, if we know the cid of one episode, we know the cid of each episode. For example, the cid of the 1st episode of *未来日记*  is 578104, therefore the cid of the 3rd episode is 578104+2=578106. 

### async, await | promise, then
```javascript
// Given a function that returns a promise
function foo3(){
    let myPromise = new Promise(function(myResolve, myReject) {
        let flag = 0;

        wait_for_user_input_that_may_change_flag(flag)

        if (flag == 0) {
            myResolve("OK");
        } else {
            myReject("Error");
        }
    })
}

async function foo(){
// an async function allows await operation
    foo1();
    foo2();
    await foo3();
    // wait until foo3() is completed, then execute foo4()
    // without await, foo4 that depends on foo3 will malfunction
    foo4();
}

// "async + await" IS THE SAME AS "promise + then"

function foo(){
    foo1();
    foo2();
    foo3().then(
        foo4();
    );
}
```

### Future Plan: Chrome Extension

The ultimate goal is to make an extension that can display danmuku on a video **inside the website of the video**.

A chrome extension consists of three parts that are not necessarily dependent:
content script, pop up, and background page.

* Content Script

A script that injects html codes into the current page before/when/after it's loaded.

You can add an icon in the web page that display the functionality of your extension.

Note that the domain of this script is the same as the current page, so it's hard to requests for content from another domain. (e.g. retrieve a json file from quora when the content script is running in reddit)

* Pop Up

A pop up is a seperate html page (on the top right of the chrome browser).

* Background Page

A background page is a script that keeps running on the background.

