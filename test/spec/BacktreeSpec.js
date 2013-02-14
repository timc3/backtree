/*  Test scripts depend on Jasmine and Jasmine.JQuery */

describe("Custom Footer View and Header View", function(){
  beforeEach(function() {
    myCollection = new testCollection(jsonstructure.contents);
    customFooter = new Backtree.FooterView({
      tagName: 'div',
      className: 'testFooterClass' 
    });
    customHeader = new Backtree.FooterView({
      tagName: 'div',
      className: 'testHeaderClass'
    });
    tree = new Backtree.TreeView({
        collection: myCollection,
        className: 'backtree',
        footer: customFooter,
        header: customHeader,
        childTemplateRenderer: function(model, view){
          return ('<div>' + model.get('id') + '</div>');
        } 
    });
  });

  it("should have the footer defined correctly", function(){
    expect(tree.$('div.testFooterClass').length).toBe(1);
  });
  
  it("should have the header defined correctly", function(){
    expect(tree.$('div.testHeaderClass').length).toBe(1);
  });

  it("should store references to the DOM objects against the tree", function(){
    expect(tree.hasOwnProperty('$footerEl')).toBe(true);
    expect(tree.hasOwnProperty('$headerEl')).toBe(true);
    expect(tree.hasOwnProperty('$treeEl')).toBe(true);
  });

});

