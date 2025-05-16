import { LightningElement, track } from 'lwc';

export default class ObjectTableApp extends LightningElement {
    selectedObject;
    @track selectedFields;
    @track fieldOptions;
    childRef;

    renderedCallback() {
        // This hook ensures the childRef is assigned after rendering
        this.childRef = this.refs.childRef;
    }

    handleDataFetch() {
        if (this.childRef) {
            this.childRef.getData();
        }
    }
    handleSelectionChange(event) {
        this.selectedObject = event.detail.objectApiName
        this.selectedFields = event.detail.fieldApiNames
        this.fieldOptions = event.detail.fieldOptions
        console.log('selectedFields--> ' + this.selectedFields)
    }
}