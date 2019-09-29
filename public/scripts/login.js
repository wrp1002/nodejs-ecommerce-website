$(document).ready(function () {
    const $loginForm = $('#loginForm');
    const $loginBtn = $('#loginbtn');
    const $emailField = $('#email');
    const $passwordField = $('#password');
    let showError = true;

    /**
     * Validation for the login form
     */
    let isValid = $loginForm.validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true
            },
        },
        messages: {
            email: {
                required: "Please enter your email address",
                email: "A valid email address is required"
            },
            password: {
                required: "Please enter your password",
            },
        },
        showErrors: function (errorMap, errorList) {
            if (showError) {
                this.defaultShowErrors();
            }
        }
    }).checkForm();


    /**
     * Disables login button until all fields are valid
     */
    $loginForm.on("blur keyup change", "input", () => {
        showError = false;

        if ($emailField.valid() && $passwordField.valid()) {
            $loginBtn.removeAttr("disabled");
        } else {
            $loginBtn.attr("disabled", "disabled");
        }
        showError = true;
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