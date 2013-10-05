var _templates = {};

_templates['boards/edit'] = '<?\
var action	=	(board.id ? \'Edit\' : \'Add\');\
?>\
<? if(!bare) { ?>\
	<h1>\
		<? if(title) { ?>\
			<?=title?>\
		<? } else { ?>\
			<?=action?> board\
		<? } ?>\
		<? if(return_to_manage) { ?>\
			<small><a href="#manage">&laquo; Back to board manager</a></small>\
		<? } ?>\
	</h1>\
<? } ?>\
<div class="board-edit clear <? if(bare) { ?>bare<? } ?>">\
	<form>\
		<? if(bare) { ?>\
			<input type="text" name="name" value="<?=board.title?>" placeholder="Board name">\
			<a href="#submit"><img src="<?=img(\'/images/site/icons/check_16x16.png\')?>" width="16" height="16" alt="submit"></a>\
			<a href="#cancel"><img src="<?=img(\'/images/site/icons/x_16x16.png\')?>" width="16" height="16" alt="cancel"></a>\
		<? } else { ?>\
			<input type="submit" value="<?=action?> board">\
			<input type="text" name="name" value="<?=board.title?>" placeholder="Board name">\
		<? } ?>\
	</form>\
</div>\
';

_templates['boards/list'] = '<div class="board-list">\
	<? if(boards.length > 0) { ?>\
		<select id="board_selector">\
			<? boards.each(function(p) { ?>\
				<option\
					value="<?=p.id?>"\
					<? if(current == p.id) { ?>selected<? } ?>>\
					<?=p.title?>\
				</option>\
			<? }); ?>\
		</select>\
		<ul class="actions">\
			<li>\
				<a href="#" class="add" title="Add a new board (shortcut `b`)">\
					<img src="<?=img(\'/images/site/icons/add_16x16_black.png\')?>" alt="add" width="16" height="16">\
				</a>\
			</li>\
			<li>\
				<a href="#" class="manage" title="Manage your boards">\
					<img src="<?=img(\'/images/site/icons/manage_16x16_black.png\')?>" alt="manage" width="16" height="16">\
				</a>\
			</li>\
		</ul>\
	<? } else { ?>\
		<ul class="actions">\
			<li>\
				<a href="#" class="add first" title="Add a new board (shortcut `b`)">\
					<img src="<?=img(\'/images/site/icons/add_16x16_black.png\')?>" alt="add" width="16" height="16">\
					Add your first board\
				</a>\
			</li>\
		</ul>\
	<? } ?>\
	<?/* little trick i learned in nam */?>\
	<span style="clear:left;display:block;"></span>\
</div>\
';

_templates['boards/manage'] = '<h1>Manage boards</h1>\
<div class="board-manage">\
	<? if(!enable_sharing) { ?>\
		<a href="#add-persona">Add a persona</a> to enable sharing.\
	<? } ?>\
	<div class="button add">\
		<span>New board</span>\
	</div>\
	<span class="clearMe"></span>\
	<ul class="mine">\
		<? boards.each(function(b) { ?>\
			<li class="clear board_<?=b.id?>">\
				<span class="sort" title="Drag to sort boards"></span>\
				<h3>\
					<?=b.title?>\
					<? if(b.shared) { ?><small>(shared)</small> <? } ?>\
				</h3>\
				<ul class="actions">\
					<? if(b.shared) { ?>\
						<li>\
							<a href="#leave" class="<?=b.id?>" title="Leave board">\
								<img src="<?=img(\'/images/site/icons/remove_16x16_black.png\')?>" alt="share" width="16" height="16">\
							</a>\
						</li>\
					<? } else { ?>\
						<? if(enable_sharing) { ?>\
							<li class="<? if(b.share_enabled) { ?>highlight<? } ?>">\
								<a href="#share" class="<?=b.id?>" title="Share board">\
									<img src="<?=img(\'/images/site/icons/share_16x16_black.png\')?>" alt="share" width="16" height="16">\
								</a>\
							</li>\
						<? } ?>\
						<li>\
							<a href="#edit" class="<?=b.id?>" title="Edit board">\
								<img src="<?=img(\'/images/site/icons/edit_16x16_black.png\')?>" alt="Edit" width="16" height="16">\
							</a>\
						</li>\
						<li>\
							<a href="#delete" class="<?=b.id?>" title="Delete board (and all contained data)">\
								<img src="<?=img(\'/images/site/icons/delete_16x16_black.png\')?>" alt="Delete" width="16" height="16">\
							</a>\
						</li>\
					<? } ?>\
				</ul>\
			</li>\
		<? }); ?>\
	</ul>\
</div>\
';

