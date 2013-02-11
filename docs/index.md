# BackTree

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
