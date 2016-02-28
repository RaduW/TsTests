/// <reference path="../typings/tsd.d.ts" />
/// <reference path="tree.ts" />

interface ITestNode{
    type:string;
    id: string;
    parent: ITestNode;
    children: ITestNode[];
    
}

class TestNode implements ITestNode{
    constructor ( public type:string, public id:string, public children:ITestNode[] = null, public parent:ITestNode = null){}
    toString(){ return `<${this.type} id=${this.id}>`;}
}
    
declare function using( title:string , data: any[], callback: (...any)=>any );

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
*/
let testTree:ITestNode = new TestNode('node','n1',[
    new TestNode('other','a',[
        new TestNode('node', 'n2',[
            new TestNode('other', 'c'),
            new TestNode('other', 'd'),
        ]),
        new TestNode('other', 'e', [
            new TestNode('node', 'n3',[
                new TestNode('other', 'f'),
                new TestNode('node', 'n4'),
            ]),
            new TestNode('other', 'g'),
        ]),
    ]),
    new TestNode('node','n5', [
        new TestNode('node', 'n6'),
    ]),
    new TestNode('other','b',[
        new TestNode('node', 'n7',[
            new TestNode('node', 'n8'),
            new TestNode('node', 'n9'),
        ]),
        new TestNode('other', 'h'),
    ]),
]);

//patch the parent back pointer
(function patch(node:ITestNode, parent:ITestNode){
    node.parent = parent;
    if ( node.children)
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
    if ( ! node )
        return null;
    if ( node.id === nodeName)
        return node;
    var idx = 0;
    
    
    if ( !node.children || node.children.length == 0)
        return null;
    
    var numElm = node.children.length;
    
    do {
        retVal = findNodeInternal(node.children[idx], nodeName);
        ++idx;
    }while(retVal == null && idx < numElm);
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
        if (!node || !node.parent)
            return null;
        var parent = node.parent;
        var currentNodeIndex = _.indexOf(parent.children, node);
        if (currentNodeIndex < parent.children.length - 1)
            return parent.children[currentNodeIndex + 1];
        return null;
    };
    TestNavigator.prototype.previousSibling = function (node) {
        if (!node || !node.parent)
            return null;
        var parent = node.parent;
        var currentNodeIndex = _.indexOf(parent.children, node);
        if (currentNodeIndex > 0)
            return parent.children[currentNodeIndex - 1];
        return null;
    };
    TestNavigator.prototype.parent = function (node) {
        if (!node)
            return null;
        return node.parent;
    };
    TestNavigator.prototype.firstChild = function (node) {
        if (node && node.children && node.children.length > 0){
            return node.children[0];
        }
        return null;
    };
    TestNavigator.prototype.lastChild = function (node) {
        if (node && node.children && node.children.length > 0)
            node.children[node.children.length - 1];
        return null;
    };
    TestNavigator.prototype.hasChildren = function (node) {
        if (node && node.children && node.children.length > 0)
            return true;
        return false;
    };
    TestNavigator.prototype.hasParent = function (node) {
        return node && node.parent;
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
//    it("should navigate", function(){
        using("sample values",
            [["n1", true, "n1"],
            ["n1", false, null],
            ["a", true, "n2"],
            ["a", false, "n5"],
            ["n2", true, "n2"],
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
                    var endNode = endNodeName==null ? null : findNode(endNodeName);
                    expect(ModificationEditor.findNext(startNode,navigator,testMatcher,including)).toEqual(endNode);
                });    
            }
        );
});