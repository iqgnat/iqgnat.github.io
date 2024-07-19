---
title: Hive踩坑合集与日常笔记
categories: 开发随笔
tags: [数仓]
description: 
comments: false
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

记录日常数据任务加工踩坑合集与行之有效的技巧。

<!--more-->

### 1. 数据倾斜治理

小倾斜的临时治理：调整并行度。增加Reduce任务的数量，以分散数据处理压力。数据倾斜会导致部分Reduce任务负载过重，而其他任务负载较轻，通过增加Reduce任务的数量和调整并行度，可以更均匀地分配负载，从而缓解数据倾斜问题。（reduce太多，生成的小文件越多，对hdfs造成压力；reduce数量太少，每个reduce要处理很多数据，容易拖慢运行时间或者造成OOM）:

MR引擎：SET mapred.reduce.tasks = <number_of_reducers>;
Tez引擎：SET hive.tez.auto.reducer.parallelism = true;
Spark引擎：SET spark.sql.shuffle.partitions = <number_of_partitions>;

```sql
-- 比如 tez
-- 启用Tez引擎
SET hive.execution.engine=tez;

-- 自动调整Reduce任务数量
SET hive.tez.auto.reducer.parallelism=true;

-- 设置初始Reduce任务数量
SET mapred.reduce.tasks=50000;
```

+ #### JOIN

1. 表关联键字段类型保持一致。相同数据类型的关联键有助于在数据处理过程中减少类型转换的开销，提高数据处理效率。距离： 如果key字段既有string类型也有int类型，默认的hash就都会按int类型来分配。把int类型都转为string，这样key字段都为string，hash时就按照string类型分配。

2. 存在热key：

   1. 手动切分热值。将热点值分析出来后，从主表中过滤出热点值记录，先进行MapJoin，再将剩余非热点值记录进行join，最后union all 两部分的Join结果.

   2. 哈希函数。哈希函数令不同的输入尽可能均匀地分布在整个输出空间中，减少哈希冲突的概率，每个分区的负载更加均衡 。通过哈希运算，也可以将热键值打散，使得相同的键值分布在不同的分区中。

      ```sql
      -- 哈希处理：使用内置函数进行哈希分区
      SELECT
          t1.other_columns,
          t2.other_columns
      FROM
          table1 t1
      JOIN
          table2 t2
      ON
          hash(t1.hashed_id) = hash(t2.hashed_id);
      ```

   3. 随机前缀改变默认的hash分区逻辑。避免同一Key的数据都落在一个Reduce任务中

      ```sql
      -- 随机前缀
      SELECT
          t1.other_columns,
          t2.other_columns
      FROM
          (SELECT CONCAT(CAST(FLOOR(RAND() * 10) AS STRING), '_', CAST(hashed_id AS STRING)) AS prefixed_id, other_columns FROM table1) t1
      JOIN
          (SELECT CONCAT(CAST(FLOOR(RAND() * 10) AS STRING), '_', CAST(hashed_id AS STRING)) AS prefixed_id, other_columns FROM table2) t2
      ON
          t1.prefixed_id = t2.prefixed_id;
      ```

   4. 分桶(比较少见)。将数据根据某一列进行预先分桶存储，确保数据均匀分布在多个桶中，再进行关联查询。

      ```
      -- 创建 table1 并按照 hashed_id 划分成 10 个桶
      CREATE TABLE table1_bucketed (
          id INT,
          other_columns STRING,
          hashed_id INT
      )
      CLUSTERED BY (hashed_id) INTO 10 BUCKETS
      STORED AS ORC;
      
      -- 创建 table2 并按照 hashed_id 划分成 10 个桶
      CREATE TABLE table2_bucketed (
          id INT,
          other_columns STRING,
          hashed_id INT
      )
      CLUSTERED BY (hashed_id) INTO 10 BUCKETS
      STORED AS ORC;
      ```

   5. 倍数小表。通过将小表的每一条记录复制多次，每次赋予不同的随机键值，使其在Join过程中能够更均匀地分布在各个Reduce任务中，从而减少数据倾斜问题。

      还可以将膨胀只局限作用于两表中的热点值记录，其他非热点值记录不变。先找到热点值记录，然后分别处理流量表和用户行为表，新增加一个`eleme_uid_join`列，如果用户ID是热点值，`concat`一个随机分配正整数（0到预定义的倍数之间，比如0~1000），如果不是则保持原用户ID不变。在两表Join时使用`eleme_uid_join`列。这样既起到了放大热点值倍数减小倾斜程度的作用，又减少了对非热点值无效的膨胀。不过可想而知的是这样的逻辑会将原先的业务逻辑SQL改得面目全非，因此不建议使用。

      ```sql
      SELECT
      eleme_uid,
      ...
      FROM (
          SELECT
          eleme_uid,
          ...
          FROM <viewtable>
      )t1
      LEFT JOIN(
          SELECT
          /*+mapjoin(<multipletable>)*/
          eleme_uid,
          number
          ...
          FROM <customertable>
          JOIN <multipletable> -- 倍数表，其值只有一列：int列，比如可以是从1到N（具体可根据倾斜程度确定），利用这个倍数表可以将用户行为表放大N倍
      )  t2
      ON t1.eleme_uid = t2.eleme_uid
      AND mod(t1.<value_col>,10)+1 = t2.number; -- 原先只按照用户ID分发导致的数据倾斜就会由于加入了number关联条件而减少为原先的1/N。但是这样做也会导致数据膨胀N倍。
      ```

