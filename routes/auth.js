var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var shortid = require('shortid');
var db = require("../lib/db");

module.exports = function (passport) {
  router.get('/login', function (request, response) {
    var fmsg = request.flash();
    var feedback = '';
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    var title = 'WEB - login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <div style="color:red;">${feedback}</div>
      <form action="/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p>
          <input type="submit" value="login">
        </p>
      </form>
    `, '');
    response.send(html);
  });

  /*router.post('/login_process',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/auth/login',
      failureFlash: true,
      successFlash: true
    }));*/
router.post('/login_process', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
    if (err) {
    return next(err);
    }
    if (!user) {
    req.flash('error', info.message);
    return req.session.save(function (err) {
    if (err) {
    return next(err);
    }
    return res.redirect('/auth/login');
    })
    }

    req.login(user, function (err) {
    if (err) {
    return next(err);
    }
    req.flash('success', info.message);
    return req.session.save(function (err) {
    if (err) {
    return next(err);
    }
    return res.redirect('/');
    });
    });
    })(req, res, next);
    });
  router.get('/register', function (request, response) {
    var fmsg = request.flash();
    var feedback = '';
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    var title = 'WEB - login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <div style="color:red;">${feedback}</div>
      <form action="/auth/register_process" method="post">
        <p><input type="text" name="email" placeholder="email" value="egoing777@gmail.com"></p>
        <p><input type="password" name="pwd" placeholder="password" value="111111"></p>
        <p><input type="password" name="pwd2" placeholder="password" value="111111"></p>
        <p><input type="text" name="displayName" placeholder="display name" value="egoing"></p>
          <input type="submit" value="register">
        </p>
      </form>
    `, '');
    response.send(html);
  });
  
  router.post('/register_process', function (request, response) {
    var post = request.body;
    var email = post.email;
    var pwd = post.pwd;
    var pwd2 = post.pwd2;
    var displayName = post.displayName;
    if (pwd !== pwd2){
      request.flash('error', 'password must same!');
      response.redirect('/auth/register')
    } else{
    var user = {
      id:shortid.generate(),
      email:email,
      password:pwd,
      displayName:displayName
    };
    db.get('users').push(user).write();
    request.login(user, function(err){
      return response.redirect('/');
    })
  }});

  router.get('/logout', function (request, response) {
    request.logout();
    request.session.save(function () {
      response.redirect('/');
    });
  });

  return router;
}