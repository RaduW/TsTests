namespace ModificationEditor{
    
    export interface ITreeLocation<Node>{
        toParent : this;
        numberOfChildren: number;
        toChild(index: number): this; 
        node: Node;
    }
    
    export interface ITreeNavigator<Node>{
        In( currentLocation: ITreeLocation<Node>): ITreeLocation<Node>;
        Out( currentLocation: ITreeLocation<Node>): ITreeLocation<Node>;
        Next( currentLocation: ITreeLocation<Node>): ITreeLocation<Node>;
        Previous( currentLocation: ITreeLocation<Node>): ITreeLocation<Node>;
    }
    
    export class HtmlTreeLocation implements ITreeLocation<HTMLElement>{
        
        private currentItem: HTMLElement;
        
        public constructor(item: HTMLElement){
            this.currentItem = item;
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

    }    
}

