# Final Project for NWEN304

Dylan Hoefsloot
Deanne Alabastro
Wesley Paglia


a. How to use our system

    Start index.js with node. Navigate to http://localhost:5000 in a browser. The website will then be usable locally. An account must be created to be able to log in and use the service. After logged in, there will be new options on the navigation bar that allow you to view account settings and your cart. Using the search bar will allow you to search for products on the website. The products can then be added to your cart. Whenever you are done, you can click the cart on icon to view your cart. You can then review your cart and move on to the checkout. 

    If you are an administrator, you can go to the account page. On here, you will see additional options that other users cannot see. Here you can search for a user and view their purchase history. You also have the option to archive their purchase history. After doing this, you will be able to download the history as a text file. 



b. What the REST interface is

c. What error handling has been implemented in your system
Error handling is done in each API call. Checks are done to be sure that sql queries execute properly and have the correct data given to them. Checks are also done to be sure that the user is logged in and/or is an admin. Error pages are rendered in cases where the user should not be able to access certain pages. For some API calls, status codes are sent depending on how the request is processed. 