var pos = {
  // (A) PROPERTIES
  iName : "POS", // idb name
  iDB : null, iTX : null, // idb object & transaction
  updated : null, // last updated timestamp
  items : null, // items list
  hList : null, // html items list
  hCart : null, // html cart items

  // (B) HELPER FUNCTION - AJAX FETCH
  fetch : (req, data, after) => {
    // (B1) FORM DATA
    let form = new FormData();
    form.append("req", req);
    if (data != null) { for (let [k,v] of Object.entries(data)) {
      form.append(k, v);
    }}

    // (B2) GO!
    fetch("3-ajax-pos.php", { method: "post", body: form })
    .then(res => res.text())
    .then(txt => after(txt))
    .catch(err => console.error(err));
  },

  // (C) HELPER FUNCTION - UPDATE INDEXED DATABASE ITEMS
  update : ts => pos.fetch("getAll", null, items => {
    // (C1) CLEAR OLD ITEMS
    pos.iTX().clear();

    // (C2) UPDATE ITEMS
    items = JSON.parse(items);
    let count = 0;
    for (let i of items) {
      let req = pos.iTX().put(i);
      req.onsuccess = () => {
        count++;
        if (count==items.length) {
          localStorage.setItem("POSUpdate", ts);
          pos.draw(cart.empty);
          alert("Item database updated.");
        }
      };
    }
  }),

  // (D) INITIALIZE
  init : () => {
    // (D1) IDB SUPPORT CHECK
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    if (!window.indexedDB) {
      alert("Your browser does not support indexed database.");
      return false;
    }

    // (D2) OPEN "POS" DATABASE
    let req = window.indexedDB.open(pos.iName, 1);

    // (D3) ON DATABASE ERROR
    req.onerror = evt => {
      alert("Indexed DB init error - " + evt.message);
      console.error(evt);
    };

    // (D4) UPGRADE NEEDED
    req.onupgradeneeded = evt => {
      // (D4-1) INIT UPGRADE
      pos.iDB = evt.target.result;
      pos.iDB.onerror = evt => {
        alert("Indexed DB upgrade error - " + evt.message);
        console.error(evt);
      };

      // (D4-2) VERSION 1
      if (evt.oldVersion < 1) {
        let store = pos.iDB.createObjectStore(pos.iName, { keyPath: "item_id" });
      }
    };

    // (D5) OPEN DATABASE OK
    req.onsuccess = evt => {
      // (D5-1) REGISTER IDB OBJECTS
      pos.iDB = evt.target.result;
      pos.iTX = () => {
        return pos.iDB
        .transaction(pos.iName, "readwrite")
        .objectStore(pos.iName);
      };

      // (D5-2) GET HTML ELEMENTS
      pos.hList = document.getElementById("list");
      pos.hCart = document.getElementById("cart");

      // (D5-3) LAST UPDATED - ITEMS
      pos.updated = localStorage.getItem("POSUpdate");
      if (pos.updated== null) { pos.updated = 0; }

      // (D5-4) CHECK SERVER FOR ITEM UPDATES
      pos.fetch("check", null, ts => {
        if (ts > pos.updated) { pos.update(ts); }
        else { pos.draw(() => { cart.load(); cart.draw(); }); }
      });
    };
  },

  // (E) GET & DRAW ITEMS
  draw : after => {
    let req = pos.iTX().getAll();
    req.onsuccess = () => {
      pos.hList.innerHTML = "";
      pos.items = {};
      for (let i of req.result) {
        pos.items[i["item_id"]] = i;
        let item = document.createElement("div");
        item.className = "item";
        item.innerHTML = `<img class="iImg" src="assets/${i["item_image"]}">
        <div class="iName">${i["item_name"]}</div>
        <div class="iPrice">$${i["item_price"]}</div>`;
        item.onclick = () => { cart.add(i["item_id"]); };
        pos.hList.appendChild(item);
      }
      if (after) { after(); }
    };
  }
};
window.onload = pos.init;