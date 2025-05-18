public with sharing class DynamicObjectController {
    // DTO for returning Object info
    public class ObjectInfo implements Comparable {
        @AuraEnabled public String label;
        @AuraEnabled public String apiName;
        public Integer compareTo(Object o) {
            ObjectInfo other = (ObjectInfo) o;
            return this.apiName.toLowerCase().compareTo(other.apiName.toLowerCase());
        }
    }
    
    // DTO for returning Field info
    public class FieldInfo implements Comparable {
        @AuraEnabled public String label;
        @AuraEnabled public String apiName;
        @AuraEnabled public String dataType;
        public Integer compareTo(Object field) {
            FieldInfo other = (FieldInfo) field;
            return this.apiName.toLowerCase().compareTo(other.apiName.toLowerCase());
        }
    }
    /**
* Get all SObjects accessible to the user (standard & custom).
*/
    @AuraEnabled(cacheable=true)
    public static List<ObjectInfo> getAvailableObjects() {
        List<ObjectInfo> objectList = new List<ObjectInfo>();
        Map<String, Schema.SObjectType> globalDesc = Schema.getGlobalDescribe();
        
        for (String objName : globalDesc.keySet()) {
            Schema.DescribeSObjectResult describe = globalDesc.get(objName).getDescribe();
            
            if (describe.isCreateable() && describe.isAccessible() && !describe.isCustomSetting()) {
                ObjectInfo objInfo = new ObjectInfo();
                objInfo.label = describe.getLabel();
                objInfo.apiName = describe.getName();
                objectList.add(objInfo);
            }
        }
        objectList.sort();
        System.debug('objectList --> '+objectList);
        return objectList;
    }
    @AuraEnabled(cacheable=true)
    public static List<FieldInfo> getFieldsForObject(String objectApiName) {
        List<FieldInfo> fieldList = new List<FieldInfo>();
        
        if (String.isBlank(objectApiName)) {
            throw new AuraHandledException('Object API name is required.');
        }
        
        Schema.SObjectType sObjType = Schema.getGlobalDescribe().get(objectApiName);
        if (sObjType == null) {
            throw new AuraHandledException('Invalid object name.');
        }
        
        Schema.DescribeSObjectResult describe = sObjType.getDescribe();
        Map<String, Schema.SObjectField> fieldsMap = describe.fields.getMap();
        
        for (String fieldApiName : fieldsMap.keySet()) {
            Schema.DescribeFieldResult fieldDesc = fieldsMap.get(fieldApiName).getDescribe();
            
            if (fieldDesc.isAccessible()) {
                FieldInfo f = new FieldInfo();
                f.label = fieldDesc.getLabel();
                f.apiName = fieldDesc.getName();
                f.dataType = fieldDesc.getType().name();
                fieldList.add(f);
            }
        }
        fieldList.sort();
		System.debug('fieldList --> '+fieldList);
        return fieldList;
    }
}