3. 参数： 使用 `set hive.optimize.skewjoin=true;`或者SkewJoin Hint 来启用 Skew Join 特性。或者以下hint（不常用）：

   1. 大表 join 小表: /*+ mapjoin(small_table)*/, 在map阶段将指定小表的数据全部加载在内存中; （已经是自动了）；
   2. 大表 join 中表: /*+distmapjoin(<table_name>(shard_count=<n>,replica_count=<m>))*/, 加强版mapjoin， 通过将中型表通过分片将数据更高效地加载到内存中。并发度=shard_count * replica_count;
   3. 小表 join 大表: /*+ STREAMTABLE(big_table) */，显式提醒hive哪一个是大表。 将大表以流式方式处理，	从而避免将其加载到内存中。



+ #### GROUP BY 

  1. 设置Group By防倾斜的参数;

  2. 添加随机数,把引起长尾的Key进行拆分:

     ```sql
     --假设长尾的Key已经找到是KEY001
     SELECT  a.Key
             ,SUM(a.Cnt) AS Cnt
     FROM(SELECT  Key
                 ,COUNT(*) AS Cnt
                 FROM    <TableName>
                 GROUP BY Key
                 ,CASE WHEN KEY = 'KEY001' THEN Hash(Random()) % 50
                  ELSE 0
                 END
             ) a
     GROUP BY a.Key;
     ```

  3. 创建滚存表。对于线上任务而言，每次都要读取`T-1`至`T-365`的所有分区其实是对资源的很大浪费，创建滚存表可以减少分区的读取:

     ```sql
     --创建滚存表
     CREATE TABLE IF NOT EXISTS m_xxx_365_df
     (
       shop_id STRING COMMENT,
       last_update_ds COMMENT,
       365d_open_days COMMENT
     )
     PARTITIONED BY
     (
       ds STRING COMMENT '日期分区'
     )LIFECYCLE 7;
     --假定365d是 2021.5.1-2022.5.1，先完成一次初始化
     INSERT OVERWRITE TABLE m_xxx_365_df PARTITION(ds = '20220501')
       SELECT shop_id,
              max(ds) as last_update_ds,
              sum(is_open) AS 365d_open_days
       FROM table_xxx_di
       WHERE dt BETWEEN '20210501' AND '20220501'
       GROUP BY shop_id;
     --那么之后线上任务要执行的是
     INSERT OVERWRITE TABLE m_xxx_365_df PARTITION(ds = '${bizdate}')
       SELECT aa.shop_id, 
              aa.last_update_ds, 
              365d_open_days - COALESCE(is_open, 0) AS 365d_open_days --消除营业天数的无限滚存
       FROM (
         SELECT shop_id, 
                max(last_update_ds) AS last_update_ds, 
                sum(365d_open_days) AS 365d_open_days
         FROM (
           SELECT shop_id,
                  ds AS last_update_ds,
                  sum(is_open) AS 365d_open_days
           FROM table_xxx_di
           WHERE ds = '${bizdate}'
           GROUP BY shop_id
           UNION ALL
           SELECT shop_id,
                  last_update_ds,
                  365d_open_days
           FROM m_xxx_365_df
           WHERE dt = '${bizdate_2}' AND last_update_ds >= '${bizdate_365}'
           GROUP BY shop_id
         )
         GROUP BY shop_id
       ) AS aa
       LEFT JOIN (
         SELECT shop_id,
                is_open
         FROM table_xxx_di
         WHERE ds = '${bizdate_366}'
       ) AS bb
       ON aa.shop_id = bb.shop_id;
     ```

