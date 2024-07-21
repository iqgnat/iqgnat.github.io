---
title: 计算引擎常用参数笔记
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

系统整理平时常用或常见的引擎参数。

<!--more-->

Hive 引擎并非一定用于查询，而是用于执行 SQL 查询任务。查询引擎和计算引擎的区别在于，查询引擎负责接收和解析 SQL 查询，并生成任务执行计划，而计算引擎则负责具体的数据处理和计算任务。Hive 可以通过配置选择不同的计算引擎来执行查询任务，以优化性能和资源利用率。

Hive引擎在执行SQL查询时，通常分为多个阶段。每个阶段都有特定的任务和处理步骤。

1. SQL词法、语法解析阶段： 确保输入的SQL语句是合法的，并生成初步的语法树
2. 语义分析阶段：基于解析得到的语法树，进行语义检查，验证列名、表名等是否存在，并进行类型检查。确保SQL语句在逻辑上是正确的，并生成逻辑计划。
3. 逻辑计划生成阶段：将语法树转换为逻辑操作树（Logical Plan），包括选择、投影、联接、分组等逻辑操作。确定查询操作的逻辑执行顺序。
4. 物理计划优化阶段： 将逻辑操作树转换为物理执行计划，选择合适的执行策略（MapReduce、Tez、Spark等）。
5. 任务划分阶段： 根据物理计划将查询划分为多个子任务（Task），并确定各任务之间的依赖关系。为实际执行做准备，确保任务之间的正确执行顺序。
6. 任务调度和执行阶段：根据生成的任务计划，调度各个任务在集群上执行。实际运行查询，包括数据读取、计算和写入。（Map,shuffle类）
7. 结果合并和输出阶段：收集所有任务的执行结果，并进行必要的合并操作，将结果输出到指定的存储位置（如HDFS或本地文件系统）。生成最终的查询结果，并确保结果的正确性和完整性。(reduce类)


Hive 引擎在执行过程中会生成 Map 输出文件，这些文件通常是 Map 任务的中间结果。即使使用 Tez、Spark 这样的优化引擎，Hive 也会生成和管理这些中间文件。



## Hive 查询引擎

+ ### 全局参数

1. 设置动态分区（最常用在回刷数据） 
   + set **hive.exec.dynamic.partition**=true：允许Hive在插入数据时自动创建必要的分区 
   + set **hive.exec.dynamic.partition.mode**=nonstrict：允许所有的分区字段都可以使用动态分区，而不要求必须指定至少一个静态分区。默认模式为strict，至少需要一个静态分区；
   + set hive.exec.dynamic.partitions.pernode=10000：限制每个节点上动态分区的数量，以防止资源消耗过大。该参数通常用于控制每个任务节点的资源使用情况;
   + set hive.exec.dynamic.partitions=10000; -- 限制整个作业可以创建的动态分区的数量，以防止作业生成过多的分区，消耗大量的元数据存储和管理资源;

2. 普通 JOIN 转换为 Map-side JOIN
   + set **hive.auto.convert.join** = true： Hive 会判断输入表的大小，并在合适的情况下将普通 JOIN 转换为 Map-side JOIN，避免了 Reduce 阶段，可以减少数据传输和节省资源。这对于小表和大表 JOIN 场景特别有效。从 Hive 0.11.0 版本开始，hive.auto.convert.join 默认是开启的。(Reducing Shuffles)
   
3. 临时表存储：优化查询执行计划，减少计算量和数据传输量，加快查询速度
   + set **hive.auto.convert.temporary.table**=true：自动将某些中间结果存储为临时表。适用于复杂的 HiveQL 查询，包括多个子查询、连接和聚合操作的场景在这些情况下，自动转换临时表可以显著提高查询效率
   
