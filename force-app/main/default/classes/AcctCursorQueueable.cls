public with sharing class AcctCursorQueueable implements Queueable{
    private Database.Cursor cursor;
    private integer position;


    public AcctCursorQueueable(){
        cursor = Database.getCursor(
            'Select Id, name,  Industry From Account Where Name Like \'%Dummy%\' Limit 1000'
        );
        position = 0;
    }

    public void execute(QueueableContext ctx){      
    /*    while (true) {
            //Fetch next batch of records
            
            
            if(records.isEmpty()){
                break;
            }
            for(Sobject record : records){
                System.debug('inside record');
                
            }         
        }*/
        Integer batchSize = 50;
        List<SObject> records = cursor.fetch(position, batchsize);
        position += records.size();   
        for(Sobject obj: records){
            obj.put('Industry', 'Consulting');
        }
        Database.update(records);
        if(position < cursor.getNumRecords()){
            System.enqueueJob(this);
        }
    }
}