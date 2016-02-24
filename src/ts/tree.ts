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

