/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
 
 /*************************************************************
Script Name: YGST: Common Get Enity State SUT
Script Type: Suitelet Script
Created Date: 18/04/2020
Created By: Prashant Lokhande
Description: This script will trigger from another scripts. This script loads entity and send requested details.
*************************************************************/

define(['N/record','N/search','N/runtime','N/log','N/https'],

function(record,search,runtime,log,https)
{
    function onRequest(context)
    {
        try{
            if (context.request.method === 'GET')
            {
                var DataArray =new Array();
                var i_Entity = context.request.parameters.i_entiry_id;                
                var i_shipTo = context.request.parameters.s_Ship_To;
                log.debug({  title: ' i_shipTo:', details:'i_shipTo: '+i_shipTo});
                var s_Record_Type = context.request.parameters.s_record_type;
                log.debug({  title: ' s_Record_Type:', details:'s_Record_Type: '+s_Record_Type});

                if(_dataValidation(i_Entity) && _dataValidation(i_shipTo))
                {
                    var entity_Record;
                    if(s_Record_Type == 'Sale')
                    {
                        log.debug({  title: ' Sales Cycle:', details:'i_Entity: '+i_Entity});
                        entity_Record = record.load({type: record.Type.CUSTOMER,id: i_Entity});
                        log.debug({  title: ' s_Record_Type:', details:'entity_Record: '+entity_Record});                        
                    }
                    else if(s_Record_Type == 'Purchase')
                    {
                        log.debug({  title: ' Purchase Cycle :', details:'i_Entity: '+i_Entity});                        
                        entity_Record =record.load({type: record.Type.VENDOR,id: i_Entity});
                        log.debug({  title: ' s_Record_Type:', details:'entity_Record: '+entity_Record});                      
                        
                    }
                   /* else if(s_Record_Type == 'Location')
                    {
                        log.debug({  title: ' Location :', details:'Location: '+i_Location});                        
                        var locationRecordObj = record.load({type: record.Type.LOCATION,id: getLocation})
						var subrec = locationRecordObj.getSubrecord({fieldId: 'mainaddress' });
						//var companyState = subrec.getText({fieldId: 'custrecord_state_gst'});
                        var locGstNo = subrec.getValue({fieldId: 'custrecord_gst_nocustomeraddr'});
                        DataArray.push({
                            'locationgstnumber' : locGstNo                            
                            });               
                    }*/
                    if(_dataValidation(entity_Record))
		            {
                       var addressCount = entity_Record.getLineCount({sublistId: 'addressbook'});
                       log.debug({  title: ' addressCount:', details:'addressCount: '+addressCount});

                       for(var i_Temp = 0; i_Temp < addressCount; i_Temp++)
                       {
                        var s_Lable = entity_Record.getSublistValue({sublistId: 'addressbook',fieldId: 'id',line: i_Temp});
                        log.debug({  title: ' s_Lable:', details:'s_Lable: '+s_Lable});
                        if(_dataValidation(s_Lable) && (i_shipTo == s_Lable))
                        {
                           var addrSubrecord = entity_Record.getSublistSubrecord({sublistId: 'addressbook',fieldId: 'addressbookaddress',line: i_Temp});
                           log.debug({  title: ' addrSubrecord:', details:'addrSubrecord: '+addrSubrecord});
                           if(_dataValidation(addrSubrecord))
                           {
                            var entityStateCode = addrSubrecord.getValue({fieldId: 'custrecord_gst_addressstatecode'});
                            log.debug({  title: ' entityStateCode:', details:'entityStateCode: '+entityStateCode});
                            var entityGSTIN = addrSubrecord.getValue({fieldId: 'custrecord_gst_nocustomeraddr'});     
                            log.debug({  title: ' entityGSTIN:', details:'entityGSTIN: '+entityGSTIN});
                            var entityCountry = addrSubrecord.getValue({fieldId: 'country'});     
                            log.debug({  title: ' entityCountry:', details:'entityCountry: '+entityCountry});
                            var gstRegType = addrSubrecord.getText({fieldId: 'custrecord_gst_registration_type'});     
                            log.debug({  title: ' gstRegType:', details:'gstRegType: '+gstRegType});
                            var stateValue = addrSubrecord.getValue({fieldId: 'state'});     
                            log.debug({  title: ' stateValue:', details:'stateValue: '+stateValue});
                            
                            DataArray.push({
								'entitystatecode' : entityStateCode,
								'entitygstin' : entityGSTIN,
								'entityCountry':entityCountry,
								'gstRegType':gstRegType,
								'stateValue':stateValue
								});                     
                           }
                           break;
                        }// end if(_dataValidation(s_Lable) && (i_shipTo == s_Lable))
                       }// end for(var i_Temp = 1; i_Temp <= addressCount; i_Temp++)
                    }// end if(_dataValidation(entity_Record))
                }// end if(_dataValidation(i_Entity) && _dataValidation(i_shipTo))
            }
        }
        catch(e)
        {
            log.error({title: e.name,details: e.message});
        }
        log.debug({  title: ' DataArray:', details:'DataArray: '+JSON.stringify(DataArray)});
        context.response.write(JSON.stringify(DataArray));        
    }
    function _dataValidation(value) 
	{
		 if(value!='null' && value != null && value != null && value != '' && value != undefined && value != undefined && value != 'undefined' && value != 'undefined'&& value != 'NaN' && value != NaN) 
		 {
		  return true;
		 }
		 else 
		 { 
		  return false;
		 }
	}
return {
    onRequest: onRequest
};
});
