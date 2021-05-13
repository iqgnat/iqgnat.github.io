---
title: crawler:手机信息抓取
categories: 开发随笔
tags: python
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---



基于 etree （lxml） 和 BeautifulSoup（bs4）的一次手机信息抓取。

<!--more-->

需求说明：

包括品牌、型号、配置（CPU、内存、存储）、制式（电信、联通、移动）、4G/5G、图片（1张主界面即可）。


lxml 和 element tree 解析，综合三种方式获取网页元素:

1.xpath

2.BeautifulSoup: find / find_all

3.BeautifulSoup: css选择器



```python
# -*- encoding in utf-8 -*-
import pandas as pd
import numpy as np
import csv
import re
import requests


# 注意数据类型
class Phone:
    def _get_brand(self, f):
        # 品牌,xpath可以精确获取
        brand = f.xpath('//*[@id="parameter-brand"]/li/@title')
        brand = ''.join(brand)
        # print(brand)
        return brand

    def _get_product_name(self, soup):
        # 产品名称(通过子标签内容查找父标签下的dt)
        detail0 = soup.find('div', attrs={'class': 'Ptable-item'})
        product_name = detail0.find('dt', text=re.compile(r'产品名称')).next_sibling.get_text()
        # print(product_name)
        return product_name

    def _get_year(self, soup):
        # 上市年份
        detail0 = soup.find('div', attrs={'class': 'Ptable-item'})
        year = detail0.find('dt', text=re.compile(r'上市年份')).next_sibling.get_text()
        # year = detail0.find('dd', text=re.compile(r'\d{4}年')).get_text()
        # print(year)
        return year

    def _get_month(self, soup):
        # 上市月份
        detail0 = soup.find('div', attrs={'class': 'Ptable-item'})
        month = detail0.find('dt', text=re.compile(r'上市月份')).next_sibling.get_text()
        # month = detail0.find('dd', text=re.compile(r'\d+月')).get_text()
        # print(month)
        return month

    def _get_cpu_model(self, soup):
        # cpu 型号
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'CPU型号')) is not None:
                cpu_model = details[i].find('dt', text=re.compile(r'CPU型号')).next_sibling.get_text()
            else:
                pass
        # print(cpu_model)
        return cpu_model

    def _get_ram(self, soup):
        # 运行内存
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'运行内存')) is not None:
                ram = details[i].find('dt', text=re.compile(r'运行内存')).next_sibling.get_text()
            else:
                pass
        # print(ram)
        return ram

    def _get_extended_memory(self, soup):
        # 判断是否支持存储卡
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        extended_memory = '0GB'
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'最大存储扩展容量')) is not None:
                extended_memory = details[i].find('dt', text=re.compile(r'最大存储扩展容量')).next_sibling.get_text()
                break
            else:
                pass
        # print(extended_memory)
        return extended_memory

    def _get_memory(self, soup):
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'机身存储')) is not None:
                memory = details[i].find('dt', text=re.compile(r'机身存储')).next_sibling.get_text()
            else:
                pass
        # print(memory)
        return memory

    def _get_screen_resolution(self, soup):
        # 分辨率(screen resolution)
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'分辨率')) is not None:
                screen_resolution = details[i].find('dt', text=re.compile(r'分辨率')).next_sibling.get_text()
            else:
                pass
        # print(screen_resolution)
        return screen_resolution

    def _get_domscreen_size(self, soup):
        # 主屏幕尺寸
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'主屏幕尺寸（英寸）')) is not None:
                primscreen_size = details[i].find('dt', text=re.compile(r'主屏幕尺寸（英寸）')).next_sibling.get_text()
            else:
                pass
        # print(primscreen_size)
        return primscreen_size

    def _get_system(self, soup):
        # 操作系统
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'操作系统')) is not None:
                system = details[i].find('dt', text=re.compile(r'操作系统')).next_sibling.get_text()
            else:
                pass
        # print(system)
        return system

    def _get_SSIM_4G(self, soup):
        # 判断是否存在副SIM卡4G网络(SSIM_4G)
        # print(type(soup))
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        SSIM_4G = '不存在'
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'副SIM卡4G网络')) is not None:
                SSIM_4G_tags = details[i].find('dt', text=re.compile(r'副SIM卡4G网络')).parent.find_all('dd', attrs={
                    "class": False})
                SSIM_4G = SSIM_4G_tags[0].string
                # print(SSIM_4G)
                break
            else:
                pass
        return SSIM_4G

    def _get_fiveG(self, soup):
        # 5G网络
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'5G网络')) is not None:
                fiveG = details[i].find('dt', text=re.compile(r'5G网络')).next_sibling.get_text()
            else:
                pass
        # print(fiveG)
        return fiveG

    def _get_fourG(self, soup):
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        fourG = '未知'
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'4G网络')) is not None:
                fourG_tags = details[i].find('dt', text=re.compile(r'4G网络')).parent.find_all('dd', attrs={
                    "class": False})
                fourG = fourG_tags[0].string
                break
            else:
                pass
        # print(fourG)
        return fourG

    def _get_charging_interface(self, soup):
        # 充电接口类型
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'充电接口类型')) is not None:
                charging_interface = details[i].find('dt', text=re.compile(r'充电接口类型')).next_sibling.get_text()
            else:
                pass
        # print(charging_interface)
        return charging_interface

    def _get_NFC(self, soup):
        # NFC/NFC模式
        details = soup.find_all('div', attrs={'class': 'Ptable-item'})
        for i, content in enumerate(details):
            if details[i].find('dt', text=re.compile(r'NFC/NFC模式')) is not None:
                NFC = details[i].find('dt', text=re.compile(r'NFC/NFC模式')).next_sibling.get_text()
            else:
                pass
        # print(NFC)
        return NFC

    def gather_info(self, f, soup):
        brand = self._get_brand(f)
        product_name = self._get_product_name(soup)
        year = self._get_year(soup)
        month = self._get_month(soup)
        cpu_model = self._get_cpu_model(soup)
        ram = self._get_ram(soup)
        extended_memory = self._get_extended_memory(soup)
        memory = self._get_memory(soup)
        screen_resolution = self._get_screen_resolution(soup)
        domscreen_size = self._get_domscreen_size(soup)
        system = self._get_system(soup)
        SSIM_4G = self._get_SSIM_4G(soup)
        fiveG = self._get_fiveG(soup)
        fourG = self._get_fourG(soup)
        charging_interface = self._get_charging_interface(soup)
        NFC = self._get_NFC(soup)

        item_info = (brand, product_name, year, month, cpu_model, ram, extended_memory, memory, screen_resolution,
                     domscreen_size, system, SSIM_4G, fiveG, fourG, charging_interface, NFC)

        return item_info
    
# def get_picture(self, f):
#     return

```

