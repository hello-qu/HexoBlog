/**
* Merge all `theme_config.*` options from main Hexo config into hexo.theme.config.
* This fixes an issue with hexo-renderer-stylus, which otherwise ignores these
* configuration overrides.
*/
hexo.on('generateBefore', function () {
  hexo.theme.config = Object.assign({}, hexo.theme.config, hexo.config.theme_config);
  
});


hexo.extend.generator.register('tags', function(locals){
  return {
    path: 'tags/index.html',
    data: hexo.config.tags,
    layout: ['tags', 'index']
  }
});

hexo.extend.tag.register('runkit', function(args, content){
  var elemetId = args;
  return `
  <script src="https://embed.runkit.com" data-element-id="${elemetId}"></script>
  <div id="${elemetId}">
      ${content}
  </div>
  `
}, {ends: true,async:true});