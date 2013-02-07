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

  it("should be define a view with children views", function() {
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

  it("should be possible to handle clicks", function(){

  });

  it("should be able to put something a little deeper", function(){
    tree.collection.models[2].contents.add([new testModel({
      id: 'testDeeper',
      name: 'Test Addition',
      type: 'collection'
    })]); 
    expect(tree.$el).toContainHtml('Test Addition');
  });

});
