import { api, LightningElement, track } from 'lwc';
import { apexUtils } from 'c/apexUtils';
import EditRecordModal from 'c/editRecordModal';
import { deleteRecord } from 'lightning/uiRecordApi';
export default class DynamicDataTable extends LightningElement {
    @api selectedFields = []
    @api selectedObject;
    @api fieldOptions = [];
    @api finalTableData = []
    @api start;     //starting pos in table data
    @api end;       //end pos in table data
    @track rawData = [];
    @track refinedData = [];
    @track tableHeaders = []
    @track tableData = []
    selectedFieldsTypeMap = []; //This contains the map of selected field and its type from Apex
    isAscending = false;
    hasProcessed = false;
    showSpinner = false;
    error;
    sortedFieldApiName;
    sortedFieldType;
    rowId;
    connectedCallback() {
    }
    renderedCallback() {
        if (this.selectedFields && this.selectedFields.length > 0 && !this.hasProcessed) {
            this.hasProcessed = true;
            this.computeTableHeaders()
        }
    }
    get showTable() {
        return this.finalTableData?.length > 0
    }
    @api async getData() {
        // console.log('selected fields from data table cmp --> ', JSON.stringify(this.selectedFields))
        let response = {}
        this.showSpinner = true
        try {
            response = await apexUtils.getData(this)
            this.rawData = response.success ? response.data.records : []
            this.selectedFieldsTypeMap = response.success ? response.data.fieldsMap : []
            console.log('raw data from controller -->', JSON.stringify(this.rawData))
            console.log('fields Type Map -->', JSON.stringify(this.selectedFieldsTypeMap))
            await this.computeTableHeaders()
            if (this.rawData.length || this.rawData) {
                await this.transformRawData()
                this.showSpinner = false
            }
            this.error = undefined
        }
        catch (error) {
            this.error = response.error
            this.rawData = undefined
        }
    }

    async transformRawData() {
        try {
            this.refinedData = this.rawData.map(record => {
                // console.log('inside data refining')
                const normalised = {}
                let tempFields = [...this.selectedFields]
                tempFields.push("Id")
                tempFields.forEach(field => {
                    normalised[field] = record.hasOwnProperty(field) ? record[field] : null
                })
                return normalised
            })
            await this.updateDataInParent()
            console.log('refined data -->', JSON.stringify(this.refinedData))
        }
        catch (error) {
            console.error('error from data refining --> ' + error)
        }

    }
    async updateDataInParent() {
        await this.updateTableData()
        const dataUpdate = new CustomEvent('dataupdate', {
            detail: {
                data: this.tableData
            }
        });
        this.dispatchEvent(dataUpdate)
    }

    async handleSort(event) {
        let sorted_field = event.currentTarget.dataset.field
        console.log('sorted field -->', sorted_field)
        this.tableHeaders.forEach(field => {
            if (field.name === sorted_field) {
                field.isSorted = true
            }
            else {
                field.isSorted = false
            }
        })
        console.log('field options after sort', JSON.stringify(this.tableHeaders))
        await this.sortData(sorted_field)
        this.isAscending = !this.isAscending
    }

    async computeTableHeaders() {
        let returnedFields = this.selectedFields.map(field => {
            let fieldObj = {};
            this.fieldOptions.forEach(option => {
                if (option.value === field) {
                    fieldObj = { name: option.label, isSorted: false }
                }
            })
            return { ...fieldObj }
        })
        console.log('returnedFields ', JSON.stringify(returnedFields))
        this.tableHeaders = [...returnedFields]
    }
    async sortData(sorted_field) {
        await this.fieldOptions.filter(item => {
            if (item.label.toLowerCase() == sorted_field.toLowerCase()) {
                this.sortedFieldApiName = item.value
            }
        })
        //console.log('this.sortedFieldApiName --> ' + this.sortedFieldApiName)
        this.sortedFieldType = await this.selectedFieldsTypeMap[this.sortedFieldApiName]
        //console.log('this.sortedFieldType --> ' + this.sortedFieldType)
        await this.getData();
        this.refinedData = await apexUtils.sortData(this.refinedData, this.sortedFieldApiName, this.sortedFieldType.toLowerCase(), this.isAscending)
        //console.log('sorted table data -->', JSON.stringify(this.refinedData))
        await this.updateDataInParent()
    }

    async updateTableData() {
        this.tableData = await this.refinedData.map(record => {
            return {
                key: record.Id || Math.random().toString(36).substring(2),
                values: this.selectedFields.map(field => apexUtils.checkIfValueIsObject(record[field]))
            };
        });
    }
    async handleRowAction(event) {
        let action = event.currentTarget.title
        this.rowId = event.currentTarget.dataset.id
        if (action == 'edit' && this.rowId) {
            await this.handleEditClick()
        }
        if (action == 'delete' && this.rowId) {
            this.showSpinner = true
            await this.deleteSelectedRecord(this)
            await this.getData();
        }
    }

    async handleEditClick() {
        EditRecordModal.open({
            size: 'small',
            description: 'Edit record',
            recordId: this.rowId,
            objectApiName: this.selectedObject,
            selectedFields: this.selectedFields,
            onrecordsave: () => {
                this.getData()
            },
            onrecordsubmit: () => {
                this.showSpinner = true
            }
        }).then((result) => {
            if (result === 'success') {
                // Refresh logic
            }
        });
    }
    async deleteSelectedRecord() {
        try {
            await apexUtils.deleteSelectedRecord(this)            
            await this.getData()
            this.showSpinner = false
            await apexUtils.generateToastMessages(this, 'Success', 'Record deleted', 'success');
        } catch (error) {
            this.showSpinner = false
            await apexUtils.generateToastMessages(this, 'Error', error.body.message, 'error');
        }
    }
}