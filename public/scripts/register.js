$(document).ready(function () {
    $('#signupbtn').click(function (event) {

      event.preventDefault();

      $.ajax({
        method: 'POST',
        url: 'register',
        dataType: 'json',
        processData: false,
        contentType: 'application/json',
        data: JSON.stringify({
          'email': $('#email').val(),
          'password': $('#password').val()
        }),
        success: (result) => {
          location.href = "/"
        },
        error: (result) => {
          console.log(result.message);
        }
      })
    });
  });