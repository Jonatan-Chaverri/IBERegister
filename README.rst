============
IBE Register
============

IBE Register is a Web Application that serves as a self registration tool for church members that wants to attend church services, allowing them to reserve a certain amount of spaces for the service. 

It was developed during COVID pandemic to ensure the fulfillment of capacity restrictions imposed at the time by the goverment. 

The app is currently being used by a local church, you can see it in action in this site https://iberegistro.web.app

Prerequisites
=============

1. Set a new Firebase project in Firebase website
2. Set a new real time database in Firebase
3. Copy/paste configurations to config.js file.
4. Set at least one user in firebase authentication console to act as an "admin". Project is configured to accept email and password as credentials.

Deploy
======

1. Build the project

```
yarn build
```

2. Deploy to firebase

```
Firebase deploy
```

Navigation
==========

There are two main views, one for the guests that are going to make reservations and the other just for the admins that will be checking those reservations.

- *https://<project_url>/* to make reservations.
- *https://<project_url/admin* for system admins, authentication is done using Firebase authentication features. 
