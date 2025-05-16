import { LightningElement, track } from 'lwc';
import getAvailableObjects from '@salesforce/apex/DynamicObjectController.getAvailableObjects';
import getFieldsForObject from '@salesforce/apex/DynamicObjectController.getFieldsForObject';

export default class ObjectSelector extends LightningElement {
  @track objectOptions = [];
  @track fieldOptions = []

  connectedCallback() {
    this.loadObjects();
  }

  async loadObjects() {
    try {
      const data = await getAvailableObjects();
      this.objectOptions = data.map(obj => ({
        label: obj.label,
        value: obj.apiName
      }));
    } catch (error) {
      console.error('Error loading objects', error);
    }
  }

  async handleObjectChange(event) {
    this.selectedObject = event.detail.value;
    this.selectedFields = [];
    this.fieldOptions = [];

    try {
      const fields = await getFieldsForObject({ objectApiName: this.selectedObject });
      this.fieldOptions = fields.map(field => ({
        label: field.label,
        value: field.apiName
      }));
    } catch (error) {
      console.error('Error loading fields', error);
    }
    this.fireSelectionChange();
  }

  handleFieldChange(event) {
    this.selectedFields = event.detail.value;
    this.selectedFields.forEach(element => {
      console.log('field name -->' + element)
    });
    this.fireSelectionChange();
  }

  fireSelectionChange() {
    const selectionEvent = new CustomEvent('selectionchange', {
      detail: {
        objectApiName: this.selectedObject,
        fieldApiNames: this.selectedFields,
        fieldOptions: this.fieldOptions
      }
    });
    this.dispatchEvent(selectionEvent);
  }
}