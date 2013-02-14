var root = window;

backtree = root.Backtree = {
  VERSION: "0.0.2",

  // check if we are using a mobile
  isMobile: (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)),
  
  logger: {
      loglevel: 3,
      level:{ none: 0, debug: 1, warn: 3 },
      log: function(mesg){
          if(window.console && console.log){
              console.log(mesg);   
          }
      } 
  }
}

var EventCoordinator = backtree.EventCoordinator = function(options){
  this._configure(options || {});
};
_.extend(EventCoordinator.prototype, {
    _configure: function(options) {
        if (this.options) options = _.extend({}, _.result(this, 'options'), options);
        this.options = options;
        this.pubfunction = options.publist || $.publish || undefined;
        this.subfunction =  options.subscribe || $.subscribe || undefined;
        this.unsubfunction = options.unsubscribe || $.unsubscribe || undefined;
        this.topicPrefix = options.topicPrefix || '/bt/';
    },
    publish: function(event, arguments, model){
      if (model !== undefined){
        model.trigger(event, arguments);
      }
      this.pubfunction(this.topicPrefix + event, [arguments, model]);
    },
    subscribe: function(topic, callback){
      if (this.subfunction !== undefined){
        this.subfunction(this.topicPrefix + topic, callback); 
      }
    },
    unsubscribe: function(topic, callback){
      if (this.unsubfunction !== undefined){
        this.unsubfunction(this.topicPrefix + topic, callback);
      }
    }
});

/* Backtree View
 *
 */
backtree.View = Backbone.View.extend({
  // Contains a cache of all the topics subscribed to
  topicCache: {},
  eventCoordinator: '',
  constructor: function(){
    var args = Array.prototype.slice.apply(arguments);
    Backbone.View.prototype.constructor.apply(this, args);
  },
  eventPublish: function(event, args, model){
    this.eventCoordinator.publish(event, args, model);
  },
  eventSubscribe: function(event, callback){
    this.eventCoordinator.subscribe(event, callback);
    this.topicCache[event] = callback;
  },
  eventUnSubscribe: function(event, callback){
    delete this.topicCache[event];
    this.eventCoordinator.unsubscribe(event, callback);
  },
  eventClearAll: function(){
    var self = this;
    _.each(this.topicCache, function(subscription, index){
      self.eventUnSubscribe(subscription.event, subscription.callback);
    });
  }
});

/* FooterView. 
 * Override this for custom footers.
 */
backtree.FooterView = backtree.View.extend({
  tagName: "footer",
  template: _.template('\
    <nav class="right">\
    <ul class="menu">\
    <li><a href="#" class="bt-ft-add-button">Add</a></li>\
    <li><a href="#" class="bt-ft-remove-button">Remove</a></li></ul>\
    </nav>\
    '),

  constructor: function(){
    _.bindAll(this, "render", "enable", "disable");
    var args = Array.prototype.slice.apply(arguments);
    backtree.View.prototype.constructor.apply(this, args);
  },

  events: function(){
    return backtree.isMobile ? { 
      "touchstart .bt-ft-add-button": 'addCollection',
      "touchstart .bt-menu-active .bt-ft-remove-button": 'removeCollection'
    } : { 
      "click .bt-ft-add-button": "addCollection",
      "click .bt-menu-active .bt-ft-remove-button": "removeCollection",
    }
  },

  render: function(){
    this.$el.html(this.template());
    return this;
  },

  // Enable menu views that need selected tree.
  enable: function(){
    this.$('.menu').addClass('bt-menu-active');
  },

  // Disable menu items that need selected tree.
  disable: function(){
    this.$('.menu').removeClass('bt-menu-active');
  },

  // Respond to add button
  addCollection: function(){
    this.$el.trigger('add-new-collection');
  },

  // Response to remove button
  removeCollection: function(){
    this.$el.trigger('remove-selected-collection');
  }
});

