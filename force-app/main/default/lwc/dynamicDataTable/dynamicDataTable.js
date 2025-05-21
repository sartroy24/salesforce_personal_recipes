import { api, LightningElement, track } from 'lwc';
import { apexUtils } from 'c/apexUtils';
export default class DynamicDataTable extends LightningElement {
    @api selectedFields = []
    @api selectedObject;
    @api fieldOptions = [];
    @api finalTableData = []
    @api start;     //starting pos in table data
    @api end;       //end pos in table data
    @track rawData = [];
    @track refinedData = [];
    selectedFieldsTypeMap = []; //This contains the map of selected field and its type from Apex
    error;
    connectedCallback() {
        //this.updatePaginationEvent();
    }
    get tableData() {
        return this.refinedData.map(record => {
            return {
                key: record.Id || Math.random().toString(36).substring(2),
                values: this.selectedFields.map(field => apexUtils.checkIfValueIsObject(record[field]))
            };
        });
    }
    get tableHeaders() {
        return this.selectedFields.map(field => {
            let fields = []
            this.fieldOptions.forEach(option => {
                if (option.value === field) {
                    fields.push(option.label)
                }
            })
            return fields
        })
    }
    // get finalData() {
    //     this.tableData.slice(this.start, this.end)
    // }
    @api async getData() {
        console.log('selected fields from data table cmp --> ', JSON.stringify(this.selectedFields))
        let response = {}
        try {
            response = await apexUtils.getData(this)
            this.rawData = response.success ? response.data.records : []
            this.selectedFieldsTypeMap = response.success ? response.data.fieldsMap : []
            console.log('raw data from controller -->', JSON.stringify(this.rawData))
            console.log('fields Type Map -->', JSON.stringify(this.selectedFieldsTypeMap))
            if (this.rawData.length || this.rawData) {
                this.transformRawData()
            }
            this.error = undefined
        }
        catch (error) {
            this.error = response.error
            this.rawData = undefined
        }
    }

    transformRawData() {
        try {
            this.refinedData = this.rawData.map(record => {
                console.log('inside data refining')
                const normalised = {}
                let tempFields = [...this.selectedFields]
                tempFields.push("Id")
                tempFields.forEach(field => {
                    normalised[field] = record.hasOwnProperty(field) ? record[field] : null
                })
                return normalised
            })
            this.updateDataInParent()
            console.log('refined data -->', JSON.stringify(this.refinedData))
        }
        catch (error) {
            console.error('error from data refining --> ' + error)
        }

    }
    updateDataInParent() {
        const dataUpdate = new CustomEvent('dataupdate', {
            detail: {
                data: this.tableData
            }
        });
        this.dispatchEvent(dataUpdate)
    }

    get showTable(){
        return this.finalTableData?.length > 0
    }
}