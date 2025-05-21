public with sharing class DataTableController {
    @AuraEnabled
    public static List<SObject> getRecords(String objectName, List<String> fields) {
        String soql = 'SELECT Id, ' + String.join(fields, ',') + ' FROM ' + objectName+ ' Limit 10';
        List<SObject> results = Database.query(soql);
        return results;
    }
}