var meta	=	document.getElementsByTagName('meta');
var desc	=	false;
var image	=	false;
for(var x in meta)
{
	if(meta[x].name != 'description') continue;
	desc = meta[x].content;
	break;
}

for(var x in meta)
{
	if(meta[x].getAttribute && meta[x].getAttribute('property') == 'og:image')
	{
		image	=	meta[x].content;
		break;
	}
}

if(!image)
{
	var images	=	document.getElementsByTagName('img');
	var divs	=	document.getElementsByTagName('div');

	var size	=	0;	// used to track largest image

	for(var i = 0, n = images.length; i < n; i++)
	{
		var img		=	images[i];
		if(img.width < 150 || img.height < 150) continue;
		var isize	=	img.width * img.height;
		if(isize > size)
		{
			size	=	isize;
			image	=	img.src;
		}
	}

	for(var i = 0, n = divs.length; i < n; i++)
	{
		var div	=	divs[i];
		if(!div.style.width || !div.style.height) continue;
		if(!div.style.backgroundImage) continue;
		if(div.style.width < 200 || div.style.height < 200) continue;
		var img	=	new Image();
		img.src	=	div.style.backgroundImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
		if(img.width < 150 || img.height < 150) continue;
		var isize	=	img.width * img.height;
		if(isize > size)
		{
			size	=	isize;
			image	=	img.src;
		}
	}
}

self.port.emit('scraped', {image: image, desc: desc});

