import getRecords from '@salesforce/apex/DataTableController.getRecords';
import getAvailableObjects from '@salesforce/apex/DynamicObjectController.getAvailableObjects';
import getFieldsForObject from '@salesforce/apex/DynamicObjectController.getFieldsForObject';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export const apexUtils = {

    async getData(cmp) {
        let response = {}
        try {
            response.data = await getRecords({ objectName: cmp.selectedObject, fields: cmp.selectedFields })
            response.success = true
        }
        catch (error) {
            response.success = false
            response.error = error
        }
        return response
    },

    checkIfValueIsObject(value) {
        return value && typeof value === 'object' && !Array.isArray(value) ? (value.hasOwnProperty('street') ? value['street'] : null) : value
    },

    async getAvailableObjects() {
        let response = {}
        try {
            response.data = await getAvailableObjects()
            response.success = true
        }
        catch (error) {
            response.success = false
            response.error = error
        }
        return response
    },

    async getFieldsForObject(cmp) {
        let response = {}
        try {
            response.data = await getFieldsForObject({ objectApiName: cmp.selectedObject })
            response.success = true
        }
        catch (error) {
            response.success = false
            response.error = error
        }
        return response
    },

    async apexToJsFieldTypeMap() {
        return {
            'string': 'string',
            'id': 'string',
            'picklist': 'string',
            'multiPicklist': 'string',
            'textArea': 'string',
            'email': 'string',
            'phone': 'string',
            'url': 'string',
            'encryptedstring': 'string',
            'integer': 'number',
            'double': 'number',
            'currency': 'number',
            'percent': 'number',
            'long': 'number',
            'decimal': 'number',
            'boolean': 'boolean',
            'date': 'date',
            'datetime': 'date',
            'time': 'date',
            'reference': 'string', // Typically shows Name or related field
            'address': 'string',
            'location': 'string',
            'base64': 'string',
            'combobox': 'string'
        };
    },
    async sortData(data, field, type, isAsc = true) {
        return [...data].sort((a, b) => {
            let jsType = apexUtils.apexToJsFieldTypeMap()[type]
            let valA = a[field];
            let valB = b[field];

            // Normalize undefined or null
            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';

            // Comparison based on type
            let comparison = 0;
            switch (jsType) {
                case 'number':
                    comparison = Number(valA) - Number(valB);
                    break;
                case 'date':
                    comparison = new Date(valA) - new Date(valB);
                    break;
                case 'boolean':
                    comparison = (valA === valB) ? 0 : valA ? 1 : -1;
                    break;
                case 'string':
                default:
                    comparison = String(valA).localeCompare(String(valB));
                    break;
            }
            return isAsc ? -comparison : comparison;
        });
    },
    async deleteSelectedRecord(cmp) {
        console.log('inside delete')
        console.log('record Id in delete ', cmp.rowId)
        try {
            await deleteRecord(cmp.rowId)
            console.log('after delete is clicked')
            apexUtils.generateToastMessages(cmp, 'Success', 'Record deleted', 'success');
        } catch (error) {
            apexUtils.generateToastMessages(cmp, 'Error', error.body.message, 'error');
        }
    },
    async generateToastMessages(cmp, title, message, variant) {
        cmp.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    },
    async exportData(headers, data) {
        // Prepare a html table
        let doc = '<table>';
        // Add styles for the table
        doc += '<style>';
        doc += 'table, th, td {';
        doc += '    border: 1px solid black;';
        doc += '    border-collapse: collapse;';
        doc += '}';
        doc += '</style>';
        // Add all the Table Headers
        doc += '<tr>';
        headers.forEach(element => {
            doc += '<th>' + element.name + '</th>'
        });
        doc += '</tr>';
        // Add the data rows
        data.forEach(record => {
            console.log('record in export --> ', JSON.stringify(record))
            doc += '<tr>';
            headers.forEach(header => {
                doc += '<th>' + record[header.apiName] + '</th>';
            });
            doc += '</tr>';
        });
        doc += '</table>';
        var element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
        let downloadElement = document.createElement('a');
        downloadElement.href = element;
        downloadElement.target = '_self';
        // use .csv as extension on below line if you want to export data as csv
        downloadElement.download = 'ExportedFile.xls';
        document.body.appendChild(downloadElement);
        downloadElement.click();
    },
    async downloadExcel(headers, data) {
        let csvFile = await apexUtils.convertDataToCsv(headers, data)
        await apexUtils.createLinkForDownload(csvFile)
    },
    async convertDataToCsv(headers, data) {
        let csvHeader = headers.map(header => header.name).join(',');
        // let csvHeader = Object.keys(data[0]).toString()
        let csvBody = data.map(item => Object.values(item).toString())
        let csvFile = csvHeader+ "\n"+csvBody.join("\n")
        return csvFile
    },
    async createLinkForDownload(csvFile){
        const downLink = document.createElement("a");
        downLink.href = "data:text/csv;charset=utf-8," + encodeURI(csvFile);
        downLink.target = "_blank";
        downLink.download = "Record_data.csv";
        //document.body.appendChild(downLink);
        downLink.click();
    }
}
