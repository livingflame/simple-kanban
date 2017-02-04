<?php
define('DATA_FILE', 'data.txt');
define('COLUMN_FILE', 'board.txt');

class SimpleKanban {
	
	public $card_file;
	public $list_file;

	public function __construct($card_file,$list_file) {
        $this->card_file = $card_file;
        $this->list_file = $list_file;
        if(!empty($_POST['action'])){
            switch ($_POST['action']) {
                case 'save_cards':
                    if(!empty($_POST['data'])){
                        $this->saveCards($_POST['data']);
                    }
                    break;
                case 'load_cards':
                    $this->loadCards();
                    break;
                case 'save_columns':
                    if(!empty($_POST['data'])){
                        $this->saveColumns($_POST['data']);
                    }
                    break;
                case 'load_columns':
                    $this->loadColumns();
                    break;
            }
        }
	}
	
    public function saveCards($data) {
        $encoded = json_encode($data);
        $fh = fopen($this->card_file, 'w') or die ("Can't open file");
        fwrite($fh, $encoded);
        fclose($fh);
    }

    public function loadCards() {
        $fh = fopen($this->card_file, 'r');
        $data = fread($fh, filesize($this->card_file));
        print $data;
    }


    public function saveColumns($data) {
        $encoded = json_encode($data);
        $fh = fopen($this->list_file, 'w') or die ("Can't open file");
        fwrite($fh, $encoded);
        fclose($fh);
    }

    public function loadColumns() {
        $fh = fopen($this->list_file, 'r');
        $data = fread($fh, filesize($this->list_file));
        print $data;
    }
}

$kanban = new SimpleKanban('data.txt','board.txt');



