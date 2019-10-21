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
    $("#id").val(item.attr('id'));
    UpdatePrice();
  
    document.getElementById("mySidenav").style.right = "-0px";
    document.getElementById("fade").style.visibility = "visible";
    document.getElementById("fade").style.backgroundColor = "rgba(0,0,0,0.4)";
  }
  
  /* Set the width of the side navigation to 0 */
  function closeNav() {
    document.getElementById("mySidenav").style.right = "-400px";
    document.getElementById("fade").style.visibility = "hidden";
    document.getElementById("fade").style.backgroundColor = "rgba(0,0,0,0.0)";
  }
  
  function UpdatePrice() {
    let total = $("#price").val().replace(/\$/g, '') * $("#quantity").val();
    $("#total").val("$" + total);
  }