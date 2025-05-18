import getRecords from '@salesforce/apex/DataTableController.getRecords';
import getAvailableObjects from '@salesforce/apex/DynamicObjectController.getAvailableObjects';
import getFieldsForObject from '@salesforce/apex/DynamicObjectController.getFieldsForObject';

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
        finally {
            return response
        }
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
        finally {
            return response
        }
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
        finally {
            return response
        }
    }
}
