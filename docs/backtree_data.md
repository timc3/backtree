# Backtree Data

This descibes how the data could be setup to use Backtree. Any views or opinions on how to enhance to make it more agnostic about the data structure are welcome.

## Expectations.

It is expected that the data provided to Backtree is in a certain format, mainly because that is what has been tested with and developed with.

Examples of this are in the test subdirectory of the project and it is recommended that you take a look. But a typical structure looks like the following:

```
jsonstructure = {'id':'Item1', 'name':'Test Item1', 'contents':
    [
      {'id':'collection1', 'type':'collection', 'url': '/Item1/contents/collection1/', 'name':'Collection 1', 'state':'closed', 'models':
        [
          {'id':'SubItem1', 'name':'Sub Item 1', 'type':'item'},
          {'id':'SubItem2', 'name':'Sub Item 2', 'type':'item'},
          {'id':'SubItem3', 'name':'Sub Item 3', 'type':'item'},
          {'id':'SubItem4', 'name':'Sub Item 4', 'type':'item'},
          {'id':'SubItem5', 'name':'Sub Item 5', 'type':'item'}
        ]
      },
      {'id':'collection2', 'type':'collection', 'url': '/Item2/contents/collection2/', 'name':'Collection 2', 'state':'closed', 'models':
        [
          {'id':'SubItem6', 'name':'Sub Item 6', 'type':'item'},
          {'id':'SubItem7', 'name':'Sub Item 7', 'type':'item'},
          {'id':'SubItem8', 'name':'Sub Item 8', 'type':'item'},
          {'id':'SubItem9', 'name':'Sub Item 9', 'type':'item'},
          {'id':'SubItem10', 'name':'Sub Item 10', 'type':'item'}
        ]
      },
      {'id':'collection3', 'type':'collection', 'url': '/Item1/contents/collections3/', 'name':'Collection 3', 'state':'open', 'models':
        [
          {'id':'SubItem11', 'name':'Sub Item 11', 'type':'item'},
          {'id':'SubItem12', 'name':'Sub Item 12', 'type':'item'},
          {'id':'SubItem13', 'name':'Sub Item 13', 'type':'item'},
          {'id':'SubItem14', 'name':'Sub Item 14', 'type':'item'},
          {'id':'SubItem15', 'name':'Sub Item 15', 'type':'item'}
        ], 'contents':
        [
          {'id':'subcollection1', 'type':'collection', 'url':'/Item1/contents/collections1/contents/subcollection1/', 'name':'A Sub Collection', 'state':'closed', 'models':
            [
              {'id':'SubItem16', 'name':'Sub Item 16', 'type':'item'},
              {'id':'SubItem17', 'name':'Sub Item 17', 'type':'item'},
              {'id':'SubItem18', 'name':'Sub Item 18', 'type':'item'},
              {'id':'SubItem19', 'name':'Sub Item 19', 'type':'item'},
              {'id':'SubItem20', 'name':'Sub Item 20', 'type':'item'}
            ]
          }
        ]
      }
    ]
  }

```

The collection should have a field that is used for the label, and it should have a field used for type.
It has an entry point of 'contents', and this is what would be fed to the Backtree.TreeView collection attribute.

## Nested collections.

The nesting of collections is enhanced by using a nesting of collection > model > collection.
With the model having an attribute referred to as the `branchAttribute`. This attribute is configurable, but used in the parsing of the tree.

I have been testing with the [nesting.js](https://gist.github.com/geddesign/1610397) Gist ( [my fork](https://gist.github.com/timc3/4761446) ) but calling nestCollection in set rather than initialise. The data is the unset from the attributes.