4. GROUP BY 阶段

   + **hive.optimize.skewjoin**：默认false。控制是否启用对数据倾斜的 Join 操作优化。通过将倾斜的 join 操作分割为多个较小的任务来实现。

   + **hive.groupby.skewindata**： 默认false。当设置为 true 时，Hive 会检测并处理数据倾斜，避免某些节点处理过多数据导致性能瓶颈。这通过将倾斜的键值分配到多个 reduce 任务来实现。 

   + **hive.exec.parallel** ：默认false。同一个 SQL 查询中的不同作业（jobs）是否可以同时运行。默认 Hive 在同一 SQL 查询中的作业是串行执行的。启用后，通过 hive.exec.parallel.thread.number 参数来控制并行执行的线程数。默认 Hive 使用 10 个线程来执行查询。

   + **hive.groupby.mapaggr**：默认false。控制是否在 GROUP BY 操作中使用 Map Aggregation。当设置为 true 时，Hive 会在 Map 阶段进行部分聚合，从而减少 Shuffle 数据量。这有助于降低网络传输和磁盘 I/O 负担。

   + **hive.groupby.mapaggr.checkinterval**：默认0（即禁用负载均衡）。设置在数据倾斜时进行负载均衡的频率。当设置为一个非零值时，Hive 会在指定的间隔内检查并进行负载均衡，以确保不会出现严重的倾斜现象。
   + **hive.query.results.cache.enabled**：默认false。控制是否启用查询结果缓存。当设置为 true 时，Hive 会缓存查询结果以提高后续相同查询的执行速度。这对于频繁执行相同查询的场景非常有用。
5. 合并小文件，以减少HDFS NameNode 的开销。
   + **hive.merge.smallfiles.maxsize**：小文件合并的最大大小，当小文件的总大小达到或超过此值时，Hive 将不再合并小文件。默认为 256MB。用于防止合并过大的小文件;
   + set **hive.merge.mapfiles**=true : 控制是否在作业输出目录中合并 Map 输出文件。默认为 true。合并小文件可以减少 NameNode 的负载，并提高查询性能;
   + set **hive.merge.mapredfiles**=true ：同时影响hive引擎和mapreduce引擎的文件合并策略。在Map-Reduce的任务结束时合并小文件。对于hive引擎，该参数可以控制是否在查询执行前合并小文件，以优化查询性能。对于mapreduce引擎，控制是否在作业输出目录中合并 Reducer 输出文件。默认为 false;
   + set **hive.merge.size.per.task**= 256*1000*1000：每个任务（Task）中的输出文件大小阈值。当一个任务输出文件大小小于该阈值时，会尝试进行文件合并操作。默认为 256MB。用于控制单个任务中输出文件的大小;
   + set **hive.merge.smallfiles.avgsize**=16000000 ：当输出文件的平均大小小于该值时，Hive 会尝试合并小文件, 启动一个独立的map-reduce任务进行文件merge。默认为 16MB。通过控制平均小文件的大小来决定合并策略;

6. 存储压缩（压缩中间结果，使用压缩技术减少存储和I/O开销）
   + **hive.exec.orc.default.compress**： 控制使用 ORC 格式存储时的默认压缩方式。ORC 是一种列式存储格式，压缩可以显著减少存储空间占用和数据传输成本。常用的有ZSTD和ZLIB。ZSTD 适合于需要高性能和良好压缩率的场景， 在较低压缩级别时可以非常快速，甚至比 ZLIB 的某些设置更快，同时仍保持较高的压缩率

7. 谓词下推
   + **hive.vectorized.execution.enabled**: 启用矢量化执行，可以提升包括谓词下推在内的多种优
   + **hive.optimize.ppd**: 在执行查询时，设置hive.optimize.ppd=true 可以将SQL查询中的谓词（如 WHERE 条件）推到数据源处进行过滤，以减少传输的数据量并提高查询效率
   + **hive.cbo.enable**: 启用基于成本的优化（CBO），这可以进一步优化查询计划，包括谓词下推



+ ### Hint 参数

  + **MAPJOIN**: 指示Hive在执行JOIN操作时使用Map端连接，将小表加载到Mapper的内存中，以减少Shuffle操作和提高性能。适用于一个参与JOIN的表很小（通常小于25MB）的情况，避免将其分发到Reducer节点。

  + **STREAMTABLE**: 指示Hive在执行JOIN操作时将另一个表作为流表处理，这意味着每个Mapper读取一行流表数据。用于处理一个表非常大而另一个表相对较小的情况，以避免内存不足和性能问题。

  + **BUCKET**: 指示Hive使用指定的Bucket列进行连接，用于执行Bucketed Map Join。当两个表都被分桶并且按照相同的分桶策略时，可以使用 Bucketed Map Join 来避免传统的 Shuffle Join 过程，在 Map 阶段直接通过哈希桶的映射关系进行连接操作，而不需要将全部数据传输到 Reduce 阶段再进行连接。这种方法减少了数据移动和网络传输，提升了执行效率，特别适合大型数据集的 JOIN 操作，能够显著减少处理时间和资源消耗。

  + **SORTMERGE**： 指示Hive使用Sort-Merge Join算法执行连接操作。适用于连接大型数据集时，可以提供更好的性能和内存管理。与MapReduce引擎中的MERGEJOIN具有相似的作用。相较于嵌套循环连接，排序合并连接在处理大型数据集时通常具有更好的性能，因为排序和合并操作的时间复杂度较低。但需要对连接字段进行排序，因此在内存或磁盘上可能需要额外的空间和时间成本。

  + **BROADCAST**：指示Hive将小表广播到所有的Mapper节点上。适用于一个表非常小而另一个表很大的情况，可以提高JOIN操作的性能。

  + **SKEWJOIN**：指示Hive在JOIN操作中处理数据倾斜的情况。帮助处理JOIN键中存在数据倾斜的情况，优化性能并避免任务失败。

  + **NO_COMPUTE_STATISTICS**：指示Hive不计算表的统计信息。用于禁止Hive在执行查询计划时自动计算表的统计信息，适用于某些特定的查询优化场景。



