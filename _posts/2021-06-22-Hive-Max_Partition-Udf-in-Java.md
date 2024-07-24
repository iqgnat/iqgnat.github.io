---
title: Hive Udf MAX_PARTITION
categories: 开发随笔
tags: [java]
description: 
comments: false
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

用于hive的max_partition的udf，作用是返回已经加工完成的最近时间分区：

```java
import org.apache.hadoop.hive.ql.exec.UDF;
import org.apache.hadoop.hive.ql.exec.Description;
import org.apache.hadoop.io.Text;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Description(
    name = "max_partition",
    value = "_FUNC_() - Returns the latest time partition from a specified Hive table",
    extended = "Example:\n"
    + "  > SELECT max_partition('database_name', 'table_name') FROM dual;\n"
    " 
)
public class MaxPartitionUDF extends UDF {

    public Text evaluate(String databaseName, String tableName) {
        Text latestPartition = new Text();
        Connection connection = null;
        Statement statement = null;
        ResultSet resultSet = null;

        try {
            // Connect to Hive
            String url = "jdbc:hive2://your-hive-server:10000/" + databaseName;
            connection = DriverManager.getConnection(url, "your-username", "your-password");
            statement = connection.createStatement();

            // Query to get the latest partition
            String query = "SHOW PARTITIONS " + tableName + " ORDER BY partition DESC LIMIT 1";
            resultSet = statement.executeQuery(query);

            // Retrieve the latest partition
            if (resultSet.next()) {
                latestPartition.set(resultSet.getString(1));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (resultSet != null) resultSet.close();
                if (statement != null) statement.close();
                if (connection != null) connection.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return latestPartition;
    }

    public static void main(String[] args) {
        MaxPartitionUDF udf = new MaxPartitionUDF();
        System.out.println(udf.evaluate("your_database", "your_table"));
    }
}
```

