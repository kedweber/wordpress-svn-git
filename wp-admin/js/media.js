var findPosts;(function(a){findPosts={open:function(d,c){var b=document.documentElement.scrollTop||a(document).scrollTop();if(d&&c){a("#affected").attr("name",d).val(c)}a("#find-posts").show().draggable({handle:"#find-posts-head"}).resizable({handles:"all",minHeight:150,minWidth:280}).css({top:b+50+"px",left:"50%",marginLeft:"-200px"});a(".ui-resizable-handle").css({backgroundColor:"#e5e5e5"});a(".ui-resizable-se").css({border:"0 none",width:"15px",height:"16px",background:"transparent url(images/se.png) no-repeat scroll 0 0"});a("#find-posts-input").focus().keyup(function(f){if(f.which==27){findPosts.close()}});return false},close:function(){a("#find-posts-response").html("");a("#find-posts").draggable("destroy").resizable("destroy").hide()},send:function(){var b={};b.ps=a("#find-posts-input").val();b.action="find_posts";b._ajax_nonce=a("#_ajax_nonce").val();if(a("#find-posts-pages:checked").val()){b.pages=1}else{b.posts=1}a.ajax({type:"POST",url:ajaxurl,data:b,success:function(c){findPosts.show(c)},error:function(c){findPosts.error(c)}})},show:function(b){if(typeof(b)=="string"){this.error({responseText:b});return}var c=wpAjax.parseAjaxResponse(b);if(c.errors){this.error({responseText:wpAjax.broken})}c=c.responses[0];a("#find-posts-response").html(c.data)},error:function(b){var c=b.statusText;if(b.responseText){c=b.responseText.replace(/<.[^<>]*?>/g,"")}if(c){a("#find-posts-response").html(c)}}};a(document).ready(function(){a("#find-posts-submit").click(function(b){if(""==a("#find-posts-response").html()){b.preventDefault()}});a("#doaction, #doaction2").click(function(b){a('select[name^="action"]').each(function(){if(a(this).val()=="attach"){b.preventDefault();findPosts.open()}})})})})(jQuery);