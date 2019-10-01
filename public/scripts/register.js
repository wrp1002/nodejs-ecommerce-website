$(document).ready(function () {
    const $signupForm = $('#signupForm');
    const $signupBtn = $('#signupbtn');
    const $emailField = $('#email');
    const $passwordField = $('#password');
    const $confirmField = $('#confirm');
    let showError = true;

    /**
     * Validation for the login form
     */
    $signupForm.validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 6
            },
            confirm: {
                required: true,
                equalTo: "#password"
            }
        },
        messages: {
            email: {
                required: "Please enter your email address",
                email: "A valid email address is required"
            },
            password: {
                required: "Please enter your password",
                minlength: "Password must be at least 6 characters"
            },
            confirm: {
                required: "Please re-enter password",
                equalTo: "Passwords must match",
            }
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
    $signupForm.on("blur keyup change", "input", () => {
        showError = false;

        if ($emailField.valid() && $passwordField.valid()
        && $confirmField.valid()) {
            $signupBtn.removeAttr("disabled");
        } else {
            $signupBtn.attr("disabled", "disabled");
        }
        showError = true;
    });
  });