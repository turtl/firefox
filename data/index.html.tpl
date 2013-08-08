<!DOCTYPE html>

<html>
  <head>
    <meta http-equiv="Content-Type" content="test/html; charset=utf-8">
    <meta http-equiv="Content-Language" content="en">
    <title>tag.it
    </title>
    <link rel="stylesheet" href="app/css/reset.css">
    <link rel="stylesheet" href="app/css/template.css">
    <link rel="stylesheet" href="app/css/general.css">
{{gencss}}
    <link rel="shortcut icon" href="app/favicon.png" type="image/png">
    <script src="app/library/mootools-core-1.4.5.js"></script>
    <script src="app/library/mootools-more-1.4.0.1.js"></script>
    <script src="app/library/composer/composer.js"></script>
    <script src="app/library/composer/composer.relational.js"></script>
    <script src="app/library/composer/composer.filtercollection.js"></script>
    <script src="app/library/composer/composer.keyboard.js"></script>
    <script>Composer.suppress_warnings = true;</script>
	<script src="app/config/config.js"></script>
	<script src="app/config/auth.js"></script>
	<script src="app/config/routes.js"></script>
{{genjs}}
  </head>
  <body class="initial">
    <div id="loading-overlay">
      <div>
        <span>Initializing
        </span>
        <span class="spin">/
        </span>
      </div>
    </div>
    <div id="wrap-modal">
      <div id="wrap">
        <div class="sidebar-bg"></div>
        <header class="clear">
          <h1>
            <a href="/">tag<span>.</span>it
            </a>
          </h1>
          <div class="loading">
            <img src="images/site/icons/load_42x11.gif">
          </div>
        </header>
        <div id="main" class="maincontent"></div>
      </div>
    </div>
    <div id="footer">
      <footer>
        <div class="gutter">Copyright &copy; 2013 
          <a href="http://www.lyonbros.com" target="_blank">Lyon Bros. Enterprises, LLC.
          </a>&amp; Drew
        </div>
      </footer>
    </div>
{{genviews}}
  </body>
</html>


