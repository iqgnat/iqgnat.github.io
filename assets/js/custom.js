document.getElementById('search-form').addEventListener('submit', function(e) {
  e.preventDefault(); // 阻止表单默认提交行为
  var query = document.getElementById('search-input').value.toLowerCase(); // 获取并转换查询为小写
  var posts = document.querySelectorAll('#toc .toc-link'); // 获取所有文章链接

  posts.forEach(function(post) {
	var title = post.textContent.toLowerCase(); // 获取并转换文章标题为小写
	if (title.includes(query)) {
	  post.style.display = 'block'; // 显示匹配的文章
	} else {
	  post.style.display = 'none'; // 隐藏不匹配的文章
	}
  });
});