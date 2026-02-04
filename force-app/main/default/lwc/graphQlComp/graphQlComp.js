import { LightningElement, wire } from "lwc";
import { gql, graphql } from "lightning/uiGraphQLApi";

export default class GraphQlComp extends LightningElement {
    records = [];
    errors = [];
    columns = [];
    searchValue = 'test';

    get variables() {
        return {
            likeParams: this.searchValue,
            limit: 5
        }
    }

    @wire(graphql, {
        query: gql`
            query getAccounts(
                $likeParams : String,
                $limit: Int
            ) {
                uiapi {
                    query{
                    Account(
                        first: $limit,
                        orderBy: { Name: { order: ASC }},
                        where: {
                            Name: { like: $likeParams }
                        }
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
                    }
                    }
                }
            }`, 
            variables: '$variables'
    })
    wiredGraphlQLResult({ data, errors }) {
        if (data) {
            console.log("Data: ", JSON.stringify(data));
            this.records = data.uiapi.query.Account.edges.map(edge => {
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
            if (this.records.length !==  0) {
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

    handleChange(event){
        event.preventDefault();
        this.searchValue = '%'+event.target.value+'%';

    }
}
