# Jobly - Express

Jobly is a backend app built using Express. Its functionalites are very similar to online job sites such as indeed.com. 

---
Users are able to:
    - search for companies
    - search for jobs
    - apply for jobs
---

---
Unique functionalites:
    - Search keyword does not have to be complete and is not case-sensitive
    - Result will display the best match from the database
---

---
 Authentication/Authorization (companies)
    - Any user is able to view all companies or specific details regarding a company
    - Only Admin or the account owner is able to create, delete, or update information regarding a specific company
___

___
 Authentication/Authorization (Users)
    - Any prospective users are able to register
    - Only Admins are able to create and view all users
    - Only Admins or the account owner is able to get information on a specific user and update or delete any information regarding a user. 
___
 
To run this:

    node server.js
    
To run the tests:

    jest -i
