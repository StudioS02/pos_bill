var cart = {
  // (A) PROPERTIES
  items : {}, // current items in cart
  total : 0, // total amount

  // (B) SAVE CART ITEMS TO LOCALSTORAGE
  save : () => localStorage.setItem("POSCart", JSON.stringify(cart.items)),

  // (C) LOAD CART ITEMS FROM LOCALSTORAGE
  load : () => {
    cart.items = localStorage.getItem("POSCart");
    if (cart.items==null) { cart.items = {}; }
    else { cart.items = JSON.parse(cart.items); }
  },

  // (D) DRAW CART ITEMS
  draw : () => {
    // (D1) RESET TOTAL
    cart.total = 0;

    // (D2) CART EMPTY
    if (Object.keys(cart.items).length === 0) {
      pos.hCart.innerHTML = `<div class="cItem">Cart Empty</div>`;
    }
    
    // (D3) DRAW CART
    else {
      // (D3-1) RESET HTML
      pos.hCart.innerHTML = "";

      // (D3-2) CART ITEMS
      let item;
      for (let [id, qty] of Object.entries(cart.items)) {
        let itotal = pos.items[id]["item_price"] * qty;
        cart.total += itotal;
        item = document.createElement("div");
        item.className = "cRow";
        item.innerHTML = `<div class="cDel" onclick="cart.change(${id}, 0)">X</div>
        <div class="cItem">
          <div class="cName">${pos.items[id]["item_name"]}</div>
          <div class="cPrice">$${itotal.toFixed(2)}</div>
        </div>
        <input type="number" min="0" class="cQty" onchange="cart.change(${id}, this.value)" value="${qty}">`;
        pos.hCart.appendChild(item);
      }

      // (D3-3) TOTAL
      item = document.createElement("div");
      item.className = "cRow";
      item.innerHTML = `<div class="cTotal">Total</div><div class="cAmt">$${cart.total.toFixed(2)}</div>`;
      pos.hCart.appendChild(item);
      
      // (D3-4) RESET
      item = document.createElement("input");
      item.type = "button";
      item.value = "Reset";
      item.onclick = cart.empty;
      pos.hCart.appendChild(item);

      // (D3-5) CHECKOUT
      item = document.createElement("input");
      item.type = "button";
      item.value = "Checkout";
      item.onclick = cart.checkout;
      pos.hCart.appendChild(item);
    }
  },

  // (E) ADD ITEM TO CART
  add : id => {
    if (cart.items[id]==undefined) { cart.items[id] = 1; }
    else { cart.items[id]++; }
    cart.save();
    cart.draw();
  },

  // (F) CHANGE QUANTITY + REMOVE ITEM FROM CART
  change : (id, qty) => {
    if (qty==0) { delete cart.items[id]; }
    else if (qty!="") { cart.items[id] = parseInt(qty); }
    cart.save();
    cart.draw();
  },

  // (G) EMPTY CART
  empty : () => {
    cart.items = {};
    cart.save();
    cart.draw();
  },

  // (H) CHECKOUT
  checkout : () => {
    // (H1) RESHUFFLE ITEMS
    let items = [];
    for (let [id, qty] of Object.entries(cart.items)) {
      items.push({
        n : pos.items[id]["item_name"],
        p : pos.items[id]["item_price"],
        q : qty
      });
    }

    // (H2) SEND TO SERVER
    pos.fetch("checkout", {
      items : JSON.stringify(items),
      total : cart.total.toFixed(2),
      timestamp : pos.updated
    }, res => {
      // (H3) "LOCAL ITEMS OUTDATED"
      if (isFinite(res)) { pos.update(parseInt(res)); }

      // (H4) OK
      else if (res=="OK") {
        cart.empty();
        alert("OK");
      }

      // (H5) NOT OK
      else { alert(res); }
    });
  }
};