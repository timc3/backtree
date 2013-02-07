var root = window;

backtree = root.Backtree = {
  VERSION: "0.0.1",

  // check if we are using a mobile
  isMobile: (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
}
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

    this.$el.empty().addClass(this.className).attr('role', 'navigation');
    // If we pass in an element then we can render on to it.
    if (options.el !== undefined){
      this.render();
    };
  },

  events: function() {
  },

  render: function(){
    // Give the root element the className we have configured
    
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
        templateRenderer: this.childTemplateRenderer 
    });

    // Keep track of childviews & render it
    this.children.add(view);
    view.render();

    // Append to this views DOM.
    this.appendHTML(this, view, index);
  },

  /* In separate function so that we can override it */
  appendHTML:function(collectionView, nodeView, index){
    collectionView.$el.append(nodeView.el);
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
  template: _.template('<li><div class="bt-node"><div class="bt-type-<%= type %>"></div><div class="bt-icon bt-icon-<%= type %>"></div><%= name||id %></div></li>'),
  //template: _.template('<li><%= name||id %></li>'),
  events: function(){
    return backtree.isMobile ? { "touchstart": 'select' } : { "click .bt-node": 'select'}
  },
  constructor: function(options){
    var args = Array.prototype.slice.apply(arguments);

    // Apply these args using the prototypes chains arguments
    backtree.TreeView.apply(this, args);
  },
  initialize: function(options){
    this.templateRenderer = options.templateRenderer;
    this.collection = this.model[options.branchAttribute];
  },
  render: function(){
    var html = this.returnRendered();
    this.$el.addClass('backtreespacer').html(html).attr('data-id', this.model.cid);
    this.renderCollection();
    return this;
  },
  renderCollection: function(){
    var args = Array.prototype.slice.apply(arguments);
    backtree.TreeView.prototype.render.apply(this, args);
  },
  returnRendered: function(){
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
        .find("div.bt-type-collection:first")
        .addClass("bt-type-collection-open")
        .end()
        .find("div.bt-icon:first")
        .addClass("bt-icon-collection-open");
  },
  select: function(event){
    event.preventDefault();
    event.stopPropagation();
    this.$('.bt-node:first').toggleClass('bt-node-selected');
  },
  openHandler: function(event){
    
  }
});
