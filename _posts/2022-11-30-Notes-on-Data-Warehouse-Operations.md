---
title: 离线数据任务开发笔记(持续更新)
categories: 开发随笔
tags: [建模]
description: 
comments: false
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

## 1. 数据分层逻辑

根据数据加工顺序的主要数据层：

+ 抽数(数据集成的出事阶段stage层)

  ​	通常来源于数据库 (结构化数据比如mysql，后台产生的业务数据，比如商品上架) 和消息日志文件 (半结构化数据，比如埋点产生的用户行为数据，常使用文本文件、JSON等格式存储，比如商品库存，价格变动) 。	常见的消息日志有消息队列 （比如Kafka），实时处理框架（Flink、Spark Streaming）。日志文件基本上用的是Flume + Kafka，Flume如果捕捉到有新的日志文件产生或者日志文件有新的数据产生会立即采集过来，所以一般数据量比较大，需要kafka进行缓存（削峰），然后再定量或定时存入hdfs,大致流程如下：

  日志文件=>Flume(Kafka生产者，日志采集)=>Kafka(缓存)=>Flume(Kafka消费者)=>hdfs

  ```mysql
  -- 数据源
  CREATE TABLE t_dim_goods (
      goods_id BIGINT NOT NULL COMMENT '商品ID',
      goods_name VARCHAR(255) NOT NULL COMMENT '商品名称',
      category_id BIGINT NOT NULL COMMENT '商品分类ID',
      price DECIMAL(10, 2) NOT NULL COMMENT '商品价格',
      create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      PRIMARY KEY (goods_id),
      KEY idx_category_id (category_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品信息主表';
  ```

  

+ ODS层（采集层、贴源层）：

  ​	在ods层基本只储存原始的业务实时操作数据，不做清洗和转换，需要保留数据的即时性和完整性，数据来源多样化。在不同数据来源间配置数据对账。由于时间格式等一致性问题，一般不对下游业务开放。保留较短的时间，一般为几个月至一年。

  ```hive
  CREATE EXTERNAL TABLE IF NOT EXISTS ods_auction_goods (
      item_id INT,
      item_name STRING,
      auction_price DOUBLE
  )
  ROW FORMAT DELIMITED
  FIELDS TERMINATED BY ','
  STORED AS TEXTFILE;
  ```

  

+ DWD层（明细层）：将ODS层的数据进行清洗、加工和主题数据的字段合并，形成有完整业务逻辑的集合，是业务层与后续数仓之间的隔离层。这层的数据可被用于支持下游业务的查询和报表需求。 DWD层保留比ODS更长的时间，也会被用于数据长期归档。

  

+ TMP层（临时层）：主要存放临时性数据，这些数据可能需要在数据处理过程中使用，但通常不会对外部用户或应用程序开放。TMP层的数据可以是在数据清洗、转换或加载过程中临时生成的，也可以是汇总的数据层，但由于数据敏感，权限管理等原因，不便对下游开放。

  

+ DWS层（汇总层）：在dwd层基础上，进一步聚合和汇总数据，以满足决策支持系统等需要高性能数据访问的应用。DWS层的数据通常被优化为多维度数据模型，常以视图的形式对下游开发，支持复杂的分析，业务报表生成，下游业务离线逻辑加工。搜推相关的在线业务依赖 实时的数据模型，一般不从离线的dws层获取。

  

+ ADS层（应用服务层）：为最终用户提供数据访问和服务的接口层，如数据API、数据可视化、活动报表等。直接服务于业务应用和决策支持系统。根据业务需求而定保留时间，数据量大的接口数据为便于查询，往往保留较短时间。用于报表查询的一般长期保留。



数仓需要进行实时数据流处理，数据抽取/采集，离线数据模型构建，质量监控计算治理存储治理，也需要做ETL工具和UDF的开发。



## 2. 执行引擎

