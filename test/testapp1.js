/*
 * GIST from https://gist.github.com/geddesign/1610397
 * Now it looks like the gist has moved to https://gist.github.com/geddski/1610397
 */
function nestCollection(model, attributeName, nestedCollection) {
  //setup nested references
  for (var i = 0; i < nestedCollection.length; i++) {
    model.attributes[attributeName][i] = nestedCollection.at(i).attributes;
  }

  nestedCollection.on('add', function (initiative) {
      if (!model.get(attributeName)) {
          model.attributes[attributeName] = [];
      }
      model.get(attributeName).push(initiative.attributes);
  });

  nestedCollection.on('remove', function (initiative) {
      var updateObj = {};
      updateObj[attributeName] = _.filter(model.get(attributeName), function(attrs) {
          return attrs._id !== initiative.attributes._id;
      });
      model.set(updateObj);
  });
  return nestedCollection;
}


/*
 * Test Models and Collections that use nestedCollections
 * Using nestCollection we proper collections in the subresponses.
 * 
 * It is expected that whatever using BackTree builds this structure.
 * We build the DOM from that structure.
 */
var testModel = Backbone.Model.extend({
  defaults: {  
    id: '',
    name: '',
    type: ''
  },
  url: function() {
    return this.get('url') + '?json';
  },
  /* Override to deal with adding nested collections */
  set: function(attributes, options) {
    var ret = Backbone.Model.prototype.set.call(this, attributes, options);
    if (attributes.contents && !this.contents) {
      this.contents = nestCollection(this, 'contents', new testCollection(this.get('contents')));
      this.unset('contents', options);
    }
    return ret;
  },

});

var testCollection = Backbone.Collection.extend({
  model: testModel,
});

