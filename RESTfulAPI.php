<?php
class RESTfulAPI
{
    protected $output_format_list = array('json' => 'application/json', 'text' => 'text/plain', 'xml' => 'text/xml');
    /**
     * Current output format.
     *
     * @var string
     */
    protected $charset = 'utf-8';
    protected $output_format = 'json';
    
    /**
     * List of possible output formats.
     *
     * @var array
     */
    protected $output_format_methods = array('json' => 'asJSON', 'xml' => 'asXML');
    
    /**
     * List of possible methods.
     * @var array
     */
    protected $supported_methods = array('get', 'post', 'put', 'delete', 'head', 'trace', 'options', 'patch', 'connect');
    
    /**
     * Current URL.
     *
     * @var string
     */
    protected $url;
    
    
    /**
     * Custom set http method.
     *
     * @var string
     */
    protected $method;
    
    /**
     * Current routes.
     *
     * structure:
     *  array(
     *    '<uri>' => <callable>
     *  )
     *
     * @var array
     */
    protected $routes = array();
    protected $default_routes_added = false;
    
    /**
     * HTTP ERROR Codes
     * 
     * 1xx: Meta, only used for negotiations
     * 2xx: Success
     * 3xx: Redirection
     * 4xx: Client-Side Error
     * 5xx: Server-Side Error
     *
     * @var $ecode array HTTP Error codes with title
     */
    private $status_codes = array( // Importance |
        '100' => "Continue", // Medium 
        '101' => "Switching Protocols", // Very Low
        '200' => "OK", // Very High
        '201' => "Created", // High
        '202' => "Accepted", // Medium
        '203' => "Non-Authoritative Information", // Very Low
        '204' => "No Content", // High
        '205' => "Reset Content", // Low
        '206' => "Partial Content", // Low
        '207' => "Multi-Status", // Low to Medium
        '300' => "Multiple Choices", // Low
        '301' => "Moved Permanently", // Medium
        '302' => "Found", //
        '303' => "See Other", // High
        '304' => "Not Modified", // High
        '305' => "Use Proxy", // Low
        '306' => "Unused", // None
        '307' => "Temporary Redirect", // High
        '400' => "Bad Request", // High
        '401' => "Unauthorized", // High
        '402' => "Payment Required", // None
        '403' => "Forbidden", // Medium
        '404' => "Not Found", // High
        '405' => "Method Not Allowed", // Medium
        '406' => "Not Acceptable", // Medium
        '407' => "Proxy Authentication Required", // Low
        '408' => "Request Timeout", // Low
        '409' => "Conflict", // High
        '410' => "Gone", // Medium
        '411' => "Length Required", // Low to Medium
        '412' => "Precondition Failed", // Medium
        '413' => "Request Entity Too Large", // Low to Medium
        '414' => "Request-URI Too Long", // Low
        '415' => "Unsupported Media Type", // Medium
        '416' => "Requested Range Not Satisfiable", // Low
        '417' => "Expectation Failed", // Medium 
        '500' => "Internal Server Error", // High
        '501' => "Not Implemented", // Low
        '502' => "Bad Gateway", // Low
        '503' => "Service Unavailable", // Medium to High
        '504' => "Gateway Timeout", // Low
        '505' => "HTTP Version Not Supported" // Very Low
        );
    
    protected $host;
    protected $client_name;
    protected $accept;
    protected $accept_list;
    protected $auth;
    protected $input;
    protected $query;
    protected $username;
    protected $password;
    protected $keys;
    protected $data;
    
