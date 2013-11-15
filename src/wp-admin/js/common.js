/* global setUserSetting, ajaxurl, commonL10n, alert, confirm, toggleWithKeyboard, pagenow */
var showNotice, adminMenu, columns, validateForm, screenMeta, stickyMenu;
(function($){
// Removed in 3.3.
// (perhaps) needed for back-compat
adminMenu = {
	init : function() {},
	fold : function() {},
	restoreMenuState : function() {},
	toggle : function() {},
	favorites : function() {}
};

// show/hide/save table columns
columns = {
	init : function() {
		var that = this;
		$('.hide-column-tog', '#adv-settings').click( function() {
			var $t = $(this), column = $t.val();
			if ( $t.prop('checked') )
				that.checked(column);
			else
				that.unchecked(column);

			columns.saveManageColumnsState();
		});
	},

	saveManageColumnsState : function() {
		var hidden = this.hidden();
		$.post(ajaxurl, {
			action: 'hidden-columns',
			hidden: hidden,
			screenoptionnonce: $('#screenoptionnonce').val(),
			page: pagenow
		});
	},

	checked : function(column) {
		$('.column-' + column).show();
		this.colSpanChange(+1);
	},

	unchecked : function(column) {
		$('.column-' + column).hide();
		this.colSpanChange(-1);
	},

	hidden : function() {
		return $('.manage-column').filter(':hidden').map(function() { return this.id; }).get().join(',');
	},

	useCheckboxesForHidden : function() {
		this.hidden = function(){
			return $('.hide-column-tog').not(':checked').map(function() {
				var id = this.id;
				return id.substring( id, id.length - 5 );
			}).get().join(',');
		};
	},

	colSpanChange : function(diff) {
		var $t = $('table').find('.colspanchange'), n;
		if ( !$t.length )
			return;
		n = parseInt( $t.attr('colspan'), 10 ) + diff;
		$t.attr('colspan', n.toString());
	}
};

$(document).ready(function(){columns.init();});

validateForm = function( form ) {
	return !$( form )
		.find( '.form-required' )
		.filter( function() { return $( 'input:visible', this ).val() === ''; } )
		.addClass( 'form-invalid' )
		.find( 'input:visible' )
		.change( function() { $( this ).closest( '.form-invalid' ).removeClass( 'form-invalid' ); } )
		.size();
};

// stub for doing better warnings
showNotice = {
	warn : function() {
		var msg = commonL10n.warnDelete || '';
		if ( confirm(msg) ) {
			return true;
		}

		return false;
	},

	note : function(text) {
		alert(text);
	}
};

screenMeta = {
	element: null, // #screen-meta
	toggles: null, // .screen-meta-toggle
	page:    null, // #wpcontent

	init: function() {
		this.element = $('#screen-meta');
		this.toggles = $('.screen-meta-toggle a');
		this.page    = $('#wpcontent');

		this.toggles.click( this.toggleEvent );
	},

	toggleEvent: function( e ) {
		var panel = $( this.href.replace(/.+#/, '#') );
		e.preventDefault();

		if ( !panel.length )
			return;

		if ( panel.is(':visible') )
			screenMeta.close( panel, $(this) );
		else
			screenMeta.open( panel, $(this) );
	},

	open: function( panel, link ) {

		$('.screen-meta-toggle').not( link.parent() ).css('visibility', 'hidden');

		panel.parent().show();
		panel.slideDown( 'fast', function() {
			panel.focus();
			link.addClass('screen-meta-active').attr('aria-expanded', true);
		});
	},

	close: function( panel, link ) {
		panel.slideUp( 'fast', function() {
			link.removeClass('screen-meta-active').attr('aria-expanded', false);
			$('.screen-meta-toggle').css('visibility', '');
			panel.parent().hide();
		});
	}
};

/**
 * Help tabs.
 */
$('.contextual-help-tabs').delegate('a', 'click focus', function(e) {
	var link = $(this),
		panel;

	e.preventDefault();

	// Don't do anything if the click is for the tab already showing.
	if ( link.is('.active a') )
		return false;

	// Links
	$('.contextual-help-tabs .active').removeClass('active');
	link.parent('li').addClass('active');

	panel = $( link.attr('href') );

	// Panels
	$('.help-tab-content').not( panel ).removeClass('active').hide();
	panel.addClass('active').show();
});

$(document).ready( function() {
	var checks, first, last, checked, sliced, mobileEvent, transitionTimeout, focusedRowActions,
		lastClicked = false,
		menu = $('#adminmenu'),
		pageInput = $('input.current-page'),
		currentPage = pageInput.val();

	// when the menu is folded, make the fly-out submenu header clickable
	menu.on('click.wp-submenu-head', '.wp-submenu-head', function(e){
		$(e.target).parent().siblings('a').get(0).click();
	});

	$('#collapse-menu').on('click.collapse-menu', function() {
		var body = $( document.body ), respWidth;

		// reset any compensation for submenus near the bottom of the screen
		$('#adminmenu div.wp-submenu').css('margin-top', '');

		// WebKit excludes the width of the vertical scrollbar when applying the CSS "@media screen and (max-width: ...)"
		// and matches $(window).width().
		// Firefox and IE > 8 include the scrollbar width, so after the jQuery normalization
		// $(window).width() is 884px but window.innerWidth is 900px.
		// (using window.innerWidth also excludes IE < 9)
		respWidth = navigator.userAgent.indexOf('AppleWebKit/') > -1 ? $(window).width() : window.innerWidth;

		if ( respWidth && respWidth < 900 ) {
			if ( body.hasClass('auto-fold') ) {
				body.removeClass('auto-fold').removeClass('folded');
				setUserSetting('unfold', 1);
				setUserSetting('mfold', 'o');
			} else {
				body.addClass('auto-fold');
				setUserSetting('unfold', 0);
			}
		} else {
			if ( body.hasClass('folded') ) {
				body.removeClass('folded');
				setUserSetting('mfold', 'o');
			} else {
				body.addClass('folded');
				setUserSetting('mfold', 'f');
			}
		}
	});

	if ( 'ontouchstart' in window || /IEMobile\/[1-9]/.test(navigator.userAgent) ) { // touch screen device
		// iOS Safari works with touchstart, the rest work with click
		mobileEvent = /Mobile\/.+Safari/.test(navigator.userAgent) ? 'touchstart' : 'click';

		// close any open submenus when touch/click is not on the menu
		$(document.body).on( mobileEvent+'.wp-mobile-hover', function(e) {
			if ( !$(e.target).closest('#adminmenu').length )
				menu.find('li.wp-has-submenu.opensub').removeClass('opensub');
		});

		menu.find('a.wp-has-submenu').on( mobileEvent+'.wp-mobile-hover', function(e) {
			var el = $(this), parent = el.parent();

			// Show the sub instead of following the link if:
			//	- the submenu is not open
			//	- the submenu is not shown inline or the menu is not folded
			if ( !parent.hasClass('opensub') && ( !parent.hasClass('wp-menu-open') || parent.width() < 40 ) ) {
				e.preventDefault();
				menu.find('li.opensub').removeClass('opensub');
				parent.addClass('opensub');
			}
		});
	}

	menu.find('li.wp-has-submenu').hoverIntent({
		over: function() {
			var b, h, o, f, m = $(this).find('.wp-submenu'), menutop, wintop, maxtop, top = parseInt( m.css('top'), 10 );

			if ( isNaN(top) || top > -5 ) // meaning the submenu is visible
				return;

			menutop = $(this).offset().top;
			wintop = $(window).scrollTop();
			maxtop = menutop - wintop - 30; // max = make the top of the sub almost touch admin bar

			b = menutop + m.height() + 1; // Bottom offset of the menu
			h = $('#wpwrap').height(); // Height of the entire page
			o = 60 + b - h;
			f = $(window).height() + wintop - 15; // The fold

			if ( f < (b - o) )
				o = b - f;

			if ( o > maxtop )
				o = maxtop;

			if ( o > 1 )
				m.css('margin-top', '-'+o+'px');
			else
				m.css('margin-top', '');

			menu.find('li.menu-top').removeClass('opensub');
			$(this).addClass('opensub');
		},
		out: function(){
			$(this).removeClass('opensub').find('.wp-submenu').css('margin-top', '');
		},
		timeout: 200,
		sensitivity: 7,
		interval: 90
	});

	menu.on('focus.adminmenu', '.wp-submenu a', function(e){
		$(e.target).closest('li.menu-top').addClass('opensub');
	}).on('blur.adminmenu', '.wp-submenu a', function(e){
		$(e.target).closest('li.menu-top').removeClass('opensub');
	});

	// Move .updated and .error alert boxes. Don't move boxes designed to be inline.
	$('div.wrap h2:first').nextAll('div.updated, div.error').addClass('below-h2');
	$('div.updated, div.error').not('.below-h2, .inline').insertAfter( $('div.wrap h2:first') );

	// Init screen meta
	screenMeta.init();

	// check all checkboxes
	$('tbody').children().children('.check-column').find(':checkbox').click( function(e) {
		if ( 'undefined' == e.shiftKey ) { return true; }
		if ( e.shiftKey ) {
			if ( !lastClicked ) { return true; }
			checks = $( lastClicked ).closest( 'form' ).find( ':checkbox' );
			first = checks.index( lastClicked );
			last = checks.index( this );
			checked = $(this).prop('checked');
			if ( 0 < first && 0 < last && first != last ) {
				sliced = ( last > first ) ? checks.slice( first, last ) : checks.slice( last, first );
				sliced.prop( 'checked', function() {
					if ( $(this).closest('tr').is(':visible') )
						return checked;

					return false;
				});
			}
		}
		lastClicked = this;

		// toggle "check all" checkboxes
		var unchecked = $(this).closest('tbody').find(':checkbox').filter(':visible').not(':checked');
		$(this).closest('table').children('thead, tfoot').find(':checkbox').prop('checked', function() {
			return ( 0 === unchecked.length );
		});

		return true;
	});

	$('thead, tfoot').find('.check-column :checkbox').click( function(e) {
		var c = $(this).prop('checked'),
			kbtoggle = 'undefined' == typeof toggleWithKeyboard ? false : toggleWithKeyboard,
			toggle = e.shiftKey || kbtoggle;

		$(this).closest( 'table' ).children( 'tbody' ).filter(':visible')
		.children().children('.check-column').find(':checkbox')
		.prop('checked', function() {
			if ( $(this).is(':hidden') )
				return false;
			if ( toggle )
				return $(this).prop( 'checked' );
			else if (c)
				return true;
			return false;
		});

		$(this).closest('table').children('thead,  tfoot').filter(':visible')
		.children().children('.check-column').find(':checkbox')
		.prop('checked', function() {
			if ( toggle )
				return false;
			else if (c)
				return true;
			return false;
		});
	});

	// Show row actions on keyboard focus of its parent container element or any other elements contained within
	$( 'td.post-title, td.title, td.comment, .bookmarks td.column-name, td.blogname, td.username, .dashboard-comment-wrap' ).focusin(function(){
		clearTimeout( transitionTimeout );
		focusedRowActions = $(this).find( '.row-actions' );
		focusedRowActions.addClass( 'visible' );
	}).focusout(function(){
		// Tabbing between post title and .row-actions links needs a brief pause, otherwise
		// the .row-actions div gets hidden in transit in some browsers (ahem, Firefox).
		transitionTimeout = setTimeout(function(){
			focusedRowActions.removeClass( 'visible' );
		}, 30);
	});

	$('#default-password-nag-no').click( function() {
		setUserSetting('default_password_nag', 'hide');
		$('div.default-password-nag').hide();
		return false;
	});

	// tab in textareas
	$('#newcontent').bind('keydown.wpevent_InsertTab', function(e) {
		var el = e.target, selStart, selEnd, val, scroll, sel;

		if ( e.keyCode == 27 ) { // escape key
			$(el).data('tab-out', true);
			return;
		}

		if ( e.keyCode != 9 || e.ctrlKey || e.altKey || e.shiftKey ) // tab key
			return;

		if ( $(el).data('tab-out') ) {
			$(el).data('tab-out', false);
			return;
		}

		selStart = el.selectionStart;
		selEnd = el.selectionEnd;
		val = el.value;

		try {
			this.lastKey = 9; // not a standard DOM property, lastKey is to help stop Opera tab event. See blur handler below.
		} catch(err) {}

		if ( document.selection ) {
			el.focus();
			sel = document.selection.createRange();
			sel.text = '\t';
		} else if ( selStart >= 0 ) {
			scroll = this.scrollTop;
			el.value = val.substring(0, selStart).concat('\t', val.substring(selEnd) );
			el.selectionStart = el.selectionEnd = selStart + 1;
			this.scrollTop = scroll;
		}

		if ( e.stopPropagation )
			e.stopPropagation();
		if ( e.preventDefault )
			e.preventDefault();
	});

	$('#newcontent').bind('blur.wpevent_InsertTab', function() {
		if ( this.lastKey && 9 == this.lastKey )
			this.focus();
	});

	if ( pageInput.length ) {
		pageInput.closest('form').submit( function() {

			// Reset paging var for new filters/searches but not for bulk actions. See #17685.
			if ( $('select[name="action"]').val() == -1 && $('select[name="action2"]').val() == -1 && pageInput.val() == currentPage )
				pageInput.val('1');
		});
	}

	$('.search-box input[type="search"], .search-box input[type="submit"]').mousedown(function () {
		$('select[name^="action"]').val('-1');
	});

	// Scroll into view when focused
	$('#contextual-help-link, #show-settings-link').on( 'focus.scroll-into-view', function(e){
		if ( e.target.scrollIntoView )
			e.target.scrollIntoView(false);
	});

	// Disable upload buttons until files are selected
	(function(){
		var button, input, form = $('form.wp-upload-form');
		if ( ! form.length )
			return;
		button = form.find('input[type="submit"]');
		input = form.find('input[type="file"]');

		function toggleUploadButton() {
			button.prop('disabled', '' === input.map( function() {
				return $(this).val();
			}).get().join(''));
		}
		toggleUploadButton();
		input.on('change', toggleUploadButton);
	})();
});

stickyMenu = {
	active: false,

	init: function () {
		this.$window = $( window );
		this.$body = $( document.body );
		this.$adminMenuWrap = $( '#adminmenuwrap' );
		this.$collapseMenu = $( '#collapse-menu' );
		this.bodyMinWidth = parseInt( this.$body.css( 'min-width' ), 10 );
		this.enable();
	},

	enable: function () {
		if ( ! this.active ) {
			this.$window.on( 'resize.stickyMenu scroll.stickyMenu', this.debounce(
				$.proxy( this.update, this ), 200
			) );
			this.$collapseMenu.on( 'click.stickyMenu', $.proxy( this.update, this ) );
			this.update();
			this.active = true;
		}
	},

	disable: function () {
		if ( this.active ) {
			this.$window.off( 'resize.stickyMenu scroll.stickyMenu' );
			this.$collapseMenu.off( 'click.stickyMenu' );
			this.$body.removeClass( 'sticky-menu' );
			this.active = false;
		}
	},

	update: function () {
		// Make the admin menu sticky if both of the following:
		// 1. The viewport is taller than the admin menu
		// 2. The viewport is wider than the min-width of the <body>
		if ( this.$window.height() > this.$adminMenuWrap.height() + 32 && this.$window.width() > this.bodyMinWidth) {
			if ( ! this.$body.hasClass( 'sticky-menu' ) ) {
				this.$body.addClass( 'sticky-menu' );
			}
		} else {
			if ( this.$body.hasClass( 'sticky-menu' ) ) {
				this.$body.removeClass( 'sticky-menu' );
			}
		}
	},

	// Borrowed from Underscore.js
	debounce: function( func, wait, immediate ) {
		var timeout, args, context, timestamp, result;
		return function() {
			var later, callNow;
			context = this;
			args = arguments;
			timestamp = new Date().getTime();
			later = function() {
				var last = new Date().getTime() - timestamp;
				if ( last < wait ) {
					timeout = setTimeout( later, wait - last );
				} else {
					timeout = null;
					if ( ! immediate ) {
						result = func.apply( context, args );
						context = args = null;
					}
				}
			};
			callNow = immediate && !timeout;
			if ( ! timeout ) {
				timeout = setTimeout( later, wait );
			}
			if ( callNow ) {
				result = func.apply( context, args );
				context = args = null;
			}

			return result;
		};
	}
};

stickyMenu.init();

var moby6 = {

	init: function() {
		// cached selectors
		this.$html = $( document.documentElement );
		this.$body = $( document.body );
		this.$wpwrap = $( '#wpwrap' );
		this.$wpbody = $( '#wpbody' );
		this.$adminmenu = $( '#adminmenu' );
		this.$overlay = $( '#moby6-overlay' );
		this.$toolbar = $( '#wp-toolbar' );
		this.$toolbarPopups = this.$toolbar.find( 'a[aria-haspopup="true"]' );

		// Modify functionality based on custom activate/deactivate event
		this.$html
			.on( 'activate.moby6', function() { moby6.activate(); } )
			.on( 'deactivate.moby6', function() { moby6.deactivate(); } );

		// Toggle sidebar when toggle is clicked
		$( '#wp-admin-bar-toggle-button' ).on( 'click', function(evt) {
			evt.preventDefault();
			moby6.$wpwrap.toggleClass( 'moby6-open' );
		} );

		// Trigger custom events based on active media query.
		this.matchMedia();
		$( window ).on( 'resize', $.proxy( this.matchMedia, this ) );
	},

	activate: function() {

		window.stickymenu && window.stickymenu.disable();

		if ( ! moby6.$body.hasClass( 'auto-fold' ) )
			moby6.$body.addClass( 'auto-fold' );

		this.modifySidebarEvents();
		this.disableDraggables();
		this.movePostSearch();

	},

	deactivate: function() {

		window.stickymenu && window.stickymenu.enable();

		this.enableDraggables();
		this.removeHamburgerButton();
		this.restorePostSearch();

	},

	matchMedia: function() {
		clearTimeout( this.resizeTimeout );
		this.resizeTimeout = setTimeout( function() {

			if ( ! window.matchMedia )
				return;

			if ( window.matchMedia( '(max-width: 782px)' ).matches ) {
				if ( moby6.$html.hasClass( 'touch' ) )
					return;
				moby6.$html.addClass( 'touch' ).trigger( 'activate.moby6' );
			} else {
				if ( ! moby6.$html.hasClass( 'touch' ) )
					return;
				moby6.$html.removeClass( 'touch' ).trigger( 'deactivate.moby6' );
			}

			if ( window.matchMedia( '(max-width: 480px)' ).matches ) {
				moby6.enableOverlay();
			} else {
				moby6.disableOverlay();
			}

		}, 150 );
	},

	enableOverlay: function() {
		if ( this.$overlay.length === 0 ) {
			this.$overlay = $( '<div id="moby6-overlay"></div>' )
				.insertAfter( '#wpcontent' )
				.hide()
				.on( 'click.moby6', function() {
					moby6.$toolbar.find( '.menupop.hover' ).removeClass( 'hover' );
					$( this ).hide();
				});
		}
		this.$toolbarPopups.on( 'click.moby6', function() {
			moby6.$overlay.show();
		});
	},

	disableOverlay: function() {
		this.$toolbarPopups.off( 'click.moby6' );
		this.$overlay.hide();
	},

	modifySidebarEvents: function() {
		this.$body.off( '.wp-mobile-hover' );
		this.$adminmenu.find( 'a.wp-has-submenu' ).off( '.wp-mobile-hover' );

		var scrollStart = 0;
		this.$adminmenu.on( 'touchstart.moby6', 'li.wp-has-submenu > a', function() {
			scrollStart = $( window ).scrollTop();
		});

		this.$adminmenu.on( 'touchend.moby6', 'li.wp-has-submenu > a', function( e ) {
			e.preventDefault();

			if ( $( window ).scrollTop() !== scrollStart )
				return false;

			$( this ).find( 'li.wp-has-submenu' ).removeClass( 'selected' );
			$( this ).parent( 'li' ).addClass( 'selected' );
		});
	},

	disableDraggables: function() {
		this.$wpbody
			.find( '.hndle' )
			.removeClass( 'hndle' )
			.addClass( 'hndle-disabled' );
	},

	enableDraggables: function() {
		this.$wpbody
			.find( '.hndle-disabled' )
			.removeClass( 'hndle-disabled' )
			.addClass( 'hndle' );
	},

	removeHamburgerButton: function() {
		if ( this.hamburgerButtonView !== undefined )
			this.hamburgerButtonView.destroy();
	},

	movePostSearch: function() {
		this.searchBox = this.$wpbody.find( 'p.search-box' );
		if ( this.searchBox.length ) {
			this.searchBox.hide();
			if ( this.searchBoxClone === undefined ) {
				this.searchBoxClone = this.searchBox.first().clone().insertAfter( 'div.tablenav.bottom' );
			}
			this.searchBoxClone.show();
		}
	},

	restorePostSearch: function() {
		if ( this.searchBox !== undefined ) {
			this.searchBox.show();
			if ( this.searchBoxClone !== undefined )
				this.searchBoxClone.hide();
		}
	}
};

// Fire moby6.init when document is ready
$( document ).ready( $.proxy( moby6.init, moby6 ) );

// make Windows 8 devices playing along nicely
(function(){
	if ( '-ms-user-select' in document.documentElement.style && navigator.userAgent.match(/IEMobile\/10\.0/) ) {
		var msViewportStyle = document.createElement( 'style' );
		msViewportStyle.appendChild(
			document.createTextNode( '@-ms-viewport{width:auto!important}' )
		);
		document.getElementsByTagName( 'head' )[0].appendChild( msViewportStyle );
	}
})();

// internal use
$(document).bind( 'wp_CloseOnEscape', function( e, data ) {
	if ( typeof(data.cb) != 'function' )
		return;

	if ( typeof(data.condition) != 'function' || data.condition() )
		data.cb();

	return true;
});

})(jQuery);
