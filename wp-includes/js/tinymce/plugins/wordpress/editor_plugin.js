(function(){var a=tinymce.DOM;tinymce.create("tinymce.plugins.WordPress",{mceTout:0,init:function(c,d){var e=this,h=c.getParam("wordpress_adv_toolbar","toolbar2"),g=0,f,b,i;f='<img src="'+d+'/img/trans.gif" class="mceWPmore mceItemNoResize" title="'+c.getLang("wordpress.wp_more_alt")+'" />';b='<img src="'+d+'/img/trans.gif" class="mceWPnextpage mceItemNoResize" title="'+c.getLang("wordpress.wp_page_alt")+'" />';if(getUserSetting("hidetb","0")=="1"){c.settings.wordpress_adv_hidden=0}c.onPostRender.add(function(){var j=c.controlManager.get(h);if(c.getParam("wordpress_adv_hidden",1)&&j){a.hide(j.id);e._resizeIframe(c,h,28)}});c.addCommand("WP_More",function(){c.execCommand("mceInsertContent",0,f)});c.addCommand("WP_Page",function(){c.execCommand("mceInsertContent",0,b)});c.addCommand("WP_Help",function(){c.windowManager.open({url:tinymce.baseURL+"/wp-mce-help.php",width:450,height:420,inline:1})});c.addCommand("WP_Adv",function(){var j=c.controlManager,k=j.get(h).id;if("undefined"==k){return}if(a.isHidden(k)){j.setActive("wp_adv",1);a.show(k);e._resizeIframe(c,h,-28);c.settings.wordpress_adv_hidden=0;setUserSetting("hidetb","1")}else{j.setActive("wp_adv",0);a.hide(k);e._resizeIframe(c,h,28);c.settings.wordpress_adv_hidden=1;setUserSetting("hidetb","0")}});c.addCommand("WP_Medialib",function(){var k=c.getParam("wp_fullscreen_editor_id")||c.getParam("fullscreen_editor_id")||c.id,j=tinymce.DOM.select("#wp-"+k+"-media-buttons a.thickbox");if(j&&j[0]){j=j[0]}else{return}tb_show("",j.href);tinymce.DOM.setStyle(["TB_overlay","TB_window","TB_load"],"z-index","999999")});c.addButton("wp_more",{title:"wordpress.wp_more_desc",cmd:"WP_More"});c.addButton("wp_page",{title:"wordpress.wp_page_desc",image:d+"/img/page.gif",cmd:"WP_Page"});c.addButton("wp_help",{title:"wordpress.wp_help_desc",cmd:"WP_Help"});c.addButton("wp_adv",{title:"wordpress.wp_adv_desc",cmd:"WP_Adv"});c.addButton("add_media",{title:"wordpress.add_media",image:d+"/img/image.gif",cmd:"WP_Medialib"});c.onBeforeExecCommand.add(function(q,p,t,m,k){var w=tinymce.DOM,l,j,s,v,u,r;if("mceFullScreen"==p){if("mce_fullscreen"!=q.id&&w.select("a.thickbox").length){q.settings.theme_advanced_buttons1+=",|,add_media"}}if("JustifyLeft"==p||"JustifyRight"==p||"JustifyCenter"==p){l=q.selection.getNode();if(l.nodeName=="IMG"){r=p.substr(7).toLowerCase();u="align"+r;j=q.dom.getParent(l,"dl.wp-caption");s=q.dom.getParent(l,"div.mceTemp");if(j&&s){v=q.dom.hasClass(j,u)?"alignnone":u;j.className=j.className.replace(/align[^ '"]+\s?/g,"");q.dom.addClass(j,v);if(v=="aligncenter"){q.dom.addClass(s,"mceIEcenter")}else{q.dom.removeClass(s,"mceIEcenter")}k.terminate=true;q.execCommand("mceRepaint")}else{if(q.dom.hasClass(l,u)){q.dom.addClass(l,"alignnone")}else{q.dom.removeClass(l,"alignnone")}}}}});c.onInit.add(function(k){var j=k.getParam("body_class","");k.onNodeChange.add(function(m,l,o){var n;if(o.nodeName=="IMG"){n=m.dom.getParent(o,"dl.wp-caption")}else{if(o.nodeName=="DIV"&&m.dom.hasClass(o,"mceTemp")){n=o.firstChild;if(!m.dom.hasClass(n,"wp-caption")){n=false}}}if(n){if(m.dom.hasClass(n,"alignleft")){l.setActive("justifyleft",1)}else{if(m.dom.hasClass(n,"alignright")){l.setActive("justifyright",1)}else{if(m.dom.hasClass(n,"aligncenter")){l.setActive("justifycenter",1)}}}}});if(k.id!="wp_mce_fullscreen"&&k.id!="mce_fullscreen"){k.dom.addClass(k.getBody(),"wp-editor")}else{if(k.id=="mce_fullscreen"){k.dom.addClass(k.getBody(),"mce-fullscreen")}}k.onBeforeSetContent.add(function(l,m){if(m.content){m.content=m.content.replace(/<p>\s*<(p|div|ul|ol|dl|table|blockquote|h[1-6]|fieldset|pre|address)( [^>]*)?>/gi,"<$1$2>");m.content=m.content.replace(/<\/(p|div|ul|ol|dl|table|blockquote|h[1-6]|fieldset|pre|address)>\s*<\/p>/gi,"</$1>")}});if(j){k.dom.addClass(k.getBody(),j)}});if("undefined"!=typeof(jQuery)){c.onKeyUp.add(function(l,m){var j=m.keyCode||m.charCode;if(j==g){return}if(13==j||8==g||46==g){jQuery(document).triggerHandler("wpcountwords",[l.getContent({format:"raw"})])}g=j})}c.onSaveContent.addToTop(function(j,k){k.content=k.content.replace(/<p>(<br ?\/?>|\u00a0|\uFEFF)?<\/p>/g,"<p>&nbsp;</p>")});c.onSaveContent.add(function(j,k){if(j.getParam("wpautop",true)&&typeof(switchEditors)=="object"){if(j.isHidden()){k.content=k.element.value}else{k.content=switchEditors.pre_wpautop(k.content)}}});e._handleMoreBreak(c,d);c.addShortcut("alt+shift+c",c.getLang("justifycenter_desc"),"JustifyCenter");c.addShortcut("alt+shift+r",c.getLang("justifyright_desc"),"JustifyRight");c.addShortcut("alt+shift+l",c.getLang("justifyleft_desc"),"JustifyLeft");c.addShortcut("alt+shift+j",c.getLang("justifyfull_desc"),"JustifyFull");c.addShortcut("alt+shift+q",c.getLang("blockquote_desc"),"mceBlockQuote");c.addShortcut("alt+shift+u",c.getLang("bullist_desc"),"InsertUnorderedList");c.addShortcut("alt+shift+o",c.getLang("numlist_desc"),"InsertOrderedList");c.addShortcut("alt+shift+d",c.getLang("striketrough_desc"),"Strikethrough");c.addShortcut("alt+shift+n",c.getLang("spellchecker.desc"),"mceSpellCheck");c.addShortcut("alt+shift+a",c.getLang("link_desc"),"mceLink");c.addShortcut("alt+shift+s",c.getLang("unlink_desc"),"unlink");c.addShortcut("alt+shift+m",c.getLang("image_desc"),"WP_Medialib");c.addShortcut("alt+shift+g",c.getLang("fullscreen.desc"),"mceFullScreen");c.addShortcut("alt+shift+z",c.getLang("wp_adv_desc"),"WP_Adv");c.addShortcut("alt+shift+h",c.getLang("help_desc"),"WP_Help");c.addShortcut("alt+shift+t",c.getLang("wp_more_desc"),"WP_More");c.addShortcut("alt+shift+p",c.getLang("wp_page_desc"),"WP_Page");c.addShortcut("ctrl+s",c.getLang("save_desc"),function(){if("function"==typeof autosave){autosave()}});if(tinymce.isWebKit){c.addShortcut("alt+shift+b",c.getLang("bold_desc"),"Bold");c.addShortcut("alt+shift+i",c.getLang("italic_desc"),"Italic")}c.onInit.add(function(j){tinymce.dom.Event.add(j.getWin(),"scroll",function(k){j.plugins.wordpress._hideButtons()});tinymce.dom.Event.add(j.getBody(),"dragstart",function(k){j.plugins.wordpress._hideButtons()})});c.onBeforeExecCommand.add(function(j,l,k,m){j.plugins.wordpress._hideButtons()});c.onSaveContent.add(function(j,k){j.plugins.wordpress._hideButtons()});c.onMouseDown.add(function(j,k){if(k.target.nodeName!="IMG"){j.plugins.wordpress._hideButtons()}});i=function(j){var k;if(j.target.id=="mceModalBlocker"||j.target.className=="ui-widget-overlay"){for(k in c.windowManager.windows){c.windowManager.close(null,k)}}};tinymce.dom.Event.remove(document.body,"click",i);tinymce.dom.Event.add(document.body,"click",i)},getInfo:function(){return{longname:"WordPress Plugin",author:"WordPress",authorurl:"http://wordpress.org",infourl:"http://wordpress.org",version:"3.0"}},_setEmbed:function(b){return b.replace(/\[embed\]([\s\S]+?)\[\/embed\][\s\u00a0]*/g,function(d,c){return'<img width="300" height="200" src="'+tinymce.baseURL+'/plugins/wordpress/img/trans.gif" class="wp-oembed mceItemNoResize" alt="'+c+'" title="'+c+'" />'})},_getEmbed:function(b){return b.replace(/<img[^>]+>/g,function(c){if(c.indexOf('class="wp-oembed')!=-1){var d=c.match(/alt="([^\"]+)"/);if(d[1]){c="[embed]"+d[1]+"[/embed]"}}return c})},_showButtons:function(f,d){var g=tinyMCE.activeEditor,i,h,b,j=tinymce.DOM,e,c;b=g.dom.getViewPort(g.getWin());i=j.getPos(g.getContentAreaContainer());h=g.dom.getPos(f);e=Math.max(h.x-b.x,0)+i.x;c=Math.max(h.y-b.y,0)+i.y;j.setStyles(d,{top:c+5+"px",left:e+5+"px",display:"block"});if(this.mceTout){clearTimeout(this.mceTout)}this.mceTout=setTimeout(function(){g.plugins.wordpress._hideButtons()},5000)},_hideButtons:function(){if(!this.mceTout){return}if(document.getElementById("wp_editbtns")){tinymce.DOM.hide("wp_editbtns")}if(document.getElementById("wp_gallerybtns")){tinymce.DOM.hide("wp_gallerybtns")}clearTimeout(this.mceTout);this.mceTout=0},_resizeIframe:function(c,e,b){var d=c.getContentAreaContainer().firstChild;a.setStyle(d,"height",d.clientHeight+b);c.theme.deltaHeight+=b},_handleMoreBreak:function(c,d){var e,b;e='<img src="'+d+'/img/trans.gif" alt="$1" class="mceWPmore mceItemNoResize" title="'+c.getLang("wordpress.wp_more_alt")+'" />';b='<img src="'+d+'/img/trans.gif" class="mceWPnextpage mceItemNoResize" title="'+c.getLang("wordpress.wp_page_alt")+'" />';c.onInit.add(function(){c.dom.loadCSS(d+"/css/content.css")});c.onPostRender.add(function(){if(c.theme.onResolveName){c.theme.onResolveName.add(function(f,g){if(g.node.nodeName=="IMG"){if(c.dom.hasClass(g.node,"mceWPmore")){g.name="wpmore"}if(c.dom.hasClass(g.node,"mceWPnextpage")){g.name="wppage"}}})}});c.onBeforeSetContent.add(function(f,g){if(g.content){g.content=g.content.replace(/<!--more(.*?)-->/g,e);g.content=g.content.replace(/<!--nextpage-->/g,b)}});c.onPostProcess.add(function(f,g){if(g.get){g.content=g.content.replace(/<img[^>]+>/g,function(i){if(i.indexOf('class="mceWPmore')!==-1){var h,j=(h=i.match(/alt="(.*?)"/))?h[1]:"";i="<!--more"+j+"-->"}if(i.indexOf('class="mceWPnextpage')!==-1){i="<!--nextpage-->"}return i})}});c.onNodeChange.add(function(g,f,h){f.setActive("wp_page",h.nodeName==="IMG"&&g.dom.hasClass(h,"mceWPnextpage"));f.setActive("wp_more",h.nodeName==="IMG"&&g.dom.hasClass(h,"mceWPmore"))})}});tinymce.PluginManager.add("wordpress",tinymce.plugins.WordPress)})();