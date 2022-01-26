import requests
import os
import sys
import xml.etree.ElementTree as ET
import pprint as p


verbose = True

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
    with open(path, "wb") as file:
        file.write(ET.tostring(root, encoding='utf8'))
        print(f"{path} is reformatted, there are {total} danmukus in total")

with open("./raw_01.xml", 'r', encoding='utf8') as file:
    xml_str = file.read()

reformat_xml_and_save(xml_str, "./01.xml")