namespace ModificationEditor{
    
    
    export interface ILinearWalker<Node>{
        goNext( currentLocation: Node): Node;
        goPrevious( currentLocation: Node): Node;
    }
    
    export interface ISurfaceWalker<Node> extends ILinearWalker<Node>{
        goIn( currentLocation: Node): Node;
        goOut( currentLocation: Node): Node;
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

    interface INodeName<Node>{
        (node: Node): string;
    }

    export function findPrevious<Node>(currentNode:Node, navigator:INodeNavigator<Node>, matcher: INodeMatcher<Node>
            , includeCurrent: boolean):Node{
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
                                 
            }while (sibling);
            
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
                let retVal:Node = findLastChild(child,navigator,matcher);
                if ( retVal)
                    return retVal;
                child = navigator.previousSibling(child);
            }while( child != null)
        }
        if ( matcher(currentNode))
            return currentNode;
        return null;
    }
    
    export function findNext<Node>(currentNode:Node, navigator:INodeNavigator<Node>, matcher: INodeMatcher<Node>
            , includeCurrent: boolean):Node{
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

            let child = findChild( nextSibling, navigator, matcher);

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
        }while( currentChild != null);
        
        return null;        
    }

    export class SimpleHtmlWalker implements ISurfaceWalker<HTMLElement>{

        public constructor(private returnNullOnMoveFailure:boolean = false)
        {}

        public goNext( element: HTMLElement): HTMLElement{
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

        public goPrevious( element: HTMLElement): HTMLElement{
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

        public goIn( element: HTMLElement): HTMLElement{
            let failReturn = this.returnNullOnMoveFailure ? null: element;

            if (! element || ! (element instanceof HTMLElement))
                return failReturn;
            let retVal = element.firstElementChild;
            do{
                if ( retVal instanceof HTMLElement)
                    return retVal;
                retVal = retVal.nextElementSibling;
            }while ( retVal != null);

            return failReturn;
        }

        public goOut( element: HTMLElement): HTMLElement{
            let failReturn = this.returnNullOnMoveFailure ? null: element;

            if (! element || ! (element instanceof HTMLElement))
                return failReturn;

            return element.parentElement == null? failReturn : element.parentElement;
        }
    }

    export class HierarchyWalker<Node> implements ISurfaceWalker<Node>{
        constructor(
            private navigator:INodeNavigator<Node>,
            private matcher:INodeMatcher<Node>,
            private root:Node){
        }
        goNext(currentLocation:Node):Node{
            return this.next(currentLocation,false) || currentLocation;
        }

        goPrevious(currentLocation:Node):Node{
            return this.previous(currentLocation,false) || currentLocation ;
        }

        goIn(currentLocation:Node):Node{
            let self = this;
            let child = self.navigator.firstChild(currentLocation);
            do{
                let found:Node = self.findFirstChild(child);
                if ( found)
                    return found;
                child = self.navigator.nextSibling(child);
            }while( child);
            return currentLocation;
        }

        goOut(currentLocation:Node):Node{
            let self = this;
            if ( currentLocation == self.root) {
                if (self.matcher(currentLocation))
                    return currentLocation;
                else
                    return null;
            }
            let parent:Node = currentLocation;
            while ( parent = self.navigator.parent(parent)){
                if (self.matcher(parent))
                    return parent;
                if ( parent == self.root) {
                    return null; // we are not allowed to go higher
                }
            }
            return currentLocation;
        }

        private next(currentLocation:Node, include:boolean):Node{
            let self = this;
            if ( ! currentLocation)
                return null;

            //go inside
            if ( include){
                if( self.matcher(currentLocation))
                    return currentLocation;

                let child = self.navigator.firstChild(currentLocation);
                do{
                    let found:Node = self.findFirstChild(child);
                    if ( found)
                        return found;
                }while( child);
            }

            //go right ( siblings)
            let sibling:Node = self.navigator.nextSibling(currentLocation);
            while( sibling){
                let found:Node = self.findFirstChild(sibling);
                if ( found)
                    return found;
                sibling = self.navigator.nextSibling(sibling);
            }

            //go up if parent node is not selectable
            let parent:Node = self.navigator.parent(currentLocation);
            if ( parent && !self.matcher(parent))
                return self.next(parent, false);
            return null;
        }
        private previous(currentLocation:Node, include:boolean):Node{
            let self = this;
            if ( ! currentLocation)
                return null;

            //go inside
            if ( include){
                if( self.matcher(currentLocation))
                    return currentLocation;

                let child = self.navigator.lastChild(currentLocation);
                do{
                    let found:Node = self.findLastChild(child);
                    if ( found)
                        return found;
                }while( child);
            }

            //go left ( siblings)
            let sibling:Node = self.navigator.previousSibling(currentLocation);
            while( sibling){
                let found:Node = self.findLastChild(sibling);
                if ( found)
                    return found;
                sibling = self.navigator.previousSibling(sibling);
            }

            //go up if parent node is not selectable
            let parent:Node = self.navigator.parent(currentLocation);
            if ( parent && !self.matcher(parent))
                return self.previous(parent, false);
            return null;
        }

        private findFirstChild( node:Node):Node{
            let self = this;
            if ( self.matcher(node))
                return node;

            let child = self.navigator.firstChild(node);
            while ( child){
                let found:Node = self.findFirstChild(child);
                if ( found) {
                    return found;
                }
                child = self.navigator.nextSibling(child);
            }
            return null;
        }
        private findLastChild( node:Node):Node{
            let self = this;
            if ( self.matcher(node))
                return node;

            let child = self.navigator.lastChild(node);
            while ( child){
                let found:Node = self.findLastChild(child);
                if ( found) {
                    return found;
                }
                child = self.navigator.previousSibling(child);
            }
            return null;
        }

    }

    export class HtmlNavigator implements INodeNavigator<HTMLElement>{
        constructor( private root: HTMLElement){
        }

        nextSibling(element:HTMLElement):HTMLElement{
            if (! element )
                return null;

            let currentLocation: Element= element;
            do{
                currentLocation = currentLocation.nextElementSibling;
                if ( currentLocation instanceof HTMLElement)
                    return currentLocation;
            }while ( currentLocation != null);
            return null;
        }

        previousSibling(element:HTMLElement):HTMLElement{
            if (! element )
                return null;
            let currentLocation: Element= element;
            do{
                currentLocation = currentLocation.previousElementSibling;
                if ( currentLocation instanceof HTMLElement)
                    return currentLocation;
            }while ( currentLocation != null);
            return null;
        }
        parent(element:HTMLElement):HTMLElement{
            let self = this;
            if ( ! element || element == self.root)
                return null;

            let parentElm = element.parentElement;
            while ( parentElm && !(parentElm instanceof HTMLElement) && parentElm != self.root){
                parentElm = parentElm.parentElement;
            }
            return parentElm;

        }
        firstChild(element:HTMLElement):HTMLElement{
            if ( ! element)
                return null;
            let firstChild = element.firstElementChild;
            while ( firstChild && ! (firstChild instanceof HTMLElement))
                firstChild = firstChild.nextElementSibling;

            if ( firstChild instanceof HTMLElement)
                return firstChild;

            return null;
        }
        lastChild(element:HTMLElement):HTMLElement{
            if ( ! element)
                return null;
            let lastChild = element.lastElementChild;
            while ( lastChild && ! (lastChild instanceof HTMLElement))
                lastChild = lastChild.previousElementSibling;

            if ( lastChild instanceof HTMLElement)
                return lastChild;

            return null;
        }

        hasChildren(element:HTMLElement): boolean{
            if ( !element)
                return false;

            return element.childElementCount > 0 ;
        }

        hasParent(element:HTMLElement): boolean{
            return this.parent(element) != null;
        }

    }

    export function soforHtmlNodeMatcher(element:HTMLElement){
        if ( element == null)
            return false;
        return element.hasAttribute('sfr-node');
    }

    export function getSuroundingHtmlNode(element:Element):HTMLElement{
        if (! element )
            return null;

        if ( element instanceof HTMLElement  && soforHtmlNodeMatcher(element))
            return element;

        let parent = element.parentElement;

        while( parent ){
            if ( parent instanceof HTMLElement && soforHtmlNodeMatcher(parent)){
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }

    export function getNodePath<Node>(node: Node, navigator: INodeNavigator<Node>, matcher:INodeMatcher<Node>, name:INodeName<Node>):string{
        let path = '';
        let currentNode=node;

        while(currentNode){
            if ( matcher(currentNode))
            {
                path = `/${name(currentNode)}${path}`;
            }
            currentNode = navigator.parent(currentNode);
        }
        return path;
    }

    export function soforHtmlNodeNamer( element:Element):string{
        const attribute:Attr = element.attributes.getNamedItem('legalid');
        if ( attribute)
            return attribute.value;
        else
            return '';
    }

    export function getSoforHtmlNodePath(node:Element, navigator:INodeNavigator<HTMLElement>):string
    {
        const start:HTMLElement = getSuroundingHtmlNode(node);
        return getNodePath(start, navigator, soforHtmlNodeMatcher, soforHtmlNodeNamer);
    }

    export class HtmlHierarchyWalker extends HierarchyWalker<HTMLElement> {

        constructor(root:HTMLElement){
            super(new HtmlNavigator(root) ,soforHtmlNodeMatcher, root)
        }
    }

    export function getFirstChildSoforNode(node:Element):HTMLElement{
        const navigator = new HtmlNavigator(null);
        //we first go up to find an HTMLElement, this is not going to happen in practice and we'll
        let currentElement: Element = node;
        while ( currentElement )
        {
            if ( currentElement instanceof HTMLElement)
                return findChild( currentElement,navigator,soforHtmlNodeMatcher);
            currentElement = currentElement.parentElement;
        }
        return null;
    }
}