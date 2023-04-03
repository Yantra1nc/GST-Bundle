/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/*************************************************************
 * File Header
 * Script Type: User Event Script
 * Script Name: [UE] YGST_TCS_Calclation
 * File Name:  UE_YGST_TCS_Calculation.js 
 * Created On: 17/01/2021
 * Created By: 
 * Description:Sales and Purchase side logic merged in a single file.
 1) If the TCS Applicable checkbox is checked and TCS Rate is define on customer then TCS Amount will apply on total of line item.
 2)If the TCS Applicable checkbox is checked and TCS Rate is define on Vendor then TCS Amount will apply on total of line item.
 *********************************************************** */

define(['N/record', 'N/search', 'N/runtime','N/config'],
 function(record, search, runtime,config) {
     function afterSubmitTCS_Calc(context){
         try
		 {
            if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE)
			{
            	var totalAmount   = 0;
                 
            	var currentRecord = context.newRecord;
                 var recordid      = currentRecord.id;
                 var recordtype    = currentRecord.type;
                 var paramData     = runtime.getCurrentScript();
                 
                 var configRecObj = config.load({type: config.Type.COMPANY_PREFERENCES});
				
                 var tcsItem       = paramData.getParameter({name: 'custscript_ygst_tcs_item'});				 
				 log.debug("afterSubmitTCS_Calc","preferredItemType="+preferredItemType);
				 
				 var preferredItemType = configRecObj.getValue({fieldId: 'custscript_ygst_tcs_item_type'});
				 log.debug("afterSubmitTCS_Calc","preferredItemType="+preferredItemType);	
				 
				var splitItemType  = preferredItemType.split(",");
					
				 if(recordid)
				 {
					 var recObj        = record.load({type: recordtype, id: recordid, isDynamic: true});
					 var entityID      = recObj.getValue({fieldId: 'entity'});
					 var loc      = recObj.getValue({fieldId: 'location'});
					
					 if( recordtype == "invoice"){
						var entityType =  'customer';
					 }
					 if( recordtype == "vendorbill"){
						var entityType =  'vendor';
					 }
					if(_validateData(entityID) && _validateData(entityType))
					{
						var entityObj = search.lookupFields({ type:entityType, id: entityID, columns: ['custentity_ygst_tcs_percentage'] });
						if(entityObj){
							var tcsRate  =  entityObj.custentity_ygst_tcs_percentage;						
							if(tcsRate){
								var SplittedTCSRate    = tcsRate.split('%');								
								var finalTCSRate = SplittedTCSRate[0];
							}
						}
					}
					
					if( _validateData(entityID))
					{
						var searchObj = searchData(entityID,recordtype);
					}
					if(_validateData(searchObj)){
						var searchResultCount = searchObj.runPaged().count;						
					}
					if(searchResultCount > 0){
						var resultIndex = 0; 
						var resultStep = 1000;
						var searchResult = searchObj.run().getRange({ start: resultIndex, end: resultIndex + resultStep });
						for(var t=0; t< searchResultCount;t++) {
							 var invAmount = searchResult[t].getValue({name: 'fxamount', summary: "SUM"});							 
							 invAmount = parseFloat(invAmount);
							 totalAmount = parseFloat(totalAmount) + parseFloat(invAmount);							 
						}
						var totalItemAmount = 0;

						var lineItemCount = recObj.getLineCount({sublistId: 'item'});
					 
						for(var i = 0; i < lineItemCount; i++)
						{
							 var itemID = recObj.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
							 var itemAmt = recObj.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
						
							 var itemType= recObj.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});
							 
							 	var itemFlag=0;
								var itemTypeLength	= splitItemType.length;								
								for(var loopCtr=0; loopCtr<itemTypeLength; loopCtr++) 
								{		
								 	if(splitItemType[loopCtr]==itemType)
									 {
										 itemFlag=1;
									 }
								}
								if(itemID != tcsItem && itemFlag==1)
								{
										totalItemAmount = (totalItemAmount + itemAmt);
								}
											 						
						 }
						for(var i_ctr = 0; i_ctr < lineItemCount; i_ctr++)
						{
							 var itemID = recObj.getSublistValue({sublistId: 'item', fieldId: 'item', line: i_ctr});
							if(itemID == tcsItem)
							{ 
									recObj.removeLine({sublistId: 'item', line: i_ctr, ignoreRecalc: true});
									break;
							}		
						}
						 if(_validateData(totalItemAmount) && _validateData(finalTCSRate)){
							
							 var itemRate = ((totalItemAmount * finalTCSRate)/100);
							log.debug('Item Rate :',itemRate);
							
							recObj.selectNewLine({sublistId: 'item'});
							
							if(tcsItem){
								recObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: tcsItem ,ignoreFieldChange: false,forceSyncSourcing: false}); 
							}
							if(itemRate){
								recObj.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: itemRate ,ignoreFieldChange: false,forceSyncSourcing: false});
							}
							
							recObj.commitLine({sublistId: 'item'});
							
							var Savedrecord = recObj.save({ enableSourcing: true, ignoreMandatoryFields: true });
							log.debug('Savedrecord :',Savedrecord);
						}
					}
				}
			}
		 }
         catch(e){
             var errString = 'afterSubmit ' + e.name + ' : ' + e.type + ' : ' + e.message;
             log.error({
                 title: 'afterSubmit',
                 details: errString
             });
         }
     }
	 function _validateData(val) {
		if (val != null && val != 'undefined' && val != 'NaN' && val != '') {
			return true;
		}
		return false;
	 }
	  function searchData(entityID,recordtype) {
		 if(entityID){
			var filters	= [];
			var columns	= [];
			filters.push([
				["mainline","is","F"], "AND", ["taxline","is","F"], "AND", ["cogs","is","F"], "AND", ["shipping","is","F"], "AND", ["billingaddress.country","anyof","IN"]
			]);
			if(recordtype == "invoice") {
				filters.push("AND");
				filters.push(["type","anyof","CustInvc"]);
				filters.push("AND");
				filters.push(["customer.custentity_ygst_tcs_applicable","is","T"]);
				filters.push("AND");
				filters.push(["customer.internalid","anyof",entityID]);
			}
			if(recordtype == "vendorbill") {
				filters.push("AND");
				filters.push(["type","anyof","VendBill"]);
				filters.push("AND");
				filters.push(["vendor.custentity_ygst_tcs_applicable","is","T"]);
				filters.push("AND");
				filters.push(["vendor.internalid","anyof",entityID]);
			}
			columns.push(search.createColumn({name: "trandate", summary: "GROUP",label: "Date"}));
			columns.push(search.createColumn({name: "tranid",summary: "GROUP",label: "Document Number"}));
			columns.push(search.createColumn({name: "entity",summary: "GROUP",label: "Name"}));
			columns.push(search.createColumn({name: "amount",summary: "SUM",label: "Amount"}));
			columns.push(search.createColumn({name: "fxamount",summary: "SUM",label: "Amount (Foreign Currency)"}));
			
			var searchObj = search.create({type: "transaction", filters: filters, columns: columns});
		 }
		 return searchObj;
	  }
	 
     return{
         afterSubmit: afterSubmitTCS_Calc
     };
 });
