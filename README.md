### Comment
Finally, I've completed a version that won't put danmuku somewhere I would never expected! This version can run properly, given you are willing to twist some parameters.

### Bugs
To use this version, you should know the following problems:
-   you can pause the video, however one or two danmukus may not be paused
-   switch to another page for too long will make danmuku stack together
-   danmuku may occlude each other
-   you have to manually
    -   get media id of bangumi / cid of video
    -   copy-and-paste danmuku
besides all these problems, enjoy!

### User Guide 
Below is the workflow to properly play a bangumi with danmuku in edge explorer:
1.  Get Danmuku
-   get media id of bangumi
    - search for bangumi on bilibili
    
    - open the bangumi page

    - copy the number in url that starts with "md"
    
      example:
    
      ```
      https://www.bilibili.com/bangumi/media/md28228414/?spm_id_from=666.25.b_6d656469615f6d6f64756c65.1			// md28228414 (w/o md) is the media_id
      ```
    
-   set `media_id`, `ep_num` variable in `get_danmumu.py` and run it (my version of python is 3.7.9)
    this will produce a `danmuku.xml` file in the subfolder `./danmuku/`.

-   ~~copy-and-paste danmuku~~
    
    - ~~copy all contents except the first line in "danmuku.xml"~~
    
    - ~~paste it into "script.js" like this:~~

      ```javascript
      var xml_txt = 'insert xml file content';
      ```
    
      ~~note that the value of xml_txt MUST BE INCLUDED WITH SINGLE QUOTE!!!~~
    
-   open the index.html in Microsoft Edge, upload the `danmuku.xml` and play the video
    
2. Get video
There are two ways: download the video OR find the url of the video
either way, change the `src` attribute of the `b-video` element in index.html

### To-do List

Besides fixing these bugs, here are some other functionality I want to implement:
-   find a way that guarantees to stop all danmukus.
-   resizable video player window

3. Tips:
-   Don't pause-and-play the video too fast, or you will freak out the danmukus and make them freeze in the air.