_templates['boards/share'] = '<h1>\
	Sharing: <?=board.title?>\
	<small><a href="#back">&laquo; Back to board manager</a></small>\
</h1>\
<div class="board-share">\
	<div class="button add share">\
		<span>Share this board</span>\
	</div>\
	<span class="clearMe"></span>\
\
	<div class="share-to clear">\
		<div class="select clear"></div>\
		<form class="standard-form">\
			<div class="submit">\
				<input tabindex="4" type="submit" value="Invite" disabled>\
			</div>\
		</form>\
	</div>\
\
	<div class="personas-list">\
		<? if(personas.length > 0 || invites.length > 0) { ?>\
			<ul>\
				<? personas.each(function(p) { ?>\
					<? if(!p || !p.privs || !p.privs.perms) { return; } ?>\
					<li class="persona_<?=p.id?> clear">\
						<h3>\
							<?=p.email?>\
							<? if(p.privs && p.privs.invite) { ?>\
								<small>- invite pending</small>\
							<? } ?>\
						</h3>\
						<small>\
							(has <?=(p.privs.perms == 2 ? \'write\' : \'read\')?> permissions)\
						</small>\
						<ul>\
							<li>\
								<a href="#remove" title="Remove this user from sharing">\
									<img src="<?=img(\'/images/site/icons/remove_16x16_black.png\')?>" width="16" height="16" alt="remove">\
								</a>\
							</li>\
						</ul>\
					</li>\
				<? }); ?>\
\
				<? invites.each(function(i) { ?>\
					<li class="invite_<?=i.id?> clear">\
						<h3>\
							<?=i.email?>\
							<small>- invite pending</small>\
						</h3>\
						<small>\
							(has <?=(i.perms == 2 ? \'write\' : \'read\')?> permissions)\
						</small>\
						<ul>\
							<li>\
								<a href="#cancel" title="Cancel this invite">\
									<img src="<?=img(\'/images/site/icons/remove_16x16_black.png\')?>" width="16" height="16" alt="remove">\
								</a>\
							</li>\
						</ul>\
					</li>\
				<? }); ?>\
			</ul>\
		<? } else { ?>\
			<p>\
				You have not shared this board with anyone.\
			</p>\
		<? } ?>\
	</div>\
</div>\
';

_templates['bookmark/index'] = '<div class="boards clear">\
	<div class="board"></div>\
</div>\
<div class="edit"></div>\
';

_templates['categories/list'] = '<? if(categories.length > 0) { ?>\
	<ul class="categories">\
		<? categories.each(function(c) { ?>\
			<li>\
				<a href="#cat"><?=c.name?></a>\
				<ul>\
					<? c.tags.each(function(t) { ?>\
						<li><a href="#tag"><?=t.name?></a></li>\
					<? }); ?>\
				</ul>\
			</li>\
		<? }); ?>\
	</ul>\
<? } ?>\
';

_templates['dashboard/index'] = '<div class="dashboard clear">\
	<div class="notes clear"></div>\
	<div class="sidebar">\
		<div class="boards"></div>\
		<div class="menu">\
			<div class="categories"></div>\
			<div class="tags clear"></div>\
		</div>\
	</div>\
</div>\
';

_templates['invites/board'] = '<div class="invite">\
	<h2>Invite <?=invite.email?> to Turtl</h2>\
	<form class="standard-form">\
		<div class="split clear">\
			<input type="text" name="secret" value="" tabindex="1" placeholder="Shared secret (optional)">\
			<p>\
				A recommended passphrase that protects the board in the event\
				the invite code is intercepted. It must be sent to the invitee\
				separately (by phone call, text msg, etc).\
			</p>\
		</div>\
	</form>\
</div>\
';

