import { LightningElement, wire } from "lwc";
import { gql, graphql } from "lightning/uiGraphQLApi";

export default class FirstGraphQlComp extends LightningElement {
    results;
    errors;
    // Just a simple query to show Account with Name and Industry
    // @wire(graphql, {
    //     query: gql`
    //     query AccountWithName {
    //     uiapi {
    //       query {
    //         Account(first: 10) {
    //           edges {
    //             node {
    //               Id
    //               Name {
    //                 value
    //               }
    //               Industry {  
    //                 value
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // `,
    // })
    // graphqlQueryResult({ data, errors }) {
    //     if (data) {
    //         this.results = data.uiapi.query.Account.edges.map((edge) => edge.node);
    //     }
    //     this.errors = errors;
    // }

    @wire(graphql, {
        query: gql`
            query AccountsAndCases {
                uiapi{
                    query {
                        Case(where: AccountId: { inq: { Account: {
                            and: [
                                { Name: { like: "United %" } },
                                { Industry: { eq: "Energy" } }
                            ]},                                        
                                ApiName: "Id" } } } ) {
                                edges {
                                    node {
                                        AccountId {value}
                                        Priority {value}
                                        Subject {value}
                                    }
                                }
                            }
                        }
                    }
                `,
    })
    graphqlQueryResult({ data, errors }) {
        if (data) {
            this.results = data.uiapi.query.Case.edges.map((edge) => edge.node);
            console.log('results ===> ', JSON.stringify(this.results));
        }
        this.errors = errors;
    }
}