## Tez 执行计算引擎

Tez 可以将多个有依赖关系的作业合并为一个作业，减少了数据读写和中间节点，从而大大提升作业的计算性能和效率。支持更灵活的内存管理，特别适合处理内存密集型的计算任务，能够有效减少由于数据溢出到磁盘而引起的性能损失。与 MapReduce 不同，Tez 允许数据流在任务之间动态调整，这种灵活性使得复杂的计算模型更易于实现和优化。

排序在 Tez 引擎中非常常见。Tez 是为了提高 Hadoop MapReduce 的计算效率而设计的，其优化了数据流和任务执行模型，使得排序操作能够更加高效地执行。


+ ### 全局参数

Tez AM负责整个Tez应用的生命周期管理，包括资源分配、任务调度、故障处理等。它是整个Tez作业的核心协调者，确保任务能够顺利执行并监控任务的进展。Tez任务内存是为具体的每个Tez任务分配的内存。每个任务在执行时会使用这部分内存来处理数据、执行计算等操作。任务内存的设置影响单个任务的性能和内存使用效率。


1. tez.am.resource.memory.mb： 默认值1024 MB，控制Tez应用管理器在集群中的内存使用量，确保有足够的内存来处理任务。
2. tez.am.resource.cpu.vcores： 默认1，控制Tez应用管理器在集群中的CPU使用量，确保有足够的计算资源来处理任务
3. tez.task.resource.memory.mb： 默认值1024 MB，控制每个Tez任务的内存使用量，防止内存溢出，提高任务执行效率
4. tez.task.resource.cpu.vcores： 控制每个Tez任务的CPU使用量，确保任务有足够的计算资源来完成
5. tez.grouping.min-size： 默认52428800 (50 MB), 设置Tez任务分组的最小大小,控制任务分组的粒度，有助于优化任务调度和资源分配
6. tez.grouping.max-size: 默认 1073741824 (1 GB), 设置Tez任务分组的最大大小,控制任务分组的粒度，避免任务过大导致的资源分配不均和调度延迟



+ ### Hint参数

  + **tez.grouping.min-size**：指定数据分组的最小大小，用于在执行分组操作时优化性能。
  + **tez.grouping.max-size**：指定数据分组的最大大小，控制在执行分组操作时的最大数据量。
  + **tez.grouping.split-waves**：控制在执行分组操作时的并行度，即分组操作可以分成的波数。控制 Tez 作业在执行分组操作时的并行度。分组操作涉及将数据分组成波段（waves），该参数指定了可以并行进行分组的波段数。通过增加或减少波段数，可以调整数据分组操作的并行度。
  + **tez.grouping.flush.size**：指定在执行分组操作时，刷新缓冲区的大小。通过调整该参数，可以控制在何时以及多大的数据量触发缓冲区的刷新，进而影响整体的内存使用和排序性能。
  + **tez.runtime.sort.threads**：指定排序操作时使用的线程数，用于加速排序过程。
  + **tez.runtime.compress**：设置是否在执行时压缩数据，以减少数据传输和存储的成本。
  + **tez.runtime.io.sort.mb**：指定排序操作时的内存缓冲区大小。
  + **tez.runtime.sort.spill.percent**：指定在执行排序操作时，允许的内存溢出百分比。该参数影响了在内存中进行排序时，何时将排序结果写入磁盘（溢出到磁盘），以防止内存溢出。通过调整这个参数，可以平衡内存使用和排序性能。


## Spark 执行计算引擎

