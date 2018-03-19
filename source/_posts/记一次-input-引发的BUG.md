---
title: 记一次 input 引发的BUG
date: 2018-03-19 18:13:58
tags: [Javascript,坑]
---

背景：最近公司在优化二类户的代码，其中有一个很重要的流程就是影像上传，客户在开户的过程中需要上传影像资料（给身份证正反面拍照或选择本地图片的方式）因为用户可能在口袋内上传或者在 h5 页面操作，在口袋内上传就用`aladdin`的方式，使用OCR上传，但是在 h5 时候就使用原生的 input 上传影像，监听它的 change 事件，监听值改变后做处理。
 本次优化的一项就是把影像上传这一部分抽成 VUE 组件，所以重构的时候就遇到了以下的BUG
 - 因为抽成了组件，所以上传身份证正反面的时候需要引两次组件。这个组件有两个选项，**手机拍照** 和 **选择本地图片** 当同时选择拍照的 或者同时选择两张一样的图片时候 第二次上传并不会生效。
 - 因为我们的input 是 动态生成，在 移动端的时候选择上传图片并没有生效。


考虑：第二次上传没有生效 原因可能是 input 没有监听到 change 事件，那为什么第一次有效，第二次没有生效的原因是什么。当input 在本地选择同一张照片的时候，第二次 change 事件没有更新，原因比较简单，因为只有在 input 的值发生改变的时候才 change 事件才会触发，当用户第二次选择的图片和第一次选择的图片一样的时候， js 判断 两次的改变相同，也就是说 js 并不会觉得你第二次发生 `change` 了，栗子如下 :
```javascript
var input = document.querySelector('input[type="file"]');
input.addEventListener('change',function(){
	console.log('被改变了')
	})
```
上面的例子如果选择同一张图片，第二次是不会有 `console` 的，那么如何让两次的操作都一样 也都能 触发 change 事件 呢？加上以下代码就好了

```javascript
var input = document.querySelector('input');
input.addEventListener('change',function(event){
	console.log('被改变了')
	event.target.value = ''
	})
```
那为什么拍照的时候 也不能区分 `change` 事件呢，我有一个大胆的猜想，就是 系统不会知道你拍照的时候是拍的什么，因为你两次调用的拍照，那么就索性认定为操作为同一个对象，所以第二次就不会出发 `change` 事件了。


现在来看看第二个问题，移动端选择照片没有生效，后来经过排查，发现这是 `safari` 的兼容问题，也就是动态生成元素，且没有生成 `DOM` 节点时 并且是用`click` 模拟触发事件，发现 `change` 事件并不会生效 ，以下是我们刚开始的代码。

``` javascript
	<button id="btn">点击触发input change 事件</button>
	<script>
		var demo = document.querySelector('#demo');
		btn.addEventListener('click',function(){
			var btn = document.createElement('input');
			btn.setAttribute('type','file')
			
			btn.addEventListener('change',function(){
				alert('changed')
			})
		btn.click()
		})

	</script>
```

这段代码在 `chrome` 里可以正常运行，但是在移动端里无法弹出`alert`，后来我们在动态创建 `input` 改成 直接在`DOM`中生成。

总结：对于 `DOM` 事件还是不太熟悉，经验太少! 