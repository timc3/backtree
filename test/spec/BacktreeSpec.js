/*  Test scripts depend on Jasmine and Jasmine.JQuery */

describe("Bind to existing Element", function(){
  beforeEach(function() {
    myCollection = new testCollection(jsonstructure.contents);
    tree = new Backtree.TreeView({
        collection: myCollection,
        className: 'backtree',
        childTemplateRenderer: function(model, view){
          return ('<div>' + model.get('id') + '</div>');
        } 
    });
  });

  it("should be defined correctly", function(){
    expect(tree).toBeDefined();
    expect(tree.children).toBeDefined();
  });
  it("should not be rendered until we call the render function", function(){
    expect(tree.$el).not.toContainHtml('<div>collection1</div>');
  });
  it("should render on to an element that we can create", function(){
    var newEl = $('<div>');
    $('#backtree').append(newEl);
    newEl.append(tree.render().$el);
    expect(tree.$el).toContainHtml('<div>collection1</div>');
  });
});

describe("Custom Template Renderer", function(){
  beforeEach(function() {
    myCollection = new testCollection(jsonstructure.contents);
    tree = new Backtree.TreeView({
        collection: myCollection,
        el: '#backtree',
        className: 'backtree',
        childTemplateRenderer: function(model, view){
          return ('<div>' + model.get('id') + '</div>');
        } 
    });
  });


  it("should be defined correctly", function(){
    expect(tree).toBeDefined();
    expect(tree.children).toBeDefined();
  });
  it("should use the custom renderer function to return HTML", function(){
    expect(tree.$el).toContainHtml('<div>collection1</div>');
    expect(tree.$el).toContainHtml('<div>collection2</div>');
    expect(tree.$el).toContainHtml('<div>collection3</div>');
  });
});

