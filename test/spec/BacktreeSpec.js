/*  Test scripts depend on Jasmine and Jasmine.JQuery */
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
        className: 'backtree'
    });
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

  it("", function(){

  });

  xit("selecting node view should raise an event", function(){
    
  });

  xit("selecting node view should bind a once event handler to make sure that on another node selecting we take off the selection", function(){
    
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
