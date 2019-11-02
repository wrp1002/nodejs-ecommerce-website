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

/* Set the width of the side navigation to 250px */
function openNav(item) {
    item = $(item);
    console.log(item);
    $("#name").text(item.parent().parent().find('.name').text());
    $("#price").val(item.parent().parent().find('.price').text());
    $("#quantity").val("1");
    $("#id").val(item.attr('id'));
    UpdatePrice();
  
    document.getElementById("mySidenav").style.right = "-0px";
    document.getElementById("fade").style.visibility = "visible";
    document.getElementById("fade").style.backgroundColor = "rgba(0,0,0,0.4)";
  }
  
  /* Set the width of the side navigation to 0 */
  function closeNav() {
    if (!wait) {
        document.getElementById("mySidenav").style.right = "-400px";
        document.getElementById("fade").style.visibility = "hidden";
        document.getElementById("fade").style.backgroundColor = "rgba(0,0,0,0.0)";
    }
  }
  
  function UpdatePrice() {
    let total = $("#price").val().replace(/\$/g, '') * $("#quantity").val();
    total = Math.floor(total * 100 + .5) / 100;
    $("#total").val("$" + total);
  }

function UpdateCart() {
console.log("Updating cart...");
$.ajax({
    url: "/cartCount",
    type: 'GET',
    success: function(data) {
        console.log("cartItems:", data.cartCount);
        if (data.cartItems == -1)
        window.location = "/login";
        $("#cart-count").text(data.cartCount);
    }
});
}

$(function() {
    $("#form").on("submit", function(e) {
        $("#add-cart-button").val("Adding...");
        e.preventDefault();

        if (!wait) {
            wait = true;

            $.ajax({
                url: $(this).attr("action"),
                type: 'POST',
                data: $(this).serialize(),
                success: function(data) {
                    wait = false;
                    //console.log(data.cartItems);
                    //console.log($("cart-count").text());
                    closeNav();
                    UpdateCart();
                    $("#add-cart-button").val("Add to cart");
                    
                }
            });
        }
    });
});

$(document).ready(function() {
    wait = false;
});