describe("Basic Backtree Usage", function() {
  /* var myCollection, tree; */

  beforeEach(function() {
    myCollection = new testCollection(jsonstructure.contents);
    tree = new Backtree.TreeView({
      collection: myCollection,
      el: '#backtree',
      className: 'backtree',
      topicName: '/backtree/'
    });
  });

  afterEach(function(){
    $.unsubscribeall();
  });

  it("should define a view with children views", function() {
    expect(tree).toBeDefined();
    expect(tree.children).toBeDefined();
  });

  it("should remove everything under the existing dom element.", function() {
    expect(tree.$el.html()).toNotBe('Test');
  });

  it("should get the class from the initialization.", function() {
    expect(tree.$el.hasClass(tree.className)).toBe(true);
  });

  it("should have created the data structure in the view.", function() {
    expect(tree.collection).toBeDefined();
    expect(tree.collection.get('collection1')).not.toBeUndefined();
  });

  it("should append the structure to the DOM correctly", function(){
    expect(tree.$el).toContainHtml('Collection 3');
    expect(tree.$el).toContainHtml('A Sub Collection');
  });

  it("should add new childviews to the DOM correctly", function(){
    // This adds a relatively easy amendment.
    tree.collection.add([new testModel({
      id: 'testAddNewNode1',
      name:'testAddNewNode1', 
      type:'collection',
      url:'/test',
      contents: [{
        id: 'subcollection1',
        name: 'testAddNewSubCollection'
      }]
      })
    ]);
    expect(tree.$el).toContainHtml('testAddNewNode');
    expect(tree.$el).toContainHtml('testAddNewSubCollection');
  });

  it("should be possible to remove child nodes as needed", function(){
    tree.collection.add([new testModel({
      id: 'removeMe',
      name:'removeMe', 
      type:'collection',
      url:'/test',
      contents: [{
        id: 'subcollection1',
        name: 'removeSub'
      }]
      })
    ]);
    tree.collection.remove(tree.collection.get('removeMe'));
    expect(tree.$el).not.toContainHtml('removeSub');
    expect(tree.$el).not.toContainHtml('removeMe');
  });

  it("should be possible to update the name of a childnode and it updates in the DOM", function(){

  });

  it("should handle click and change the class to show its selected", function(){
    tree.$('div:contains("A Sub Collection")').click();
    expect(tree.$('div:contains("A Sub Collection")').hasClass('bt-node-selected')).toBe(true);
    tree.$('div:contains("A Sub Collection")').click();
    expect(tree.$('div:contains("A Sub Collection")').hasClass('bt-node-selected')).toBe(false);
  });

  it("Selection should raise events and close selected in other views", function(){

  });

  it("should not propegate a click event to parent nodes", function(){
    tree.$('div:contains("A Sub Collection")').click();
    expect(tree.$('div:contains("A Sub Collection")').parents().find('.bt-node-selected').length).toBe(1);
  });

  it("should create a node with collection icon if that is the type", function(){
    expect(tree.$('div:contains("A Sub Collection")').find('.bt-icon-collection').length).toBe(1);
  });

  describe("click to expand on branch", function(){
    it("should toggle visibility of a branch with child nodes by setting the correct class", function(){
      var collectionEl = tree.$('div:contains("Collection 3")');
      collectionEl.find('.bt-arrow').click();
      expect(collectionEl.parents('.bt-node-closed').length).toBe(1);
    });

    it("toggling function should be called.", function(){
      var collectionView = _.find(tree.children._views, function(view){ if (view.model.get('name') === 'Collection 3'){return view;}});
      var spy = spyOn(collectionView, 'toggleVisibility').andCallThrough();
      var collectionEl = tree.$('div:contains("Collection 3")');
      collectionView.delegateEvents();
      expect(collectionView).toBeDefined();
      expect(collectionEl.length).toBe(1);
      collectionEl.find('.bt-arrow').click();
      expect(spy).toHaveBeenCalled();
    });
     
    it("toggling function should be available and event is optional", function(){
      var collectionView = _.find(tree.children._views, function(view){ if (view.model.get('name') === 'Collection 3'){return view;}});
      var collectionEl = tree.$('div:contains("Collection 3")');
      collectionView.toggleVisibility();
      expect(collectionEl.parents('.bt-node-closed').length).toBe(1);
    });

    xit("toggling on a branch that is closed but has no loaded views should try and load from server.", function(){

    });
  });

  it("", function(){

  });

  describe("events in backtree", function(){
    it("should send a pubsub event when selecting a branch", function(){
      var x=0;
      var collectionEl = tree.$('div:contains("Collection 3")');
      testFunc = function(){ x +=1};
      tree.eventCoordinator.subscribe('selected', function(){ x +=1});
      collectionEl.click();
      expect(x).toBe(1);
    });
    it("for selecting a node/branch should send a view and an argument", function(){
      var x={}, y={};
      var collectionEl = tree.$('div:contains("Collection 3")');
      tree.eventCoordinator.subscribe('selected', function(args, model){ x=args, y=model; });
      collectionEl.click();
      expect(x).not.toBe({});
      expect(y).not.toBe({});
      expect(Object.getPrototypeOf(x.view) === backtree.NodeView.prototype).toBe(true);
      expect(Object.getPrototypeOf(y) === testModel.prototype).toBe(true);
    });
    it("selecting node view should listen to other select events so that we can unselect this", function(){
        var x={}, y={};
        var collectionEl1 = tree.$('div:contains("Collection 2")');
        var collectionEl2 = tree.$('div:contains("Collection 3")');
        collectionEl1.click();
        collectionEl2.click();
        expect(collectionEl1.hasClass('bt-node-selected')).toBe(false);
    });
  });

  describe("Selecting and UnSelecting", function(){
    it("should have an array to store an object of the view and collection", function(){
      expect(tree.selectedCollection).toBeDefined();
      expect(tree.selectedCollection instanceof Array).toBe(true);
    });
    it("should store the selected views and collections", function(){
        var collectionEl1 = tree.$('div:contains("Collection 2")');
        collectionEl1.click();
        expect(tree.selectedCollection.length).toBe(1);
    });
    it("should store one selected view at a time for this application", function(){
        var collectionEl1 = tree.$('div:contains("Collection 2")');
        var collectionEl2 = tree.$('div:contains("Collection 3")');
        collectionEl1.click();
        collectionEl2.click();
        expect(tree.selectedCollection.length).toBe(1);
    });
    it("we store a reference to the view and the collection", function(){
        var collectionEl1 = tree.$('div:contains("Collection 2")');
        collectionEl1.click();
        expect(tree.selectedCollection[0].hasOwnProperty('view')).toBe(true);
        expect(tree.selectedCollection[0].hasOwnProperty('collection')).toBe(true);
    });
  });

  describe("Should be able to edit the text of a collection", function(){
    it("clicking on the text should convert to an input field", function(){
      var collectionEl1 = tree.$('div:contains("Collection 2")');
      collectionEl1.find('.contenteditable').click();
      expect(collectionEl1).toContainHtml('<input type="text">');
    });
    it("Hitting Escape should cancel the editing", function(){
      var collectionEl1 = tree.$('div:contains("Collection 2")');
      var press = jQuery.Event('keydown'); press.ctrlKey = false; press.which = 27; 
      collectionEl1.find('.contenteditable').click();
      collectionEl1.find('input').trigger(press);
      expect(collectionEl1).not.toContainHtml('<input type="text">');
    });
    it("Hitting return should accept the editing", function(){
      var collectionEl1 = tree.$('div:contains("Collection 2")');
      var press = jQuery.Event('keydown'); press.ctrlKey = false; press.which = 13; 
      collectionEl1.find('.contenteditable').click();
      var input = collectionEl1.find('input')
      input.val('ITWorks');
      input.trigger(press);
      expect(collectionEl1).not.toContainHtml('Collection 2');
      expect(collectionEl1).toContainHtml('ITWorks');
    });
    it("On blur or clicking somewhere else should accept the editing", function(){
      var collectionEl1 = tree.$('div:contains("Collection 1")');
      var collectionEl2 = tree.$('div:contains("Collection 3")');
      var press = jQuery.Event('keydown'); press.ctrlKey = false; press.which = 13; 
      collectionEl1.find('.contenteditable').click();
      var input = collectionEl1.find('input')
      input.val('ITWorks');
      collectionEl2.find('.contenteditable').click();
      expect(collectionEl1).not.toContainHtml('Collection 1');
      expect(collectionEl1).toContainHtml('ITWorks');
    });
  });

  it("should be able to put something a little deeper using the API.", function(){
    tree.collection.models[2].contents.add([new testModel({
      id: 'testDeeper',
      name: 'Test Addition',
      type: 'collection'
    })]); 
    expect(tree.$el).toContainHtml('Test Addition');
  });

});
