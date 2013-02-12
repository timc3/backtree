# BackTree

## backtree.TreeView options.

These are the options that can be sent through to the TreeView when initialising.

### DOM and view options.

Sending in view options means that you can customise the menus and other elements as you wish, providing custom rendering of DOM objects, custom event bindings or whatever.

#### header

Should be a Backbone type view with a render function that renders to own property $el or a JQuery DOM object.

#### tree

Should be a Backbone type view with a render function that renders to own property $el or a JQuery DOM object.

#### footer

Should be a Backbone type view with a render function that renders to own property $el or a JQuery DOM object.


## EventCoordinator.

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