_templates['invites/list'] = '<h1>Invites</h1>\
\
<div class="invites-list">\
	<? if(invites.length > 0 || messages.length > 0) { ?>\
		<? if(num_personas > 0) { ?>\
			<ul>\
				<? messages.each(function(msg) { ?>\
					<li class="clear message <?=msg.body.type?> message_<?=msg.id?>">\
						<div class="actions">\
							<a href="#accept" title="Accept invite"><img src="<?=img(\'/images/site/icons/check_16x16.png\')?>" width="16" height="16" alt="Accept"></a>\
							<a href="#deny" title="Deny invite"><img src="<?=img(\'/images/site/icons/x_16x16.png\')?>" width="16" height="16" alt="Deny"></a>\
						</div>\
						<?=msg.subject?>\
					</li>\
				<? }); ?>\
				<? invites.each(function(inv) { ?>\
					<? inv.data || (inv.data = {}); ?>\
					<li class="invite invite_<?=inv.id?> clear">\
						<div class="actions">\
							<? if(inv.data.used_secret) { ?>\
								<a href="#unlock" title="Unlock invite"><img src="<?=img(\'/images/site/icons/lock_16x16_blank.png\')?>" width="16" height="16" alt="Unlock"></a>\
							<? } else { ?>\
								<a href="#accept" title="Accept invite"><img src="<?=img(\'/images/site/icons/check_16x16.png\')?>" width="16" height="16" alt="Accept"></a>\
							<? } ?>\
							<a href="#deny" title="Deny invite"><img src="<?=img(\'/images/site/icons/x_16x16.png\')?>" width="16" height="16" alt="Deny"></a>\
						</div>\
						<? if(inv.from) { ?>\
							<strong><?=inv.from.email?></strong>\
							invited you to join a \
							<?=(inv.type != \'b\' ? \'other\' : \'board\')?>\
						<? } else {  ?>\
							<?=(inv.type != \'b\' ? \'Other\' : \'Board\')?> invite\
							<strong><?=inv.code?></strong>\
						<? } ?>\
						<? if(inv.data.used_secret) { ?>\
							&nbsp;&nbsp;(locked invite, <a href="#unlock">enter secret to unlock</a>)\
							<form class="secret">\
								<input type="text" name="secret" placeholder="Enter this invite\'s shared secret to unlock and accept">\
								<input type="submit" value="Unlock">\
							</form>\
						<? } ?>\
					</li>\
				<? }); ?>\
			</ul>\
		<? } else { ?>\
			<div class="button add persona"><span>Add a persona</span></div>\
			<br><br>\
			<p>You have <?=invites.length?> invite(s), but you cannot accept them without a persona.</p>\
		<? } ?>\
	<? } else { ?>\
		<p>You have no pending invites.<p>\
	<? } ?>\
</div>\
';

_templates['modules/header_bar'] = '<div class="actions">\
	<? if(user.id) { ?>\
		<div class="apps clear"></div>\
	<? } ?>\
\
	<? if(!window._in_ext) { ?>\
		<? if(user.id) { ?>\
			<a class="menu" href="#menu"><img src="<?=img(\'/images/site/icons/menu_37x29.png\')?>" width="37" height="29" alt="Menu"></a>\
			<ul class="menu">\
				<li class="persona">\
					<a href="#personas" title="Manage your identity">\
						<img src="<?=img(\'/images/site/icons/person_16x16.png\')?>" width="16" height="16" alt="Persona">\
						<span>Personas</span>\
					</a>\
				</li>\
				<li class="bookmarklet">\
					<? var site_url = __site_url; ?>\
					<a href="javascript:(function() { var u = encodeURIComponent(window.location.href); var t = encodeURIComponent(document.title); var m = document.getElementsByTagName(\'meta\'); var y = \'link\'; var d = \'\'; var i = false; for(var x in m) {if(m[x].name == \'description\') {d = m[x].content; break;}} for(var x in m) { if(m[x].getAttribute && m[x].getAttribute(\'property\') == \'og:image\') { i = m[x].content; break; } } if(i) d = \'![image](\'+i+\')  \\\\n\'+d; d = encodeURIComponent(d); var req = new XMLHttpRequest(); req.open(\'GET\', document.location, false); req.send(null); var headers = req.getAllResponseHeaders().toLowerCase(); var content = headers.match(new RegExp(\'content-type: image/([\\\\\\\\w]+)\')); if(content && content[1]) { y = \'image\'; t = \'\'; } f = \'<?=window.location.protocol?>//<?=window.location.host?>/bookmark?url=\'+ u +\'&title=\'+ t +\'&text=\'+ d +\'&type=\'+ y; t = function() { if(!window.open(f, \'turtl\', \'location=yes,links=no,scrollbars=no,toolbar=no,width=740,height=525\')) { location.href = f; } }; if(/Firefox/.test(navigator.userAgent)) setTimeout(t, 0); else t(); })()" title="Drag me to your bookmarks!">\
						<img src="<?=img(\'/images/site/icons/link_16x16.png\')?>" width="16" height="16" alt="Bookmarklet">\
						<span>Bookmarklet</span>\
					</a>\
				</li>\
				<li class="logout">\
					<a href="/users/logout" title="Sign out (shortcut `shift+L`)">\
						<img src="<?=img(\'/images/site/icons/logout_16x16.png\')?>" width="16" height="16" alt="Logout">\
						<span>Logout</span>\
					</a>\
				</li>\
			</ul>\
		<? } else { ?>\
			<ul>\
				<li>\
					<a href="/users/login"><span>Login</span></a>\
				</li>\
				<li>\
					<a href="/users/join"><span>Join</span></a>\
				</li>\
			</ul>\
		<? } ?>\
	<? } ?>\
</div>\
';

