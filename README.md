# Final Project for NWEN304

Dylan Hoefsloot
Deanne Alabastro
Wesley Paglia


a. How to use our system

    Start index.js with node. Navigate to http://localhost:5000 in a browser. The website will then be usable locally. An account must be created to be able to log in and use the service. After logged in, there will be new options on the navigation bar that allow you to view account settings and your cart. Using the search bar will allow you to search for products on the website. The products can then be added to your cart. Whenever you are done, you can click the cart on icon to view your cart. You can then review your cart and move on to the checkout. 

    If you are an administrator, you can go to the account page. On here, you will see additional options that other users cannot see. Here you can search for a user and view their purchase history. You also have the option to archive their purchase history. After doing this, you will be able to download the history as a text file. 

    File Structure:

        * config directory: contains the configuration files for passport module used in the auth controller.
        * controllers directory: contains all of the files that manage whether a user can go to a page or not (api)
        * db directory: contains all of the files for managing and accessing the database. More information in the database access and management section of the report.
        * services directory: used by the controllers when a single query is not enough to determine what route a user can access and be redirected to. An example is the mailer service that decides what email to send to a user. The shoppingService contains all of the miscellaneous logic related to shopping such as accessing accounts, calculating cart number, calculating total price and many more.
        * public and views directory: contains all of the view related code that users can see such as html, css, images, and client side scripts.
        * The root index file contains the configuration for the server.

    Heroku Access: https://nwen304finalproject.herokuapp.com/
    Admin Account: Email: admin@test.com, Password: password
    User Account: Recommended to create your own so you can test password reset. Or: Email: test@email.com Password: Tester

b. What the REST interface is

    '/'
        GET: Returns a rendered view of the homepage
    '/register'
        GET: Returns a rendered view of the registration form
    '/auth/register'
        POST: check inputs are valid. If valid, generates hash and salt and adds user to database. It then redirects to login if successful. If not valid, re-renders register with flash message of the errors
    '/login'
        GET: Returns a rendered view of the login form
    '/auth/login'
        POST: Check if input is valid. Then checks if authentication is successful. If successful, redirects to homepage and deletes any stored password reset tokens in database. Else, redirects back to login with error flash message.
    '/auth/google'
        GET: redirects user to Google OAuth Login.
    '/auth/logout'
        POST: Logs user out and redirects them to login page with success flash message
    '/forgotpassword'
        GET: Returns a rendered view of the forgot password form
    '/auth/forgotpassword'
        POST: If the email is a valid email, it sends either an email containing a link with a password reset token (if user exists in database) or an email telling the user that their account does not exist and links to register or forget password again. The second option is to prevent attackers from spamming the forget password page to find which accounts exist in the database.
    '/auth/resetpassword/:token'
        GET: Checks if token is valid (less than fifteen minutes old). If valid, renders resetpassword page. Else renders page with error message.
    '/auth/resetpassword/'
        POST: First checks if the token is still valid. If valid, checks the validity of new password. If valid, generates and saves new hash and redirects to login with success message. Else, redirects to resetpassword with error message.
    '/search'
        GET: Returns a rendered view of the search page with search results given from query parameter 'search'
    '/addproduct'
        GET: Returns a rendered view of the add products form
        POST: Adds a new product into the database after ensuring that an admin has made the request
    '/cart'
        GET: Returns a rendered view of the cart page of a user
        POST: Adds a new products to a user's cart
        DELETE: Removes an item from a user's cart
        PATCH: Changes the quantity of an item in a user's cart
    '/cartCount'
        GET: Returns the amount of items in a user's cart in JSON format
    '/checkout'
        GET: Returns ta rendered view of the checkout page, which shows a short summary of the purchase
    '/placeorder'
        GET: Adds the user's order to the order history table in the database and returns a rendered page saying that the purchase was successful
    '/account'
        GET: Returns ta rendered view of the account page. If an administrator is logged in, there are extra tools available
    '/purchaseHistory'
        GET: Returns a rendered view of a user's purchase history
        DELETE: Archives a user's purchase history. Only available for administrators. 
    '/archive'
        GET: Returns a rendered view of the archive page where archived purchase history can be viewed. Only available for administrators. 
    '/archiveDownload'
        GET: Downloads a text file of a user's purchase history specified by the query parameter 'file'. Only available for administrators.
    '/recommendation'
        GET: Returns a rendered view of a weather based recommendation. 

c. What error handling has been implemented in your system
    Error handling is done in each API call. Checks are done to be sure that sql queries execute properly and have the correct data given to them. Checks are also done to be sure that the user is logged in and/or is an admin. Error pages are rendered in cases where the user should not be able to access certain pages. Checks are also done for inputs and flash messages (i.e. req.flash) are used to tell the user if inputs for forms are invalid and if certain actions are successful (e.g. sending a password reset email). For some API calls, status codes are sent depending on how the request is processed. The error is also printed to console.