backtree.TreeView = backtree.View.extend({
  /*  Main Tree View 
   *  Represents a tree.
   *  
   *  It requires a root collection from which it the iterates over.
   *  Optional el selector to bind to a route element.
   *  Optionally it takes a class name otherwise that defaults to 'backtree'.
   *  Optional 'StateAttribute': Attribute used on element for closed or open branch.
   *  Optional template attribute: function call for rendering templates.
   *
   *  var tree = new Backtree.Tree({
   *    root: mybootstrappedcollection,
   *    el: '#backtree'
   *  });
   *
   *  $("#backgrid").append(tree.render().$el);
   *
   *
   * */
  tagName: "div",
  selectedCollection: [],

  constructor: function(){
    _.bindAll(this, "render", "addNew");
    
    // We create a structure for the child.
    this.children = new Backbone.ChildViewContainer();
    var args = Array.prototype.slice.apply(arguments);
    backtree.View.prototype.constructor.apply(this, args);
  
    // Bind the initial events ala Marionette.
    this._initialEvents();
  },

  _initialEvents: function(){
    if (this.collection){
      this.listenTo(this.collection, "add", this.addChildView, this);
      this.listenTo(this.collection, "remove", this.removeNodeView, this);
      this.listenTo(this.collection, "reset", this.render, this);
      this.listenTo(this.collection, "change:contents", this.updateChildView, this);
    }
  },

  events: {
    'remove-selected-collection': 'removeSelected',
    'add-new-collection': 'addNew'
  },

  initialize: function(options) {
    this.selectedCollection = [];
    this.className = options.className || "backtree";
    this.stateAttribute = options.stateAttribute || "state";
    this.branchAttribute = options.branchAttribute || "contents";
    this.nameAttribute = options.branchAttribute || "name";
    this.collection = options.collection;
    this.childTemplateRenderer = options.childTemplateRenderer || undefined;
    this.topicPrefix = options.topicPrefix || '/backtree/';
    this.eventCoordinator = options.eventCoordinator || new backtree.EventCoordinator({topicPrefix: this.topicPrefix});
    this.footer = options.footer || new backtree.FooterView();
    this.tree = options.tree || $('<div class="bt-wrapper"><nav class="tree"></div>');
    this.header = options.header || $('<header>');
    this._renderStructure();
    this._selectedEventBinder();

    // If we pass in an element then we can render on to it and can
    // manually call for render.
    if (options.el !== undefined){
      this.render();
    };
  },

  // Selected and Unselected Views need to be added and removed from the selectedCollection
  _selectedEventBinder: function(){
    var self=this;
    this.eventSubscribe('unselected', function(obj, collection){
      self.selectedCollection = _.reject(self.selectedCollection, function(viewObj){ if(viewObj.view.cid == obj.view.cid){ return viewObj;}});
      if (self.selectedCollection.length === 0 && self.footer.hasOwnProperty('disable')){  
        self.footer.disable(); 
      }
    });
    this.eventSubscribe('selected', function(obj, collection){
      self.selectedCollection.push({view: obj.view, collection: collection});
      if (self.selectedCollection.length > 0 && self.footer.hasOwnProperty('enable')){  self.footer.enable(); }
    });
  },

  // create the DOM structure that is needed for the tree.
  _renderStructure: function(){
    var self = this,
        renderHlpr = function(viewname){
          if (viewname.hasOwnProperty('render')){
            viewname.render()
            return viewname.$el.appendTo(self.$el);
          } else {
            return $(viewname).appendTo(self.$el);
          }
        };

    this.$el.empty().addClass(this.className);
    this.$headerEl = renderHlpr(this.header);
    this.$treeEl = renderHlpr(this.tree);
    this.$footerEl = renderHlpr(this.footer); 
  },

  render: function(){
    if (this.collection && this.collection.length > 0) {
      this.buildCollectionView();
    }
    this.trigger("rendered");
    return this;
  },

  /* Build up a view of the nodes in the collection. */
  buildCollectionView: function(){
    var self = this;
    // Iterate over the collection calling addNodeView
    this.collection.each(function(node, index){
      self.addNodeView(node, backtree.NodeView, index);
    });
  },

  /* Handler for event for adding
   * This should contain logic on where to put the new
   * collection before calling addNew view, because we need to make sure that we
   * maintain the correct dataStructure.
   *
   * */
  addNew: function(event){
    var _selectedCollection = this.selectedCollection,
        newCollection = {
          'type': 'collection',
          'name': 'Untitled',
          'state': 'closed'};
    var newChildNode = {};
        newChildNode[this.branchAttribute] = [newCollection];

    // If not selected in the UI, add to the route collection, otherwise add it into the heirarchy.
    if (_selectedCollection.length == 0){
      // Add to route collection.
      this.collection.add(newCollection);
    } else {
      // Get the parentView, Check to see if it actually has the branch attribute, if not add it and the newCollection.
      var _parentView = _selectedCollection[0];
      _parentView.view.unselect();
      if (!_parentView.hasOwnProperty('children')){
         _parentView.children = new Backbone.ChildViewContainer();
      }
      if (!_parentView.collection.hasOwnProperty(this.branchAttribute)){
        var updated = _parentView.collection.set(newChildNode);
        _parentView.view.collection = updated.contents;
        _parentView.view._initialEvents()  // Bind events on the new collection.
        _parentView.view.addNodeView(updated.contents.at(0), backtree.NodeView);
      } else {
        var updated = _parentView.collection[this.branchAttribute].add(newCollection);
      } 
    }
  },

  /* Update the child view for a change event */
  updateChildView: function(model, value, options){
    var self=this, view = this.children.findByModel(model);
    if (model[self.branchAttribute] !== undefined){ 
        if (view.collection === undefined){
          view.collection = model[self.branchAttribute];
          view._initialEvents()
        }
        view.render();
    }
  },
  
  /* Add a child view to the DOM */
  addChildView: function(item, collection, options){
    var index = this.collection.indexOf(item);
    this.addNodeView(item, backtree.NodeView, index);
  },

  /* Add a node */
  addNodeView: function(node, NodeViewType, index){
    var view = new NodeViewType({
        model: node, 
        parentView: this, 
        branchAttribute: this.branchAttribute,
        templateRenderer: this.childTemplateRenderer,
        eventCoordinator: this.eventCoordinator,
        topicPrefix: this.topicPrefix
    });

    // Keep track of childviews & render it
    this.children.add(view);
    view.render();

    // Append to this views DOM.
    this.appendHTML(this, view, index);
    
  },

  /* In separate function so that we can override it */
  appendHTML:function(collectionView, nodeView, index){
    collectionView.$treeEl.append(nodeView.el);
  },

  removeNodeView: function(node){
    var view = this.children.findByModel(node);
    if (this.selectedCollection[0] !== undefined && this.selectedCollection[0].collection.cid === node.cid){
      this.selectedCollection.pop(0);
      this.footer.disable();
    }
    this.removeChildView(view);
  },

  removeSelected: function(){
    if (this.selectedCollection[0] !== undefined && this.selectedCollection[0].hasOwnProperty('collection')){
       this.selectedCollection[0].view.model.destroy();
    }
  },

  /* Remove a single child view */
  removeChildView: function(view){
    if (view){
      if (view.close){
        view.close();
      }
      this.children.remove(view);
    }
  },

  // Another good idea inspired by Marionette
  close: function(){
    this.eventClearAll();
    this.closeChildren();
    this.remove();
  },

  /* Close the child views that this collection view
  // is holding on to, if any */
  closeChildren: function(){
    this.children.each(function(child){
      this.removeChildView(child);
    }, this);
  }
});











