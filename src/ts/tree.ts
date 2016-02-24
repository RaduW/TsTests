namespace ModificationEditor{
    
    
    export interface INavigator<Node>{
        Next( currentLocation: Node): Node;
        Previous( currentLocation: Node): Node;
    }
    
    export interface ITreeNavigator<Node> extends INavigator<Node>{
        In( currentLocation: Node): Node;
        Out( currentLocation: Node): Node;
    }
    
    export class SimpleHtmlNavigator implements ITreeNavigator<HTMLElement>{

        Next( element: HTMLElement): HTMLElement{
            if (! element || ! (element instanceof HTMLElement))
                return null;
            let currentLocation: Element= element;
            do{
                currentLocation = currentLocation.nextElementSibling;
                if ( currentLocation instanceof HTMLElement)
                    return currentLocation;                
            }while ( currentLocation != null);
            return null;
        }

        Previous( element: HTMLElement): HTMLElement{
            return null;
        }

        In( element: HTMLElement): HTMLElement{
            return null;
        }

        Out( element: HTMLElement): HTMLElement{
            return null;
        }
    }
    
    export class HtmlTreePointer implements ITreePointer<HTMLElement>{
        private currentItem: HTMLElement;
        
        public constructor(item: HTMLElement){
            this.currentItem = item;
            this.currentItem.nextElementSibling
        }
        get toParent():this{
            this.currentItem =<HTMLElement>this.currentItem.parentNode;
            return this;
        };
        get numberOfChildren(): number{
            return 0;
        }
        toChild(index: number):this{
            if ( this.currentItem)
                this.currentItem = <HTMLElement>this.currentItem.childNodes[index];
            return this;
        }
        get node(): HTMLElement {
            return this.currentItem;
        };
        clone():HtmlTreePointer{
            return new HtmlTreePointer(this.currentItem);
        }
        
        sameLocation( other: this){
            if (!other)
                return false;
            return this.node === other.node;
        }
    }    
}

