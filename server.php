<?php
//specify your own timezone, this tells PHP to use UTC.
 date_default_timezone_set( 'UTC' );
// ----------------------------------------------------------------------------------------------------
// - Display Errors
// ----------------------------------------------------------------------------------------------------
ini_set('display_errors', 'On');
ini_set('html_errors', 0);

// ----------------------------------------------------------------------------------------------------
// - Error Reporting
// ----------------------------------------------------------------------------------------------------
error_reporting(-1);

// ----------------------------------------------------------------------------------------------------
// - Shutdown Handler
// ----------------------------------------------------------------------------------------------------
function ShutdownHandler()
{
    if(@is_array($error = @error_get_last()))
    {
        return(@call_user_func_array('ErrorHandler', $error));
    };

    return(TRUE);
};

register_shutdown_function('ShutdownHandler');

// ----------------------------------------------------------------------------------------------------
// - Error Handler
// ----------------------------------------------------------------------------------------------------
function ErrorHandler($type, $message, $file, $line)
{
    $_ERRORS = Array(
        0x0001 => 'E_ERROR',
        0x0002 => 'E_WARNING',
        0x0004 => 'E_PARSE',
        0x0008 => 'E_NOTICE',
        0x0010 => 'E_CORE_ERROR',
        0x0020 => 'E_CORE_WARNING',
        0x0040 => 'E_COMPILE_ERROR',
        0x0080 => 'E_COMPILE_WARNING',
        0x0100 => 'E_USER_ERROR',
        0x0200 => 'E_USER_WARNING',
        0x0400 => 'E_USER_NOTICE',
        0x0800 => 'E_STRICT',
        0x1000 => 'E_RECOVERABLE_ERROR',
        0x2000 => 'E_DEPRECATED',
        0x4000 => 'E_USER_DEPRECATED'
    );

    if(!@is_string($name = @array_search($type, @array_flip($_ERRORS))))
    {
        $name = 'E_UNKNOWN';
    };

    return(print(@sprintf("<p>[%s] Error in file '%s' at line %d: %s</p>\n", $name, @basename($file), $line, $message)));
};

$old_error_handler = set_error_handler("ErrorHandler");

define('DATA_FILE', 'var/cards.json');
define('COLUMN_FILE', 'var/states.json');
define('USER_FILE', 'var/users.json');
define('ARCHIVE_FILE', 'var/archives.json');


define('DS', DIRECTORY_SEPARATOR );
define('DOC_ROOT',      realpath(dirname(__FILE__)) . DS);// Document root full path





session_start();
$_SESSION["user_id"] = "usr_1502874459563";
class SimpleKanbanServer {
	private $server_key;
	private $ivlen;
	private $card_file;
	private $state_file;
	private $user_file;
	private $archive_file;
	private $encrypt_method = "AES-256-CTR";

