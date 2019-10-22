function GetTotalItems(cart) {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].quantity;
    }
    return total;
}

function GetResults() {
    let search = document.getElementById('search').value;
    document.getElementById('results').innerHTML = "Searching...";

    $.ajax({
        type: "POST",
        url: "/search",
        data: JSON.stringify({search: search}),
        contentType: "application/json; charset=utf-8",
        //success: function(data){ console.log(data); },
        failure: function(errMsg) { console.log(errMsg); }
    }).then(function(data) {
        document.getElementById('results').innerHTML = data; //.replace(new RegExp(search, 'g'), '<b>'+search+'</b>');
    });
}

function RemoveItem(item) {
    item =$(item);
    let id = item.attr('id');
    console.log(id);

    $.ajax({
        type: "DELETE",
        url: "/cart",
        data: JSON.stringify({id: id}),
        contentType: "application/json; charset=utf-8",
        //success: function(data){ console.log(data); },
        failure: function(errMsg) { console.log(errMsg); }
    }).then(function(data) {
        location.reload();
    });
}

function ShowButton(item) {
    item = $(item);
    let quantity = parseInt(item.val());
    let quantityInitial = item.parent().parent().find('.quantityInitial').val();

    if (!item.is(":focus") && Number.isNaN(quantity)) {
        console.log("Resetting");
        quantity = quantityInitial;
        item.val(quantity);
    }

    if (quantity == quantityInitial)
        item.parent().parent().find('.update-cart').css("visibility", "hidden");
    else if (!Number.isNaN(quantity))
        item.parent().parent().find('.update-cart').css("visibility", "visible");
}

function UpdateCart(item) {
    item = $(item);
    let id = item.parent().parent().find('.remove-cart').attr('id');
    let quantity = item.parent().parent().find('.quantity').val();

    $.ajax({
        type: "PATCH",
        url: "/cart",
        data: JSON.stringify({id: id, quantity: quantity}),
        contentType: "application/json; charset=utf-8",
        //success: function(data){ console.log(data); },
        failure: function(errMsg) { console.log(errMsg); }
    }).then(function(data) {
        location.reload();
    });
}