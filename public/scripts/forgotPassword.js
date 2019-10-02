$(document).ready(function () {
    const $forgotPasswordForm = $('#forgotPasswordForm');
    const $forgotpasswordbtn = $('#forgotpasswordbtn');
    const $emailField = $('#email');
    let showError = true;

    /**
     * Validation for the login form
     */
    $forgotPasswordForm.validate({
        rules: {
            email: {
                required: true,
                email: true
            },
        },
        messages: {
            email: {
                required: "Please enter your email address",
                email: "A valid email address is required"
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
    $forgotPasswordForm.on("blur keyup change", "input", () => {
        showError = false;

        if ($emailField.valid()) {
            $forgotpasswordbtn.removeAttr("disabled");
        } else {
            $forgotpasswordbtn.attr("disabled", "disabled");
        }
        showError = true;
    });

});