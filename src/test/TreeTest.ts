 /*
   The tree
   n1-------------
   |          \   \
   a--         n5  b---
   |  \        |   |   \
   n2  e--     n6  n7-  h
   |\  |  \        |  \
   c d n3  g       n8 n9
       | \
       f n4
   
   next(n1,true) ->n1
   next(n1,false) ->null
   next(a,true) -> n2
   next(a,false) ->n5
   next(n2,true) -> n3
   next(n2,false)->n3
   next(c,true)->n3
   next(c,false)->n3
   next(d,true)->n3
   next(d,false)->n3
   next(e,true)->n3
   next(e,false)->n5
   next(n3,true)->n3
   next(n3,false)->n5
   next(f,true)-> n4
   next(f,false)->n4
   next(n4,true)->n4
   next(n4,false)->n5
   next(g,true)->n5
   next(g,false)->n5
   next(n5,true)->n5
   next(n5,false)->n7
   next(n6,true)->n6
   next(n6,false)->n7
   next(b,true)->n7
   next(b,false)->null
   next(n7,true)->n7
   next(n7,false)->null
   next(n8,true)->n8
   next(n8,false)->n9
   next(n9,true)->n9
   next(n9,false)->null
   next(h,true)->null
   next(h,false)->null
   */


    interface ITestNode{
        type:string;
        id: string;
        parent: ITestNode;
        children: ITestNode[];
        
    }
    
    
    let testTree:ITestNode = {
        type : 'n', id: 'n1', parent:null,
        children:[{
            type:'other', id: 'a', parent:null,
            children:[
            {
                type:'node', id: 'n2', parent:null,
                children:[
                    {
                        type:'other', id: 'c', parent:null,
                        children:<any>null
                    },
                    {
                        type:'other', id: 'd', parent:null,
                        children:<any>null
                    },
                ]
            },
            {
                type:'other', id: 'e', parent:null,
                children:[
                {
                    type:'node', id: 'n3', parent:null,
                    children:[
                    {
                        type:'other', id: 'f', parent:null,
                        children:<any>null
                    },
                    {
                        type:'node', id: 'n4', parent:null,
                        children:<any>null
                    }]
                },
                {
                    type:'other', id: 'g', parent:null,
                    children:<any>null
                }]
            }]
        },
        {
            type:'node',  id: 'n5', parent:null,
            children:[
            {
                type:'node', id: 'n6', parent:null,
                children:<any>null
            }]
        },
        {
            type:'other', id: 'b', parent:null,
            children:[
            {
                type:'node', id: 'n7', parent:null,
                children:[
                {
                    type:'node', id: 'n8', parent:null,
                    children:<any>null
                },
                {
                    type:'node', id: 'n9', parent:null,
                    children:<any>null
                }]
            },
            {
                type:'other', id: 'h', parent:null,
                children:<any>null
            }]
        }]
    };

//patch the parent back pointer
(function patch(node:ITestNode, parent:ITestNode){
    node.parent = parent;
    for( let child of node.children){
        patch(child,node);
    }
} 
)(testTree, null);


function findNode(nodeName:string):ITestNode{
    return findNodeInternal(testTree,nodeName);
}

function findNodeInternal(node:ITestNode, nodeName:string):ITestNode{
    var retVal = null;
    if ( node.id === nodeName)
        return node;
    var idx = 0;
    var numElm = node.children.length;
    
    do {
        retVal = findNodeInternal(node.children[idx], nodeName);
        ++idx;
    }while(retVal == null && idx < numElm-1);
    return retVal;    
}

function testMatcher(node:ITestNode){
    if ( !node)
        return false;
    
    return node.type === 'node';
}

var TestNavigator = (function () {
    function TestNavigator() {
    }
    TestNavigator.prototype.nextSibling = function (node) {
        if (!node.parent)
            return null;
        var parent = node.parent;
        var currentNodeIndex = _.indexOf(parent.children, node);
        if (currentNodeIndex < parent.children.length - 1)
            return parent.children[currentNodeIndex + 1];
        return null;
    };
    TestNavigator.prototype.previousSibling = function (node) {
        if (!node.parent)
            return null;
        var parent = node.parent;
        var currentNodeIndex = _.indexOf(parent.children, node);
        if (currentNodeIndex > 0)
            return parent.children[currentNodeIndex - 1];
        return null;
    };
    TestNavigator.prototype.parent = function (node) {
        return node.parent;
    };
    TestNavigator.prototype.firstChild = function (node) {
        if (node.children && node.children.length > 0)
            node.children[0];
        return null;
    };
    TestNavigator.prototype.lastChild = function (node) {
        if (node.children && node.children.length > 0)
            node.children[node.children.length - 1];
        return null;
    };
    TestNavigator.prototype.hasChildren = function (node) {
        if (node.children && node.children.length > 0)
            return true;
        return false;
    };
    TestNavigator.prototype.hasParent = function (node) {
        return !!node.parent;
    };
    return TestNavigator;
}());

describe("Testing tree navigation", function(){
    beforeEach(function(){
        //do your init
    })

    //    The tree
    //    n1-------------
    //    |          \   \
    //    a--         n5  b---
    //    |  \        |   |   \
    //    n2  e--     n6  n7-  h
    //    |\  |  \        |  \
    //    c d n3  g       n8 n9
    //        | \
    //        f n4
    it("should navigate", function(){
        using("sample values",
            [["n1", true, "n1"],
            ["n1", false, null],
            ["a", true, "n2"],
            ["a", false, "n5"],
            ["n2", true, "n3"],
            ["n2", false, "n3"],
            ["c", true, "n3"],
            ["c", false, "n3"],
            ["d", true, "n3"],
            ["d", false, "n3"],
            ["e", true, "n3"],
            ["e", false, "n5"],
            ["n3", true, "n3"],
            ["n3", false, "n5"],
            ["f", true, "n4"],
            ["f", false, "n4"],
            ["n4", true, "n4"],
            ["n4", false, "n5"],
            ["g", true, "n5"],
            ["g", false, "n5"],
            ["n5", true, "n5"],
            ["n5", false, "n7"],
            ["n6", true, "n6"],
            ["n6", false, "n7"],
            ["b", true, "n7"],
            ["b", false, null],
            ["n7", true, "n7"],
            ["n7", false, null],
            ["n8", true, "n8"],
            ["n8", false, "n9"],
            ["n9", true, "n9"],
            ["n9", false, null],
            ["h", true, null],
            ["h", false, null]],
            function(startNodeName,including,endNodeName){
                var navigator = new TestNavigator();
                it("should navigate from startNode to endNode", function(){
                    var startNode = findNode(startNodeName);
                    var endNode = findNode(endNodeName);
                    expect(findNext(startNode,navigator,testMatcher,including)).toEqual(endNode);
                });    
            }
        );
    })
});