    /**
     * @param Server $pServerController
     */
    public function __construct()
    {
        $this->realm = "Basic RESTfulPHP Web Auth";
        $this->invoke($this->fullURL());
    }
    public function invoke($full_url)
    {
        $this->setUrl($full_url);
        $this->setupFormats();
        $this->autoAgent();
        $this->autoHTTPAccept();
        $this->autoHTTPAuth();
        $this->autoInput();
        $this->processHTTPAuth();
        $this->processHTTPRequestMethod();
    }
    public function getPathInfo()
    {
        if (empty($this->path_info)) {
            $path_info = '';
            if (isset($_SERVER['PATH_INFO'])) {
                $path_info = $_SERVER['PATH_INFO'];
            } elseif (isset($_GET['L'])) {
                $path_info = $_GET['L'];
            } else {
                $path_info = '/';
            }
            $this->path_info = $path_info;
        }
        return $this->path_info;
    }
    public function fullURL()
    {
        $isHTTPS = (isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] == "on");
        $port    = (isset($_SERVER["SERVER_PORT"]) && ((!$isHTTPS && $_SERVER["SERVER_PORT"] != "80") || ($isHTTPS && $_SERVER["SERVER_PORT"] != "443")));
        $port    = ($port) ? ':' . $_SERVER["SERVER_PORT"] : '';
        $url     = ($isHTTPS ? 'https://' : 'http://') . $_SERVER["SERVER_NAME"] . $port . $_SERVER["REQUEST_URI"];
        return $url;
    }
    
    public function baseUrl($file = "")
    {
        static $base_url;
        if (!$base_url) {
            $request_uri  = $_SERVER['REQUEST_URI'];
            $path_info    = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
            $query_string = isset($_SERVER['QUERY_STRING']) ? '?' . $_SERVER['QUERY_STRING'] : '';
            $request_uri  = str_replace($path_info, '', $request_uri);
            $request_uri  = str_replace($query_string, '', $request_uri);
            $base_url     = str_replace($path_info, NULL, $this->fullURL());
            $base_url     = str_replace($query_string, NULL, $base_url);
            $base_url     = str_replace(basename($request_uri), NULL, $base_url);
        }
        return $base_url . $file;
    }
    
    /**
     * Sends the actual response.
     *
     * @param string $pHttpCode
     * @param        $pMessage
     */
    public function sendResponse($pHttpCode = '200', $pMessage)
    {
        if (php_sapi_name() !== 'cli') {
            $status = $this->status_codes[$pHttpCode];
            header('HTTP/1.1 ' . ($status ? $pHttpCode . ' ' . $status : $pHttpCode), true, $pHttpCode);
        }
        
        $pMessage           = array_reverse($pMessage, true);
        $pMessage['status'] = intval($pHttpCode);
        $pMessage           = array_reverse($pMessage, true);
        
        $method = $this->getOutputFormatMethod($this->getOutputFormat());
        echo $this->$method($pMessage);
        exit;
    }
    
    /**
     * @param  string $pFormat
     * @return string
     */
    public function getOutputFormatMethod($pFormat)
    {
        return $this->output_format_methods[$pFormat];
    }
    
    /**
     * @return string
     */
    public function getOutputFormat()
    {
        return $this->output_format;
    }
    
    /**
     * Detect the method.
     *
     * @return string
     */
    public function getMethod()
    {
        if ($this->method) {
            return $this->method;
        }
        
        $method = @$_SERVER['REQUEST_METHOD'];
        if (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']))
            $method = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
        
        if (isset($_GET['_method']))
            $method = $_GET['_method'];
        else if (isset($_POST['_method']))
            $method = $_POST['_method'];
        
        $method = strtolower($method);
        
        if (!in_array($method, $this->supported_methods)) {
            $this->sendResponse(405, 'Unsupported Format');
            $method = 'get';
        }
        
        return $method;
        
    }
    
    /**
     * Sets a custom http method. It does then not check against
     * SERVER['REQUEST_METHOD'], $_GET['_method'] etc anymore.
     *
     * @param  string $pMethod
     * @return Client
     */
    public function setMethod($pMethod)
    {
        $method = strtolower($pMethod);
        if (in_array($method, $this->supported_methods)) {
            $this->method = $method;
        } else {
            $this->sendResponse(405, 'Unsupported Format');
        }
        
        return $this;
    }
    
    /**
     * Set header Content-Length $pMessage.
     *
     * @param $pMessage
     */
    public function setContentLength($pMessage)
    {
        if (php_sapi_name() !== 'cli')
            header('Content-Length: ' . strlen($pMessage));
    }
    
    public function getContentType($type)
    {
        if (isset($this->output_format_list[$type])) {
            return $this->output_format_list[$type];
        }
        return 'text/plain';
    }
    /**
     * Converts $pMessage to pretty json.
     *
     * @param $pMessage
     * @return string
     */
    public function asJSON($pMessage)
    {
        if (php_sapi_name() !== 'cli')
            header('Content-Type: ' . $this->getContentType('json') . '; charset=' . $this->charset);
        
        $result = $this->jsonFormat($pMessage);
        $this->setContentLength($result);
        return $result;
    }
    
    /**
     * Indents a flat JSON string to make it more human-readable.
     *
     * Original at http://recursive-design.com/blog/2008/03/11/format-json-with-php/
     *
     * @param string $json The original JSON string to process.
     *
     * @return string Indented version of the original JSON string.
     */
    public function jsonFormat($json)
    {
        if (!is_string($json))
            $json = json_encode($json);
        $result       = '';
        $pos          = 0;
        $strLen       = strlen($json);
        $indentStr    = '    ';
        $newLine      = "\n";
        $inEscapeMode = false; //if the last char is a valid \ char.
        $outOfQuotes  = true;
        
        for ($i = 0; $i <= $strLen; $i++) {
            
            // Grab the next character in the string.
            $char = substr($json, $i, 1);
            
            // Are we inside a quoted string?
            if ($char == '"' && !$inEscapeMode) {
                $outOfQuotes = !$outOfQuotes;
                
                // If this character is the end of an element,
                // output a new line and indent the next line.
            } elseif (($char == '}' || $char == ']') && $outOfQuotes) {
                $result .= $newLine;
                $pos--;
                for ($j = 0; $j < $pos; $j++) {
                    $result .= $indentStr;
                }
            } elseif ($char == ':' && $outOfQuotes) {
                $char .= ' ';
            }
            
            // Add the character to the result string.
            $result .= $char;
            
            // If the last character was the beginning of an element,
            // output a new line and indent the next line.
            if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
                $result .= $newLine;
                if ($char == '{' || $char == '[') {
                    $pos++;
                }
                
                for ($j = 0; $j < $pos; $j++) {
                    $result .= $indentStr;
                }
            }
            
            if ($char == '\\' && !$inEscapeMode)
                $inEscapeMode = true;
            else
                $inEscapeMode = false;
        }
        
        return $result;
    }
    
    /**
     * Converts $pMessage to xml.
     *
     * @param $pMessage
     * @return string
     */
    public function asXML($pMessage)
    {
        if (php_sapi_name() !== 'cli')
            header('Content-Type: ' . $this->getContentType('xml') . '; charset=' . $this->charset);
        $xml = $this->toXml($pMessage);
        $xml = "<?xml version=\"1.0\"?>\n<response>\n$xml</response>\n";
        
        $this->setContentLength($xml);
        return $xml;
        
    }
    
    /**
     * @param  mixed  $pData
     * @param  string $pParentTagName
     * @param  int    $pDepth
     * @return string XML
     */
    public function toXml($pData, $pParentTagName = '', $pDepth = 1)
    {
        if (is_array($pData)) {
            $content = '';
            
            foreach ($pData as $key => $data) {
                $key = is_numeric($key) ? $pParentTagName . '-item' : $key;
                $content .= str_repeat('  ', $pDepth) . '<' . htmlspecialchars($key) . '>' . $this->toXml($data, $key, $pDepth + 1) . '</' . htmlspecialchars($key) . ">\n";
            }
            
            return $content;
        } else {
            return htmlspecialchars($pData);
        }
        
    }
    
    /**
     * Add a additional output format method.
     *
     * @param  string $pCode
     * @param  string $pMethod
     * @return Client $this
     */
    public function addOutputFormatMethod($pCode, $pMethod)
    {
        $this->output_format_methods[$pCode] = $pMethod;
        
        return $this;
    }
    
    /**
     * Set the current output format.
     *
     * @param  string $pFormat a key of $outputForms
     * @return Client
     */
    public function setFormat($pFormat)
    {
        $this->output_format = $pFormat;
        
        return $this;
    }
    
    /**
     * Returns the url.
     *
     * @return string
     */
    public function getUrl()
    {
        return $this->url;
    }
    
    /**
     * Set the url.
     *
     * @param  string $pUrl
     * @return Client $this
     */
    public function setUrl($pUrl)
    {
        $this->parseUrl($pUrl);
        $this->url = $pUrl;
        return $this;
    }
    
    /**
     * Setup formats.
     *
     * @return Client
     */
    public function setupFormats()
    {
        
        if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], '*/*') === false) { //through HTTP_ACCEPT
            foreach ($this->output_format_methods as $formatCode => $formatMethod) {
                if (strpos($_SERVER['HTTP_ACCEPT'], $formatCode) !== false) {
                    $this->output_format = $formatCode;
                    break;
                }
            }
        }
        
        
        if (preg_match('/\.(\w+)$/i', $this->getUrl(), $matches)) { //through uri suffix
            if (isset($this->output_format_methods[$matches[1]])) {
                $this->output_format = $matches[1];
                $url                 = $this->getUrl();
                $this->setUrl(substr($url, 0, (strlen($this->output_format) * -1) - 1));
            }
        }
        
        
        if (isset($_GET['_format'])) { //through _format parametr
            if (isset($this->output_format_methods[$_GET['_format']])) {
                $this->output_format = $_GET['_format'];
            }
        }
        
        return $this;
    }
    
    /**
     * Sends a 'Bad Request' response to the client.
     *
     * @param $pCode
     * @param $pMessage
     * @throws \Exception
     * @return string
     */
    public function sendBadRequest($pCode, $pMessage)
    {
        if (is_object($pMessage) && $pMessage->xdebug_message)
            $pMessage = $pMessage->xdebug_message;
        $msg = array(
            'error' => $pCode,
            'message' => $pMessage
        );
        return $this->sendResponse('400', $msg);
    }
    
    /**
     * Sends a 'Internal Server Error' response to the client.
     * @param $pCode
     * @param $pMessage
     * @throws \Exception
     * @return string
     */
    public function sendError($pCode, $pMessage)
    {
        if (is_object($pMessage) && $pMessage->xdebug_message)
            $pMessage = $pMessage->xdebug_message;
        $msg = array(
            'error' => $pCode,
            'message' => $pMessage
        );
        return $this->sendResponse('500', $msg);
    }
    
    
    /*  /////////////////////////////////////ROUTING METHODS///////////////////////////////////////////////  */
    
    public function map($rule, $target = array(), $conditions = array(), $method = "_ANY_")
    {
        $rule    = $this->normalizePath($rule);
        $methods = ($method != "_ANY_") ? $this->normalizeMethod($method) : array(
            "_ANY_"
        );
        $route   = array();
        if (isset($this->routes[$rule])) {
            $route = $this->routes[$rule];
        } else {
            $route = array(
                'rule' => $rule,
                'conditions' => $conditions,
                'method' => array()
            );
        }
        foreach ($methods as $method) {
            $route['method'][$method] = $target;
        }
        $this->routes[$rule] = $route;
    }
    
    public function normalizeMethod($method)
    {
        $method = explode("|", strtoupper($method));
        return array_intersect($this->supported_methods, $method);
    }
    
    public function normalizePath($url)
    {
        if ($url !== '/') {
            if (substr($url, 0, 1) != '/')
                $url = '/' . $url;
            $url = rtrim($url, "/"); //removes trailing slash
        }
        return $url;
    }
    
    public function defaultRoutes()
    {
        $this->map('/:controller', array(
            'action' => 'index'
        ), array(), "_ANY_");
        $this->map('/:controller/:action', array(), array(), "_ANY_");
        $this->map('/:controller/:action/:id', array(), array(
            'id' => '[\d]{1,8}'
        ), "_ANY_");
        $this->map('/:controller/:action/:param', array(), array(), "_ANY_");
    }
    
    public function get($rule, $target = array(), $conditions = array())
    {
        $this->map($rule, $target, $conditions, 'get');
    }
    
    public function post($rule, $target = array(), $conditions = array())
    {
        $this->map($rule, $target, $conditions, 'post');
    }
    
    public function put($rule, $target = array(), $conditions = array())
    {
        $this->map($rule, $target, $conditions, 'put');
    }
    
    public function delete($rule, $target = array(), $conditions = array())
    {
        $this->map($rule, $target, $conditions, 'delete');
    }
    
    public function head($rule, $target = array(), $conditions = array())
    {
        $this->map($rule, $target, $conditions, 'head');
    }
    
    public function option($rule, $target = array(), $conditions = array())
    {
        $this->map($rule, $target, $conditions, 'option');
    }
    
    public function patch($rule, $target = array(), $conditions = array())
    {
        $this->map($rule, $target, $conditions, 'patch');
    }
    
    public function getRoute($request_uri = '/', $method)
    {
        if (!$this->default_routes_added) {
            $this->defaultRoutes();
            $this->default_routes_added = true;
        }
        $matched     = array(
            'controller' => null,
            'action' => null,
            'params' => array()
        );
        $request_uri = $this->normalizePath($request_uri);
        
        foreach ($this->routes as $rule => $route) {
            if ($match = $this->checkMatch($route, $request_uri, $method)) {
                if (isset($match['controller'])) {
                    $matched['controller'] = $match['controller'];
                    unset($match['controller']);
                }
                if (isset($match['action'])) {
                    $matched['action'] = $match['action'];
                    unset($match['action']);
                }
                $matched['params'] = $match;
                break;
            }
        }
        
        return $matched;
    }
    
    private function checkMatch($route, $request_uri, $method)
    {
        
        $params = array();
        if ($route['rule'] == $request_uri) {
            $methods = $route['method'];
            $target = function()
            {
                return;
            };
            if (array_key_exists($method, $methods)) {
                $target = $methods[$method];
            } elseif (isset($methods['_ANY_'])) {
                $target = $methods['_ANY_'];
            }
            if (is_callable($target)) {
                $params['action'] = $target;
            } elseif (is_array($target)) {
                foreach ($target as $key => $value)
                    $params[$key] = $value;
            }
        } else {
            $param_names = array();
            preg_match_all('@:([\w]+)@', $route['rule'], $param_names, PREG_PATTERN_ORDER);
            $param_names = $param_names[0];
            
            $url_regex = preg_replace_callback('@:[\w]+@', function($matches) use ($route)
            {
                $key        = str_replace(':', '', $matches[0]);
                $conditions = $route['conditions'];
                if (array_key_exists($key, $conditions)) {
                    return '(' . $conditions[$key] . ')';
                } else {
                    return '([a-zA-Z0-9_\+\-%]+)';
                }
            }, $route['rule']);
            
            $url_regex .= '/?';
            if (preg_match('@^' . $url_regex . '$@', $request_uri, $param_values)) {
                $methods = $route['method'];
                array_shift($param_values);
                foreach ($param_names as $index => $value) {
                    $params[substr($value, 1)] = urldecode($param_values[$index]);
                }
                $target = function()
                {
                    return;
                };
                if (array_key_exists($method, $methods)) {
                    $target = $methods[$method];
                } elseif (isset($methods['_ANY_'])) {
                    $target = $methods['_ANY_'];
                }
                if (is_callable($target)) {
                    $params['action'] = $target;
                } elseif (is_array($target)) {
                    foreach ($target as $key => $value)
                        $params[$key] = $value;
                }
                unset($param_values);
            }
            
            unset($param_names);
        }
        
        return $params;
    }
    
    /**
     * Resolves Route to a callable or a controller and its method
     *
     * @param obj $route a route object
     * @return void
     */
    public function resolveRoute($route)
    {
        $error = TRUE;
        
        // Check if a controller and action name were declared.
        if ($route['controller'] && $route['action']) {
            if (strpos($route['controller'], 'Application\\Controller\\') !== 0) {
                $route['controller'] = 'Application\\Controller\\' . $route['controller'];
            }
            
            //does the class exist?
            if (class_exists($route['controller'])) {
                //does the routeed class contain the routeed action as a method?
                $method_exists   = method_exists($route['controller'], $route['action']);
                $method_callable = is_callable(array(
                    $route['controller'],
                    $route['action']
                ));
                if ($method_exists || $method_callable) {
                    //bad action/method error
                    $error = FALSE;
                }
            }
        } elseif ($route['action'] && is_callable($route['action'])) {
            $error = FALSE;
        }
        
        if ($error) {
            $route['controller'] = '\Application\Controller\Error';
            $route['action']     = 'badurl';
        }
        return $route;
    }
    
    public function parseUrl($pUrl)
    {
        $scheme = '';
        $host   = '';
        $port   = '';
        foreach (parse_url($pUrl) as $key => $value) {
            switch ($key) {
                case 'query':
                    $this->query = $value;
                    break;
                case 'path':
                    $path_array = array_filter(explode('/', $value));
                    $str        = '';
                    $found_file = '';
                    foreach ($path_array as $k => $v) {
                        if ($found_file)
                            break;
                        $str .= '/' . $v;
                        $path_parts = pathinfo($str);
                        if (isset($path_parts["extension"])) {
                            $found_file = $str;
                        }
                    }
                    if (!empty($found_file)) {
                        $this->path_info = str_replace($found_file, '', $value);
                    } else {
                        $this->path_info = $value;
                    }
                    break;
                case 'user':
                    $this->username = $value;
                    break;
                case 'pass':
                    $this->password = $value;
                    break;
                case 'scheme':
                    $scheme = $value;
                    break;
                case 'host':
                    $host = $value;
                    break;
                case 'port':
                    $port = $value;
                    break;
            }
        }
        if (!empty($host)) {
            $host = $_SERVER["SERVER_NAME"];
            if (empty($scheme)) {
                $isHTTPS = (isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] == "on");
                $scheme  = ($isHTTPS ? 'https' : 'http');
            }
            if (empty($port)) {
                if ($scheme == 'https') {
                    $isHTTPS = true;
                } else {
                    $isHTTPS = false;
                }
                $port = (isset($_SERVER["SERVER_PORT"]) && ((!$isHTTPS && $_SERVER["SERVER_PORT"] != "80") || ($isHTTPS && $_SERVER["SERVER_PORT"] != "443")));
                $port = ($port) ? ':' . $_SERVER["SERVER_PORT"] : '';
            }
            $this->host = $scheme . '//' . $host . $port;
        }
    }
    /**
     * Simulates a HTTP Call.
     *
     * @param  string $pUri
     * @param  string $pMethod The HTTP Method
     * @return string
     */
    public function simulateCall($pUri, $pMethod = 'get')
    {
        $this->parseUrl($pUri);
        $this->setMethod($pMethod);
        $this->processHTTPRequestMethod();
        $this->run();
        $this->invoke($this->fullURL());
    }
    
    public function run()
    {
        $route = $this->getRoute($this->getPathInfo(), $this->getMethod());
        $route = $this->resolveRoute($route);
        $this->dispatch($route);
    }
    
    public function dispatch($route)
    {
        $controller = $route['controller'];
        $action     = $route['action'];
        $params     = $route['params'];
        if($controlle && $action){
            $this->create($controller, $action, $params);
        } elseif($action && is_callable($action))
        {
            $parameters = array();
            
            if(is_array($action)){
                $ref = new ReflectionObject($action[0]);
                $refFunc = $ref->getMethod($action[1]);
                $parameters = $this->getCorrectParams($refFunc,$params);
                $parameters = $this->getAllParameterValues($parameters);
                $res = $refFunc->invokeArgs($action[0],$parameters);
            } elseif($action instanceof \Closure || is_string($action)) {
                $refFunc = new ReflectionFunction($action);
                $parameters = $this->getCorrectParams($refFunc,$params);
                $parameters = $this->getAllParameterValues($parameters);
                $res = $refFunc->invokeArgs($parameters);
            } elseif(is_object($action)) {
                if(method_exists($action,'__invoke') && is_callable($action, '__invoke')){
                    $ref =  new  ReflectionObject($action);
                    $refFunc = $ref->getMethod('__invoke');
                    $parameters = $this->ioc->getCorrectParams($refFunc,$params);
                    $parameters = $this->ioc->getAllParameterValues($parameters);
                    $res = $refFunc->invokeArgs($action,$parameters);
                }
            }
        }
    }
    /**
     * Checks if the parameter is a closure
     * @param  variable  $f   variable to check if closure
     * @return Boolean
     */
     
    public function isClosure($f) {
        return (is_object($f) && ($f instanceof Closure));
    }
    
    /**
     * object creator/builder. This should be the last one to be called.
     *
     * @param string $name the name of the method to be called
     * @param array $value the parameters of the method.
     * @return object or a result of method called
     */
    public function create($class_name, $call = NULL, $arg = array())
    {
        $obj = NULL;
        $reflect = new ReflectionClass($class_name);
        // creaet an object instance based on the constructor
        if ($constructor = $reflect->getConstructor())
        {
            $params = $this->getAllParameterValues($arg);
            $n_param = $this->getCorrectParams($constructor,$params);
            $obj = $reflect->newInstanceArgs($n_param);
        }
        else
        {
            $obj = $reflect->newInstanceWithoutConstructor();
        }
        
        if( $call && $reflect->hasMethod($call) ){
            $param = $this->getParameterValues($arg);
            $ref_method = $reflect->getMethod($call);
            $ref_param = $this->getCorrectParams($ref_method,$param);
            return $ref_method->invokeArgs($obj,(array) $ref_param);
        }
        return $obj;
    }
    public function getParameterValues($param)
    {
        if($this->isClosure($param))
        {
            return $param($this);
        }
        elseif (gettype($param) === "array")
        {
            return $this->getAllParameterValues($param);
        }
        else
        {
            return $param;
        }
    }
    public function getAllParameterValues($params)
    {
        $true_params = array();
        if(gettype($params) === "array")
        {
            foreach($params as $key => $param)
            {
                $true_params[$key] = $this->getParameterValues($param);
            }
        }
        return $true_params;
    }
	public function getCorrectParams(ReflectionFunctionAbstract $refMethod,$params){
        /* make sure we have an array for params */
		if(!is_array($params)){
			$params = (array) $params;
		}
		$method_parameter = array();
		$ref_params = array();
		$con_params = $refMethod->getParameters();
		/* get names of parameters */
		foreach($con_params as $con_param){
			$name = $con_param->getName();
			$ref_params[$name] = $con_param;
			$method_parameter[$name] = NULL; // we're assigning initial value here to make sure that correct sequence of parameters are in place
		}
		/* get the keys of the parameterss */
		$params_key = array_keys($params);
		$method_param_key = array_keys($ref_params);
		$instersect = array_intersect($method_param_key, $params_key);
        
		if($instersect){
			foreach($instersect as $exist_param){
				$method_parameter[$exist_param] = $params[$exist_param];
				unset($params[$exist_param]);
			}
		}
		/* get the key of parameter that did not appear in the $method_parameter */
		$differences = array_diff($method_param_key, $instersect);
		$param_current = current($params);
		$difference_current = current($differences);
		while($param_current){
			$method_parameter[$difference_current] = $param_current;
			$param_current = next($params);
			$difference_current = next($differences);
		}
		array_filter($method_parameter, function($var){return !is_null($var);} );
		foreach($ref_params as $param_name => $ref_param){
			if(!isset($method_parameter[$param_name])){
				if($ref_param->isDefaultValueAvailable()){
                    $method_parameter[$param_name] = $ref_param->getDefaultValue();  
                } else {
                    $method_parameter[$param_name] = NULL;
                }
			}
		}
		return $method_parameter;
	}
    /**
     * Browser Agent 
     * 
     * => _SERVER["HTTP_USER_AGENT"] <=
     * @todo add some parsing for matching clients like the iWork iPhone app
     * 
     * @return string
     */
    public function autoAgent()
    {
        $this->client_name = $_SERVER["HTTP_USER_AGENT"];
        
        return $this->client_name;
    }
    /**
     * autoHost 
     * 
     * => _SERVER["HTTP_HOST"] <= if _SERVER['HTTPS'] is set than use https://
     * @return string
     */
    public function autoHost()
    {
        if (empty($this->host)) {
            $isHTTPS    = (isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] == "on");
            $port       = (isset($_SERVER["SERVER_PORT"]) && ((!$isHTTPS && $_SERVER["SERVER_PORT"] != "80") || ($isHTTPS && $_SERVER["SERVER_PORT"] != "443")));
            $port       = ($port) ? ':' . $_SERVER["SERVER_PORT"] : '';
            $url        = ($isHTTPS ? 'https://' : 'http://') . $_SERVER["SERVER_NAME"] . $port;
            $this->host = $url;
        }
        
        return $this->host;
    }
    /**
     * autoHTTPAccept 
     * 
     * => _SERVER['HTTP_ACCEPT'] <= list of accecptable file types, defaults to json
     * @return string
     */
    public function autoHTTPAccept()
    {
        if (array_key_exists('HTTP_ACCEPT', $_SERVER)) {
            $this->accept_list = explode(',', $_SERVER['HTTP_ACCEPT']);
            $this->accept      = $_SERVER['HTTP_ACCEPT'];
        } else {
            $this->accept      = 'application/json';
            $this->accept_list = array(
                'application/json',
                'text/plain',
                'text/xml'
            );
        }
        return $this->accept;
    }
    
    /**
     * autoHTTPAuth 
     * 
     * => _SERVER['HTTP_AUTHORIZATION'] <= or => _SERVER['REDIRECT_HTTP_AUTHORIZATION'] <=
     * @return string
     */
    public function autoHTTPAuth()
    {
        if (array_key_exists('HTTP_AUTHORIZATION', $_SERVER) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $this->auth = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (array_key_exists('REDIRECT_HTTP_AUTHORIZATION', $_SERVER) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $this->auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        return $this->auth;
    }
    /**
     * autoInput 
     * 
     * => Process PUT data to your PHP script
     * @return string
     */
    
    public function autoInput()
    {
        $this->input = file_get_contents("php://input");
        return $this->input;
    }
    /**
     * getQuery 
     * 
     * @return void|string
     */
    public function getQuery()
    {
        if (empty($this->query)) {
            if (array_key_exists('QUERY_STRING', $_SERVER))
                parse_str($_SERVER['QUERY_STRING'], $output);
                $this->query = http_build_query($output);
        }
        
        return $this->query;
    }
    
    /**
     * getUsername 
     * 
     * => _SERVER['PHP_AUTH_USER']
     * @return void|string
     */
    public function getUsername()
    {
        if (empty($this->username)) {
            if (array_key_exists('PHP_AUTH_USER', $_SERVER))
                $this->username = $_SERVER['PHP_AUTH_USER'];
        }
        return $this->username;
    }
    
    /**
     * getPassword 
     * 
     * => _SERVER['PHP_AUTH_PW']
     * @return void|string
     */
    public function getPassword()
    {
        if (empty($this->password)) {
            if (array_key_exists('PHP_AUTH_PW', $_SERVER))
                $this->password = $_SERVER['PHP_AUTH_PW'];
        }
        return $this->password;
    }
    
    public function server($key,$default = null){
        if (array_key_exists($key, $_SERVER)) return $_SERVER[$key];
        return $default;
    }
    /**
     * process HTTP Request methods
     * 
     *  - GET => none of these vales should be used to change any data, only query and toggle ui 
     *  - POST => should be for creating new or updating items into the database
     *  - PUT => data comes in on the php://input stream, should be used for replacing resources and creating new resources
     *  - DELETE => parses qurey string for DELETE HTTP Method, no _GET is populated
     * @return boolean|void defaults to error page if not a proper HTTP METHOD used, returns true if no error
     */
    public function processHTTPRequestMethod()
    {
        //process request to be used in extended class
        switch ($this->method) {
            case 'GET':
                $this->processArray($_GET);
                break;
            case 'POST':
                $this->processArray($_POST);
                break;
            case 'PATCH':
            case 'DELETE':
            case 'PUT':
                parse_str($this->input, $post_vars);
                $this->processArray($post_vars);
                break;
            case 'HEAD':
            case 'OPTIONS':
                $this->processURIQueryString();
                //   case 'TRACE':  break;
                break;
        }
        return TRUE;
    }
    /** 
     * Process HTTP BASIC AUTH
     * 
     *  - sets PHP_AUTH_USER and PHP_AUTH_PW from HTTP_AUTHORIZATION
     * @link http://ca2.php.net/manual/en/features.http-auth.php#106285
     * @return boolean returns true always
     */
    
    public function processHTTPAuth()
    {
        // Parse Basic Authentication
        if (isset($this->auth) && preg_match('/Basic\s+(.*)$/i', $this->auth, $matches)) {
            list($name, $password) = explode(':', base64_decode($matches[1]));
            $_SERVER['PHP_AUTH_USER'] = strip_tags($name);
            $_SERVER['PHP_AUTH_PW']   = strip_tags($password);
        }
        return TRUE;
    }
    
    /**
     * process any key=>value pairs
     * 
     * useful for $_GET and $_POST arrays
     * 
     * @param array $arg
     * @return boolean fails if not an array with at least 1 item
     */
    
    public function processArray($arg)
    {
        if (!is_array($arg)) {
            return FALSE;
        }
        if (count($arg) < 1) {
            return FALSE;
        }
        foreach (array_keys($arg) as $k) {
            if (count($this->keys) < 1) { // if keys is empty then allow all
                $this->data[$k] = $arg[$k];
            } else { // if the post/get keys are not defined then don't add to data list
                if (array_key_exists($k, $this->keys)) {
                    $this->data[$k] = $arg[$k];
                }
            }
        }
        return TRUE;
    }
    
    /**
     * Process the QUERY_STRING 
     * 
     *  - ideal for when _GET is not populated by PHP 
     * 
     * rested.app on mac forces a query sring in DELETE request, there is no flexiblity with this HTTP METHOD in that tool
     * 
     * @return boolean always returns true
     */
    
    public function processURIQueryString()
    {
        parse_str($this->query, $arr);
        $this->processArray($arr);
        return TRUE;
    }
    /**
     * Basic HTTP Auth
     * @return boolean
     */
    public function basicAuth()
    {
        if (!$this->username) {
            header('WWW-Authenticate: Basic realm="' . $this->realm . '"');
            header('HTTP/1.1 401 Unauthorized');
            return FALSE;
        }
        return TRUE;
    }
    
    /**
     * Clears http auth and logs user out
     * 
     * only clear HTTP auth if _GET['clear'] is set, then redirect to script
     * 
     * @return void cancel HTTP Auth and exit
     */
    public function cancelAuth()
    {
        if (array_key_exists('clear', $_GET) && isset($_GET['clear'])) {
            unset($_SERVER['PHP_AUTH_USER']);
            unset($_SERVER['PHP_AUTH_PW']);
            unset($_GET);
            $this->username = null;
            $this->password = null;
            header('WWW-Authenticate: Basic realm="Cancel to logout"');
            header('HTTP/1.1 401 Unauthorized');
            //header("Location: ".$this->controller); 
            exit();
        }
    }
    
    public function zipResources($zip)
    {
        if (!class_exists('ZipArchive')) {
            $this->error = 'ZipArchive not found';
            $this->error('php_fail');
        }
        $za = new ZipArchive();
        $za->open($zip);
        $list = array();
        for ($i = 0; $i < $za->numFiles; $i++) {
            $z      = $za->statIndex($i);
            //META-INF/container.xml
            $list[] = $z['name'];
        }
        $za->close();
        return $list;
    }
    
}