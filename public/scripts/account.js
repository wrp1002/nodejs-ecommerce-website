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
        if (data != "No results") {
            $("#archive").css("visibility", "visible");
        }
    });
    return false;
}

$(document).ready(function(e) {
    $('#archive-confirm').dialog({
        modal : true, autoOpen : false,
        buttons : {
        "Confirm" : function () {
            let email = $("#email").val();

            $(this).dialog('close');
            $("#archive-confirmed").dialog('open');

            $.ajax({
                type: "DELETE",
                url: "/purchaseHistory",
                data: JSON.stringify({email: email}),
                contentType: "application/json; charset=utf-8",
                success: function(data){
                    alert('horray! 200 status code!');
                    $("#archive-done-result").innerHTML = "Successfully archived purchase history";
                    $("#archive-confirmed").dialog('close');
                    $("#archive-done").dialog('open');
                },
                error: function(data){
                    //get the status code
                    $("#archive-done-result").innerHTML = "Failed to archive purchase history";
                }
            }).then(function(data) {
                
            });
        },
        "Cancel" : function () { $(this).dialog('close'); }
        }
    });

    $('#archive-done').dialog({
        modal : true, autoOpen : false,
        buttons : {
            "Okay" : function () { location.reload(); }
        }
    });

    $('#archive-confirmed').dialog({
        modal : true, autoOpen:false, 
        closeOnEscape: false,
        dialogClass: "noclose",
         open: function(event, ui) {
            $("#archive-confirmed", ui.dialog || ui).hide();
        }
    });
    

    $("#archive").click(function() {
        $("#archive-confirm").dialog('open');
    });
});