+ #### COUNT 

1. 参数设置调优;

2. 通用两阶段聚合,拼接随机数:

   ```sql
   --方式1：拼接随机数 CONCAT(ROUND(RAND(),1)*10,'_', ds) AS rand_ds
   SELECT  SPLIT_PART(rand_ds, '_',2) ds
           ,COUNT(*) id_cnt
     FROM (
           SELECT  rand_ds
                   ,shop_id
           FROM    demo_data0
           GROUP BY rand_ds,shop_id
           )
   GROUP BY SPLIT_PART(rand_ds, '_',2);
   
   --方式2：新增随机数字段 ROUND(RAND(),1)*10 AS randint10
   SELECT  ds
           ,COUNT(*) id_cnt
   FROM    (SELECT  ds
                    ,randint10
                    ,shop_id
              FROM  demo_data0
           GROUP BY ds,randint10,shop_id
           )
   GROUP BY ds;
   ```

3. 借助另一个均匀字段。如果GroupBy与Distinct的字段数据都均匀，先GroupBy两分组字段（ds和shop_id）再使用 count(distinct) 命令。

   ```sql
   SELECT  ds
           ,COUNT(*) AS cnt
   FROM(SELECT  ds
               ,shop_id
               FROM    demo_data0
               GROUP BY ds ,shop_id
       )
   GROUP BY ds;
   ```

+ #### ROW_NUMBER（TopN）

​	增加随机列或拼接随机数，将其作为分区（Partition）中一参数。进行两次row_number

+ #### 动态分区

1. 参数配置优化;
2. 裁剪优化:通过查找到存在记录数较多的分区, 过滤上述分区插入后，再单独插入大记录数分区数据。



### 2. 语法踩坑

1. LATERAL VIEW explode：当explode函数的输入值为空时或者explode后的数据为空(解析不出来)， lateral view不会生成任何输出行，导致数据丢失。加 outer (lateral view outer explode) 只针对 null 扩展，同样不能解析空字符串。

   ```sql
   SELECT ip,req_cnt,req_refuse_cnt,req_refuse_rate,collect_set(did) as did_list
   FROM
   (
       SELECT ip,
               sum(req_cnt) as req_cnt,
               sum(req_refuse_cnt) as req_refuse_cnt,
               sum(req_refuse_cnt)/sum(req_cnt) as req_refuse_rate,
               concat_ws(',',collect_set(concat_ws(',',did_list))) did_list_tmp
       FROM xxx.ip_feat_hr
       where pt ='${env.YYYYMMDD}'
       group by ip
   ) a 
   LATERAL VIEW explode(split(did_list_tmp,',')) k as did
   GROUP BY ip,req_cnt,req_refuse_cnt,req_refuse_rate
   ```

2. full outer join 作用于超过2个表，前两个表都有的key与第三张表匹配数据会出现多条重复数据，因为多个表之间的连接条件可能产生多对多的匹配。解决方式：

   ```sql
   SELECT 
       A.column2, 
       B.column2, 
       C.column2
   FROM 
       (
           (SELECT month, column2 FROM table1) A
           FULL OUTER JOIN
           (SELECT month, column2 FROM table2) B 
               ON A.month = B.month
           FULL OUTER JOIN
           (SELECT month, column2 FROM table3) C 
               ON ISNULL(A.month, B.month) = C.month
       )
   ```


