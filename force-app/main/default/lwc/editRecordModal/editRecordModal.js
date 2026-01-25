import { api } from 'lwc';
import LightningModal from 'lightning/modal'

export default class EditRecordModal extends LightningModal {
    @api recordId;
    @api selectedFields;
    @api objectApiName;
    handleClose() {
        this.close('okay');
    }
    handleSuccess(event) {
        const updatedRecord = event.detail.id;
        console.log('onsuccess: ', updatedRecord);
    }

    handleSave() {
        const form = this.refs.recordForm;
        // Validate all fields
        const allValid = [...form.querySelectorAll('lightning-input-field')]
            .reduce((validSoFar, inputField) => validSoFar && inputField.reportValidity(), true);

        if (allValid) {
            form.submit(); // Triggers onsuccess/onerror
        }
    }

    handleSuccess() {
        // Handle success (e.g., close modal, show toast)
        this.updateParentCmp();
        this.close();
    }

    handleError(event) {
        // Handle error
        console.error('Form submission error:', event.detail);
    }

    updateParentCmp() {
        this.dispatchEvent(new CustomEvent('recordsave', { detail: { recordId: this.recordId } }))
    }

    handleSubmit(){
        this.dispatchEvent(new CustomEvent('recordsubmit'))
    }
}