import { LightningElement, api } from 'lwc';

export default class Pagination extends LightningElement {
    @api totalRecords = 0;
    @api pageSize = 10;

    currentPage = 1;

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.dispatchPageChange();
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.dispatchPageChange();
        }
    }

    dispatchPageChange() {
        this.dispatchEvent(new CustomEvent('pagechange', {
            detail: {
                page: this.currentPage,
                pageSize: this.pageSize
            }
        }));
    }

    @api
    reset() {
        this.currentPage = 1;
        this.dispatchPageChange();
    }
}