backtree.NodeView = backtree.TreeView.extend({
  /* Collection Node View. Used for rendering the branches as Child Views to the main structure
   * 
   * */
  tagName: "ul",
  template: _.template('<li><div class="bt-node">\
      <div class="bt-arrow <% if (state != undefined && state === "open"){ %>bt-arrow-open<% } %>">\
      </div><div class="bt-icon bt-icon-<%= type %>">\
      </div><span class="contenteditable"><%= name||id %></span></div></li>'),
  
  /* Events check for mobile compatibility */
  events: function(){
    return backtree.isMobile ? { 
      "touchstart .bt-node": 'select',
      "touchstart .bt-arrow": 'toggleVisibility'
    } : { 
      "click .bt-node": 'select',
      "click .bt-arrow": 'toggleVisibility',
      "click .contenteditable": 'editname'
    }
  },

  constructor: function(options){
    _.bindAll(this, "render", "selectEventHandler");
    var args = Array.prototype.slice.apply(arguments);

    // Apply these args using the prototypes chains arguments
    backtree.TreeView.apply(this, args);
  },

  initialize: function(options){
    this.templateRenderer = options.templateRenderer;
    this.collection = this.model[options.branchAttribute];
    this.eventCoordinator = options.eventCoordinator || new backtree.EventCoordinator();
    this.listenTo(this.model, 'select', function(){ this.select()}, this);  // Bind to select event (model is actually the wrapper for the collection).
  },

  render: function(event){
    var html = this.returnRendered();
    this.$el.addClass('bt-branch').html(html).attr('data-id', this.model.cid);
    this.renderCollection();
    return this;
  },

  renderCollection: function(){
    var args = Array.prototype.slice.apply(arguments);
    backtree.TreeView.prototype.render.apply(this, args);
  },

  returnRendered: function(){
    if (this.model.get('state') === undefined) { this.model.set({'state':'closed'}); }

    var html = '';
    if(this.templateRenderer !== undefined){
      html = this.templateRenderer(this.model, this);
    } else {
      html = this.template(this.model.attributes);
    }
    return html;
  },

  appendHTML: function(collectionView, nodeView){
    collectionView.$("li:first")
        .append(nodeView.el)
        .find("div.bt-arrow:first")
        .addClass("bt-arrow-open")
        .end()
        .find("div.bt-icon:first")
        .addClass("bt-icon-collection-open");
  },

  /* Handler for selecting this collection */
  select: function(event){
    var self=this;
    if (event !== undefined){
      event.preventDefault();
      event.stopPropagation();
    }
    var selected = this.$('.bt-node:first').toggleClass('bt-node-selected').hasClass('bt-node-selected');
    this.eventPublish((selected ? 'selected':'unselected'), {view: this}, this.model);

    if (selected === true){
      this.eventSubscribe('selected',  this.selectEventHandler);
    } else {
      this.eventUnSubscribe('selected', this.selectEventHandler);
    }
  },

  /* Hander for unselecting this collection */
  unselect: function(event){
    var selected = this.$('.bt-node:first').removeClass('bt-node-selected');
    this.eventUnSubscribe('selected', this.selectEventHandler);
    this.eventPublish('unselected', {view: this}, this.model);
  },

  /* This deals with the callback from listening to a select event */
  selectEventHandler: function(){
    this.eventUnSubscribe('selected', this.selectEventHandler);
    this.unselect();
  },
  
  /* Handler for editing the name field of a collection from the DOM */
  editname: function(event){
    event.preventDefault();  // Prevents the edit field from passing on the selection.
    event.stopPropagation();
    var span = event.target || event.srcElement, self = this, 
        text = span.innerHTML,
        input = document.createElement("input");
      span.style.display = "none";
      input.type = "text"; input.value = text;
      span.parentNode.insertBefore(input, span);
      input.focus();
      $(input).keydown(function(event){
        if (event.which == 27){ // escaping out
          input.onblur = null;
          span.parentNode.removeChild(input);
          span.style.display = "";
        } else if (event.which ==13) {
          input.blur();
        }
      });
      input.onblur = function(){
         span.innerHTML = input.value;
         self.model.set({name: input.value}); 
         span.parentNode.removeChild(input);
         span.style.display = "";
      }
  },

  /* Handler for toggling the visibility of a node */
  toggleVisibility: function(event){
    if (event !== undefined){
      event.preventDefault();
      event.stopPropagation();
    }
    var hidden = this.$el.toggleClass('bt-node-closed').hasClass('bt-node-closed');
    this.eventPublish((hidden ? 'hidden':'visible'), {view: this}, this.model);
    return true;
  }
});
