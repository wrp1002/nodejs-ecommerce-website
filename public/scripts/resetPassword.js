$(document).ready(function () {
    const $resetPasswordForm = $('#resetPasswordForm');
    const $resetpasswordBtn = $('#resetpasswordbtn');
    const $passwordField = $('#password');
    const $confirmField = $('#confirm');
    let showError = true;

    /**
     * Validation for the login form
     */
    $resetPasswordForm.validate({
        rules: {
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
     * Change border colour of password field on change based on validity
     */
    $passwordField.on("blur keyup change", () => {
        if ($passwordField.valid()) {
            $passwordField.css("border", "none");
        } else {
            $passwordField.css("border", "1px solid red");
        }
    });

    /**
     * Change border colour of confirm password field on change based on validity
     */
    $confirmField.on("blur keyup change", () => {
        if ($emailField.valid()) {
            $emailField.css("border", "none");
        } else {
            $emailField.css("border", "1px solid red");
        }
    });


    /**
     * Disables login button until all fields are valid
     */
    $resetPasswordForm.on("blur keyup change", "input", () => {
        showError = false;

        if ($passwordField.valid()
        && $confirmField.valid()) {
            $resetpasswordBtn.removeAttr("disabled");
        } else {
            $resetpasswordBtn.attr("disabled", "disabled");
        }
        showError = true;
    });
  });