	public function __construct($card_file,$state_file,$user_file,$archive_file,$server_key) {
        $this->card_file = $card_file;
        $this->state_file = $state_file;
        $this->user_file = $user_file;
        $this->archive_file = $archive_file;
        $this->server_key = $server_key;
        $this->ivlen = openssl_cipher_iv_length($this->encrypt_method); 
        header("Access-Control-Allow-Origin: *");
        if(!empty($_GET['action'])){
            switch ($_GET['action']) {
                case 'load_all':
                    echo $this->loadAll();
                    break;
                /////////////////////////////////////////////////
                case 'add_task':
                    echo $this->addTask();
                    break;
                case 'remove_task':
                    echo $this->removeTask();
                    break;
                case 'update_task':
                    echo $this->updateTask();
                    break;
                //////////////////////CARDS//////////////////////
                case 'remove_card':
                    echo $this->removeCard();
                    break;
                case 'remove_cards':
                    echo $this->removeCards();
                    break;
                case 'add_card':
                    echo $this->addCard();
                    break;
                case 'update_cards':
                    echo $this->updateCards();
                    break;
                case 'load_card':
                    echo $this->loadCard();
                    break;
                case 'save_cards':
                    if(!empty($_POST['data'])){
                        echo $this->saveCards($_POST['data']);
                    }
                    break;
                case 'load_cards':
                    echo json_encode($this->loadCards());
                    break;
                //////////////////////COLUMNS//////////////////////
                case 'add_column':
                    echo $this->addColumn();
                    break;
                case 'remove_column':
                    echo $this->removeColumn();
                    break;
                case 'update_columns':
                    echo $this->updateColumns();
                    break;
                case 'load_columns':
                    echo json_encode($this->loadColumns());
                    break;
                //////////////////////USERS//////////////////////
                case 'load_users':
                    echo json_encode($this->loadUsers());
                    break;
                //////////////////////ARCHIVES//////////////////
                case 'save_archives':
                    echo $this->saveArchives();
                    break;
                case 'load_archives':
                    echo $this->loadArchives();
                    break;
                //////////////////////COMMENTS//////////////////
                case 'add_card_comment':
                    echo $this->addCardComment();
                    break;
                case 'remove_card_comment':
                    echo $this->removeCardComment();
                    break;
                case 'update_card_comment':
                    echo $this->updateCardComment();
                    break;
                case 'to_files':
                    echo $this->archivesToFiles();
                    break;
                case 'load_card_comments':
                    if(!empty($_POST['card_id'])){
                        echo $this->loadCardComments($_POST['card_id']);
                    }
                    echo "{}";
                    break;
                //////////////////////EXPORTS//////////////////
                case 'export':
                    $this->export();
                    break;
            }
        }
	}
	
    public function loadAll() {
		$data = array(
            'raw_cards' => $this->loadCards(),
            'raw_states' => $this->loadColumns(),
            'raw_people' => $this->loadUsers()
        );
		return json_encode($data);
    }