_templates['notes/edit'] = '<?\
var action = note.id ? \'Edit\' : \'Add\';\
?>\
<h1><?=action?> note</h1>\
<div class="note-edit clear">\
	<? if(show_tabs) { ?>\
		<?\
		var showtab = function(name)\
		{\
			var slug = name.toLowerCase();\
			var t = \'<li class="\'+slug;\
			if(note.type == slug) t += \' sel\';\
			t += \'">\'+ name +\'</li>\';\
			return t;\
		};\
		?>\
		<ul class="type clear">\
			<? if(!note.id) { ?>\
				<?=showtab(\'Quick\')?>\
			<? } ?>\
			<?=showtab(\'Text\')?>\
			<?=showtab(\'Link\')?>\
			<?=showtab(\'Image\')?>\
			<!--\
			<li>Embed</li>\
			<li>PDF</li>\
			-->\
		</ul>\
	<? } ?>\
	<form class="standard-form">\
		<div class="tags"></div>\
\
		<div class="type quick">\
			<textarea tabindex="1" name="quick" rows="8" cols="40" placeholder="Enter a link, text, image URL, etc"></textarea>\
			<div class="form-note">\
				Feel free to use <a href="http://support.mashery.com/docs/customizing_your_portal/Markdown_Cheat_Sheet" target="_blank">markdown</a> for note text.\
			</div>\
		</div>\
\
		<div class="type url">\
			<input tabindex="1" type="text" name="url" value="<?=(note.url ? note.url.replace(/"/g, \'&quot;\') : \'\')?>" placeholder="http://">\
		</div>\
\
		<div class="type title">\
			<input tabindex="1" type="text" name="title" value="<?=(note.title ? note.title.replace(/"/g, \'&quot;\') : \'\')?>" placeholder="Title">\
		</div>\
\
		<div class="type text">\
			<textarea tabindex="1" name="text" rows="8" cols="40" placeholder="Describe this note"><?=note.text?></textarea>\
			<div class="form-note">\
				Feel free to use <a href="http://support.mashery.com/docs/customizing_your_portal/Markdown_Cheat_Sheet" target="_blank">markdown</a> for note text.\
			</div>\
		</div>\
\
		<span class="clearMe"></span>\
		<div class="submit">\
			<input tabindex="3" type="submit" value="<?=action?> note">\
		</div>\
		<?/*\
		<div class="colors">\
			<span class="tooltip" title="Note color :: Note colors can be used to visually classify your notes. How you do this is up to you!">Color:&nbsp;</span>\
			<? var colors = [\'none\',\'blue\',\'red\',\'green\',\'purple\',\'pink\',\'brown\',\'black\']; ?>\
			<? colors.each(function(c, i) { ?>\
				<? i++; ?>\
				<label for="inp_color_<?=i?>" title="<?=c?>">\
					<span class="color <?=c?>"></span>\
				</label>\
				<input\
					type="radio"\
					id="inp_color_<?=i?>"\
					name="color"\
					value="<?=i?>"\
					<? if(note.color == i) { ?>checked<? } ?>\
					title="<?=c?>">\
				&nbsp;\
			<? }); ?>\
		</div>\
		*/?>\
	</form>\
</div>\
';

