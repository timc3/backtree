# Backtree.js

***

Is a backbone aware tree module for building a tree naviation system based on Backbone nested collections.

## Overview

BackTree is an opinionated Tree View for working with nested Backbone.js collections. It doesn't currently show models in the tree view.

Inspiration was gathered from Backgrid by Jimmy Yuen Ho Wong and Marionette by Derick Bailey, particular the use of composite views. 

## Supported browsers

It might well work on more browsers than the following but I will only test with a subset of all browsers 

* **Internet Explorer 9+
* **Safari 6+
* **Chrome 22+
* **Firefox 18+

 For IE8 and above you should use a shim for HTML5 tag support

## Requirements

* **JQuery** >= 1.7.2
* **Underscore** 1.4.3 || **LoDash with Underscore** 1.0.0-rc.3
* **Backbone.js** == 0.9.10 
* **Backbone Babysitter** == 0.0.4

It also currently requires a Javascript PubSub implementation (I have included a modified version of pubsub.js).


## Test & Develop

Run `test/index.html` 
