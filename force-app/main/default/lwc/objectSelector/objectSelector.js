import { LightningElement, track } from 'lwc';
import { apexUtils } from 'c/apexUtils';

export default class ObjectSelector extends LightningElement {
  @track objectOptions = [];
  @track fieldOptions = []

  connectedCallback() {
    this.loadObjects();
  }

  async loadObjects() {
    let response = {}
    try {
      response = await apexUtils.getAvailableObjects()
      const data = response.success ? response.data : []
      this.objectOptions = data.map(obj => ({
        label: obj.label,
        value: obj.apiName
      }));
    } catch (error) {
      console.error('Error loading objects', response.error);
    }
  }

  async handleObjectChange(event) {
    this.selectedObject = event.detail.value;
    this.selectedFields = [];
    this.fieldOptions = [];
    let response = {}
    try {
      response = await apexUtils.getFieldsForObject(this)
      const fields = response.success ? response.data : []
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