1、**Presto** (将查询直接发送到Presto而不是Hive,通过Hive Connector与Hive Metastore和数据存储交互）

​	分布式 SQL 查询引擎，日常ad-hoc简单查询最常用，最好用。支持从 GB 到 PB 级别的数据量。快速处理大规模数据，它不存储数据本身，而是通过连接不同的数据源进行查询。对简单逻辑的查询非常好用、常用。

​	但 Presto 只支持简单的SQL语法，不支持正则(比如rlike）、自定义UDF或路径导入、having、lateral view、复合数据类型(比如map)、union all、时间转换函数、窗口函数(rank lead lag) 等。



2、**MapReduce**(set hive.execution.engine=mr)

​	用于复杂查询和处理大规模的离线批处理或ETL任务。稳定可靠，但速度较慢，适合大数据量的离线处理。通过将任务分解为Map和Reduce步骤，分布式地处理数据并汇总结果。这种方法适用于处理大量数据，但速度相对较慢。



3、**Tez** (set hive.execution.engine=tez)

​	优化 MapReduce 作业的执行效率，提供了更低的延迟和更高的吞吐量，适合需要更快速度的批处理。优化了执行模型(支持DAG)、减少中间数据存储(直接在内存中传递数据，大幅减少了磁盘I/O) 和高效的资源管理(与YARN更好地集成)。随着数据处理需求的增长，Tez的使用正在逐渐取代MapReduce，成为更为优选的选择。



4、**Spark**(set hive.execution.engine=spark)

​	在AI模型任务和实时数据处理中常用。支持内存计算，适用于需要高性能的场景，速度比MapReduce和Tez更快。通过将Spark作为执行引擎，Hive能够利用Spark的并行处理能力和内存计算优势，从而提高查询性能和处理速度。



## 3. 数据存储(压缩与编码)格式

**ORC **(列存储)：最常用默认的存储格式

- 优势： 高度压缩、高性能的列式存储格式，适合大数据量和复杂查询，支持复杂数据结构和谓词下推。  orc+snappy 效率高。
- 劣势： 初始化时间较长，不易与其他工具兼容。ORC不支持bzip2和Zip等支持文件分割的压缩算法， 如果该压缩文件很大，那么处理该文件的Map需要花费的时间会远多于读取普通文件的Map时间，造成Map读取文件的数据倾斜。
- 应用场景： 数据仓库、数据湖等需要高性能和高压缩比的大数据分析场景。

**Parquet**(列存储)

- 优势： 同样提供高度压缩和高性能的列式存储，支持多种压缩技术和编码策略，如字典编码和Run-Length Encoding (RLE)。使用Parquet存储+ lzo压缩的方式可以避免由于读取不可分割大文件引发的数据倾斜。
- 劣势： 初始化时间较长，不易与其他工具兼容。
- 应用场景： 大规模数据的存储和分析，特别是需要处理复杂数据结构和查询的场景

**TEXTFILE**：ODS层常用

- **优势：** 简单易用，与其他工具兼容性好。
- **劣势：** 不支持压缩和列式存储，占用存储空间较大，数据解析开销大。
- **应用场景：** 小规模数据存储和处理，以及需要与其他工具进行数据交互的场景

**SEQUENCEFILE** （少见）

- **优势：** 支持二进制存储和自定义数据类型，适合顺序读取和处理。
- **劣势：** 不支持列式存储和压缩，存储效率较低。
- **应用场景：** 适合需要顺序读取的场景，如日志文件处理等[[2](https://blog.csdn.net/goTsHgo/article/details/139587052)].

**RCFILE**（还没见过）

- **优势：** 列式存储和压缩，减少I/O操作，适合大数据量和高性能需求。
- **劣势：** 不易与其他工具兼容，配置和管理复杂。
- **应用场景：** 日志数据分析、实时查询等需要高性能和低存储消耗的场景[[4](https://blog.csdn.net/chenmingqi322304/article/details/127476756)].



## 4. 查询/计算优化

1. 热key(数据倾斜优化):

   1. 设置更多的Reduce任务数：SET mapreduce.job.reduces=多倍数；
      reduce太多，生成的小文件越多，对hdfs造成压力；reduce数量太少，每个reduce要处理很多数据，容易拖慢运行时间或者造成OOM

   2. ```hive
      --哈希处理：使用内置函数进行哈希分区
      SELECT hash(column) % num_buckets AS hashed_key, SUM(value)
      FROM (
          SELECT column, value
          FROM table_name
          CLUSTER BY column  --等价于distribute by column sort by column
      ) t
      GROUP BY hashed_key;
      ```

   3. ```hive
      -- 随机前缀（随机函数不在数仓使用，因为回刷或迁库会造成对账问题）
      SET hivevar:random_num = FLOOR(rand() * 10);
      
      SELECT
          CASE WHEN key = 'hotkey' THEN concat(${hivevar:random_num}, '_', key) ELSE key END AS hashed_key,
          value
      FROM
          table_name
      DISTRIBUTE BY ${hivevar:random_num};
      ```

2. 大key处理

   1. 数据分桶

      ```
      CREATE TABLE target_table (
          key_column STRING,
          value_column STRING
      )
      CLUSTERED BY (key_column) INTO <num_buckets> BUCKETS;
      ```

3. 快速数据抽样：

   ```hive
   -- ad-hoc查询中，除法抽样最快。比如1/1000抽样：
   create table *** as
   SELECT *
   FROM 
   (SELECT *,
           floor(rand(年月日分区作为种子保持一致)*10000) as random
   FROM ***
   ) t 
   where random between 1 and 10;
   ```

   ```hive
   -- 块抽样，随机
   SELECT *
   FROM iteblog1
   tablesample(BUCKET 1 OUT OF 10 ON rand());
   ```

   

## 5. 接口、切片加工

我印象最深的加工过的几个接口/切片

1. "历史最低价" 商品标签
2. 商品库存、价格接口
3. 各商品类目实验下的转化切片
4. 不同商品实验名下的转换切片
5. DSP/RTA拦截策略切片。渠道、点位、资源位、组合切片



涉及后端：

a. 数据流处理

+ Flink ：
  + 实时数据分析：在线广告请求流，需要低延迟和高精度的数据处理。
  + 事件驱动应用：在线交易和风控系统，需要对事件的实时响应和处理。

+ Spark Streaming：
  + 数据集成与ETL：从多个数据源提取、转换和加载数据，适合批处理和流处理相结合的场景。
  + 推荐系统：常用于搜推业务，如商品推荐，批次处理用户行为数据并实时更新推荐结果。
  + 日志处理：处理服务器日志，监控和分析系统性能。

b. 数据存储：Druid适合处理和分析数据，Redis适合快速读写操作，Kafka则适合实时数据流的处理和传输。

+ Druid(分布式分析数据库)：看板、切片、或加工业务分析需要调用的接口。支持实时数据摄取和快速查询，擅长处理和分析大量时间序列数据。分析用户行为数据，实时计算和展示各种统计指标，如每日销售额、用户活跃度等
+ Redis(内存数据结构存储)： 高性能、低延迟，支持多种数据结构（如字符串、列表、集合等），适用于快速读写操作。适用于需要快速响应和高并发读写操作的场景，常用作缓存层来加速数据库访问或存储实时数据。数仓中的某些频繁访问的统计结果（但对更新需求可能只是分钟级，不会快速大面积更新）可以将结果缓存到Redis中，提高查询响应速度，减轻数据仓库的负载。
+ Kafka(分布式流处理平台)： 用于构建数据管道，将实时数据流传输到数据仓库进行存储和分析。构建实时数据管道和流应用, 适用于数据流的实时处理和传输，如日志收集、监控数据聚合和流式数据处理。





## 6. 常用的计算引擎参数(MR&Tez)

1. 内存配置
   mapreduce.map.memory.mb = 4096;
   mapreduce.reduce.memory.mb = 8192;

   mapred.reduce.tasks

   mapreduce.job.reduces

2. SET hive.exec.orc.default.compress=ZSTD; set tez.grouping.min-size=00; set tez.grouping.max-size=00;

3. 谓词下推：set hive.auto.convert.temporary.table=false;

4. hive map 慢优化 ： 表关联键字段类型一致

5. 使用MapJoin优化小表与大表的JOIN操作。SET hive.auto.convert.join = true; (已经是自动了)

6. 并行执行，启用并行执行，提高查询效率。SET hive.exec.parallel = true;

7. 合并小文件，以减少HDFS NameNode的开销。

   SET hive.merge.smallfiles.avgsize = 256000000;
   SET hive.merge.mapfiles = true;

8. 数据倾斜处理，处理数据倾斜，避免某些节点负载过重。SET hive.groupby.skewindata = true;

1. **Reducing Shuffles**: 连接方式选择，选择合适的连接方式以优化查询性能。尽量减少数据在节点之间的传输。SET hive.auto.convert.join = true;
2. **Compression**: 压缩中间结果，使用压缩技术减少存储和I/O开销。SET hive.exec.compress.output = true;
3. **Map Side Aggregation**: 在map阶段进行聚合，减少数据传输。SET hive.groupby.mapaggr = true;
4. **Reduce Number of Map/Reduce Tasks**: 适当调整任务数量，避免过多的任务开销。SET  = 50000;
5. **Skew Join Optimization**: 使用skew join优化处理数据倾斜。SET hive.optimize.skewjoin = true;
6. **Parallel Execution**: 启用并行执行，提升性能。SET hive.exec.parallel = true;
7. **Increase JVM Heap Size**: 增加JVM堆大小，避免内存不足。SET mapreduce.map.memory.mb = 4096;
8. **Caching**: 在内存中缓存中间结果。SET hive.query.results.cache.enabled = true;
9. 启用向量化查询执行。SET hive.vectorized.execution.enabled = true;
10. set hive.auto.convert.join=true;set hive.mapjoin.smalltable.filesize = 3000000000;



7. ## 官方手册

Hive配置属性手册：https://www.docs4dev.com/docs/zh/apache-hive/3.1.1/reference/Configuration_Properties.html

hive 编程指南 

消息队列，kafka版： https://cloud.tencent.com/document/product/597/32544

[
https://blog.csdn.net/SunWuKong_Hadoop/article/details/81326385](https://www.google.com/url?q=https://blog.csdn.net/SunWuKong_Hadoop/article/details/81326385&sa=D&source=calendar&usd=2&usg=AOvVaw3WRdmo1xWQn0q1SYorH_kq)
参考书籍：《Hive编程指南》
Hive--官方参考文档：
1.用户手册
[https://cwiki.apache.org/confluence/display/Hive/Home#Home-UserDocumentation](https://www.google.com/url?q=https://cwiki.apache.org/confluence/display/Hive/Home%23Home-UserDocumentation&sa=D&source=calendar&usd=2&usg=AOvVaw076tYMtfIXk6lYVzWsqoBk)
2.管理员手册
[https://cwiki.apache.org/confluence/display/Hive/Home#Home-AdministrationDocumentation](https://www.google.com/url?q=https://cwiki.apache.org/confluence/display/Hive/Home%23Home-AdministrationDocumentation&sa=D&source=calendar&usd=2&usg=AOvVaw1Rnte_Vg4pqaCvuBtb_1Yt)
3.DDL操作：
[https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DDL](https://www.google.com/url?q=https://cwiki.apache.org/confluence/display/Hive/LanguageManual%2BDDL&sa=D&source=calendar&usd=2&usg=AOvVaw0oJThnvCTghlmhrZLguSt9)
4.DML操作：
[https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DML](https://www.google.com/url?q=https://cwiki.apache.org/confluence/display/Hive/LanguageManual%2BDML&sa=D&source=calendar&usd=2&usg=AOvVaw3Yd4PME5qkTKOe4XrDeaf3)
5.数据查询
[https://cwiki.apache.org/confluence/display/Hive/LanguageManual+Select](https://www.google.com/url?q=https://cwiki.apache.org/confluence/display/Hive/LanguageManual%2BSelect&sa=D&source=calendar&usd=2&usg=AOvVaw3mpAh6py0qhpokZtz1J8I4)
6.函数清单
[https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF](https://www.google.com/url?q=https://cwiki.apache.org/confluence/display/Hive/LanguageManual%2BUDF&sa=D&source=calendar&usd=2&usg=AOvVaw22O0plMcn7wfW1F_cxzsiv)



