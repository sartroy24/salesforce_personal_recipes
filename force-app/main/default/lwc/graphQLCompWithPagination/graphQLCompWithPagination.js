import { LightningElement, wire } from "lwc";
import { gql, graphql } from "lightning/uiGraphQLApi";

export default class GraphQLCompWithPagination extends LightningElement {
    records = [];
    errors = [];
    columns = [];
    searchValue = 'test';
    after = null;
    pageInfo = null;
    pageNumber = 1;
    totalCount = 0;

    get variables() {
        return {
            likeParams: this.searchValue,
            limit: 5,
            after: this.after
        }
    }

    get totalPages() {
        return Math.ceil(this.totalCount / 5);
    }

    get isDisabled(){
        return this.totalCount === 0 || this.pageNumber === this.totalPages
    }

    @wire(graphql, {
        query: gql`
            query getAccounts(
                $limit: Int,                
                $after: String,
                $likeParams: String
            ) {
                uiapi {
                    query{
                    Account(
                        first: $limit,
                        orderBy: { Name: { order: ASC }},
                        where: {
                            Name: { like:  $likeParams }
                        }
                        after: $after              
                        ){    
                        edges {
                        node {  
                                Id
                                Name {
                                    value
                                }
                                AnnualRevenue {
                                    value
                                }
                                Industry {
                                    value
                                }
                                Type {
                                    value
                                }
                            }
                        }
                        totalCount
                            pageInfo {
                                hasNextPage
                                hasPreviousPage
                                startCursor
                                endCursor
                            }
                    }
                    }
                }
            }`,
        variables: '$variables'
    })
    wiredGraphlQLResult({ data, errors }) {
        if (data) {
            console.log("Data: ", JSON.stringify(data));
            this.pageInfo = data.uiapi.query?.Account?.pageInfo;
            this.totalCount = data.uiapi.query?.Account?.totalCount;
            this.records = data.uiapi.query?.Account?.edges.map(edge => {
                const nodeObj = edge.node
                const flatObj = {};
                if (this.isObject(nodeObj)) {
                    Object.keys(nodeObj).forEach(key => {
                        if (this.isObject(nodeObj[key])) {
                            flatObj[key] = nodeObj[key].value;
                        } else {
                            flatObj[key] = nodeObj[key];
                        }
                    })
                }
                return flatObj;
            })
            console.log("Records: ", JSON.stringify(this.records))
            console.log("columns: ", JSON.stringify(this.records[0] ? Object.keys(this.records[0]) : []))
            if (this.records.length !== 0) {
                this.columns = Object.keys(this.records[0]).map(key => {
                    return { label: key === 'Id' ? 'Account Id' : key, fieldName: key };
                });
                console.log("Columns: ", JSON.stringify(this.columns))
            }

        }
        else if (errors) {
            console.error("Error: ", JSON.stringify(errors));
            this.errors = errors;
        }
    }

    isObject(value) {
        return typeof value === 'object' && value !== null;
    }

    handleChange(event) {
        event.preventDefault();
        this.searchValue = '%' + event.target.value + '%';

    }

    handleNext(event) {
        event.preventDefault();
        console.log('page info --> ', JSON.stringify(this.pageInfo))
        if (this.pageInfo && this.pageInfo.hasNextPage) {
            this.after = this.pageInfo.endCursor;
            this.pageNumber++;    
        } else {
            this.after = null
            this.pageNumber = 1;
        }
    }
}