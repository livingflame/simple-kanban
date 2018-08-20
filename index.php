<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Simple Kanban</title>
        <link type="text/css" rel="stylesheet" href="css/reset.css"/>
        <link type="text/css" rel="stylesheet" href="css/bootstrap.min.css"/>
        <link type="text/css" rel="stylesheet" href="css/style.css"/>
        <link type="text/css" rel="stylesheet" href="css/jquery.modal.css"/>
        <link type="text/css" rel="stylesheet" href="css/selectric/selectric.css"/>
        <!--[if lt IE 9]>
        <link rel="stylesheet" type="text/css" href="css/style-ie7-8.css" />
        <![endif]-->
        <!--<script type="text/javascript" src="js/bootstrap.min.js"></script>-->
        <script type="text/javascript" src="js/jquery-3.1.1.js"></script>
        <script type="text/javascript" src="js/jquery.dragsort-0.5.2.js"></script>
        <script type="text/javascript" src="js/jquery.modal.js"></script>
        <script type="text/javascript" src="js/showdown.js"></script>
        <script type="text/javascript" src="js/selectric/jquery.selectric.min.js"></script>
        <script type="text/javascript" src="js/NeoDialog.js"></script>
        <script type="text/javascript" src="js/kanban.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var converter = new showdown.Converter();
                converter.setFlavor('github');
                converter.setOption('simpleLineBreaks',false);

                var hidden_div = $(document.createElement('div'));
                hidden_div.addClass('hiddendiv');

                var kanban = $.kanban({
                    api_url:'server.php',
                    converter:converter,
                    hidden_div:hidden_div
                });
            });
        </script>
    </head>
    <body>
        <div id="outer">
            <div id="contain-all">
                <div class="inner">
                    <div id="wrapper">
                        <div id="board">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="top-bar">
            <div id="topbar-inner">        
                <nav id="top_nav" class="navbar navbar-inverse">
                  <div class="container-fluid">
                    <div class="navbar-header">
                      <span class="navbar-brand">
                        Kanban
                      </span>
                    </div>
                    <div class="collapse navbar-collapse">
                        <ul class="nav navbar-nav">
                            <li><a href="#" class="new_column"><i class="glyphicon glyphicon-object-align-top"></i> New Column</a></li>
                            <li><a href="#" class="export"><i class="glyphicon glyphicon-export"></i> Export</a></li>
                            <li><a href="#" class="import"><i class="glyphicon glyphicon-import"></i> Import</a></li>
                            <li><a href="#"><i class="glyphicon glyphicon-compressed"></i> Archives</a></li>
                        </ul>
                        <ul class="nav navbar-nav navbar-right">
                            <li><a href="#" class="kanban_info"><i class="glyphicon glyphicon-info-sign"></i> Help</a></li>
                        </ul>
                    </div>
                  </div>
                </nav>
            </div>
        </div>
        <div id="footer">
            <div id="notify_container"></div>
            <div id="footer-inner"><div id="navigation" class="navigation"></div></div>
        </div>
    </body>
</html>