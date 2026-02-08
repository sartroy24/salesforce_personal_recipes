public with sharing class QueryCursorDemo {

    @AuraEnabled(cacheable=true)
    public static List<Lead> getLeads(Integer startPosition, Integer numRecords){
        try {
            if(startPosition != null && numRecords != null){
                Database.cursor cursor;
                if(Cache.Session.contains('leadCursor')){
                    System.debug('getting from cache');
                    cursor = (Database.Cursor)Cache.Session.get('leadCursor');
                } else{
                    System.debug('Inserting to cache');
                    cursor = Database.getCursor('Select Id, Name FROM Lead');
                    Cache.Session.put('leadCursor', cursor);
                }
                    return cursor.fetch(startPosition, numRecords);
            }  
            return null;           
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}