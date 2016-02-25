namespace ModificationEditor{
   /*
   
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
    
    
    let testTree = {
        type : 'n', id: 'n1',
        children:[{
            type:'other', id: 'a',
            children:[
            {
                type:'node', id: 'n2',
                children:[
                    {
                        type:'other', id: 'c',
                        children:<any>null
                    },
                    {
                        type:'other', id: 'd',
                        children:<any>null
                    },
                ]
            },
            {
                type:'other', id: 'e',
                children:[
                {
                    type:'node', id: 'n3',
                    children:[
                    {
                        type:'other', id: 'f',
                        children:<any>null
                    },
                    {
                        type:'node', id: 'n4',
                        children:<any>null
                    }]
                },
                {
                    type:'other', id: 'g',
                    children:<any>null
                }]
            }]
        },
        {
            type:'node',  id: 'n5',
            children:[
            {
                type:'node', id: 'n6',
                children:<any>null
            }]
        },
        {
            type:'other', id: 'b',
            children:[
            {
                type:'node', id: 'n7',
                children:[
                {
                    type:'node', id: 'n8',
                    children:<any>null
                },
                {
                    type:'node', id: 'n9',
                    children:<any>null
                }]
            },
            {
                type:'other', id: 'h',
                children:<any>null
            }]
        }]
    };
    
    export interface ILinearWalker<Node>{
        Next( currentLocation: Node): Node;
        Previous( currentLocation: Node): Node;
    }
    
    export interface ISurfaceWalker<Node> extends ILinearWalker<Node>{
        In( currentLocation: Node): Node;
        Out( currentLocation: Node): Node;
    }
    
    
    interface INodeNavigator<Node>{
        nextSibling(node:Node):Node;
        previousSibling(node:Node):Node;
        parent(node:Node):Node;
        firstChild(node:Node):Node;
        lastChild(node:Node):Node;
        hasChildren(node:Node): boolean;
        hasParent(node:Node): boolean;
    }
    
    interface INodeMatcher<Node>{
        (node: Node ):boolean;
    }
    
    export function findNext<Node>(currentNode:Node, navigator:INodeNavigator<Node>, matcher: INodeMatcher<Node>, includeCurrent: boolean):Node{
        if (!currentNode)
            return null;

        //look inside the node if we need to
        if ( includeCurrent)
        {
            if ( matcher(currentNode))
                return currentNode;
                
            let node:Node = findChild(currentNode,navigator,matcher);
            
            if ( node)
                return node;
        }
        
        //look at the siblings
        let nextSibling:Node = navigator.nextSibling(currentNode);
        while ( nextSibling != null)
        {
            if ( matcher(nextSibling))
                return nextSibling;

            let child = findChild( nextSibling, navigator, matcher)

            if ( child)
                return child;
                
            nextSibling = navigator.nextSibling(nextSibling);                        
        }
        
        //look at the parent siblings
        return findNext(navigator.parent(currentNode), navigator,matcher, false);
    }
    
    function findChild<Node>(currentNode:Node, navigator:INodeNavigator<Node>, matcher: INodeMatcher<Node>):Node{
        
        if ( ! navigator.hasChildren(currentNode))
            return null;
            
        let currentChild: Node = navigator.firstChild(currentNode);
        do {
            if ( matcher(currentChild))
                return currentChild;
            let child = findChild(currentChild,navigator,matcher);
            if ( child )
                return child;
            currentChild = navigator.nextSibling(currentChild);
        }while( currentChild != null)
        
        return null;        
    }
    
    export class SimpleHtmlNavigator implements ISurfaceWalker<HTMLElement>{
        
        public constructor(private returnNullOnMoveFailure:boolean = false)
        {}

        public Next( element: HTMLElement): HTMLElement{
            let failReturn = this.returnNullOnMoveFailure ? null: element;
            
            if (! element || ! (element instanceof HTMLElement))
                return failReturn;
            let currentLocation: Element= element;
            do{
                currentLocation = currentLocation.nextElementSibling;
                if ( currentLocation instanceof HTMLElement)
                    return currentLocation;                
            }while ( currentLocation != null);
            return failReturn;
        }

        public Previous( element: HTMLElement): HTMLElement{
            let failReturn = this.returnNullOnMoveFailure ? null: element;

            if (! element || ! (element instanceof HTMLElement))
                return failReturn;
            let currentLocation: Element= element;
            do{
                currentLocation = currentLocation.previousElementSibling;
                if ( currentLocation instanceof HTMLElement)
                    return currentLocation;                
            }while ( currentLocation != null);
            return failReturn;
        }

        public In( element: HTMLElement): HTMLElement{
            let failReturn = this.returnNullOnMoveFailure ? null: element;

            if (! element || ! (element instanceof HTMLElement))
                return failReturn;
            let retVal = element.firstElementChild;
            do{
                if ( retVal instanceof HTMLElement)
                    return retVal;
                retVal = retVal.nextElementSibling;
            }while ( retVal != null)
            
            return failReturn;
        }

        public Out( element: HTMLElement): HTMLElement{
            let failReturn = this.returnNullOnMoveFailure ? null: element;

            if (! element || ! (element instanceof HTMLElement))
                return failReturn;
                
            return element.parentElement == null? failReturn : element.parentElement;
        }
    }
    
}

