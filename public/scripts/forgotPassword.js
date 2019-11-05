$(document).ready(function () {
    const $forgotPasswordForm = $('#forgotPasswordForm');
    const $forgotpasswordbtn = $('#forgotpasswordbtn');
    const $emailField = $('#email');
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
    $forgotPasswordForm.validate({
        rules: {
            email: {
                required: true,
                emailMustHaveDomain: true
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
     * and colours background depending on field validity
     */
    $forgotPasswordForm.on("blur keyup change", "input", () => {
        showError = false;

        if ($emailField.valid()) {
            $forgotpasswordbtn.removeAttr("disabled");
            $emailField.css("border", "none");
        } else {
            $emailField.css("border", "1px solid red");
            $forgotpasswordbtn.attr("disabled", "disabled");
        }
        showError = true;
    });

});