	public function loadCardComments($card_id){
        $cmt_file =  DOC_ROOT . 'var/comments/'.$card_id.'.php';
        return $this->getPhpHidden($cmt_file,true);
    }
	public function addCardComment(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to add comment!'
        );
        if(!empty($_POST) && isset($_POST['card_id']) && isset($_POST['text'])){
            $card_id = $_POST['card_id'];
            $comment_file = DOC_ROOT . 'var/comments/' . $card_id . '.php';
            $card_file = DOC_ROOT . 'var/cards/' . $card_id . '.php';
            if(file_exists($card_file)){
                $card = (array) $this->getPhpHidden($card_file,true);
                $comments = (array) $this->getPhpHidden($comment_file,true);

                if(isset($card['comments'])){
                    $card_comments = (array) $card['comments'];
                } else {
                    $card_comments = array();
                }
                $time = $this->millitime();
                $id = "cmt_$time";
                $card_comments[] = $id;
                $comment = array(
                    'id' => $id,
                    'card_id' => $card_id,
                    'user_id' => $_SESSION["user_id"],
                    'time' => (int) $time,
                    'text' => $_POST['text']
                );
                $comments[$id] = $comment;
                $card_comments = array_keys($comments);
                $card['comments'] = $card_comments;
                $this->savePhpHidden($comment_file,$comments);
                $this->savePhpHidden($card_file,$card);
                $result['code'] = 1;
                $result['data'] = $comment;
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        echo json_encode($result);
    }
    public function removeCardComment(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to remove comment/activity!'
        );

        if( !empty($_POST) && isset( $_POST['card_id'] ) && isset($_POST['comment_id']) ){
            $card_id = $_POST['card_id'];
            $comment_file = DOC_ROOT . 'var/comments/' . $card_id . '.php';
            $card_file = DOC_ROOT . 'var/cards/' . $card_id . '.php';
            if(file_exists($comment_file)){
                $card = (array) $this->getPhpHidden($card_file,true);
                $comments = (array) $this->getPhpHidden($comment_file,true);
                $comment_id = $_POST['comment_id'];
                if( isset($comments[$comment_id]) ){
                    $dcomment = $comments[$comment_id];
                    $comments[$comment_id] = NULL;
                    $comments = array_filter($comments);
                    $card_comments = array_keys($comments);
                    $card['comments'] = $card_comments;
                    $this->savePhpHidden($comment_file,$comments);
                    $this->savePhpHidden($card_file,$card);
                    $result['code'] = 1;
                    $result['data'] = $dcomment;
                    
                }
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        echo json_encode($result);
    }
    public function updateCardComment(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to update comment/activity!'
        );

        if( !empty($_POST) && isset( $_POST['card_id'] ) && isset($_POST['text'])  && isset($_POST['comment_id']) ){
            $card_id = $_POST['card_id'];
            $comment_id = $_POST['comment_id'];
            $comment_file = DOC_ROOT . 'var/comments/' . $card_id . '.php';
            if(file_exists($comment_file)){
                $comments = (array) $this->getPhpHidden($comment_file,true);
                if(isset($comments[$comment_id])){
                    $dcomment = (array) $comments[$comment_id];
                    $ncomment = $dcomment;
                    $ncomment['text'] = $_POST['text'];
                    $ncomment['update'] = (int) $this->millitime();
                    $comments[$comment_id] = $ncomment;
                    $this->savePhpHidden($comment_file,$comments);
                    $result['code'] = 1;
                    $result['data'] = $ncomment;
                }
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        echo json_encode($result);
    }
    public function saveCardComments($card_id,$data) {
		if(is_array($data)){
			$data = json_encode($data);
		}
        $cmt_file =  DOC_ROOT . 'var/comments/'.$card_id.'.json';
        file_put_contents($cmt_file,$data);
		return $data;
    }
    
    /////////////////////////////////////////////////////////////////////////
    public function deleteCard($card_id){
        $card_file = DOC_ROOT . 'var/cards/' . $card_id . '.php';
        if(file_exists($card_file)){
            $dcard = (array) $this->getPhpHidden($card_file,true);
            unlink($card_file);
            return $dcard;
        }
    }
    public function removeCards(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to remove cards!'
        );
        $cards_removed = array();
        if(!empty($_POST['cards'])){
            $cards = $_POST['cards'];
            if(is_array($cards)){
                foreach($cards as $card_id){
                    if($dcard = $this->deleteCard($card_id)){
                        $cards_removed[] = $dcard;
                    }
                }
            } elseif(is_string($cards)) {
                if($dcard = $this->deleteCard($cards)){
                    $cards_removed[] = $dcard;
                }
            }
        }

        if(!empty($cards_removed)){
            $result['code'] = 1;
            $result['data'] = $cards_removed;
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        return json_encode($result);
    }
    public function removeCard(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to remove card!'
        );
        if(!empty($_POST) && isset($_POST['card_id'])){
            $card_id = $_POST['card_id'];
            if($dcard = $this->deleteCard($card_id)){
                $result['code'] = 1;
                $result['data'] = $dcard;
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        echo json_encode($result);
    }
    public function loadCard(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to load card!'
        );
        if(!empty($_GET) && isset($_GET['card_id'])){
            $card_id = $_GET['card_id'];
            $card_file = DOC_ROOT . 'var/cards/' . $card_id . '.php';
            if(file_exists($card_file)){
                $card = (array) $this->getPhpHidden($card_file,true);
                $comments = (array) $this->loadCardComments($card_id);
                $card['comments'] = $comments;
                $result['code'] = 1;
                $result['data'] = $card;
            }
        }
        echo json_encode($result);
    }
    
    
    public function addCard(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to add card!'
        );
        if(!empty($_POST) && isset($_POST['title']) && isset($_POST['state']) ){
			$time = $this->millitime();
            $card_id = "crd_$time";
            $newcard = array_merge(array(
                'title' => '',
                'content' => '',
                'responsible' => array(),
                'state' => NULL,
                'color' => 0,
                'index' => 0,
                'comments' => array(),
                'attachments' => array(),
                'tasks' => array()
            ),$_POST);
            $newcard['id'] = $card_id;
            $newcard['time'] = (int) $time;

            $card_file = DOC_ROOT . 'var/cards/' . $card_id . '.php';
            $this->savePhpHidden($card_file,$newcard);

            $result['code'] = 1;
            $result['data'] = $newcard;
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        echo json_encode($result);
    }
    
    public function saveCards($data) {
		if(is_array($data)){
			$data = json_encode($data);
		}
        $fh = fopen($this->card_file, 'w') or die ("Can't open file");
        fwrite($fh, $data);
        fclose($fh);
		return $data;
    }
    
    public function updateCards() {
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to update cards.'
        );
        if(!empty($_POST) && !empty($_POST['cards']) ){
            if(is_array($_POST['cards'])){
                $data_cards = $_POST['cards'];
            } else {
                $data_cards = (array) json_decode($_POST['cards'],true);
            }

            if(!empty($data_cards)){
                $ccards = array();
                $cards = (array) $this->loadCards();
                foreach($data_cards as $cid => $dcard){
                    $card_file = DOC_ROOT . 'var/cards/' . $cid . '.php';
                    if(file_exists($card_file)){
                        $card = (array) $this->getPhpHidden($card_file,true);
                        $data = array_merge($card,$dcard);
                        $ccards[$cid] = $data;
                        $this->savePhpHidden($card_file,$data);
                    }
                }
                if(!empty($ccards)){
                    $result['code'] = 1;
                    $result['data'] = $ccards;
                }
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        return json_encode($result);
    }

    public function loadCards() {
        $cards =  array();
        $dir = DOC_ROOT . 'var/cards';
        $dir_resource = opendir($dir);
        while ($file = readdir($dir_resource)) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            $content = (array) $this->getPhpHidden($dir . '/' . $file,true);
            
            $id = (string) $content['id'];
            $cards[$id] = $content;
        }
        closedir($dir_resource);
        return $cards;
    }
    /////////////////////////////////////////////////////////////////////////
    public function addTask(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to add task.'
        );
		
        if(!empty($_POST) && isset($_POST['card_id']) && !empty($_POST['task']) ){
            $card_id = $_POST['card_id'];
            $card_file = DOC_ROOT .  'var/cards/' . $card_id . '.php';
            if(file_exists($card_file)){
                $card = (array) $this->getPhpHidden($card_file,true);
                if(isset($card['tasks'])){
                    $tasks = $card['tasks'];
                } else {
                    $tasks = array();
                }
                $task_id = time() . '_' . count($tasks);
                $task = array(
                    'id' => $task_id,
                    'time' => (int) $this->millitime(),
                    'task' => $_POST['task'],
                    'done' => 0
                );
                $tasks[$task_id] = $task;
                $card['tasks'] = $tasks;
                $this->savePhpHidden($card_file,$card);
                $result['code'] = 1;
                $result['data'] = $task;
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        echo json_encode($result);
    }
    public function removeTask(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to remove task.'
        );
		
        if(!empty($_POST) && isset($_POST['card_id']) && isset($_POST['task_id']) ){
            $card_id = $_POST['card_id'];
            $task_id = $_POST['task_id'];
            
            $card_file = DOC_ROOT . 'var/cards/' . $card_id . '.php';
            if(file_exists($card_file)){
                $card = (array) $this->getPhpHidden($card_file,true);
                if(isset($card['tasks'])){
                    $tasks = $card['tasks'];
                } else {
                    $tasks = array();
                }
                if(isset($tasks[$task_id])){
                    $dtask = $tasks[$task_id];
                    $tasks[$task_id] = null;
                    $tasks = array_filter($tasks);
                    $card['tasks'] = $tasks;
                    $this->savePhpHidden($card_file,$card);
                    $result['code'] = 1;
                    $result['data'] = $dtask;
                }
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        echo json_encode($result);
    }
    
    public function updateTask(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to update task.'
        );
		
        if(!empty($_POST) && isset($_POST['card_id']) && !empty($_POST['task']) ){
            $card_id = $_POST['card_id'];
            $card_file = DOC_ROOT .  'var/cards/' . $card_id . '.php';
            if(file_exists($card_file)){
                $card = (array) $this->getPhpHidden($card_file,true);
                $task = $_POST['task'];
                $task_id = $task['id'];
                
                if(isset($card['tasks'])){
                    $tasks = $card['tasks'];
                } else {
                    $tasks = array();
                }
                if(isset($tasks[$task_id])){
                    $newtask = array_merge($tasks[$task_id],$task);
                    $tasks[$task_id] = $newtask;
                    $card['tasks'] = $tasks;
                    $this->savePhpHidden($card_file,$card);
                    $result['code'] = 1;
                    $result['data'] = $newtask;
                }
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        echo json_encode($result);
    }
    /////////////////////////////////////////////////////////////////////////
    public function addColumn() {
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to remove column.'
        );
		
        if( isset($_POST['label']) && isset($_POST['wip']) ){
            $columns = $this->loadColumns();
			$mtime = $this->millitime();
            $id = "col_$mtime";
            $cstate = array(
                'id' => $id,
                'label' => $_POST['label'],
                'wip' => (int) $_POST['wip'],
                'index' => count($columns)
            );
            $file =  DOC_ROOT . 'var/columns/' . $id . '.php';
            $this->savePhpHidden($file,$cstate,true);
            $result['code'] = 1;
            $result['data'] = $cstate;
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        echo json_encode($result);
    }

    public function removeColumn(){
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to remove column!'
        );
        if(!empty($_POST) && isset($_POST['state_id'])){
            $state_id = $_POST['state_id'];
            $state_file = DOC_ROOT . 'var/columns/' . $state_id . '.php';
            if($dstate = (array) $this->getPhpHidden($state_file,true)){
                unlink($state_file);
                $result['code'] = 1;
                $result['data'] = $dstate;
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        echo json_encode($result);
    }

    public function updateColumns() {
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to update cards.'
        );
        if(!empty($_POST['columns']) ){
            if(is_array($_POST['columns'])){
                $data_columns = $_POST['columns'];
            } else {
                $data_columns = (array) json_decode($_POST['columns'],true);
            }

            if(!empty($data_columns)){
                $ccolumns = array();
                foreach($data_columns as $cid => $dcol){
                    $file = DOC_ROOT . 'var/columns/' . $cid . '.php';
                    if($data = (array) $this->getPhpHidden($file,true)){
                        $column = array_merge($data,$dcol);
                        $ccolumns[$cid] = $column;
                        $this->savePhpHidden($file,$column,true);
                    }
                }
                if(!empty($ccolumns)){
                    $result['code'] = 1;
                    $result['data'] = $ccolumns;
                }
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        return json_encode($result);
    }

    public function loadColumns() {
        $columns =  array();
        $dir = DOC_ROOT . 'var/columns';
        $dir_resource = opendir($dir);
        while ($file = readdir($dir_resource)) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            if(is_file($dir . '/' . $file)){
                $content = (array) $this->getPhpHidden($dir . '/' . $file,true);
                $id = (string) $content['id'];
                $columns[$id] = $content;
            }
        }
        closedir($dir_resource);
        return $columns;
    }
    /////////////////////////////////////////////////////////////////////////
    public function updateUserInfo() {
        $result = array(
            'code' => 0,
            'data' => 'Error, unable to update user.'
        );
        if(!empty($_POST['user']) ){
            $user_data = $_POST['user'];
            if(!empty($user_data['id'])){
                $uid = $user_data['id'];
                $valid_keys = array("name","photo","index");
                $ndata = $this->updateUserData($uid,$valid_keys);
                if(!empty($ndata)){
                    $result = array(
                        'code' => 1,
                        'data' => $ndata
                    );
                }
            }
        } else {
            $result['data'] = 'Please make sure all fields are filled-up!';
        }
        return json_encode($result);
    }

    protected function updateUserCredentials($username,$valid_keys) {
        $sdata = array();
        $file = DOC_ROOT . 'var/authentication/' . $username . '.php';
        if($data = (array) $this->getPhpHidden($file,true)){
            $ndata = array();
            foreach($valid_keys as $key){
                if(!empty($user_data[$key])){
                    $ndata[$key] = $user_data[$key];
                }
            }
            $sdata = array_merge($data,$ndata);
            $this->savePhpHidden($file,$sdata,true);
        }
        return $sdata;
    }

    protected function updateUserData($uid,$valid_keys) {
        $sdata = array();
        $file = DOC_ROOT . 'var/users/' . $uid . '.php';
        if($data = (array) $this->getPhpHidden($file,true)){
            $ndata = array();
            foreach($valid_keys as $key){
                if(!empty($user_data[$key])){
                    $ndata[$key] = $user_data[$key];
                }
            }
            $sdata = array_merge($data,$ndata);
            $this->savePhpHidden($file,$sdata,true);
        }
        return $sdata;
    }
    
    public function getUserCredentialsByUsername($username){
        $file = DOC_ROOT . 'var/authentication/' . $username . '.php';
        if($content = (array) $this->getPhpHidden($file,true)){
            return $content;
        }
    }

    
    public function getUserDataByUsername($username){
        if($content = $this->getUserCredentialsByUsername($username)){
            $user_id = $content['user_id'];
            return $this->getUserDataByUserID($user_id);
        }
    }
    
    public function getUserDataByUserID($user_id){
        $file = DOC_ROOT . 'var/users/' . $user_id . '.php';
        if($content = (array) $this->getPhpHidden($file,true)){
            return $content;
        }
    }
    
    public function validateUserByCredential() {
        $result = array(
            'code' => 0,
            'data' => 'Error, user does not exists.'
        );
        if(!empty($_POST['username']) && !empty($_POST['password'])){
            $user_name = $_POST['username'];
            $password = $_POST['password'];
            $file = DOC_ROOT . 'var/authentication/' . $user_name . '.php';
            if($content = (array) $this->getPhpHidden($file,true)){
                $hash = $content['password'];
                if (password_verify($password, $hash)) {
                    $result = array(
                        'code' => 1,
                        'data' => $this->createTokenSeries($user_name)
                    );
                }
            }
        }
        $result['test_key'] = $this->createRandomCharacters(64);
        echo json_encode($result);
    }
    
    public function getRandomBytes($length){
        if(function_exists('random_bytes')){
            return random_bytes ( $length );
        }
        if(function_exists('mcrypt_create_iv')){
            return mcrypt_create_iv ( $length, MCRYPT_DEV_URANDOM );
        }
        if(function_exists('openssl_random_pseudo_byte')){
            return openssl_random_pseudo_bytes ( $length);
        }
    }
    public function encrypt($string,$secret_key,$iv) {
        $output = openssl_encrypt($string, $this->encrypt_method, $secret_key, 0, $iv);
        if($output){
            $output = base64_encode($output);
        }
        return $output;
    }
    public function decrypt($string,$secret_key,$iv) {
        $output = openssl_decrypt(base64_decode($string), $this->encrypt_method, $secret_key, 0, $iv);
        return $output;
    }
    
    public function getValidSeriesIdentifier(){
        $access_key = $this->createRandomCharacters(32);
        $file = DOC_ROOT . 'var/sessions/' . $series . ".php";
        if(file_exists($file)){
            return $this->getValidSeriesIdentifier();
        }
        return $access_key;
    }

    public function createTokenSeries($user_name){
        if($credentials =  $this->getUserCredentialsByUsername($user_name)){
            $user = $this->getUserDataByUserID($credentials['user_id']);
            $series = $this->getValidSeriesIdentifier(); 
            $refresh_key = $this->createRandomCharacters(64);
            $file = DOC_ROOT . 'var/sessions/' . $series . ".php";

            $refresh_data = array(
                'expire' => time() + (1 * 24 * 60 * 60),
                'user' => $user,
                'refresh_key' => $refresh_key
            );
            $refresh_iv = $this->getRandomBytes($this->ivlen);
            $refresh = base64_encode($this->encrypt(json_encode($refresh_data), $credentials['secret_key'],$refresh_iv));
            $refresh_signature = hash_hmac('sha256', $refresh_key, $this->server_key, true);

            $access_data = array(
                'expire' => time() + (30 * 60),
                'user_name' => $user_name,
                'user' => $user
            );

            $access = json_encode($access_data);
            $access_signature = hash_hmac('sha256', $access, $this->server_key, true);
            
            $data = array(
                'access' => $access,
                'refresh' => $refresh,
                'refresh_iv' => base64_encode($refresh_iv),
                'refresh_signature' => $refresh_signature,
                'user' => $user_name
            );
            $this->savePhpHidden($file,$data,true);

            return array(
                "access_token" => $series . '.' . $access_signature,
                "refresh_token" => $series . '.' . $refresh_signature,
                "token_type" => "bearer",
                "expires_in" => (30 * 60),
                "user" => $user
            );
        }
    }
    
    public function renewTokens($access_token){
        list($series, $key, $signature) = explode('.',$access_token);
        $file = DOC_ROOT . 'var/sessions/' . $series . ".php";
        if($content = (array) $this->getPhpHidden($file,true)){
            $username = $content['user'];
            if($credentials =  $this->getUserCredentialsByUsername($username)){
                $token_key = $this->createRandomCharacters($this->ivlen);
                $token_data = $this->decrypt($content['access_token'],$credentials['secret_key'],$content['token_key']);
                $token = array(
                    'expire' => time() + (60 * 30)
                );
                $data = array(
                    'access_token' => $this->encrypt(base64_encode(json_encode($token)),$credentials['secret_key'],$token_key), //cryptography lib is better
                    'token_key' => $token_key,
                    'user_name' => $username
                );
                $this->savePhpHidden($file,$data,true);
                return urlencode(base64_encode(json_encode(array(
                    'sk' => $series,
                    'tk' => $this->encrypt($token_key,$credentials['secret_key'],$token_key)
                ))));
            }
        }
    }

    public function checkAccessTokenValidity($token){
        $valid = -1;
        // -1: token needs to removed. 0: access_token expired, tokens need renewed by refresh token. 1: token ok, access token need renew
        list($series,$key,$signature) = explode('.',$token);
        $file = DOC_ROOT . 'var/sessions/' . $series . ".php";
        $is_expired = false;
        $is_tampered = false;
        $is_correct_key = false;
        if($content = (array) $this->getPhpHidden($file,true)){
            $iv = $content['access_iv'];
            $data = $content['access'];
            if($token_data = $this->decrypt(base64_decode($data),$key,base64_decode($iv))){
                $correct_key = true;
                if($token_data['expire'] < time()){
                    $is_expired = true;
                }

                $username = $token_data['user_name'];
                if($credentials =  $this->getUserCredentialsByUsername($username)){
                    /*  check if tampered  */
                    if($signature !== hash_hmac('sha256', $data, $credentials['secret_key'], true)){
                        $is_tampered = true;
                    }
                }
            }
        }
        if($is_tampered || !$correct_key){
            $valid = -1;
        } elseif($is_expired) {
            $valid = 0;
        } elseif(!$is_expired && $correct_key) {
            $valid = 1;
        }
        return $valid;
    }

    public function checkRefreshTokenValidity($token){
        $valid = -1;
        // -1: token needs to removed. 0: access_token expired, tokens need renewed by refresh token. 1: token ok, access token need renew
        list($series,$key,$signature) = explode('.',$token);
        $file = DOC_ROOT . 'var/sessions/' . $series . ".php";
        $is_expired = false;
        $is_tampered = false;
        $is_correct_key = false;
        if($content = (array) $this->getPhpHidden($file,true)){
            $iv = $content['access_iv'];
            $data = $content['access'];
            if($token_data = $this->decrypt(base64_decode($data),$key,base64_decode($iv))){
                $correct_key = true;
                if($token_data['expire'] < time()){
                    $is_expired = true;
                }

                $username = $token_data['user_name'];
                if($credentials =  $this->getUserCredentialsByUsername($username)){
                    /*  check if tampered  */
                    if($signature !== hash_hmac('sha256', $data, $credentials['secret_key'], true)){
                        $is_tampered = true;
                    }
                }
            }
        }
        if($is_tampered || !$correct_key){
            $valid = -1;
        } elseif($is_expired) {
            $valid = 0;
        } elseif(!$is_expired && $correct_key) {
            $valid = 1;
        }
        return $valid;
    }


    public function deleteTokenSeries($series){
        $file = DOC_ROOT . 'var/sessions/' . $series . ".php";
        unlink($file);
    }
    
    public function loadUsers() {
        $users =  array();
        $dir = DOC_ROOT . 'var/users';
        $dir_resource = opendir($dir);
        while ($file = readdir($dir_resource)) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            if(is_file($dir . '/' . $file)){
                $content = (array) $this->getPhpHidden($dir . '/' . $file,true);
                $id = (string) $content['id'];
                $users[$id] = $content;
            }
        }
        closedir($dir_resource);
        return $users;
    }
    /////////////////////////////////////////////////////////////////////////
    public function saveArchives() {
        $cards_archived = array();
        if(!empty($_POST['cards'])){
            $cards = $_POST['cards'];
            if(is_array($cards)){
                foreach($cards as $card_id){
                    $card_file = DOC_ROOT . 'var/cards/'. $card_id . '.php';
                    if(file_exists($card_file)){
                        rename($card_file, DOC_ROOT . 'var/archives/'. $card_id . '.php');
                        $cards_archived[] = $card_id;
                    }
                }
            } elseif(is_string($cards)) {
                $card_file = DOC_ROOT . 'var/cards/'. $cards . '.php';
                if(file_exists($card_file)){
                    rename($card_file, DOC_ROOT . 'var/archives/'. $cards . '.php');
                    $cards_archived[] = $cards;
                }
            }
        }

		return json_encode($cards_archived);
    }
    public function createRandomCharacters($length){
        if ($length < 1) {
            throw new InvalidArgumentException('Length must be a positive integer');
        }
        $characters = str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }
    public function archivesToFiles(){
        //echo password_hash("Password123", PASSWORD_DEFAULT);
        echo $this->validateUserByCredential();
    }
    public function loadArchives() {
        $archives =  array();
        $dir = DOC_ROOT . 'var/archives';
        $dir_resource = opendir($dir);
        while ($file = readdir($dir_resource)) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            $content = (array) $this->getPhpHidden($dir . '/' . $file,true);
            
            $id = (string) $content['id'];
            $archives[$id] = $content;
        }
        closedir($dir_resource);
        return $archives;
    }
    /////////////////////////////////////////////////////////////////////////
    public function export() {
        $files = array($this->card_file, $this->state_file, $this->user_file, $this->archive_file);
        $zipname = 'kanban_'.date().'.zip';
        $zip = new ZipArchive;
        $zip->open($zipname, ZipArchive::CREATE);
        foreach ($files as $file) {
          $zip->addFile($file);
        }
        $zip->close();
        header('Content-Type: application/zip');
        header('Content-disposition: attachment; filename='.$zipname);
        header('Content-Length: ' . filesize($zipname));
        readfile($zipname);
    }

    public function import($file) {
        $zip = new ZipArchive;
        if ($zip->open($file) === TRUE) {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                echo $zip->getFromName($zip->getNameIndex($i));
            }
            $zip->close();
        } else {
            echo 'Failed to open the archive!';
        }
    }
    
    /////////////////////////////////////////////////////////////////////////
    public function getPhpHidden($file,$json = NULL){
        $content = '';
        if(file_exists($file)){
            $content = file_get_contents($file);
            $content = str_replace("|*/?>","",str_replace("<?php/*|","",$content));
            $content = ($json) ? json_decode($content,true) : $content;
        } else {
            $content = ($json) ? json_decode($content,true) : $content;
            if($json){
                $content = json_decode('{}');
            }
        }

        return $content;
    }
	public function millitime() {
	  $microtime = microtime();
	  $comps = explode(' ', $microtime);

	  // Note: Using a string here to prevent loss of precision
	  // in case of "overflow" (PHP converts it to a double)
	  return sprintf('%d%03d', $comps[1], $comps[0] * 1000);
	}
    public function savePhpHidden($file,$data,$to_json = NULL){
        if($to_json ===  NULL && (is_array($data) || is_object($data))){
            $to_json = TRUE;
        }
        $data = ($to_json) ? json_encode($data) : $data;
        $data = "<?php/*|" . $data . "|*/?>";
        $write = fopen($file, 'w') or die("can't open file ".$file);
        fwrite($write, $data);
        fclose($write);
    }
}

$kanban = new SimpleKanbanServer(DATA_FILE,COLUMN_FILE,USER_FILE,ARCHIVE_FILE,'iiTgaWA9U3BdutQYr4GHuyZeNUbZGKYZx0hivrNlaxgmlBhduMHN8iDXdS1pKYpZ');