describe("Custom Footer View and Header View from JQuery object", function(){
  beforeEach(function() {
    myCollection = new testCollection(jsonstructure.contents);
    tree = new Backtree.TreeView({
        collection: myCollection,
        className: 'backtree',
        footer: $('<footer class="myFoot">'),
        header: $('<header class="myOldHead">'),
        childTemplateRenderer: function(model, view){
          return ('<div>' + model.get('id') + '</div>');
        } 
    });
  });

  it("should have the footer defined correctly", function(){
    expect(tree.$('footer.myFoot').length).toBe(1);
  });

  it("should have the header defined correctly", function(){
    expect(tree.$('header.myOldHead').length).toBe(1);
  });

  it("should store references to the DOM objects against the tree", function(){
    expect(tree.hasOwnProperty('$footerEl')).toBe(true);
    expect(tree.hasOwnProperty('$headerEl')).toBe(true);
    expect(tree.hasOwnProperty('$treeEl')).toBe(true);
  });

});
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

  it("should parse the structure", function(){
    expect(tree.collection == myCollection).toBe(true);
    expect(tree.children._views[_.keys(tree.children._views)[2]].collection == myCollection.at(2).contents).toBe(true);
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
    expect(tree.$('div.bt-wrapper').find('div:contains("A Sub Collection")').find('.bt-icon-collection').length).toBe(1);
  });

  describe("Footer", function(){
    it("should have the remove button disabled by default until click on a sub item", function(){
      var _footermenu = tree.$('footer nav ul.menu');
      var spy = spyOn(tree.footer, 'removeCollection').andCallThrough();
      expect(_footermenu.hasClass('bt-menu-active')).not.toBe(true);
      _footermenu.find('a.bt-ft-remove-button').click();
      expect(spy).not.toHaveBeenCalled();
    });
    it("after selecting an item it should allow us to remove a collection", function(){
      var collectionEl = tree.$('div:contains("Collection 2")');
      var _footermenu = tree.$('footer nav ul.menu');
      var spy = spyOn(tree.footer, 'removeCollection').andCallThrough();
      collectionEl.click();
      tree.footer.delegateEvents();
      expect(_footermenu.hasClass('bt-menu-active')).toBe(true);
      _footermenu.find('a.bt-ft-remove-button').click();
      expect(spy).toHaveBeenCalled();
    });
    it("after removing a collection selected should be zero and it should be disabled again.", function(){
      var collectionEl = tree.$('div:contains("Collection 2")');
      var _footermenu = tree.$('footer nav ul.menu');
      var spy = spyOn(tree.footer, 'removeCollection').andCallThrough();
      collectionEl.click();
      tree.footer.delegateEvents();
      expect(_footermenu.hasClass('bt-menu-active')).toBe(true);
      _footermenu.find('a.bt-ft-remove-button').click();
      expect(spy).toHaveBeenCalled();
      expect(tree.selectedCollection.length).toBe(0);
      expect(_footermenu.hasClass('bt-menu-active')).not.toBe(true);
    });
  });

  describe("click to expand on branch", function(){
    it("should toggle visibility of a branch with child nodes by setting the correct class", function(){
      var collectionEl = tree.$('div.bt-wrapper').find('div:contains("Collection 3")');
      collectionEl.find('.bt-arrow').click();
      expect(collectionEl.parents('.bt-node-closed').length).toBe(1);
    });

    it("toggling function should be called.", function(){
      var collectionView = _.find(tree.children._views, function(view){ if (view.model.get('name') === 'Collection 3'){return view;}});
      var spy = spyOn(collectionView, 'toggleVisibility').andCallThrough();
      var collectionEl = tree.$('div.bt-wrapper').find('div:contains("Collection 3")');
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
      expect(Object.getPrototypeOf(x.view) === Backtree.NodeView.prototype).toBe(true);
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
    it("should work with using an event on the collection", function(){
        tree.collection.at(1).trigger('select');
        var collectionEl1 = tree.$('div:contains("Collection 2")');
        var collectionEl2 = tree.$('div:contains("A Sub Collection")');
        expect(collectionEl1.hasClass('bt-node-selected')).toBe(true);
        tree.collection.at(2).contents.at(0).trigger('select');
        expect(collectionEl2.hasClass('bt-node-selected')).toBe(true);
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
      var collectionEl1 = tree.$('div.bt-wrapper').find('div:contains("Collection 2")');
      var press = jQuery.Event('keydown'); press.ctrlKey = false; press.which = 13; 
      collectionEl1.find('.contenteditable').click();
      var input = collectionEl1.find('input')
      input.val('ITWorks');
      input.trigger(press);
      expect(collectionEl1).not.toContainHtml('Collection 2');
      expect(collectionEl1).toContainHtml('ITWorks');
    });
    it("On blur or clicking somewhere else should accept the editing", function(){
      var collectionEl1 = tree.$('div.bt-wrapper').find('div:contains("Collection 1")');
      var collectionEl2 = tree.$('div.bt-wrapper').find('div:contains("Collection 3")');
      var press = jQuery.Event('keydown'); press.ctrlKey = false; press.which = 13; 
      collectionEl1.find('.contenteditable').click();
      var input = collectionEl1.find('input')
      input.val('ITWorks');
      collectionEl2.find('.contenteditable').click();
      expect(collectionEl1).not.toContainHtml('Collection 1');
      expect(collectionEl1).toContainHtml('ITWorks');
    });
  });

    it("Deleting a sibling shouldn't cause addition of new sibling to fail", function(){
      var press = jQuery.Event('keydown'); press.ctrlKey = false; press.which = 13; 
      var collectionEl1 = tree.$('div.bt-wrapper').find('div:contains("A Sub Collection")');
      collectionEl1.click();
      tree.$('.bt-ft-add-button').click();
      expect(tree.$('div.bt-wrapper')).toContainHtml('Untitled');
      var collectionEl2 = tree.$('div.bt-wrapper').find('div:contains("Untitled")');
      collectionEl2.find('.contenteditable').click();
      var inputEl2 = collectionEl2.find('input').val('testdeletereadd1');
      inputEl2.trigger(press);
      expect(tree.$('div.bt-wrapper')).toContainHtml('testdeletereadd1');
      collectionEl1.click();
      tree.$('.bt-ft-add-button').click();
      var collectionEl3 = tree.$('div.bt-wrapper').find('div:contains("Untitled")');
      collectionEl3.find('.contenteditable').click();
      var inputEl3 = collectionEl3.find('input').val('testdeletereadd2'); inputEl3.trigger(press);
      collectionEl2.click();
      tree.$('.bt-ft-remove-button').click();
      expect(tree.$('div.bt-wrapper')).toContainHtml('testdeletereadd2');
      expect(tree.$('div.bt-wrapper')).not.toContainHtml('testdeletereadd1');
      // Now we try and add another node.
      var collectionEl1 = tree.$('div.bt-wrapper').find('div:contains("A Sub Collection")');
      collectionEl1.click(); 
      tree.$('.bt-ft-add-button').click();
      var collectionEl4 = tree.$('div.bt-wrapper').find('div:contains("Untitled")');
      expect(tree.$('div.bt-wrapper')).toContainHtml('Untitled');
      expect(collectionEl4.length).toBe(2);
    });

  describe("Adding in child", function(){
    // This is only going to work if your models are setup correctly. 
    it("should work from adding in directly to the models", function(){
      tree.collection.at(1).set({'contents': [{'name':'test child2'}]});
      expect(tree.$el).toContainHtml('test child2');
    });
    it("should be able to add a child node", function(){
      // With the test model structure the adding needs the contents attribute.
      tree.collection.at(1).set({'contents': [{'name':'test2', 'type':'collection', url:'/', models:[], 'id':'3'}]});
      expect(tree.$('div:contains("Collection 2")').parent('li').find('span:contains("test2")').length).toBe(1);
    });

    it("should add a child of a child", function(){
      var collectionEl1 = tree.$('div.bt-wrapper').find('div:contains("A Sub Collection")');
      collectionEl1.click();
      tree.$('.bt-ft-add-button').click();
      expect(tree.collection.at(2).contents.at(0).contents.at(0).get('name')).toBe('Untitled');
      var parent1 = tree.children._views[Object.keys(tree.children._views)[2]];
      var parent2 = parent1.children._views[Object.keys(parent1.children._views)[0]];
      expect(parent2.collection.length).toBe(1);
    });
    it("should allow adding of siblings that don't require that branch to be overwritten", function(){
      var press = jQuery.Event('keydown'); press.ctrlKey = false; press.which = 13; 
      var collectionEl1 = tree.$('div.bt-wrapper').find('div:contains("A Sub Collection")');
      collectionEl1.click();
      tree.$('.bt-ft-add-button').click();
      var collectionEl2 = tree.$('div.bt-wrapper').find('div:contains("Untitled")');
      collectionEl2.find('.contenteditable').click();
      var inputEl2 = collectionEl2.find('input').val('dontoverwrite');
      inputEl2.trigger(press);
      collectionEl1.click();
      tree.$('.bt-ft-add-button').click();
      expect(tree.$('div.bt-wrapper')).toContainHtml('dontoverwrite');
    });
  });

  it("should be possible to add a node with a different type", function(){
    tree.collection.models[2].contents.add([new testModel({
      id: 'testDeeper',
      name: 'Test Addition',
      type: 'customtypeattribute'
    })]); 
    expect(tree.$el.find('div.bt-icon-customtypeattribute').length).toBe(1);
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
