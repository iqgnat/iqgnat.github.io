---
title: 图数据库 Neo4j 随笔
categories: 开发随笔
tags: Neo4j
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

腾讯课堂有 庞国明的教学课程，配套了一本全面的中文教材。

图数据库有几种选型。其中，OrientDB是开源的，但网上的资源少，长时间不维护。Neo4j社区活跃，企业版支持集群。图数据库很适合把家乡的族谱电子化呢！

<!--more-->

1. CONNECT_BY不是一个合法neo4j sql语句;

   

2.  在不同database存一个cypher脚本： Browser Sync；

   

3. 对Customer label的节点的name属性添加index：**CREATE INDEX ON: Customer(name);**

   

4. Neo4j desktop可以创建多个数据库，但是每次只能连接一个；

   

5. PROFILE 指令：执行查询； EXPLAIN 指令：provide the plain;

   

6. {a:1, b:2, c:3} 是 map 类型；

   

7. bolt接口的作用：binary protocol， 加密数据和压缩数据。

   

9. 属性的数据类型可以是： 数字，布尔值，字节，字符串，一列字符串，日期；

   

10. NEO4J browser 本身是不能创建新database的；

    

11. 载入csv用分号分隔符语句： 
    **LOAD CSV FROM "url" As row FIELD TERMINATOR ";"**
    
12.  WITH语句没有包含的参数 是不能被返回的；

​    

13. NEO4J DESKTOP支持的库： APOC, GRAPH Algorithms，GraphQL;

    

14. NEO4J 提供的UI: desktop， browser， bloom；

    

15. NEO4J 的create relation需要指定方向，但是match不需要；

    

15. NEO4J 提供了driver的语言有：python，java， go；

    

16. Neo4j 的输出格式有： PNG, CSV, SVG;

    

17. 删除label需要用 REMOVE 语句；查看节点的label种类：labels(xxx)