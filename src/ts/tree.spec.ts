
import HierarchyWalker = ModificationEditor.HierarchyWalker;
import HtmlNavigator = ModificationEditor.HtmlNavigator;
import HtmlHierarchyWalker = ModificationEditor.HtmlHierarchyWalker;
import getSoforHtmlNodePath = ModificationEditor.getSoforHtmlNodePath;
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
const testTree:ITestNode = new TestNode('node','n1',[
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

//same tree as html
const innerHtml:string = `
    <div id='n1' legalid='n1' sfr-node>
        <div id='a'>
            <div id='n2' legalid='n2'sfr-node>
                <div id='c'></div>
                <div id='d'></div>
            </div>
            <div id='e'>
                <div id='n3' legalid='n3' sfr-node>
                    <div id='f'></div>
                    <div id='n4' legalid='n4' sfr-node></div>
                </div>
                <div id='g'></div>
            </div>
        </div>
        <div id='n5' legalid='n5' sfr-node>
            <div id='n6' legalid='n6' sfr-node></div>
        </div>
        <div id='b'>
            <div id='n7' legalid='n7' sfr-node>
                <div id='n8' legalid='n8' sfr-node></div>
                <div id='n9' legalid='n9' sfr-node></div>
            </div>
            <div id='h'></div>
        </div>
    </div>
`;


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
    var retVal: ITestNode = null;
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

class TestNavigator implements ModificationEditor.INodeNavigator<ITestNode>{
    nextSibling(node: ITestNode):ITestNode {
        if (!node || !node.parent)
            return null;
        var parent = node.parent;
        var currentNodeIndex = _.indexOf(parent.children, node);
        if (currentNodeIndex < parent.children.length - 1)
            return parent.children[currentNodeIndex + 1];
        return null;
    };
    previousSibling(node: ITestNode): ITestNode {
        if (!node || !node.parent)
            return null;
        var parent = node.parent;
        var currentNodeIndex = _.indexOf(parent.children, node);
        if (currentNodeIndex > 0)
            return parent.children[currentNodeIndex - 1];
        return null;
    };
    parent(node: ITestNode): ITestNode {
        if (!node)
            return null;
        return node.parent;
    };
    firstChild = function (node: ITestNode): ITestNode {
        if (node && node.children && node.children.length > 0){
            return node.children[0];
        }
        return null;
    };
    lastChild = function (node: ITestNode): ITestNode {
        if (node && node.children && node.children.length > 0)
            return node.children[node.children.length - 1];
        return null;
    };
    hasChildren = function (node: ITestNode):boolean {
        if (node && node.children && node.children.length > 0)
            return true;
        return false;
    };
    hasParent = function (node: ITestNode): boolean {
        return !!node && !!node.parent;
    };
}

describe("Testing Hierarchy Walker", function(){
    let walker:HierarchyWalker<ITestNode> = new HierarchyWalker<ITestNode>(
        new TestNavigator(),testMatcher,testTree);

    all("goNext should navigate to the next node", [
            ["n1","n1"],
            ["a", "n5"],
            ["n2","n3"],
            ["c", "c"],
            ["d", "d"],
            ["e", "n5"],
            ["n3","n5"],
            ["f", "n4"],
            ["n4","n4"],
            ["g", "n5"],
            ["n5","n7"],
            ["n6","n6"],
            ["b", "b"],
            ["n7","n7"],
            ["n8","n9"],
            ["n9","n9"],
            ["h", "h"]
        ],
        function(startNodeName:string,endNodeName:string){
            const startNode = findNode(startNodeName);
            const endNode = endNodeName==null ? null : findNode(endNodeName);
            const result = walker.goNext(startNode);
            expect(result).toEqual(endNode);
        });

    all("goPrevious should navigate to the previous node", [
            ["n1","n1"],
            ["a", "a"],
            ["n2","n2"],
            ["c", "c"],
            ["d", "d"],
            ["e", "n2"],
            ["n3","n2"],
            ["f", "f"],
            ["n4","n4"],
            ["g", "n3"],
            ["n5","n3"],
            ["n6","n6"],
            ["b", "n5"],
            ["n7","n5"],
            ["n8","n8"],
            ["n9","n8"],
            ["h", "n7"]
        ],
        function(startNodeName:string,endNodeName:string){
            const startNode = findNode(startNodeName);
            const endNode = endNodeName==null ? null : findNode(endNodeName);
            const result = walker.goPrevious(startNode);
            expect(result).toEqual(endNode);
        });

    all("goIn should navigate to the next node", [
            ["n1","n2"],
            ["a", "n2"],
            ["n2","n2"],
            ["c", "c"],
            ["d", "d"],
            ["e", "n3"],
            ["n3","n4"],
            ["f", "f"],
            ["n4","n4"],
            ["g", "g"],
            ["n5","n6"],
            ["n6","n6"],
            ["b", "n7"],
            ["n7","n8"],
            ["n8","n8"],
            ["n9","n9"],
            ["h", "h"]
        ],
        function(startNodeName:string,endNodeName:string){
            const startNode = findNode(startNodeName);
            const endNode = endNodeName==null ? null : findNode(endNodeName);
            const result = walker.goIn(startNode);
            expect(result).toEqual(endNode);
        });

    all("goOut should navigate to the next node", [
            ["n1","n1"],
            ["a", "n1"],
            ["n2","n1"],
            ["c", "n2"],
            ["d", "n2"],
            ["e", "n1"],
            ["n3","n1"],
            ["f", "n3"],
            ["n4","n3"],
            ["g", "n1"],
            ["n5","n1"],
            ["n6","n5"],
            ["b", "n1"],
            ["n7","n1"],
            ["n8","n7"],
            ["n9","n7"],
            ["h", "n1"]
        ],
        function(startNodeName:string,endNodeName:string){
            const startNode = findNode(startNodeName);
            const endNode = endNodeName==null ? null : findNode(endNodeName);
            const result = walker.goOut(startNode);
            expect(result).toEqual(endNode);
        });
});

describe("Testing HtmlHierarchyWalker", function(){
    let testTreeRoot: HTMLElement;
    let htmlNavigator: HtmlNavigator;
    let container:HTMLElement;

    beforeAll(function(){
        container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);
        container.innerHTML = innerHtml;
        testTreeRoot = container.firstElementChild as HTMLElement;
        htmlNavigator = new HtmlNavigator(testTreeRoot);
    });

    afterAll(function(){
        //celanup the inserted html
        container.parentNode.removeChild(container);
    });

    let walker:HtmlHierarchyWalker = new HtmlHierarchyWalker(testTreeRoot);

    all("goNext should navigate to the next node", [
            ["n1","n1"],
            ["a", "n5"],
            ["n2","n3"],
            ["c", "c"],
            ["d", "d"],
            ["e", "n5"],
            ["n3","n5"],
            ["f", "n4"],
            ["n4","n4"],
            ["g", "n5"],
            ["n5","n7"],
            ["n6","n6"],
            ["b", "b"],
            ["n7","n7"],
            ["n8","n9"],
            ["n9","n9"],
            ["h", "h"]
        ],
        function(startNodeName:string,endNodeName:string){
            const startNode = document.getElementById(startNodeName);
            const endNode = endNodeName==null ? null : document.getElementById(endNodeName);;
            const result = walker.goNext(startNode);
            expect(result).toEqual(endNode);
        });

    all("goPrevious should navigate to the previous node", [
            ["n1","n1"],
            ["a", "a"],
            ["n2","n2"],
            ["c", "c"],
            ["d", "d"],
            ["e", "n2"],
            ["n3","n2"],
            ["f", "f"],
            ["n4","n4"],
            ["g", "n3"],
            ["n5","n3"],
            ["n6","n6"],
            ["b", "n5"],
            ["n7","n5"],
            ["n8","n8"],
            ["n9","n8"],
            ["h", "n7"]
        ],
        function(startNodeName:string,endNodeName:string){
            const startNode = document.getElementById(startNodeName);
            const endNode = endNodeName==null ? null : document.getElementById(endNodeName);;
            const result = walker.goPrevious(startNode);
            expect(result).toEqual(endNode);
        });

    all("goIn should navigate to the next node", [
            ["n1","n2"],
            ["a", "n2"],
            ["n2","n2"],
            ["c", "c"],
            ["d", "d"],
            ["e", "n3"],
            ["n3","n4"],
            ["f", "f"],
            ["n4","n4"],
            ["g", "g"],
            ["n5","n6"],
            ["n6","n6"],
            ["b", "n7"],
            ["n7","n8"],
            ["n8","n8"],
            ["n9","n9"],
            ["h", "h"]
        ],
        function(startNodeName:string,endNodeName:string){
            const startNode = document.getElementById(startNodeName);
            const endNode = endNodeName==null ? null : document.getElementById(endNodeName);;
            const result = walker.goIn(startNode);
            expect(result).toEqual(endNode);
        });

    all("goOut should navigate to the next node", [
            ["n1","n1"],
            ["a", "n1"],
            ["n2","n1"],
            ["c", "n2"],
            ["d", "n2"],
            ["e", "n1"],
            ["n3","n1"],
            ["f", "n3"],
            ["n4","n3"],
            ["g", "n1"],
            ["n5","n1"],
            ["n6","n5"],
            ["b", "n1"],
            ["n7","n1"],
            ["n8","n7"],
            ["n9","n7"],
            ["h", "n1"]
        ],
        function(startNodeName:string,endNodeName:string){
           const startNode = document.getElementById(startNodeName);
           const endNode = endNodeName==null ? null : document.getElementById(endNodeName);;
           const result = walker.goOut(startNode);
            expect(result).toEqual(endNode);
        });
});


describe("Testing tree navigation", function(){
    beforeEach(function(){
        //do your init
    });

    //    The tree
    //    n1-------------                         n1----------------------------
    //    |          \   \                          \           \       \       \
    //    a--         n5  b---                    a n2 c d    e n3 g    n5    b n7-- h
    //    |  \        |   |   \         ==>                     |       |       |  \
    //    n2  e--     n6  n7-  h                              f n4      n6      n8 n9
    //    |\  |  \        |  \
    //    c d n3  g       n8 n9
    //        | \
    //        f n4
    all("findNext should navigate from startNode to endNode",[
            ["n1", true, "n1"],
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
            ["h", false, null]
        ],
        function(startNodeName:string,including:boolean,endNodeName:string){
            const navigator = new TestNavigator();
            const startNode = findNode(startNodeName);
            const endNode = endNodeName==null ? null : findNode(endNodeName);
            expect(ModificationEditor.findNext(startNode,navigator,testMatcher,including)).toEqual(endNode);
        }
    );

    //    The tree
    //    n1-------------                         n1----------------------------
    //    |          \   \                          \           \       \       \
    //    a--         n5  b---                    a n2 c d    e n3 g    n5    b n7-- h
    //    |  \        |   |   \         ==>                     |       |       |  \
    //    n2  e--     n6  n7-  h                              f n4      n6      n8 n9
    //    |\  |  \        |  \
    //    c d n3  g       n8 n9
    //        | \
    //        f n4
    all("findPrevious should navigate from startNode to endNode",[
            ["n1", true, "n9"],
            ["n1", false, null],
            ["a", true, "n4"],
            ["a", false, "n1"],
            ["n2", true, "n2"],
            ["n2", false, "n1"],
            ["c", true, "n2"],
            ["c", false, "n2"],
            ["d", true, "n2"],
            ["d", false, "n2"],
            ["e", true, "n4"],
            ["e", false, "n2"],
            ["n3", true, "n4"],
            ["n3", false, "n2"],
            ["f", true, "n3"],
            ["f", false, "n3"],
            ["n4", true, "n4"],
            ["n4", false, "n3"],
            ["g", true, "n4"],
            ["g", false, "n4"],
            ["n5", true, "n6"],
            ["n5", false, "n4"],
            ["n6", true, "n6"],
            ["n6", false, "n5"],
            ["b", true, "n9"],
            ["b", false, "n6"],
            ["n7", true, "n9"],
            ["n7", false, "n6"],
            ["n8", true, "n8"],
            ["n8", false, "n7"],
            ["n9", true, "n9"],
            ["n9", false, "n8"],
            ["h", true, "n9"],
            ["h", false, "n9"]
        ],
        function(startNodeName:string,including:boolean,endNodeName:string){
            const navigator = new TestNavigator();
            const startNode = findNode(startNodeName);
            const endNode = endNodeName==null ? null : findNode(endNodeName);
            expect(ModificationEditor.findPrevious(startNode,navigator,testMatcher,including)).toEqual(endNode);
        }
    );
});

describe("Testing HtmlNavigator", function(){

    let testTreeRoot: HTMLElement;
    let htmlNavigator: HtmlNavigator;
    let container:HTMLElement;

    beforeEach(function(){
        container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);
        container.innerHTML = innerHtml;
        testTreeRoot = container.firstElementChild as HTMLElement;
        htmlNavigator = new HtmlNavigator(testTreeRoot);
    });

    afterEach(function(){
        //celanup the inserted html
        container.parentNode.removeChild(container);
    });

    //  The tree
    //  n1-------------
    //  |          \   \
    //  a--         n5  b---
    //  |  \        |   |   \
    //  n2  e--     n6  n7-  h
    //  |\  |  \        |  \
    //  c d n3  g       n8 n9
    //      | \
    //      f n4
    all('should evaluate hasParent',[
            ['n1', false],
            ['a', true],
            ['n2', true],
            ['c', true],
            ['d', true],
            ['e', true],
            ['n3', true],
            ['f', true],
            ['n4', true],
            ['g',  true],
            ['n5', true],
            ['n6', true],
            ['b', true],
            ['n7', true],
            ['n8', true],
            ['n9', true],
            ['h', true],
        ],
        function(startNodeName:string, hasParent:boolean){
            let startNode = document.getElementById(startNodeName);
            let result = htmlNavigator.hasParent(startNode);
            expect(result).toBe(hasParent);
    });

    all('should evaluate hasChildren',[
            ['n1', true],
            ['a', true],
            ['n2', true],
            ['c', false],
            ['d', false],
            ['e', true],
            ['n3', true],
            ['f', false],
            ['n4', false],
            ['g',  false],
            ['n5', true],
            ['n6', false],
            ['b', true],
            ['n7', true],
            ['n8', false],
            ['n9', false],
            ['h', false],
        ],
        function(startNodeName:string, hasChildren:boolean){
            let startNode = document.getElementById(startNodeName);
            let result = htmlNavigator.hasChildren(startNode);
            expect(result).toBe(hasChildren);
    });


    all('should navigate to lastChild',[
            ['n1', 'b'],
            ['a', 'e'],
            ['n2', 'd'],
            ['c', null],
            ['d', null],
            ['e', 'g'],
            ['n3', 'n4'],
            ['f', null],
            ['n4', null],
            ['g',  null],
            ['n5', 'n6'],
            ['n6', null],
            ['b', 'h'],
            ['n7', 'n9'],
            ['n8', null],
            ['n9', null],
            ['h', null],
        ],
        function(startNodeName:string, endNodeName:string){
            let startNode = document.getElementById(startNodeName);
            let endNode = endNodeName? document.getElementById(endNodeName): null ;

            let result = htmlNavigator.lastChild(startNode);
            expect(result).toEqual(endNode);
    });

    all('should navigate to firstChild',[
            ['n1', 'a'],
            ['a', 'n2'],
            ['n2', 'c'],
            ['c', null],
            ['d', null],
            ['e', 'n3'],
            ['n3', 'f'],
            ['f', null],
            ['n4', null],
            ['g',  null],
            ['n5', 'n6'],
            ['n6', null],
            ['b', 'n7'],
            ['n7', 'n8'],
            ['n8', null],
            ['n9', null],
            ['h', null],
        ],
        function(startNodeName:string, endNodeName:string){
            let startNode = document.getElementById(startNodeName);
            let endNode = endNodeName? document.getElementById(endNodeName): null ;

            let result = htmlNavigator.firstChild(startNode);
            expect(result).toEqual(endNode);
    });

    all('should navigate to previous sibling',[
            ['n1', null],
            ['a', null],
            ['n2', null],
            ['c', null],
            ['d', 'c'],
            ['e', 'n2'],
            ['n3', null],
            ['f', null],
            ['n4', 'f'],
            ['g',  'n3'],
            ['n5', 'a'],
            ['n6', null],
            ['b', 'n5'],
            ['n7', null],
            ['n8', null],
            ['n9', 'n8'],
            ['h', 'n7'],
        ],
        function(startNodeName:string, endNodeName:string){
            let startNode = document.getElementById(startNodeName);
            let endNode = endNodeName? document.getElementById(endNodeName): null ;

            let result = htmlNavigator.previousSibling(startNode);
            expect(result).toEqual(endNode);
    });

    all('should navigate to parent',[
            ['n1', null],
            ['a', 'n1'],
            ['n2', 'a'],
            ['c', 'n2'],
            ['d', 'n2'],
            ['e', 'a'],
            ['n3', 'e'],
            ['f', 'n3'],
            ['n4', 'n3'],
            ['g',  'e'],
            ['n5', 'n1'],
            ['n6', 'n5'],
            ['b', 'n1'],
            ['n7', 'b'],
            ['n8', 'n7'],
            ['n9', 'n7'],
            ['h', 'b'],
        ],
        function(startNodeName:string, endNodeName:string){
            let startNode = document.getElementById(startNodeName);
            let endNode = endNodeName? document.getElementById(endNodeName): null ;

            let result = htmlNavigator.parent(startNode);
            expect(result).toEqual(endNode);
    });

    all('should navigate to next sibling',[
            ['n1', null],
            ['a', 'n5'],
            ['n2', 'e'],
            ['c', 'd'],
            ['d', null],
            ['e', null],
            ['n3', 'g'],
            ['f', 'n4'],
            ['n4', null],
            ['g',  null],
            ['n5', 'b'],
            ['n6', null],
            ['b', null],
            ['n7', 'h'],
            ['n8', 'n9'],
            ['n9', null],
            ['h', null],
        ],
        function(startNodeName:string, endNodeName:string){
            let startNode = document.getElementById(startNodeName);
            let endNode = endNodeName? document.getElementById(endNodeName): null ;

            let result = htmlNavigator.nextSibling(startNode);
            expect(result).toEqual(endNode);
    });



    
});

