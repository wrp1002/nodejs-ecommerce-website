$(document).ready(function () {
    const $signupForm = $('#signupForm');
    const $signupBtn = $('#signupbtn');
    const $emailField = $('#email');
    const $passwordField = $('#password');
    const $confirmField = $('#confirm');
    let showError = true;

    /**
     * Custom email validation as html5 and jquery validation 
     * classify emails without domains as valid (backend verifies it as invalid though)
     */
    $.validator.addMethod("emailMustHaveDomain",
        function (value, element) {
            return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
        },
        "A valid email address is required"
    );

    /**
     * Validation for the login form
     */
    $signupForm.validate({
        rules: {
            email: {
                required: true,
                emailMustHaveDomain: true
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
     * Change border colour of email field on change based on validity
     */
    $emailField.on("blur keyup change", () => {
        if ($emailField.valid()) {
            $emailField.css("border", "none");
        } else {
            $emailField.css("border", "1px solid red");
        }
    });

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