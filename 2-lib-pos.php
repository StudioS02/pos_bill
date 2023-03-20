<?php
class POS {
  // (A) CONSTRUCTOR - CONNECT TO DATABASE
  private $pdo = null;
  private $stmt = null;
  public $error = "";
  function __construct () {
    $this->pdo = new PDO(
      "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET,
      DB_USER, DB_PASSWORD, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
  }

  // (B) DESTRUCTOR - CLOSE DATABASE CONNECTION
  function __destruct () {
    if ($this->stmt!==null) { $this->stmt = null; }
    if ($this->pdo!==null) { $this->pdo = null; }
  }

  // (C) HELPER FUNCTION - EXECUTE SQL QUERY
  function query ($sql, $data=null) {
    $this->stmt = $this->pdo->prepare($sql);
    $this->stmt->execute($data);
  }

  // (D) SAVE ITEM
  function saveItem ($name, $price, $img=null, $id=null) {
    // (D1) NEW ITEM
    if ($id==null) {
      $sql = "INSERT INTO `items` (`item_name`, `item_price`, `item_image`) VALUES (?,?,?)";
      $data = [$name, $price, $img];
    }

    // (D2) UPDATE ITEM
    else {
      $sql = "UPDATE `items` SET `item_name`=?, `item_price`=?, `item_image`=? WHERE `item_id`=?";
      $data = [$name, $price, $img, $id];
    }

    // (D3) RUN SQL + UPDATE TIMESTAMP
    // YOU MIGHT WANT TO KEEP THIS IN THE DATABASE INSTEAD...
    $this->query($sql, $data);
    file_put_contents(
      __DIR__ . DIRECTORY_SEPARATOR . "updated.php",
      "<?php define('POS_UPDATE', ".strtotime("now").");"
    );
    return true;
  }

  // (E) CHECKOUT ORDER
  function checkout ($items, $total, $timestamp) {
    // (E1) CHECK TIMESTAMP
    if ($timestamp < POS_UPDATE) {
      $this->error = POS_UPDATE;
      return false;
    }

    // (E2) ORDERS ENTRY
    $this->query(
      "INSERT INTO `orders` (`order_total`) VALUES (?)", [$total]
    );

    // (E3) ORDER ITEMS
    $id = $this->pdo->lastInsertId();
    $sql = "INSERT INTO `order_items` (`order_id`, `item_name`, `item_price`, `item_qty`) VALUES ";
    $data = [];
    $items = json_decode($items, true);
    foreach ($items as $i) {
      $sql .= "(?,?,?,?),";
      $data[] = $id;
      $data[] = $i["n"];
      $data[] = $i["p"];
      $data[] = $i["q"];
    }
    $sql = substr($sql, 0, -1) . ";";
    $this->query($sql, $data);

    // (E4) DONE
    return true;
  }

  // (F) GET ALL ITEMS
  function getAll () {
    $this->query("SELECT * FROM `items`");
    return $this->stmt->fetchAll();
  }
}

// (G) DATABASE SETTINGS - CHANGE TO YOUR OWN!
define("DB_HOST", "localhost");
define("DB_NAME", "test");
define("DB_CHARSET", "utf8mb4");
define("DB_USER", "root");
define("DB_PASSWORD", "");

// (H) LAST UPDATED
require "updated.php";

// (I) NEW POS OBJECT
$_POS = new POS();