+ ### 全局参数

1. spark.executor.memory: 默认值 1g, 每个Executor的内存分配量。调整此参数可以提高任务的内存使用效率，避免内存不足导致的任务失败。
2. spark.executor.cores: 默认值 1, 每个Executor使用的CPU核心数。增加此参数可以提升并行处理能力，适用于多核CPU环境。
3. spark.driver.memory: 1g, Driver程序的内存分配量。确保Driver有足够的内存来处理任务的调度和协调。
4. spark.driver.cores: 1, Driver程序使用的CPU核心数。适当调整可以提高Driver的处理能力，尤其在处理复杂任务时。
5. spark.sql.shuffle.partitions: 默认200, Shuffle操作中分区的数量。调优此参数可以提高任务的并行度和性能，尤其是在大数据量处理时
6. spark.default.parallelism：依据集群的核心数自动设置，默认的并行度设置。影响RDD的操作并行度，调整此参数可以提高任务执行的并行性
7. spark.network.timeout：120s，网络超时时间设置。确保网络通信在合理时间内完成，防止因网络延迟导致的任务失败
8. spark.sql.autoBroadcastJoinThreshold：10MB， 广播连接的阈值。小于此值的表会被广播到所有节点，提高小表连接的性能



+ ### Hint参数

​	Broadcast Hint: 用于指定在执行 Join 操作时广播表的大小阈值，可以显著优化小表与大表的 Join 操作

​	Repartition Hint: 用于控制数据重分区的方式，可以指定分区数量或列，帮助优化数据分布和操作性能

​	Join Hint: 用于显式指定 Join 策略，如 Broadcast Join 或 Shuffle Hash Join，以便更精确地控制查询执行计划

​	Shuffle Partition Hint: 用于指定 Shuffle 操作的分区数，以调整数据的并行度和任务执行效率



## MR 执行计算引擎

特别适用于需要大量数据离线处理的场景，如日志分析、数据挖掘等。适用于处理PB级别以上的海量数据，能够有效扩展到大规模集群中。MapReduce 框架具备高度的容错性，能够在节点故障时自动重启任务，保证作业的稳定性和可靠性。

+ ### 全局参数

1. 内存参数

   + set **hive.execution.engine**=mr: 设置计算引擎为 mr；考量： 1. MR引擎在某些复杂的产讯或特定数据量下表现比tez、spark更稳定。2. tez或spark对内存要求较高； 3.MR日志和调试工具更完善

   + **mapreduce.map.memory.mb**：设置每个Map Task使用的内存量,确保每个Map Task有足够的内存运行，防止内存溢出 
   
   + **mapreduce.reduce.memory.mb**：设置每个Reduce Task使用的内存量, 确保每个Reduce Task有足够的内存运行，防止内存溢出 
   + **mapreduce.job.reduces/mapred.reduce.tasks**：设置作业中Reduce Task的数量，决定Reduce阶段的并行度，影响作业的性能和资源使用 
   
   + **mapreduce.task.timeout**： 设置Task的超时时间（单位：毫秒）， 超过了会直接报任务 fail, 防止任务长时间挂起
   + set **mapreduce.map.java.opts**=-Xmx3276： 设置map jvm内存。通常情况下，jvm内存大小会被配置为 mapreduce.map.memory.mb 的80%。这意味着分配给Map Task的容器内存中，有80%会用于JVM堆内存，剩余的20%则用于其他开销，如栈内存和非堆内存（例如，代码缓存和本地变量） 。Map Task和Reduce Task的主要处理步骤都会在独立的JVM中运行，确保每个任务的隔离性和资源控制。 
   
   + set **mapreduce.reduce.java.opts**=-Xmx3072： 设置reduce jvm内存。通常情况下，jvm内存大小会被配置为 mapreduce.reduce.memory.mb 的75%。这意味着分配给Reduce Task的容器内存中，有75%会用于JVM堆内存。
     
   
   + **mapreduce.input.fileinputformat.split.maxsize** / minsize：设置Map Task处理的输入数据分片的最大、最小（单位：字节），控制Map Task的输入数据量，影响任务的并行度和性能（maxsize)， 同时确保任务负载均衡(minsize)。分片尽量与物理数据块对齐，减少跨节点的数据传输，提高数据处理效率。数据切片太大会导致堆内存(heap space)溢出， 设置得太小会产生更多的map去执行。
   + **mapreduce.map.cpu.vcores**：设置每个Map Task使用的虚拟CPU核心数上限，避免一个任务占用过多的计算资源，导致其他任务执行效率下降
   
   + **mapreduce.reduce.cpu.vcores**：设置每个Reduce Task使用的虚拟CPU核心数上限，避免一个任务占用过多的计算资源，导致其他任务执行效率下降
   + set **mapreduce.job.queuename**=queue_name; #指定 MapReduce 作业提交到的 YARN 调度队列，允许用户将不同优先级或资源需求的作业分配到不同的队列中进行管理，确保重要作业能够优先获得资源执行。
   
