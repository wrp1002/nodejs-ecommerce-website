# Final Project for NWEN304

Dylan Hoefsloot
Deanne Alabastro
Wesley Paglia


a. How to use our system

    Start index.js with node. Navigate to http://localhost:5000 in a browser. The website will then be usable locally. An account must be created to be able to log in and use the service. After logged in, there will be new options on the navigation bar that allow you to view account settings and your cart. Using the search bar will allow you to search for products on the website. The products can then be added to your cart. Whenever you are done, you can click the cart on icon to view your cart. You can then review your cart and move on to the checkout. 

    If you are an administrator, you can go to the account page. On here, you will see additional options that other users cannot see. Here you can search for a user and view their purchase history. You also have the option to archive their purchase history. After doing this, you will be able to download the history as a text file. 



b. What the REST interface is

    '/'
        GET: Returns a rendered view of the homepage
    '/register'
        GET: Returns a rendered view of the registration form
    '/login'
        GET: Returns a rendered view of the login form
    '/forgotpassword'
        GET: Returns a rendered view of the forgot password form
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
    Error handling is done in each API call. Checks are done to be sure that sql queries execute properly and have the correct data given to them. Checks are also done to be sure that the user is logged in and/or is an admin. Error pages are rendered in cases where the user should not be able to access certain pages. For some API calls, status codes are sent depending on how the request is processed. 