---
title: 环境配置：Jekyll在本地测试站点
categories: 开发随笔
tags: [工具]
description: 
comments: false
author: Tang Qi
sidebar:
  nav: docs-cn
aside:
  toc: true
layout: post
---

时隔几年，重回博客更新笔记。然而电脑在离职脱敏时进行过格式化，重新配置本地测试环境的时，遇到了版本冲突问题，在此记录。

<!--more-->

基于jekyll 框架， 根据配置本地生成环境顺序遇到的：

1. Windows 环境是否安装了合适版本的 Ruby。

   1. 目前最新的 ruby 版本是 3.3.3， 但这个版本会与 jekyll 4.3.3, jekyll 4.3.2, jekyll 4.2.2 或更早版本不兼容而出现以下报错（如下）。 在更新 jekyll 到最新版本 4.3.3 依然存在这个问题。 尝试issue提到的方案后，只有降级 ruby 从 3.3.3 到 3.2.3 能解决这个问题, 因此建议直接安装 ruby 3.2.3。另外，安装时明确到版本号第四位，也即 3.2.3.1。

      ```
      jekyll 4.2.2 | Error:  undefined method []' for nil
      C:/tools/ruby33/lib/ruby/3.3.0/logger.rb:384:in level': undefined method []' for nil (NoMethodError)
      	
          @level_override[Fiber.current] || @level
                         ^^^^^^^^^^^^^^^
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/jekyll-4.2.2/lib/jekyll/log_adapter.rb:45:in adjust_verbosity'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/jekyll-4.2.2/lib/jekyll/configuration.rb:143:in config_files'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/jekyll-4.2.2/lib/jekyll.rb:118:in configuration'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/jekyll-4.2.2/lib/jekyll/command.rb:44:in configuration_from_options'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/jekyll-4.2.2/lib/jekyll/commands/serve.rb:83:in block (2 levels) in init_with_program'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/mercenary-0.4.0/lib/mercenary/command.rb:221:in block in execute'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/mercenary-0.4.0/lib/mercenary/command.rb:221:in each'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/mercenary-0.4.0/lib/mercenary/command.rb:221:in execute'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/mercenary-0.4.0/lib/mercenary/program.rb:44:in go'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/mercenary-0.4.0/lib/mercenary.rb:21:in program'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/gems/jekyll-4.2.2/exe/jekyll:15:in <top (required)>'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/bin/jekyll:25:in load'
              from D:/git/iqgnat.github.io/vendor/bundle/ruby/3.3.0/bin/jekyll:25:in <main>'
      ```

      管理员权限终端语句：

      ```
      ruby -v (如果本地ruby版本)
      gem uninstall jekyll  (存在jekyll 依赖，先把jekyll删除)
      choco uninstall ruby --version 3.3.3 （删除与jekyll发生冲突的 ruby 3.3.3 版本）
      choco uninstall ruby.install
      C:\ProgramData\chocolatey\logs\chocolatey.log 
      choco install ruby --version=3.2.3 （报错： It is possible that version does not exist for 'ruby' at the source specified.）
      choco install ruby --version=3.2.3.1 (正常执行并安装，而后添加C:\tools\Ruby32-x64\bin到环境变量)
      ```



2. 安装 Ruby 过程中遇到 MSYS2 安装选项， 选 3

   ```
   1 - MSYS2 base installation
   2 - MSYS2 system update (optional)
   3 - MSYS2 and MINGW development toolchain
   
   Which components shall be installed? If unsure press ENTER
   ```

   

3. 重新安装 jekyll, bundle 安装gemfile中的依赖包。由于国内的网络环境访问 RubyGems 官方源可能会比较慢，使用国内镜像源可以显著提升下载速度。 但网上通用的方法： gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/， 并不起作用。最后的解决办法是： bundle config mirror.https://rubygems.org https://gems.ruby-china.com

   ```
   gem install bundler
   gem install jekyll
   cd myblog
   bundle config mirror.https://rubygems.org https://gems.ruby-china.com (配为国内镜像源)
   bundle install (提示gemfile中缺哪些依赖包，就在gemfile中添加上，再重新执行 bundle install)
   bundle exec jekyll serve --trace
   ```

![image-20240623195811103](https://raw.githubusercontent.com/iqgnat/iqgnat.github.io/master/assets/images/2024-06-23-Jekyll-Ruby-Windows-Local-Environment-Settings/01.png)



4. 在http://127.0.0.1:4000/打开

   

参考资料

1. [https://babyking.github.io/wiki/%E5%8D%9A%E5%AE%A2%E5%A4%87%E4%BB%BD/2020-02-24-ru-he-jie-jue-bundle-install-tai-man-de-wen-ti/](https://www.google.com/url?q=https://babyking.github.io/wiki/%E5%8D%9A%E5%AE%A2%E5%A4%87%E4%BB%BD/2020-02-24-ru-he-jie-jue-bundle-install-tai-man-de-wen-ti/&sa=D&source=calendar&usd=2&usg=AOvVaw1Xl9dd-794D4UBe_6c0I0c)

