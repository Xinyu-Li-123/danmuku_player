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

# bv -> cid
bv2cid = "https://api.bilibili.com/x/player/pagelist?bvid="

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
    
    raw_path = path[:-4]+"raw.xml"
    with open(raw_path, 'w', encoding="utf8") as file:
        file.write(xml_str)
        print(f"{path}(raw) is downloaded, there are {total} danmukus in total")

    with open(path, "wb") as file:
        file.write(ET.tostring(root, encoding='utf8'))
        print(f"{path} is reformatted, there are {total} danmukus in total")



def get_danmuku_via_cid(cid: str, path=None):
    danmuku = requests.get(cid2danmuku+str(cid))
    print("danmuku.xml is downloaded.")
    danmuku.encoding='utf8'
    
    reformat_xml_and_save(danmuku.text, path)




def get_danmuku_via_md(md: int, ep_num: int, path=None):   # md is media id, the id of a bangumi
    """
    md: media_id
    ep_num: number of episode

    Examples
    --------
        md = "28228414"     # the media id of the bangumi 《放学后海堤日记》
        ep_num = 1          # we want to watch the 1st episode of the bangumi
        get_danmuku_via_md(md = md, ep_num = ep_num) 
    """

    # type check
    if not isinstance(md, int):     # a common mistake
        raise TypeError(f"media id must be a int, not {type(md)}!")
    if not isinstance(ep_num, int):
        raise TypeError(f"episode number must be a positive integer, your input is {ep_num}")

    # media_id -> season_id
    x = requests.get(media2season + str(md)).json()
    if x["message"] != "success":
        return False, "Failed to get season_id"
    ss = x["result"]["media"]["season_id"]

    # season_id + ep_num -> cid
    x = requests.get(season2episode + str(ss)).json()
    if x["message"] != "success":
        return False, "Failed to get cid"
    
    cid = x["result"]["main_section"]["episodes"][ep_num-1]["cid"]

    get_danmuku_via_cid(cid, path)

def get_danmuku_via_ss(ss: int, ep_num: int, path=None):
    x = requests.get(season2episode + str(ss)).json()
    if x['code'] == 0:
        cid = x['result']['main_section']['episodes'][ep_num-1]['cid']
        get_danmuku_via_cid(cid, path)
        

#todo: untested
def get_danmuku_via_av(av: int, ep_num=None, path=None):
    if not isinstance(av, int):     # a common mistake
        raise TypeError(f"av id must be a int, not {type(av)}!")
    
    x = requests.get(av2cid + str(av)).json()
    # if x['code'] == 0:
    #     cid = x['data']['cid']
    # get_danmuku_via_cid(cid, path)

    if x['code'] == 0:
        if ep_num is not None:
            print("downloading one video among a list of videos")
            cid = x['data'][ep_num-1]['cid']
            get_danmuku_via_cid(cid, path)
        else:
            print("downloading one video")
    else:
        print(f"Request fail: {x['code']}")



#todo: untested
def get_danmuku_via_bv(bv: str, ep_num = None, path=None):
    if not isinstance(bv, str):     # a common mistake
        raise TypeError(f"bv id must be a str, not {type(bv)}!")
    
    x = requests.get(bv2cid + str(bv)).json()
    if x['code'] == 0:
        if ep_num is not None:
            print("downloading one video among a list of videos")
            cid = x['data'][ep_num-1]['cid']
            get_danmuku_via_cid(cid, path)
        else:
            print("downloading one video")
    else:
        print(f"Request fail: {x['code']}")


def test_case():
    # test_md = 28228414
    # test_ep_num = 1
    # get_danmuku_via_md(test_md, test_ep_num)
    # get_danmuku_via_av(810872)
    # x = requests.get("https://api.bilibili.com/pgc/web/season/section?season_id=34558").json()
    # p.pprint(x)
    # get_danmuku_via_ss(34558, 1)
    get_danmuku_via_cid("101693847")
    pass
    

def main():
    # md = 28228414      # manually set media id
    # ep_num = 4         # manually set episode number
    # get_danmuku_via_md(md, ep_num)
    md = 28229876
    ss = 34558
    av = 51829
    bv = "1H4411F7Ud"
    cid = 924396
    ep_start = 1
    ep_end = 26
    folder_name = "av51829_惊爆草莓"
    
    try:
        os.mkdir("danmuku")
    except FileExistsError:
        pass
    os.chdir('danmuku')
    try:
        os.mkdir(folder_name)
    except FileExistsError:
        pass

    

    for ep_num in range(ep_start, ep_end+1):

        # get_danmuku_via_md(md = md, ep_num = ep_num, path = f"./{folder_name}/{str(ep_num).zfill(2)}.xml")
        # get_danmuku_via_ss(ss = ss, ep_num = ep_num, path = f"./{folder_name}/{str(ep_num).zfill(2)}.xml")
        get_danmuku_via_av(av = av, ep_num = ep_num, path = f"./{folder_name}/{str(ep_num).zfill(2)}.xml")
        # get_danmuku_via_bv(bv = bv, ep_num = ep_num, path = f"./{folder_name}/{str(ep_num).zfill(2)}.xml")
        # get_danmuku_via_cid(cid = cid + ep_num - 1, path = f"./{folder_name}/{str(ep_num).zfill(2)}.xml")




main()
# test_case()