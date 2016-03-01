namespace ModificationEditor{
    
    
    export interface ILinearWalker<Node>{
        Next( currentLocation: Node): Node;
        Previous( currentLocation: Node): Node;
    }
    
    export interface ISurfaceWalker<Node> extends ILinearWalker<Node>{
        In( currentLocation: Node): Node;
        Out( currentLocation: Node): Node;
    }
    
    export interface INodeNavigator<Node>{
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
    
    
    export function findPrevious<Node>(currentNode:Node, navigator:INodeNavigator<Node>, matcher: INodeMatcher<Node>, includeCurrent: boolean):Node{
        if (!currentNode)
            return null;
            
        //look inside the node if we need to
        if ( includeCurrent)
        {
            let retVal:Node = findLastChild(currentNode,navigator,matcher);
            if ( retVal)
                return retVal;
        }
        
        if ( navigator.hasParent(currentNode))
        {
            //look at the previous siblings
            let sibling:Node = currentNode;
            do {
                sibling = navigator.previousSibling(sibling);
                if(sibling){
                    let retVal:Node = findPrevious(sibling,navigator,matcher,true);
                    if ( retVal)
                        return retVal;
                }
                                 
            }while (sibling)
            
            if ( navigator.hasParent(currentNode))
            {
                let parent:Node = navigator.parent(currentNode);
                //look at the parent
                if (  matcher(parent))
                    return parent;
                //find parrent's previous node
                return findPrevious(parent,navigator,matcher,false);
            }
        }
        return null;
    }
    
    function findLastChild<Node>(currentNode:Node, navigator:INodeNavigator<Node>, matcher: INodeMatcher<Node>):Node{
        if ( navigator.hasChildren(currentNode)){
            let child:Node = navigator.lastChild(currentNode);
           do{
                let retVal:Node = findLastChild(child,navigator,matcher)
                if ( retVal)
                    return retVal;
                child = navigator.previousSibling(child);
            }while( child != null)
        }
        if ( matcher(currentNode))
            return currentNode;
        return null;
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
            if ( child ){
                return child;
            }
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

