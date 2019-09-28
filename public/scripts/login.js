$(document).ready(function () {
    //variables for instant validation
    const loginForm = document.getElementById('loginForm');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const loginButton = document.getElementById('loginbtn');
    console.log("text");
    // let isEmailValid = false;

    // emailField.addEventListener('keyup', function (event) {
    // 	isValidEmail = emailField.checkValidity();

    // 	if (isValidEmail && emailField.value) {
    // 		isEmailValid = true;
    // 		isAllFieldsValid();
    // 	} else {
    // 		isEmailValid = false;
    // 	}
    // });

    // function isAllFieldsValid () {
    // 	if (passwordField.value && isEmailValid) {
    // 		loginButton.disabled = false;
    // 		console.log("valid");
    // 	} 

    // 	return false;
    // }

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