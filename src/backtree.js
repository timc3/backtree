var root = window;

backtree = root.Backtree = {
  VERSION: "0.0.1",

  // check if we are using a mobile
  isMobile: (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
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

backtree.TreeView = Backbone.View.extend({
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
  
  // Contains a cache of all the topics subscribed to
  topicCache: {},

  constructor: function(){
    _.bindAll(this, "render");
    
    // We create a structure for the child.
    this.children = new Backbone.ChildViewContainer();
    var args = Array.prototype.slice.apply(arguments);
    Backbone.View.prototype.constructor.apply(this, args);
  
    // Bind the initial events ala Marionette.
    this._initialEvents();
  },

  _initialEvents: function(){
    if (this.collection){
      this.listenTo(this.collection, "add", this.addChildView, this);
      this.listenTo(this.collection, "remove", this.removeNodeView, this);
      this.listenTo(this.collection, "reset", this.render, this);
    }
  },

  initialize: function(options) {
    this.className = options.className || "backtree";
    this.stateAttribute = options.stateAttribute || "state";
    this.branchAttribute = options.branchAttribute || "contents";
    this.collection = options.collection;
    this.childTemplateRenderer = options.childTemplateRenderer || undefined;
    this.topicPrefix = options.topicPrefix || '/backtree';

    // Clear out this element then 
    //this.$el.empty().addClass(this.className).attr('role', 'navigation');
    this._renderStructure();
    this.eventCoordinator = options.eventCoordinator || new backtree.EventCoordinator({topicPrefix: this.topicPrefix});

    // If we pass in an element then we can render on to it and can
    // manually call for render.
    if (options.el !== undefined){
      this.render();
    };
  },

  events: function() {
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
    _.each(this.topicCache, function(subscription, index){
      this.eventUnSubscribe(subscription.event, subscription.callback);
    });
  },

  // create the DOM structure that is needed for the tree.
  _renderStructure: function(){
    this.$el.empty().addClass(this.className);
    this.$headerEl = $('<header>').appendTo(this.$el);
    this.$treeEl = $('<nav>').appendTo(this.$el);
    this.$footerEl = $('<footer>').appendTo(this.$el);
  },
  render: function(){
    // If we have a collection, build up the subitems.
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
    view = this.children.findByModel(node);
    this.removeChildView(view);
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
  /* Collection Node View
   * 
   * */
  tagName: "ul",
  template: _.template('<li><div class="bt-node"><div class="bt-arrow <% if (state != undefined && state === "open"){ %>bt-arrow-open<% } %>"></div><div class="bt-icon bt-icon-<%= type %>"></div><%= name||id %></div></li>'),
  
  /* Events check for mobile compatibility */
  events: function(){
    return backtree.isMobile ? { 
      "touchstart .bt-node": 'select',
      "touchstart .bt-arrow": 'toggleVisibility'
    } : { 
      "click .bt-node": 'select',
      "click .bt-arrow": 'toggleVisibility'
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
  },
  render: function(){
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
  unselect: function(event){
    var selected = this.$('.bt-node:first').removeClass('bt-node-selected');
  },
  /* This deals with the callback from listening to a select event */
  selectEventHandler: function(){
    this.eventUnSubscribe('selected', this.selectEventHandler);
    this.unselect();
  },

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