describe("Testing soforHtmlNodePath", function(){

    let testTreeRoot: HTMLElement;
    let htmlNavigator: HtmlNavigator;
    let container:HTMLElement;

    beforeAll(function(){
        container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);
        container.innerHTML = innerHtml;
        testTreeRoot = container.firstElementChild as HTMLElement;
        htmlNavigator = new HtmlNavigator(testTreeRoot);
    });

    afterAll(function(){
        //celanup the inserted html
        container.parentNode.removeChild(container);
    });

    all('getSoforHtmlNodePath should return the correct paths',[
        ['n1','/n1'],
        ['a','/n1'],
        ['n2','/n1/n2'],
        ['c','/n1/n2'],
        ['d','/n1/n2'],
        ['e','/n1'],
        ['n3','/n1/n3'],
        ['f','/n1/n3'],
        ['n4','/n1/n3/n4'],
        ['g','/n1'],
        ['n5','/n1/n5'],
        ['n6','/n1/n5/n6'],
        ['b','/n1'],
        ['n7','/n1/n7'],
        ['n8','/n1/n7/n8'],
        ['n9','/n1/n7/n9'],
        ['h','/n1'],
    ],
        function(startNodeName:string, path:string){
            const startNode = document.getElementById(startNodeName);
            const result:string = getSoforHtmlNodePath(startNode, htmlNavigator);
            expect(result).toEqual(path);

    });
});