2. 合并小文件

   1. Map输入 set **mapred.max.split.size**=256000000：每个Map最大输入大小，或者说指定一个数据块（Block）能被划分的最大大小。当一个数据块超过这个大小时，Hadoop 将其拆分为多个分片（Split）供多个 Mapper 处理。默认情况下，这个值由 HDFS 的块大小决定。通过调整这个参数，可以控制 Mapper 处理的数据量，影响作业的并行度和性能 set mapred.min.split.size.per.node=100000000：一个节点上split的至少的大小 set mapred.min.split.size.per.rack=100000000：一个交换机(机架 rack)下数据分片(split)的至少的大小

   2. 输出合并 set **hive.merge.mapredfiles**=true ：控制是否在作业输出目录中合并 Reducer 输出文件。默认为 false

      

+ ### Hint 参数

  + **Map Join Hints**（/*+ MAPJOIN(table_name) */ ）: 指示Map端的Join操作，将小表加载到内存中，提高Join操作的效率。
  + **Broadcast Join Hints**(/*+ BROADCASTJOIN(table_name) */): 将小表广播到所有Mapper节点，用于大表与小表的Join操作。
  + **Merge Join Hints**(/*+ MERGEJOIN(table_name) */): 指定Merge Join算法，用于有序数据的Join操作。
  + **Skew Join Hints**(/*+ SKEWJOIN(table_name) */): 处理数据倾斜的Join操作，可以指定如何处理倾斜数据。
  + **Partition Pruning Hints**（/*+ PARTITION(table_name partition_column=value) */）: 指定使用分区裁剪优化，减少不必要的数据读取。当数据表设计良好，并且查询中的 WHERE 条件能够直接映射到分区列时，直接在 WHERE 条件中筛选通常足够。

  

## 三种计算引擎对比

Tez直接源于MapReduce框架，核心思想是将Map和Reduce两个操作进一步拆分，即Map被拆分成Input、Processor、Sort、Merge和Output， Reduce被拆分成Input、Shuffle、Sort、Merge、Processor和Output等，这样，这些分解后的元操作可以任意灵活组合，产生新的操作，这些操作经过一些控制程序组装后，可形成一个大的DAG作业。tez作为一个框架工具，特定为hive和pig提供批量计算。Tez只能跑在yarn上。Tez能够及时的释放资源，重用container，节省调度时间，对内存的资源要求率不高。



Spark与Tez都是以DAG方式处理数据。Spark属于内存计算，支持多种运行模式，可以跑在standalone，yarn上。更像是一个通用的计算引擎，提供内存计算，实时流处理，机器学习等多种计算方式，适合迭代计算。spark如果存在迭代计算时，container一直占用资源。



Spark号称比MR快100倍，而Tez也号称比MR快100倍；二者性能都远超MR。在Hive的批处理数据任务中，可以根据SQL语句的不同段落来启用不同的计算引擎执行：

1. **Tez**: 适用于复杂的数据处理任务，能够通过优化任务执行顺序和并行度来提高执行效率

2. **Spark**: 适合需要快速、高效处理的任务，尤其是涉及到大规模数据的情况，通过内存计算模型提供良好的性能

3. **MapReduce**: 作为以往Hive的默认执行引擎，适合处理较为简单的批处理任务，将数据划分为小块并在集群上并行处理

   

这些引擎根据SQL的特性和优化需求来选择，可以在同一个Hive任务中根据需要进行切换和配置。在实际生产中，如果数据需要快速处理而且资源充足，则可以选择Spark；如果资源是瓶颈，则可以使用Tez；可以根据不同场景不同数据层次做出选择。





## 参考材料

1. Hive配置属性手册：https://www.docs4dev.com/docs/zh/apache-hive/3.1.1/reference/Configuration_Properties.html

2. 大数据局执行引擎MR、Tez和Spark对比： https://blog.csdn.net/ZZQHELLO2018/article/details/111593822