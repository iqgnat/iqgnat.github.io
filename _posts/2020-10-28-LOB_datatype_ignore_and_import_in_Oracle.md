---
title: Oracle 导数，越过或导入 LOB 字段。
categories: 开发随笔
tags: database
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

问题：

​	通过 SQL Loader 文件往 Oracle 数据库导数，如何导入和越过大字段（LOB）；

<!--more-->

## <font face="黑体" color=green size=5>问题分析</font>

1. 越过大字段：

   将该字段定义为一个伪字段，但是后面不继续导入，也就越过了。注意后面要跟这 CHAR(一个足够大的数，不用考虑 Oracle数据库本身对CHAR长度的限制)。

   注意：大字段是无法直接通过 FILLER 越过的。

   ```nonsense         FILLER CHAR(40000)       ```

   

2. 导入大字段

   方法一：常用的做法，将原文件中的列名定义为一个伪字段，再通过LOBFILE将该伪字段导入表中对应的字段。

   ```sql
   report_variable   FILLER CHAR(40000)   --导入大字段，方法1：定义report_variable为大字段变量名（伪字段）
   ,report          LOBFILE(report_variable) TERMINATED BY EOF             
   ```
   
   
   
   方法二：不知道从哪个oracle版本开始，可以直接 CHAR(一个足够大的数)导入了，不需要再先定义伪字段。
   
   ```description       CHAR(40000)        --导入大字段，方法2(新发现欸)：建表的时候建该字段为CLOB，在ctl文件中以 CHAR 导入。```
   
   

## <font face="黑体" color=green size=5> SQL Loader的控制文件举例</font>

```sql
characterset 'UTF8'
INFILE 'C:\sample_data_iqgnat.csv'  "str x'207c200a'"
BADFILE 'C:\badfile.txt'
APPEND
INTO TABLE sample_data_iqgnat
FIELDS TERMINATED BY  ' | '
TRAILING NULLCOLS
(
 id                CHAR(20)                        "trim(:id)" 
,content_date              DATE "YYYY-MM-DD HH24:MI:SS"    "trim(:content_date)"
,nonsense         FILLER CHAR(40000)                              -- 越过大字段（新发现欸）：将该字段定义为一个伪字段，但是后面不继续导入，也就越过了。注意后面要跟这 CHAR(一个很大的数，比如40000)

,report_variable   FILLER CHAR(40000)                              --导入大字段，方法1：定义report_variable为大字段变量名（伪字段）
,report          LOBFILE(report_variable) TERMINATED BY EOF             
,description       CHAR(40000)                                     --导入大字段，方法2(新发现欸)：建表的时候建该字段为CLOB，在ctl文件中以 CHAR 导入。
)  
```

sqlldr 执行语句：

```shell
sqlldr userid= <数据库用户名>/<数据库密码>@<IP地址>:<端口号>/<服务名> control=C:\sample_data.ctl log=C:\sample_data_import.log
```



