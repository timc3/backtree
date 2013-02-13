# Backtree

This is documentation for Backtree Version 0.0.2

## backtree.TreeView options.

These are the options that can be sent through to the TreeView when initialising. So when you are doing the following:

```
var tree = new Backtree.TreeView({
      collection: myCollection,
      el: '#backtree',
      className: 'backtree',
      topicName: '/backtree/'
    });

```
You are passing in the that root element is going to be on '#backtree', and the collection is the root of the collection that you wish to build the tree from and so on.


### Parsing and view options.
---
There are some options that are used for parsing the json and pulling out attributes.

#### branchAttribute

** Default: "contents"**

*** Type: string***

When parsing the nested collections for its branches, it will follow down whatever is named in this attribute.

#### stateAttribute ***ToBe Fixed***

** Default: "state"**

***ToBe Fixed***

*** Type: string***

Optional, used for ignoring and not rendering. 

#### nameAttribute ***ToBe Fixed***

** Default: "name"**

*** Type: string***

Not all models/collections have a name attribute or want the template to render name as the label on the tree. Valid options could be something like "title", "label", "Namn";


### DOM and view options.
---
Sending in view options means that you can customise the menus and other elements as you wish, providing custom rendering of DOM objects, custom event bindings or whatever.

#### className

** Default: "backtree"**

*** Type: string***

The class that the default root node gets when rendering. Useful if you are putting multiple trees on the page and want them to look differently.

#### header

** Default: `<header>`**

*** Type: backbone view with .render() method or a string***

Should be a Backbone type view with a render function that renders to own property $el or a JQuery DOM object.

#### tree

** Default: `$('<div class="bt-wrapper"><nav class="tree"></div>');`**

*** Type: backbone view with .render() method or a string***

Should be a Backbone type view with a render function that renders to own property $el or a JQuery DOM object.

#### footer

** Default: `new backtree.FooterView()`**

*** Type: backbone view with .render() method or a string***

Should be a Backbone type view with a render function that renders to own property $el or a JQuery DOM object. 

#### childTemplateRenderer

** Default: `_.template` **

*** Type: function(model, view) ***

A renderer that can be passed in instead of the usual backtree NodeView View.


## EventCoordinator.
---
Events are published raised for selecting/unselecting elements, for hiding and unhiding branches and this is by using triggers on the model and an event system.

The Event system takes an implementation of backtree.EventCoordinator or your own EventCoordinator which should provide "publish", "subscribe" and "unsubscribe" methods.

The pubsub system should be optional but its advised for selection and deselection of options and for integrating with other view code. State is not saved into the collections themselves.

###


### Rendered Event: `rendered`

This is triggered on the view element itself when it is rendered.

### Selection Event: `selected`

When a collection or child collection is selected in the UI  we raise a selected event.

### Selection Event: `unselected`

When a collection or child collection is unselected in the UI  we raise a unselected event.
