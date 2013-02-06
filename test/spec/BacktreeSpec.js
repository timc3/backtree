describe("Backtree", function() {
  /* var myCollection, tree; */

  beforeEach(function() {
    myCollection = new testCollection(jsonstructure.contents);
    tree = new Backtree.TreeView({
        collection: myCollection,
        el: '#backtree',
        className: 'backtree'
    });
  });

  it("should be defined", function() {
    expect(tree).toBeDefined();
  });
  it("should remove everything under the existing dom element.", function() {
    expect(tree.$el.html()).toNotBe('Test');
  });
  it("should get the class from the initalisation.", function() {
    expect(tree.$el.hasClass(tree.className)).toBe(true);
  });
  it("should have created the data structure in the view.", function() {
    expect(tree.collection).toBeDefined();
    expect(tree.collection.get('collection1')).not.toBeUndefined();
  });
  it("should append the structure to the DOM correctly", function(){
    expect(tree.$el).toContainHtml('collection1');
    expect(tree.$el).toContainHtml('subcollection1');
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
  it("should be able to put something a little deeper", function(){
    tree.collection.models[2].contents.add([new testModel({
      id: 'testDeeper',
    })]); 
  });
});
