---
title: chrome 插件初探
date: 2017-08-12 23:43
tags:
---

Google chrome 插件利用了chrome 的内置原生的api，增强浏览器的功能，实现对网页的控制，监听页面的变化 网络请求 等等。

一个浏览器插件 包含了一个必不可少的manifest 文件，它是一个以json格式的配置文件，主要的功能类似于node 中的 package.json 文件 来描述插件的各种属性和对应的文件类型和功能. 大概就是这个样纸。
更具体的配置参见[官方文档](https://developer.chrome.com/extensions/manifest)

* "manifest_version":, 目前的版本是2（固定值）;
* “background” :如果需要你的插件在整个浏览器生命周期中运行（在后台监听你的页面）的话，你需要设置对应值，一般只需要设置js 文件 如需要设置对应的html  再加上 html 的value
* permissions：在chrome 插件的规则中，基本上每个事件都需要开启对应的权限，比如 你要操作选项卡 必须要启用 tabs ，获取 浏览器存储 必须要 启用 storage，网络请求需要 webRequest 等等，对应的权限 可在 [chrome 文档](https://developer.chrome.com/extensions/declare_permissions)中查看 
* option ：用于自定义你的chrome 插件的功能，点击选项跳转的页面 
* devtools_page ：如果你要添加开发者工具中的功能或者改变它的样式，你需要加上这个配置项。
* browser_action：定义了浏览器默认的规则，包括 插件的图标 点击图标弹出的网页。
``` json
{
  "name": "Fiddler For XHR",  
  "version": "1.0",
  "manifest_version": 2,  // 目前的版本是2（固定值）
  "description": "A extension only for post or get request",
  "background": {
    "scripts": ["js/background.js"]
  },
  "permissions": [
    "storage",
    "tabs",
    "webRequest",
    "webRequestBlocking",
    "<all_urls>"
  ],
  "options_page": "html/options.html",
  "devtools_page": "html/devtools.html",
  "browser_action": {
    "default_icon": "icon.png",
    "default_popup": "html/popup.html"
  }
}
```

今天主要是记录下这次工作需求中的一次插件开发，只要的功能是用了 `devtool `  的功能，需求是需要监听用户浏览的有关网页的xhr 请求，并且记录跳转之前的接口响应数据，另外根据我们的业务需求来对response 进行特殊的定制 和 内容展示。

在chrome 插件api 中 获取 xhr 的信息有两种方式 
* 通过webRequest 来请求，这样是监听用户get 和post 的资源 并且有requestId 也有响应头和请求头，
* 通过devtools.network 来监听面板中的 network 网络数据。

> 这两种方法都可以拿到请求的header 和 一些详细参数，但是 方法一不能获取到 发送请求后响应的信息。所以经过考虑 我们采用了方法2  

```javascript
// 监听浏览器的开发者网络面板所有的资源请求（无论成功或失败）
chrome.devtools.network.onRequestFinished.addListener(function
(request) {
//回调里面是资源的信息 包括请求头，响应头 cookie 等。
    if (/pingan.com.cn/.test(request.request.url)) {
        var url = request.request.url;
        var noresponse = "";
        request.getContent(function(content) {
// 获取响应的请求内容
            if (!content) {
                noresponse = "(无响应数据)";
            }
            var data = {
                url: url,
                requestId: (new Date().getMilliseconds())*(Math.floor(Math.random()*1000)),
                request: request,
                content: content,
                noresponse:noresponse
            }
            chrome.runtime.sendMessage(data, function(response) {})
        })
    }
})
```

经过测试。发现有些接口或资源出现无法获得 响应 的情况，初步判断是由于监听的是网络面板，有些请求来不及获取就跳过了。导致接受不到。
这个先mark 一下。看有没有更好的实现方式，