_templates['notes/edit_tags'] = '<?\
var format_tag = function(tagname, selected)\
{\
var t = \'<li class="\'+view.tagetize(tagname, {escape: true})+\' \'+(selected ? \'sel\': \'\')+\'">\';\
	t += view.tagetize(tagname);\
	t += \'</li>\';\
	return t;\
};\
?>\
<input type="text" tabindex="2" name="tag" placeholder="add, tags, here">\
<input type="button" class="add" value="Add tag">\
<? if(suggested_tags.length == 0 && (!note.tags || note.tags.length == 0)) { ?>\
	<br>\
	<span class="form-note">Tags make your notes easier to find.</span>\
<? } else { ?>\
	<ul class="tags clear">\
		<? suggested_tags.each(function(tagname) { ?>\
			<? var sel = note.tags ? note.tags.filter(function(t) { return view.tagetize(t.name) == view.tagetize(tagname); }).length > 0 : false; ?>\
			<?=format_tag(tagname, sel)?>\
		<? }); ?>\
		<? if(note.tags) { ?>\
			<? note.tags.each(function(tag) { ?>\
				<? if(suggested_tags.contains(view.tagetize(tag.name))) { return; } ?>\
				<?=format_tag(tag.name, true)?>\
			<? }); ?>\
		<? } ?>\
	</ul>\
<? } ?>\
';

_templates['notes/index'] = '<div class="note-actions">\
	<div class="button add note" title="Add a new note to the current board (shortcut `a`)">\
		<span>Add note</span>\
	</div>\
	<ul class="list-type hidden">\
		<li>\
			<a class="masonry <? if(display_type == \'masonry\') { ?>sel<? } ?>" href="#listing" title="Display notes as an arranged grid">\
				<span>&nbsp;</span>\
			</a>\
		</li>\
		<li>\
			<a class="grid <? if(display_type == \'grid\') { ?>sel<? } ?>" href="#grid" title="Display notes as a boring grid (allows sorting notes)">\
				<span>&nbsp;</span>\
			</a>\
		</li>\
		<!--\
		<li>\
			<a class="list <? if(display_type == \'list\') { ?>sel<? } ?>" href="#listing" title="Display notes as a list">\
				<span>&nbsp;</span>\
			</a>\
		</li>\
		-->\
	</ul>\
</div>\
<ul class="clear note_list list_<?=display_type?>"></ul>\
';

_templates['notes/list/image'] = '<a class="img" href="<?=note.url?>" target="_blank">\
	<img src="<?=note.url?>">\
	<? if(note.title) { ?>\
		<h2><?=note.title?></h2>\
	<? } ?>\
</a>\
';

_templates['notes/list/index'] = '<?\
var color = note.color;\
if(color) color = [\'none\',\'blue\',\'red\',\'green\',\'purple\',\'pink\',\'brown\',\'black\'][parseInt(color)-1];\
?>\
<? if(color) { ?><span class="color <?=color?>"></span><? } ?>\
\
<div class="actions">\
	<a class="sort" href="#sort" title="Drag to sort"><span></span></a>\
	<a class="open" href="#open" title="Open note (shortcut `enter`)"><span>Open note</span></a>\
	<a class="menu" href="#menu" title="Note menu"><span>Note menu</span></a>\
	<ul class="dropdown">\
		<li><a href="#edit" class="edit" title="Edit note (shortcut `e`)"><span>Edit note</span></a></li>\
		<li><a href="#move" class="move" title="Move note to another board (shortcut `m`)"><span>Move note to another board</span></a></li>\
		<li><a href="#delete" class="delete" title="Delete note (shortcut `delete`)"><span>Delete note</span></a></li>\
	</ul>\
</div>\
<div class="gutter content">\
	<?=Template.render(\'notes/list/\'+note.type, {\
		note: note\
	})?>\
</div>\
';

