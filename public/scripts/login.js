$(document).ready(function () {
    //variables for instant validation
    const loginForm = document.getElementById('loginForm');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const loginButton = document.getElementById('loginbtn');
    
    /**
     * Validation
     */
    $('#loginForm').validate({
        rules: {
            email: {
                required: true,
                email: true
            }, 
            password: {
                required: true
            }
        },
        messages: {
            email: {
                required: "Please enter your email address",
                email: "A valid email address is required"
            },
            password: {
                required: "Password required",
            }
        }
    });

    $('#loginbtn').click(function (event) {

        event.preventDefault();

        $.ajax({
            method: 'POST',
            url: 'login',
            dataType: 'json',
            processData: false,
            contentType: 'application/json',
            data: JSON.stringify({
                'email': $('#email').val(),
                'password': $('#password').val()
            }),
            success: (result) => {
                location.href = "/"
                window.sessionStorage.setItem('token', req.token);
            },
            error: (result) => {
                console.log(result.message)
            }
        })
    });
});