import { LightningElement, track } from 'lwc';

export default class ObjectTableApp extends LightningElement {
    selectedObject;
    @track selectedFields;
    @track fieldOptions;
    receivedData;
    dataAfterPageUpdate;
    childRef;
    paginationRef;
    dataSize;
    page = 1;
    pageSize = 10;
    start;
    end;
    connectedCallback() {
        this.updateVisibleData();
    }
    renderedCallback() {
        // This hook ensures the childRef is assigned after rendering
        this.childRef = this.refs.childRef;
        this.paginationRef = this.refs.paginationRef;

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
        console.log('fieldOptions', JSON.stringify(this.fieldOptions))
        // console.log('selectedFields--> ' + this.selectedFields)
        this.receivedData = []
        if (this.paginationRef) {
            this.paginationRef.reset();
        }
    }
    handleDataUpdate(event) {
        this.receivedData = event.detail.data
        this.dataSize = this.receivedData.length
        this.updateVisibleData();
    }
    handlePageChange(event) {
        this.page = event.detail.page;
        this.pageSize = event.detail.pageSize;
        this.updateVisibleData();
    }
    updateVisibleData() {
        this.start = (this.page - 1) * this.pageSize;
        this.end = this.page * this.pageSize;
        this.dataAfterPageUpdate = this.receivedData?.slice(this.start, this.end);
    }
    get showPagination() {
        return this.receivedData?.length > 0
    }
}