_templates['notes/list/link'] = '<?\
if(!note.url) note.url = \'\';\
\
var link = note.url;\
if(!link.match(/^[\\w]+:\\/\\//)) link = \'http://\' + link;\
var title = note.title;\
if(!title) title = note.url.replace(/^[\\w]+:\\/\\/(www\\.)?/i, \'\').replace(/([?&#])/g, \'$1<span class="break"> </span>\');\
?>\
<h1><a href="<?=link?>" target="_blank"><?=title?></a></h1>\
<? if(note.text && note.text != \'\') { ?>\
	<?=markdown.toHTML(note.text)?>\
<? } ?>\
';

_templates['notes/list/text'] = '<?=markdown.toHTML(note.text)?>\
';

_templates['notes/move'] = '<h1>Move this note to another board</h1>\
<div class="content">\
	<p>\
		To move this note to another board, select one of your boards below.\
	</p>\
</div>\
\
<select name="board">\
	<? boards.each(function(p) { ?>\
		<option value="<?=p.id?>"\
				<? if(note.board_id == p.id) { ?>selected<? } ?> >\
			<?=p.title?>\
		</option>\
	<? }); ?>\
</select>\
';

_templates['notes/view/image'] = '<a class="img clear" href="<?=note.url?>" target="_blank">\
	<img src="<?=note.url?>">\
</a>\
<? if(note.title || note.text || tags != \'\') { ?>\
	<div class="content">\
		<? if(tags != \'\') { ?><?=tags?><? } ?>\
		<? if(note.title) { ?>\
			<h1><?=note.title?></h1>\
		<? } ?>\
		<span class="clearMe"></span>\
		<? if(note.text && note.text != \'\') { ?>\
			<?=markdown.toHTML(note.text)?>\
		<? } ?>\
	</div>\
<? } ?>\
';

_templates['notes/view/index'] = '<?\
var color = note.color;\
if(color) color = [\'none\',\'blue\',\'red\',\'green\',\'purple\',\'pink\',\'brown\',\'black\'][parseInt(color)-1];\
?>\
<? if(color) { ?><span class="color <?=color?>"></span><? } ?>\
\
<div class="actions">\
	<a class="menu" href="#menu" title="Note menu"><span>Note menu</span></a>\
	<ul class="dropdown">\
		<li><a href="#edit" class="edit" title="Edit note (shortcut `e`)"><span>Edit note</span></a></li>\
		<li><a href="#move" class="move" title="Move note to another board (shortcut `m`)"><span>Move note to another board</span></a></li>\
		<li><a href="#delete" class="delete" title="Delete note (shortcut `delete`)"><span>Delete note</span></a></li>\
	</ul>\
</div>\
<? if(note.type != \'image\') { ?><div class="content"><? } ?>\
	<? var tags = Template.render(\'notes/view/tags\', { tags: note.tags }); ?>\
	<?=Template.render(\'notes/view/\'+note.type, {\
		note: note,\
		tags: tags.clean()\
	})?>\
<? if(note.type != \'image\') { ?></div><? } ?>\
';

_templates['notes/view/link'] = '<?\
var link = note.url;\
if(!link.match(/^[\\w]+:\\/\\//)) link = \'http://\' + link;\
var title = note.title;\
if(!title) title = note.url.replace(/^[\\w]+:\\/\\/(www\\.)?/i, \'\');\
?>\
<? if(tags != \'\') { ?><?=tags?><? } ?>\
<h1><a href="<?=link?>" target="_blank"><?=title?></a></h1>\
<? if(note.text && note.text != \'\') { ?>\
	<span class="clearMe"></span>\
	<?=markdown.toHTML(note.text)?>\
<? } ?>\
';

_templates['notes/view/tags'] = '<? if(tags.length > 0) { ?>\
	<div class="note-tags clear">\
		<!--<img src="<?=img(\'/images/site/icons/tag_16x16_black.png\')?>" class="icon" title="tags" width="16" height="16" alt="tags" />-->\
		<ul class="tags clear">\
			<? tags.each(function(t) { ?>\
				<li><span><?=t.name?></span></li>\
			<? }); ?>\
		</ul>\
	</div>\
<? } ?>\
';

_templates['notes/view/text'] = '<? if(tags != \'\') { ?><?=tags?><? } ?>\
<?=markdown.toHTML(note.text)?>\
';

