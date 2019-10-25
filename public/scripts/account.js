function GetPurchaseHistory() {
    let email = $("#email").val();
    console.log(email);
    $.ajax({
        type: "GET",
        url: "/purchaseHistory",
        data: {
            'email': email
        },
        contentType: "application/json; charset=utf-8",
        failure: function(errMsg) { console.log(errMsg); }
    }).then(function(data) {
        console.log(data);
        document.getElementById('results').innerHTML = data;
    });
    return false;
}