3. 两个不同时效性的表进行 union：天级表的调度时间所以不能直接用 pt = '${env.YYYYMMDD}'，因为今天的分区可能还没有开始执行。天级表此时取 max_partition 来 union 。也就是取时效性高的表写环境时间，取时效性低的表写 max_partition。


4. 报错：distinct on different columns not supported with skew in data。当数据倾斜（即某些键值的出现频率远高于其他键值）存在时，Hive 的 distinct 操作可能会失败。特别对多个列应用distinct时，数据倾斜会更加明显，因为计算可能无法均匀分布在所有节点上。当  hive.groupby.skewindata 设置为 true 时，Hive 尝试处理数据倾斜问题，但对于对多个列执行 distinct 操作时，可能不支持这种操作。 解决方法: 

   a. 禁用数据倾斜优化; b. 使用不同的方法进行去重, 比如通过子查询或临时表先进行去重; c. 确保数据在进行 distinct 操作之前均匀分布

      

### 3. 常用语法

1. GROUPING__ID 的计算方法：在 Hive 3.1+ 中，不需要进行倒叙，二进制计算参与聚合的为 0，不参与的为 1，然后计算十进制结果。 （Hive 进行过更新，在旧版本中（如1.2）的计算方法和新版本的（hive 2.3.0之后）的结果，两者是不一致的。而 spark、presto 则和 hive 新版本的结果一致）:

   GROUPING_ID(col1, col2, col3) = GROUPING(col1) * pow(2,2) + GROUPING(col2) * pow(2,1) + GROUPING(col3) * pow(2,0)

   ```sql
   -- https://juejin.cn/post/7162536883254214693
   select 
     grouping__id as id,
     province,
     city,
     county
   from region
   group by province,city,county
   grouping sets (
     (),
     (province),
     (province,city),
     (province,city,county)
   )
   order by grouping_id
   ```