_templates['notifications/index'] = '<ul class="switch">\
	<!--<li><a class="notes" href="/" title="Notes"><span>&nbsp;</span></a></li>-->\
	<li><a class="notifications <? if(is_open) { ?>sel<? } ?>" href="#notifications" title="Notifications"><span>&nbsp;</span></a></li>\
</ul>\
<div class="notification-list <? if(is_open) { ?>sel<? } ?>">\
	<div class="gutter">\
		<? if(notifications.length > 0) { ?>\
			<ul>\
				<? notifications.each(function(n) { ?>\
					<? if(!n.body.type) { return false }; ?>\
					<li class="clear <?=n.body.type?> notification_<?=n.id?>">\
						<ul class="actions clear">\
							<li><a class="accept" title="Accept invite" href="#accept">&nbsp;</a></li>\
							<li><a class="deny" title="Delete invite" href="#deny">&nbsp;</a></li>\
						</ul>\
						<?=n.subject?>\
					</li>\
				<? }); ?>\
			</ul>\
		<? } else { ?>\
			<p class="none">You have no notifications.</p>\
		<? } ?>\
	</div>\
</div>\
';

_templates['personas/edit'] = '<?\
var action = persona.id ? \'Edit\' : \'Add\';\
?>\
<h1>\
	<!--<? if(was_join) { ?><em>Almost done: </em><? } ?>-->\
	<?=action?> <? if(was_join) { ?>a <? } ?>persona\
	<? if(was_join) { ?>\
		<small>(personas let you to share with others)</small>\
	<? } else { ?>\
		<small><a href="#personas">&laquo; Back to <? if(return_to_manage) { ?>board management<? } else { ?>your personas<? } ?></a></small>\
	<? } ?>\
</h1>\
<div class="persona-edit clear">\
	<form class="standard-form">\
		<input tabindex="1" type="text" name="email" value="<?=persona.email?>" placeholder="Your email address">\
		<img class="load" src="<?=img(\'/images/site/icons/load_16x16.gif\')?>" width="16" height="16" alt="WORKING!!!1">\
		<p class="taken">&nbsp;</p>\
\
		<input tabindex="2" type="text" name="name" value="<?=persona.name?>" placeholder="Full name (optional)">\
\
		<span class="clearMe"></span>\
		<div class="submit">\
			<input tabindex="4" type="submit" value="<?=action?> persona">\
			<? if(was_join) { ?><a class="skip" href="#skip">Skip this step &raquo;</a><? } ?>\
		</div>\
	</form>\
	<div class="info content">\
		<p>\
			By default, your Turtl account is private. Personas change this by\
			giving your account a face: a name and an email people can use to\
			find you on Turtl and securely share with you.\
			<a href="http://turtl.it/security#personas" target="_blank">Read more &raquo;</a>\
		</p>\
	</div>\
</div>\
';

_templates['personas/index'] = '<h1>Your personas</h1>\
<div class="personas">\
	<div class="content">\
		<p>\
			Personas let you give a "face" to your account. By default, your\
			profile is private and your account is hidden. Persona\'s allow you to\
			share your data (and be shared with).\
		</p>\
	</div>\
\
	<? if(num_personas > 0) { ?>\
		<div class="personas-list"></div>\
	<? } ?>\
	<? if(num_personas == 0) { ?>\
		<div class="button add <? if(num_personas > 0) { ?>disabled<? } ?>">\
			<span>Add a persona</span>\
		</div>\
		<div class="content">\
			<p>\
				You don\'t have any personas. <a href="#add-persona" class="add"><strong>Add one</strong></a>\
				to start sharing.\
			</p>\
		</div>\
	<? } ?>\
</div>\
';

