# Jobly - Express

Jobly is a backend app built using Express. It replicates some common functionalites from online job sites such as indeed.com. 

__Users are able to:__
 - search for companies
 - search for jobs
 - apply for jobs

__Authentication/Authorization (companies)__
 - Any user is able to view all companies or specific details regarding a company
 - Only Admin or the account owner is able to create, delete, or update information regarding a specific company

 __Authentication/Authorization (Users)__
  - Any prospective users are able to register
  - Only Admins are able to create and view all users
  - Only Admins or the account owner is able to get information on a specific user and update or delete any information regarding a user. 

---
__Unique functionalites:__
 - Search keyword does not have to be complete and is not case-sensitive
 - Result will display the best match from the database
---

To run this:

    node server.js
    
To run the tests:

    jest -i
