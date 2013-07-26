#!/bin/bash

### This script generates index.html, which loads all needed javascript and
### templates for the app.

## -----------------------------------------------------------------------------
## generate CSS links
## -----------------------------------------------------------------------------
css=""
cssfiles="`find app/css -name '*.css' \
	| sort \
	| grep -v 'template.css' \
	| grep -v 'reset.css' \
	| grep -v 'general.css' `"
for cssfile in $cssfiles; do
	css="$css"'\n'"<link rel=\"stylesheet\" href=\"$cssfile\">"
done

## -----------------------------------------------------------------------------
## generate JS includes
## -----------------------------------------------------------------------------
js=""
function print_js() {
	jsfile=$1
	jsfile="`echo $jsfile | sed 's|___| |g'`"
	js="$js"'\n'"<script src=\"$jsfile\"></script>"
}

function path_to_js() {
	path=$1
	files="`find $path -name '*.js' | sort | sed 's| |___|g'`"
	js="$js"'\n'
	for jsfile in $files; do
		print_js $jsfile
	done
}

jsfiles="`find app/library -name '*.js' \
	| sort \
	| grep -v 'ignore' \
	| grep -v 'mootools-' \
	| grep -v 'composer' \
	| grep -v 'bookmarklet' \
	| sed 's| |___|g' `"
for jsfile in $jsfiles; do print_js $jsfile; done

print_js "app/tagit.js"
path_to_js "app/tagit"
path_to_js "app/handlers"
path_to_js "app/controllers"
path_to_js "app/models"

## -----------------------------------------------------------------------------
## generate templates
## -----------------------------------------------------------------------------
views=""
viewfiles="`find app/views -name '*.html' | sort | sed 's| |___|g'`"
for viewfile in $viewfiles; do
	content="`cat $viewfile \
		| sed 's|</script>|</%script%>|g' \
		| sed 's|<script|<%script%|g'`"
	name="`echo $viewfile | sed 's|app/views/||' | sed 's|\.html||' `"
	views="${views}"'\n'
	views="${views}<script type=\"text/x-lb-tpl\" name=\"${name}\">"'\n'
	views="${views}${content}"'\n'
	views="${views}</script>"
done

## -----------------------------------------------------------------------------
## put it all together
## -----------------------------------------------------------------------------
function replace() {
	string=$1
	rep=$2
	string="`echo "$string"|awk '{printf("%s\\\\n", $0);}'|sed -e 's/\\\n$//'`"
	echo "$string"
}

index="`cat index.html.tpl`"
index="`echo \"$index\" | sed \"s|{{gencss}}|$(replace "$css")|g\"`"
index="`echo \"$index\" | sed \"s|{{genjs}}|$(replace "$js")|g\"`"

# split file on genviews (can't use abot process because of sed errors)
index1=${index%\{\{genviews\}\}*}
index2=${index#*\{\{genviews\}\}}
index="${index1}${views}${index2}"

echo -ne "$index" > index.html

