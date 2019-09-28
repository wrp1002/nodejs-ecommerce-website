$(document).ready(function () {
    const $loginForm = $('#loginForm');
    const $loginBtn = $('#loginbtn');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');

    /**
     * Validation for the login form
     */
    $loginForm.validate({
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

    /**
     * Disables login button until all fields are valid
     */
    $loginForm.on("blur keyup change", "input", () => {
        if (passwordField.value && emailField.value) {
            if ($loginForm.valid()) {
                $loginBtn.removeAttr("disabled");
            } else {
                $loginBtn.attr("disabled", "disabled");
            }
        } 
    });

    $loginBtn.click(function (event) {

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