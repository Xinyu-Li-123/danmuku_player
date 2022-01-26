#!/usr/bin/env python
# _*_ coding:utf-8 _*_

"""
Some explanation on bilibili api
-   cid / oid: the unique id that identify a video/article of bilibili
-   media id (md): identify a bangumi
-   season id (ss): identify a bangumi (IDK the diff between md and ss, probably some internal use)
-   episode id (ep): identify an episode of a bangumi
THE DOCUMENTATION IS UNFINISHED
"""

import requests
import os
import sys
import xml.etree.ElementTree as ET
import pprint as p


verbose = True

# md -> ss
media2season = "https://api.bilibili.com/pgc/review/user?media_id="

# ss -> cid of each episode
season2episode = "https://api.bilibili.com/pgc/web/season/section?season_id="

# cid -> danmuku.xml
cid2danmuku = "https://api.bilibili.com/x/v1/dm/list.so?oid="

# av -> cid
av2cid = "https://api.bilibili.com/x/player/pagelist?aid="



def sec2time(sec):
    return f"{sec} <==> {sec//60//60}:{sec//60%60}:{sec%60}"

def reformat_xml_and_save(xml_str: str, path=None):
    """
    functionality
    -   extract useful properties from the attribute 'p' of tag <d>
            <d p="...> ==> <d timestamp="..." mode=" " rgb="...">
    -   sort xml by timestamp
    """

    root = ET.fromstring(xml_str)
    j = 0
    total = len(list(root.iter('d')))
    print(total)
    while root[j].tag != 'd':
        root.remove(root[j])

    for d in root.iter('d'):
        d.text = d.text.replace("'", '"')        # this line is to enable direct copy-and-paste from xml file into javascript file
        timestamp, mode, _, rgb, _, _, _, _, _= d.attrib['p'].split(',')
        d.attrib.pop('p')
        d.attrib['timestamp'] = float(timestamp)
        # d.attrib['timestamp'] = int(float(timestamp))        
        d.attrib['mode'] = mode
        rgb = int(rgb)
        d.attrib['rgb'] = f"rgb({rgb//(256*256)}, {(rgb%(256*256))//256}, {rgb%256})"

    def sortchildrenby(parent, attr):    
        parent[:] = sorted(parent, key=lambda child: child.get(attr))

    sortchildrenby(root, 'timestamp')

    for d in root.iter('d'):
        d.attrib['timestamp'] = str(d.attrib['timestamp'])

    if verbose:
        for d in root.iter('d'):
            print(d.attrib['timestamp'], d.text)

    if path is None:
        path = "./danmuku/danmuku.xml"
    
    # raw_path = path[:-4]+"raw.xml"
    # with open(raw_path, 'w', encoding="utf8") as file:
    #     file.write(xml_str)
    #     print(f"{path} is reformatted, there are {total} danmukus in total")

    with open(path, "wb") as file:
        file.write(ET.tostring(root, encoding='utf8'))
        print(f"{path} is reformatted, there are {total} danmukus in total")



def get_danmuku_via_cid_selected(cid: str, path=None, keywords=None):
    danmuku = requests.get(cid2danmuku+str(cid))
    print("danmuku.xml is downloaded.")
    danmuku.encoding='utf8'
    
    
    if keywords is not None:
        score = 0
        for keyword in keywords:
            if keyword in danmuku.text:
                score += 1
        
        if score >= 3:
            print(f"cid={cid} contains {score}/{len(keywords)}, pass")
            reformat_xml_and_save(danmuku.text, path)
        else:
            print(f"cid={cid} contains {score}/{len(keywords)}, fail")
    else:
        reformat_xml_and_save(danmuku.text, path)


def main():
    # md = 28228414      # manually set media id
    # ep_num = 4         # manually set episode number
    # get_danmuku_via_md(md, ep_num)
    # md = 1270
    # ss = 2574
    # av = 170001

    # bv = "1H4411F7Ud"
    # ep_start = 1
    # ep_end = 26

    folder_name = "md1270_濑户的花嫁"
    
    try:
        os.mkdir("danmuku")
    except FileExistsError:
        pass
    os.chdir('danmuku')
    try:
        os.mkdir(folder_name)
    except FileExistsError:
        pass

    keyword = ["樱谋诡计", "优酱", "吻", "春香", "枫", "柚", "百合", "kiss"]

    for cid in range(6969040, 6969051):
        path = f"{cid-6969040+2}.xml"
        get_danmuku_via_cid_selected(cid, path=path)

# main()

with open("./01raw.xml", 'r', encoding="utf8") as file:
    reformat_xml_and_save(file.read(), path="./01.xml")
