import { api, LightningElement, track } from 'lwc';
import { apexUtils } from 'c/apexUtils';
export default class DynamicDataTable extends LightningElement {
    @api selectedFields = []
    @api selectedObject;
    @api fieldOptions = [];
    @track rawData = [];
    @track refinedData = [];
    error;
    connectedCallback() {
    }

    @api async getData() {
        console.log('selected fields from data table cmp --> ', JSON.stringify(this.selectedFields))
        let response = {}
        try {
            response = await apexUtils.getData(this)
            this.rawData = response.success ? response.data : []
            console.log('raw data from controller -->', JSON.stringify(this.rawData))
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
            console.log('refined data -->', JSON.stringify(this.refinedData))
        }
        catch (error) {
            console.error('error from data refining --> ' + error)
        }

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
}