# BackTree

## Overview

BackTree is an opinionated Tree View for working with nested Backbone.js collections.

A lot of inspiration was gathered from Backgrid by Jimmy Yuen Ho Wong and Marionette by Derick Bailey, particular the use of composite views. 

## Requirements

JQuery == 1.7.2
Underscore 1.4.3 || LoDash with Underscore 1.0.0-rc.3
Backbone.js == 0.9.10 
Backbone Babysitter == 0.0.4

It also currently requires a Javascript PubSub implementation (I have included pubsub.js).


## Events.

Events are published raised for selecting/unselecting elements, for hiding and unhiding branches and this is by using triggers on the model and an event system.


