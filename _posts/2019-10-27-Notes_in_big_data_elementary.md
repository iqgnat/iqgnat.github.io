---
title: 大数据技术 - I
categories: 开发随笔
tags: hadoop
description: 
comments: true
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---



**行式存储与列式存储：**

传统的关系型数据库，如 Oracle、MySQL等采用行式存储法(Row-based)，一行中的数据在存储介质中以连续存储形式存在。Hbase、Gbase等分布式数据库均采用列式存储，一列中的数据在存储介质中以连续存储形式存在。 在大数据量查询场景中，列式数据库可在内存中高效组装各列的值，最终形成关系记录集，减少IO消耗，降低查询响应时间，存储更高效。

列式存储不太适用的场景：
	i.数据需要频繁更新的交易场景
	ii.表中列属性较少的小量数据库场景
	iii.不适合做含有删除和更新的实时操作

<!--more-->

1. 去“IOE”: 
   I=IBM,O=Oracle,E=EMC。他们代表着典型的高端数据库、数据仓库架构体系。存储空间需求的快速增长，应用的多样化、复杂化，计算压力和并发访问的快速增大。而IOE的升级成本高，却仍然要面临响应缓慢、高负载率Yarn, HDFS, 和MapReduce （MR） 是Hadoop的基础组件

2. HDFS集群:
   负责海量数据的存储，集群中的角色主要有NameNode /DataNode /SecondaryNameNode。
   YARN集群: 负责海量数据运算时的资源调度，集群中的角色主要有 ResourceManager /NodeManager
   MapReduce：一个应用程序开发包。

3. Spark 和 Hive 的角色
   Spark 是以RDD（优化map过程，运用内存）为核心的计算框架。

   Hive是建立在分布式存储系统（HDFS）上的SQL引擎，本身不存储数据，需要中间模块，起的是映射信息和目录的作用。它和底层打交道，做的是底层命令的转化、存储、查询、分析。适用的场景是数据仓库，元数据存储基于Hadoop做数据清洗（ETL），报表，数据分析等。注意: Oracle有非常严格的格式检查，而Hive没有。

4. SparkSQL和Hive都是类SQL的语句查询结果。 优点：类SQL语句包一层，来解决开发成本高的问题。

   Hive的增删改查,举例:  load data inpath local xxx into targetlist

   *注意，有 "local" 相当于复制到 hdfs, 而没有”local”*

   Spark的开发：

   一般用IntelliJ，很少用Eclipse。需要编译，编译完是个jar包。部署到工作流比较麻烦，所以一般通过命令行测试。程序中的参数优先级高于配置中的。JVM虚拟机临时表，只在当前的进程有效。

5. Kafka、Sqoop、Flume 的概念

   Kafka和Flume都是日志系统。

   Kafka是分布式消息中间件，并且自带存储(当系统堆积大量数据时，默认是7天，内存足够也可以更改更长时间）,但应该尽快消费所存数据。提供push和pull存取数据功能。flume分为agent（数据采集器）,collector（数据简单处理和写入）,storage（存储器）三部分，每一部分都是可以定制的。比如agent采用RPC（Thrift-RPC）、text（文件）等，storage指定用hdfs做。

   Flume是高可用的，高可靠的，分布式的海量日志采集、聚合和传输的系统。flume不仅可以采集数据，还可以对数据进行简单的处理。

   Sqoop是Hadoop体系下把数据从关系型数据库与大数据体系。存储系统之间相互导入导出的ETL工具。它的底层原理，是把指令解析编译成mr，然后发送到Yarn下去分布式执行，从而完成把数据在Rdbms和Hadoop体系下的迁移。

   Kafka系统的角色：
   Broker：
   一台kafka服务器就是一个broker （不同组件对服务器有不同的叫法）。一个集群由多个broker组成。一个broker可以容纳多个topic；

   Topic：
   可以理解为一个MQ消息队列的名字；

   Partition：
   为了实现扩展性，一个非常大的topic可以分布到多个 broker（即服务器）上，一个topic可以分为多个partition，每个partition是一个有序的队列。partition中的每条消息都会被分配一个有序的id（offset）。kafka只保证按一个partition中的顺序将消息发给consumer，不保证一个topic的整体 （多个partition间）的顺序；

   Broker和Partition 可以被理解为：数据的发布和订阅。

   注意，Kafka的Partition 是作冗余，备份用。(而Hive的Partition和Oracle的Partition一样，是确实的分区。)

6. 元数据的概念


   数据的数据，结构化的数据。举例，图书馆书籍的检索系统。

   HDFS的元数据存储在namenode的本地文件系统的目录里面，包含fsimage和edits文件；

   Hive的元数据是可以由用户来配置，存储在类似MySQL的关系型数据库里面；
   hbase的元数据包含两部分：meta表和root表，其meta表存储在hbase数据库中，root表存储在zookeeper中；

   关系型数据库的元数据，在数据库系统本身的数据字典表中；

   Sqoop2的元数据是存储在本身配置的关系型数据库中。默认的是derby数据库。
   kafka的元数据存储在zookeeper中。

7. 租户

   供以使用的资源。只能在资源范围内用，资源范围外，及时有空闲，也不给用。 需要评估，监控 硬件资源。关注的点很多： 技术组件多，不断迭代（维护、升级）等问题。

8. Mapreduce组件较少被提及了，Spark更热门的原因？

   因为它的发展不好，不够方便。除了存量，当下主要学和用Spark。Spark作计算框架，不做资源管理或存储框架。RDD (起cache的功能)是Spark的核心， RDD 不是直接构建，而是通过生产任务文件/目录构造。 Spark组件使用Scala开发的，因而采用“懒模型”（解释：只要没有action，前面即使有transform也不执行。直到出现action，才执行transform+action）。

9. 顶级开源项目一般都可以在apache找到资源
   Xxxx.apache.com

   举例： spark.apache.com

10. 大数据的技术选型
    根据业务场景选择。比如，Spark是流式运算，在秒级。而Storm则是毫秒级。

11. 数据格式选择
    parquet 和 orc  是列式压缩的格式效率高。

12. MongoDB的优劣势

    面向文档的数据库，直接存取BSON。MongoDB可以在文档中直接插入数组之类的复杂数据类型，并且文档的key和value不是固定的数据类型和大小。MongoDB在高可用和读负载均衡上的实现非常简洁和友好，MongoDB自带了副本集的概念，通过设计适合自己业务的副本集和驱动程序，可以非常有效和方便地实现高可用，读负载均衡。而在其他数据库产品中想实现以上功能，往往需要额外安装复杂的中间件。

    当数据量大，请求并发高的时候，用MongoDB存储和给前端提供高性能的存储方案合适。但是MongoDB的事务性不强，用到事务和需要复杂查询的应用建议不用MongoDB。另外MongoDB虽然可以关联表（类似JOIN）的操作，但是不鼓励。尽量用MongoDB只写入和查询。

    