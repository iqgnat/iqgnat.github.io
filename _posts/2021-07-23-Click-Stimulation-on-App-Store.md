---
title: 应用商店点击广告的自动化脚本
categories: 开发随笔
tags: [python]
description: 
comments: false
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---



广告主在应用商店某个广告位上投放了竞价广告，媒体会将用户在这个广告位上点击到甲方广告的用户数据回传。如果平台数据造假，利用自然量、活动量或者搜索量的用户数据混合在CPA广告点击数据，是比较难识别的, 因为这部分用户是真实的正常用户，有后续的转化。需要对应用商店广告位上的点击进行一个采样监控。



写一个简单脚本，利用安卓模拟器(比如雷电模拟器）或直接通过对应厂商的安卓手机，在对应的应用市场，随机每间隔60~300秒，判断是否我们投放且竞价成功的广告，如果成功则自动点击该广告位上的广告。通过部署多台设备和IP（躲避商店自身的风控，部分挂vpn或移动网络），记录每次的点击时间、设备、IP信息来与媒体回传的数据作对比，从而进行应用商店的广告反作弊判断。



```python
import time
import random
import os
from uiautomator import Device

# 初始化设备 (修改设备ID为实际ID)
device_id = 'emulator-5554'  # 替换模拟器的设备ID，或实际的手机的did
d = Device(device_id)

# 变更IP地址
def change_ip(device_id, ssid, password):
	"""
    :param device_id: 设备ID
    :param ssid: WiFi网络名称
    :param password: WiFi网络密码
    """
    try:
        # 断开当前WiFi连接
        os.system('adb -s {} shell svc wifi disable'.format(device_id))
        time.sleep(2)  # 等待WiFi关闭
        
        # 打开WiFi
        os.system('adb -s {} shell svc wifi enable'.format(device_id))
        time.sleep(2)  # 等待WiFi开启

        # 连接到指定WiFi网络
        connect_command = (
            f'adb -s {device_id} shell am startservice '
            f'-n com.google.android.gms/com.google.android.gms.wifi.settings.WifiSettingService '
            f'-a android.net.wifi.CONNECT_NETWORK '
            f'--es ssid "{ssid}" '
            f'--es password "{password}"'
        )
        os.system(connect_command)
        time.sleep(10)  # 等待WiFi连接

        # 检查连接状态
        os.system(f'adb -s {device_id} shell dumpsys wifi > wifi_status.txt')
        with open('wifi_status.txt', 'r') as file:
            status = file.read()
        if ssid in status:
            print(f"设备 {device_id} 已成功连接到 WiFi 网络 {ssid}")
        else:
            print(f"设备 {device_id} 连接 WiFi 网络 {ssid} 失败")
    except Exception as e:
        print(f"更换IP网络时出错: {e}")

# 检查并点击广告的函数
def click_ad():
    ad_element = d(resourceId='com.example.vivo:id/ad_resource_id')  # 替换为实际资源ID

    if ad_element.exists:
        ad_element.click()
        click_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
        print(f"Clicked ad at: {click_time}")
        # 记录点击时间，设备ID，IP等信息
        with open('click_log.txt', 'a') as log:
            log.write(f"Device: {device_id}, Click Time: {click_time}, IP: {get_current_ip()}\n")
    else:
        print("Ad not found.")

# 获取当前IP地址的函数
def get_current_ip():
    result = os.popen('adb -s {} shell ifconfig wlan0'.format(device_id)).read()
    ip = ''
    for line in result.split('\n'):
        if 'inet addr' in line:
            ip = line.split(':')[1].split(' ')[0]
            break
    return ip

# 运行脚本的函数
def run_script(interval_min=30, interval_max=60, device_id, ssid, wifi_password):
    while True:
        interval = random.randint(interval_min, interval_max)
        time.sleep(interval)
        click_ad()
        change_ip()

# 运行脚本 (修改随机间隔)
run_script(30, 300, device_id, ssid, wifi_password)
```