_templates['personas/list'] = '<? personas.each(function(p) { ?>\
	<li class="persona_<?=p.id?> clear">\
		<h3><?=p.email?></h3>\
		<small><?=p.name?></small>\
		<? if(p.has_key) { ?>\
			<small class="success">(RSA 3072)</small>\
		<? } else { ?>\
			<small>(generating RSA key)</small>\
		<? } ?>\
		<? if(show_edit) { ?>\
			<ul>\
				<li>\
					<a href="#email" title="Update this persona\'s email/notification settings">\
						<img src="<?=img(\'/images/site/icons/email_16x16_black.png\')?>" width="16" height="16" alt="email">\
					</a>\
				</li>\
				<li>\
					<a href="#edit" title="Edit this persona">\
						<img src="<?=img(\'/images/site/icons/edit_16x16_black.png\')?>" width="16" height="16" alt="edit">\
					</a>\
				</li>\
				<li>\
					<a href="#delete" title="Delete this persona permanently">\
						<img src="<?=img(\'/images/site/icons/delete_16x16_black.png\')?>" width="16" height="16" alt="delete">\
					</a>\
				</li>\
			</ul>\
			<div class="email-settings">\
				<? var settings = p.settings || {}; ?>\
				<h4>Email settings</h4>\
				<table>\
					<tr>\
						<?\
						var email_invite	=	true;\
						var label_id		=	\'email_\'+p.id;\
						var name			=	\'notify_invite\';\
						if(typeof settings[name] != \'undefined\' && settings[name] === 0)\
						{\
							email_invite	=	false;\
						}\
						?>\
						<td>\
							<label for="<?=label_id?>">Notify me when I get a board invitation</label>\
						</td>\
						<td>\
							<input id="<?=label_id?>" type="checkbox" name="<?=name?>" value="1" <? if(email_invite) { ?>checked<? } ?>>\
						</td>\
					</tr>\
				</table>\
			</div>\
		<? } ?>\
	</li>\
<? }); ?>\
';

_templates['personas/select'] = '<div class="select-persona">\
	<? if(persona.id) { ?>\
		<div class="persona">\
			<h3><?=persona.email?></h3>\
			<? if(!lock) { ?>\
				<a href="#change" title="Pick another persona">change</a>\
			<? } ?>\
			<p>\
				<?=persona.name?>\
			</p>\
		</div>\
	<? } else { ?>\
		<div class="search">\
			<form class="standard-form">\
				<input <? if(tabindex) { ?>tabindex="<?=tabindex?>"<? } ?> type="text" name="email" autocomplete="off" placeholder="Type the email of the person you\'re searching for.">\
				<img class="load" src="<?=img(\'/images/site/icons/load_16x16.gif\')?>" width="16" height="16" alt="WORKING!!!1">\
			</form>\
			<div class="personas">\
				<div class="personas-list"></div>\
			</div>\
		</div>\
	<? } ?>\
</div>\
';

_templates['tags/index'] = '<!--\
<div class="header">\
	Tags <a href="#tag-help" class="tag-help">(help)</a>\
	<ul class="actions">\
	</ul>\
</div>\
-->\
<div class="filters clear">\
	<input type="text" name="search" placeholder="Search notes" title="Search notes in this board (shortcut `f`)">\
	<a href="#clear-filters" class="clear" title="Reset all search filters (shortcut `x`)">clear filters</a>\
</div>\
\
<ul class="tags"></ul>\
';

_templates['tags/item'] = '<?=tag.name?>\
';

_templates['users/join'] = '<div class="userform join">\
	<h1>\
		Join Turtl\
		<small><a href="/users/login" title="Log in">Already have an account?</a></small>\
	</h1>\
	<form action="/users/join">\
		<input type="text" name="username" placeholder="Username" tabindex="1">\
		<input type="password" name="password" placeholder="Password" tabindex="2">\
		<input type="password" name="confirm" placeholder="Confirm password" tabindex="3">\
		<div class="content">\
			<p class="error">\
				You <em>must</em> <strong>remember your password</strong>.\
			</p>\
			<p>\
				Your password is used not only to log you in, but to decrypt all\
				of your data in Turtl. There is no password recovery feature\
				because even we don\'t have access to the data in your user account\
				(it\'s encrypted with your password).\
			</p>\
			<p>\
				<em>Make sure you keep your password in a safe place!</em>\
			</p>\
			<p>\
				Read more about <a href="http://turtl.it/about">how Turtl works</a>.\
			</p>\
		</div>\
		<input type="submit" value="Join" tabindex="4">\
	</form>\
</div>\
';

_templates['users/login'] = '<div class="userform login">\
	<h1>\
		Login\
		<small><a href="/users/join" title="Join Turtl">Don\'t have an account?</a></small>\
	</h1>\
	<form action="/users/login">\
		<input type="text" name="username" placeholder="Username" tabindex="1">\
		<input type="password" name="password" placeholder="Password" tabindex="2">\
		<input type="submit" value="Login" tabindex="3">\
	</form>\
</div>\
';