2. 快速数据抽样：

   ```sql
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

   ```sql
   -- 块抽样，随机
   SELECT *
   FROM iteblog1
   tablesample(BUCKET 1 OUT OF 10 ON rand());
   ```

3. 滑窗函数: preceding / following
   range是逻辑窗口，它基于当前行的排序值来定义范围。RANGE BETWEEN INTERVAL 5 MINUTE PRECEDING AND CURRENT ROW 指定了当前行的时间值向前推5分钟的范围。
   rows是物理窗口，即根据order by 子句排序后，取的前N行及后N行的数据计算（与当前行的值无关，只与排序后的行号相关）

   ```sql
   avg(pay_ordr_rate_7d_toctl) over (order by pt rows between 30 preceding and current row) as all_hit_mov_avg 
   ```

4. row_number 窗口函数去重, 通过PARTITION BY子句定义分组标准，通过ORDER BY子句定义排序规则，精确地保留特定记录。 with as 增加hive 可读性。

   ```sql
   select 
       pt, count(1) as did_new_add 
   from 
   (
       SELECT did_md5, pt, row_number() over (partition by did_md5 order by pt) as rn 
       FROM `xxx`.`alg_did_gang_i_d`
       WHERE `pt` between '2022-10-17' and '2022-10-23'
       and source = 'get_lv'
   ) tmp 
   where rn = 1 
   group by pt;
   -- 或者 
   WITH ranked_data AS (
       SELECT did_md5, pt, row_number() over (partition by did_md5 order by pt) as rn
       FROM `xxx`.`alg_did_gang_i_d`
       WHERE `pt` between '2022-10-17' and '2022-10-23'
   )
   SELECT pt, count(1) as did_new_add 
   FROM ranked_data
   WHERE rn = 1
   group by pt;
   ```

5. window， 对于多个字段加工中，用到相同的窗口。

   ```sql
   create table goods_max_discount as 
   select 
       goods_id
       ,site_id
       ,first_value(mrk_prc) over w1
       ,first_value(nvl(min_gaprc, prc)) over w1 as min_onsle_prc
       ,first_value((mrk_prc -  nvl(min_gaprc, prc)) / mrk_prc) over w1 as discount
   from xxx.sku_prc
   where pt = '2023-02-15' and hr ='21'
   window w1 as (
       PARTITION by
           goods_id
           ,site_id
       order by
           discount desc -- 取折扣最大对应的goods信息
           ,rgn_grp_id desc -- 排序稳定
       )
   ```

6. 处理json数据，get_json_object 和 json_tuple 函数 对比。 get_json_object 是用于从 JSON 字符串中提取指定的字段。它根据 JSON 路径提取值，并且适合用于从复杂 JSON 结构中提取单个字段的值。json_tuple 是用于从 JSON 字符串中提取多个字段的值。它一次解析 JSON 字符串，并返回指定的多个字段，适合从 JSON 中提取多个值时使用。
   如果提取三个或以上的字段， json_tuple 比 get_json_object 高效，因为它在解析 JSON 字符串时一次性提取多个字段。

   ```sql
   SELECT get_json_object('{"name":"John", "age":30}', '$.name') AS name; -- John
   SELECT json_tuple('{"name":"John", "age":30}', 'name', 'age') AS (name, age)-- John   30
   ```

7. 日期小时拼接为时间

   ```sql
   STR_TO_DATE(CONCAT(xs.`forcastDate`,' ',xs.`hour`),'%Y-%m-%d %H')
   
   -- 只考虑 24h 的回刷
   
   SELECT  
       CONCAT(max_partition( 'mktrc' , 'xxx' , "pt"),' ',max_partition( 'mktrc' , 'strg_ordr_actv_src_result_i_hr' , "hr")) ,
       unix_timestamp(CONCAT(max_partition( 'xxx' , 'xxx' , "pt"),' ',max_partition( 'xxx' , 'xxx' , "hr")), 'yyyy-MM-dd HH'), 
       from_unixtime(unix_timestamp(CONCAT(max_partition( 'xxx' , 'strg_ordr_actv_src_result_i_hr' , "pt"),' ',max_partition( 'mktrc' , 'strg_ordr_actv_src_result_i_hr' , "hr")) , 'yyyy-MM-dd HH' )  - 86400)
   ```

8. group by 后 map 格式返回。 对源表进行group by之后对另外两个字段变成key-value存成一个map：

   ```sql
   str_to_map(concat_ws(",",collect_set(concat_ws(':', mobilegid, cast(value as string)) ))) as gids
   ```

9. 取 IP 二段： SELECT regexp_extract('255.255.255.255', '\\d+\\.\\d+', 0) AS ip_seg

10. 在SQL中调用自写脚本UDF： TRANSFORM 关键字。

1. 继承org.apache.hadoop.hive.ql.exec.UDF类实现evaluate
2. 添加jar包: add jar /root/NUDF.jar;
3. 创建临时函数:create temporary function getNation as 'cn.itcast.hive.udf.NationUDF';
4. 调用: select id, name, getNation(nation) from beauty;

11. transform: 在日常数据任务中调用AI模型(可以使用任何支持的脚本语言)

    ```sql
    create TABLE u_data_new as
    SELECT user_id, user_name 
    FROM user_data 
    TRANSFORM (user_id, user_name) 
    USING 'python /path/to/transform_script.py';
    -- transform_script.py 是一个 Python 脚本，它会接收 user_id 和 user_name 作为输入，进行处理，然后输出处理后的结果。
    ```

12. 一些DDL操作：

    ```sql
    -- alter table table_name1 to table_name2; （在实际生产中禁用）
    -- 增加字段(在生产中只允许在结尾)
    ALTER TABLE table_name ADD COLUMNS (column_name column_type [COMMENT 'column_description']);
    ALTER TABLE employees ADD COLUMNS (
      salary DOUBLE COMMENT 'Employee salary',
      hire_date DATE COMMENT 'Date when the employee was hired'
    );
    -- 在指定字段位置增加字段，在实际生产中禁用（在 Hive 3.0 及以上版本中支持）， name 字段之后新增 address 字段
    ALTER TABLE employees ADD COLUMNS (address STRING AFTER name);
    
    -- 修改字段(在实际生产中不允许改列名)
    ALTER TABLE table_name CHANGE old_column_name new_column_name new_data_type;
    ```



### 4. 查询手册

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

7.相似类型产品参考类比：https://help.aliyun.com/zh/maxcompute/?spm=a2c4g.11186623.0.0.48022691zziT0B
