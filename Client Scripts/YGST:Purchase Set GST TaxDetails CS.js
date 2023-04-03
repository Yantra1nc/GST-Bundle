/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @Author 
 */

/*************************************************************
Script Name: YGST:Purchase Set GST TaxDetails CS
Script Type: Client Script
Created Date: 20/04/2020
Created By: Prashant Lokhande
Company : Yantra Inc.
Description: This script will set all GST transaction details. 
 *************************************************************/

define(['N/currentRecord', 'N/search', 'N/runtime', 'N/log','N/https','N/url'],
		function (currentRecord, search, runtime, log, https,url) 
		{
	var getIndiaSubsidiary = [];
	var intra = 1;
	var inter = 2;
	var gstRegType='';
	var isEnable = runtime.isFeatureInEffect({feature: "LOCATIONS"});
	function pageInit(scriptContext) 
	{
		try{
			var addressObject ="";
			/*var getIndiaSubsidiary = [];
			var intra = 1;
			var inter = 2;*/
			var currentRecordObj = scriptContext.currentRecord;
			//var tranSubsidiary 	= currentRecordObj.getValue({fieldId: 'subsidiary'});
			var tranSubsidiary      = window.nlapiGetFieldValue('subsidiary')
			var scriptObj 		= runtime.getCurrentScript();
			var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
			var billingAddressParam= scriptObj.getParameter({name:'custscript_ygst_billing_address_param'});
			//Condition for to compare multi India Subsidiary.
			var indiaSubObj	= false;
			var splitSub	= getAccountSubsidiary.split(",");
			var subLength	= splitSub.length;
			for(var i=0; i<subLength; i++) {
				if(Number(splitSub[i]) == Number(tranSubsidiary)) {
					indiaSubObj	= true;
				}
			}
			if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj)
			{
				if(scriptContext.mode == 'copy')
				{
					var lineItemCount = currentRecordObj.getLineCount({sublistId: 'item'});
					for (var i = 0; i < lineItemCount; i++)
					{
						currentRecordObj.selectLine({sublistId: 'item',line: i});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: ''});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: ''});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: ''});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: ''});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: ''});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: ''});
						currentRecordObj.commitLine({sublistId: 'item'});
					}// end for (var i = 0; i < lineItemCount; i++)
					return;
				}// end if(scriptContext.mode == 'copy')

				/* if(scriptContext.mode == 'edit')
               {
                    var lineExpenseCount = currentRecordObj.getLineCount({sublistId: 'expense'});

                    //Line count of Item
                    var lineItemCount = currentRecordObj.getLineCount({sublistId: 'item'});
                    if (lineItemCount > 0) 
                    {
                        for (var l = lineItemCount - 1; l >= 0; l--) 
                        {
                            var isReversalLine = currentRecordObj.getSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_apply',line: l});
                            var isReversalProcessed = currentRecordObj.getSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_process',line: l});                        

                            if (isReversalLine == true) 
                            {
                                currentRecordObj.removeLine({sublistId: 'item',line: l});
                            }
                            if(isReversalProcessed == true)
                            {
                                currentRecordObj.selectLine({sublistId: 'item',line: l});
                                currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_process',value: false});
                                currentRecordObj.commitLine({sublistId: 'item'});
                            }
                            // currentRecordObj.setSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_process',line: l,value: false});
                        }                    
                    }
                    if (lineExpenseCount > 0) 
                    {
                        for (var k = lineExpenseCount - 1; k >= 0; k--) 
                        {
                            var isReversalLine = currentRecordObj.getSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_apply',line: k});
                            var isReversalProcessed = currentRecordObj.getSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_process',line: k});

                            if (isReversalLine == true)
                            {
                                currentRecordObj.removeLine({sublistId: 'expense',line: k});
                            }
                            if(isReversalProcessed == true)
                            {
                                currentRecordObj.selectLine({sublistId: 'expense',line: k});
                                currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_process',value: false});
                                currentRecordObj.commitLine({sublistId: 'expense'});
                            }
                            // currentRecordObj.setSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_process',line: k,value: false});              
                        }
                    }// end if (lineExpenseCount > 0)
                }// end if(scriptContext.mode == 'edit')
				 */
				var isEnable = runtime.isFeatureInEffect({feature: "LOCATIONS"});
				//var entityId = currentRecordObj.getValue({fieldId: 'entity'});
				//var billingAddress = currentRecordObj.getValue({fieldId: 'billaddresslist'});

				//if (scriptContext.mode != 'edit' && scriptContext.mode != 'xedit' && _logValidation(entityId))
				if (scriptContext.mode != 'edit' && scriptContext.mode != 'xedit')
				{
					//var addressObject = setEntityGstDetails(entityId, billingAddress);			
					addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});

					if(_logValidation(addressObject))
					{
						/*var entityStateCode = addressObject[0].entitystatecode;
						var entityGstNumber = addressObject[0].entitygstin;	
						var addrCountry = addressObject[0].entityCountry;
						var gstRegType = addressObject[0].gstRegType;*/

						var entityStateCode = addressObject.getValue('custrecord_gst_addressstatecode');
						var entityGstNumber = addressObject.getValue('custrecord_gst_nocustomeraddr');				
						var addrCountry = addressObject.getValue('country');
						//gstRegType = addressObject.getText('custrecord_gst_registration_type');
						gstRegType = addressObject.getValue('custrecord_gst_registration_type');

						//if((gstRegType && gstRegType =='SEZ Registered') || (addrCountry && addrCountry != "IN")){
						if((gstRegType && gstRegType ==11) || (addrCountry && addrCountry != "IN")){
							var objFldSezPaymentType = currentRecordObj.getField({fieldId: 'custbody_gst_exprt_typ'});
							if(objFldSezPaymentType){
								objFldSezPaymentType.isMandatory =true;
							}
						}
						else{
							var objFldSezPaymentType = currentRecordObj.getField({fieldId: 'custbody_gst_exprt_typ'});
							if(objFldSezPaymentType){
								objFldSezPaymentType.isMandatory =false;
							}
						}
					}
					if(addrCountry && addrCountry != "IN")
						currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: true});                    
					else
						currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: false});
					if(entityGstNumber)		
						currentRecordObj.setValue({fieldId: 'custbody_gst_customerregno',value: entityGstNumber,ignoreFieldChange: true,fireSlavingSync: true});
					else
						currentRecordObj.setValue({fieldId: 'custbody_gst_customerregno',value: '',ignoreFieldChange: true,fireSlavingSync: true});
					if(entityStateCode)
						currentRecordObj.setValue({fieldId: 'custbody_gst_destinationstate',value: entityStateCode,ignoreFieldChange: true,fireSlavingSync: true});
					else
						currentRecordObj.setValue({fieldId: 'custbody_gst_destinationstate',value: '',ignoreFieldChange: true,fireSlavingSync: true});
				}// end if (scriptContext.mode != 'edit' && scriptContext.mode != 'xedit') 

				var getLocationGstNumber='';
				var getLocationGSTRegType='';
				var placeofSupplyValue = '';

				if(!isEnable) 
				{
					var getLocationGstNumber = searchOnSubsidiary(tranSubsidiary);
					currentRecordObj.setValue({fieldId: 'custpage_location',value: getLocationGstNumber});
				}
				else
				{
					var getLocation =  currentRecordObj.getValue({fieldId: 'location'});
					if(_logValidation(getLocation))
					{
						//var getLocationGstNumber = searchOnLocation(getLocation);
						var locationDetails = searchOnLocation(getLocation);

						if(locationDetails){
							var splitLocationDetails = locationDetails.split('$$');						
							getLocationGstNumber = splitLocationDetails[0];						
							getLocationGSTRegType = splitLocationDetails[1];
							var placeofSupply= splitLocationDetails[2];
							placeofSupplyValue =  getPlaceofSupply(placeofSupply);

						}
						if(placeofSupplyValue)
							currentRecordObj.setValue({fieldId: 'custbody_gst_place_of_supply',value: placeofSupplyValue});

						if(getLocationGstNumber)
							currentRecordObj.setValue({fieldId: 'custbody_gst_locationregno',value: getLocationGstNumber});

					}
				}
				var customerGstNumber = currentRecordObj.getValue({fieldId: 'custbody_gst_customerregno'});
				var custGSTStateCode = currentRecordObj.getValue({fieldId: 'custbody_gst_destinationstate'});
				if(!_logValidation(customerGstNumber) && _logValidation(custGSTStateCode) && _logValidation(getLocationGstNumber))
				{
					//var addressObject = setEntityGstDetails(entityId, billingAddress);
					if(!addressObject){
						addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
					}

					if(_logValidation(addressObject))
					{
						/*var entityStateCode = addressObject[0].entitystatecode;						
						var entityGstNumber = addressObject[0].entitygstin;						
						var addrCountry = addressObject[0].entityCountry;											
						//var gstRegType = addressObject[0].gstRegType;
						gstRegType = addressObject[0].gstRegType;*/

						var entityStateCode = addressObject.getValue('custrecord_gst_addressstatecode');
						var entityGstNumber = addressObject.getValue('custrecord_gst_nocustomeraddr');				
						var addrCountry = addressObject.getValue('country');
						//gstRegType = addressObject.getText('custrecord_gst_registration_type');
						gstRegType = addressObject.getValue('custrecord_gst_registration_type');

						//if((gstRegType && gstRegType =='SEZ Registered') || (addrCountry && addrCountry != "IN")){
						if((gstRegType && gstRegType ==11) || (addrCountry && addrCountry != "IN")){
							var objFldSezPaymentType = currentRecordObj.getField({fieldId: 'custbody_gst_exprt_typ'});
							if(objFldSezPaymentType){
								objFldSezPaymentType.isMandatory =true;
							}
						}
						else{
							var objFldSezPaymentType = currentRecordObj.getField({fieldId: 'custbody_gst_exprt_typ'});
							if(objFldSezPaymentType){
								objFldSezPaymentType.isMandatory =false;
							}
						}
					}
					getLocationGstNumber = getLocationGstNumber.toString();
					getLocationGstNumber = getLocationGstNumber.substr(0, 2);                                
					//If location state and customer's address state matches set gst type to intra.
					//if (Number(getLocationGstNumber) == Number(custGSTStateCode) && (gstRegType && (gstRegType !='SEZ Registered' && getLocationGSTRegType !='FTWZ'))){
					if (Number(getLocationGstNumber) == Number(custGSTStateCode) && (gstRegType && (gstRegType !=11 && getLocationGSTRegType !=10))){
						currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra});
					}
					//If location state and customer's address state does not matches set gst type to inter.
					else{
						currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter});
					}
				}
				//if(_logValidation(entityId) && _logValidation(getLocationGstNumber))
				if(_logValidation(getLocationGstNumber))
				{  
					//var addressObject = setEntityGstDetails(entityId, billingAddress);
					if(!addressObject){
						addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
					}
					if(_logValidation(addressObject))
					{
						/*var entityStateCode = addressObject[0].entitystatecode;						
						var entityGstNumber = addressObject[0].entitygstin;						
						var addrCountry = addressObject[0].entityCountry;												
						//var gstRegType = addressObject[0].gstRegType;
						gstRegType = addressObject[0].gstRegType;	*/		
						
						var entityStateCode = addressObject.getValue('custrecord_gst_addressstatecode');
						var entityGstNumber = addressObject.getValue('custrecord_gst_nocustomeraddr');				
						var addrCountry = addressObject.getValue('country');			
						gstRegType = addressObject.getValue('custrecord_gst_registration_type');

						if((gstRegType && gstRegType =='SEZ Registered') || (addrCountry && addrCountry != "IN")){
							var objFldSezPaymentType = currentRecordObj.getField({fieldId: 'custbody_gst_exprt_typ'});
							if(objFldSezPaymentType){
								objFldSezPaymentType.isMandatory =true;
							}
						}
						else{
							var objFldSezPaymentType = currentRecordObj.getField({fieldId: 'custbody_gst_exprt_typ'});
							if(objFldSezPaymentType){
								objFldSezPaymentType.isMandatory =false;
							}
						}
					}
					var customerGstNumber = currentRecordObj.getValue({fieldId: 'custbody_gst_customerregno'});
					if (_logValidation(getLocationGstNumber) && _logValidation(customerGstNumber) )
					{
						getLocationGstNumber = getLocationGstNumber.toString();
						getLocationGstNumber = getLocationGstNumber.substr(0, 2);

						customerGstNumber = customerGstNumber.toString();
						customerGstNumber = customerGstNumber.substr(0, 2);

						if((Number(getLocationGstNumber) == Number(customerGstNumber)) &&(gstRegType &&  (gstRegType !='SEZ Registered' && getLocationGSTRegType !='FTWZ')))
							currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra});
						else 
							currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter});
					}
				}
			}// end if(getIndiaSubsidiary && getIndiaSubsidiary.indexOf(subsidiary) != -1)
		}catch(e){
			log.error('Exception Caught PageInit:- ', e.id);
			log.error('Exception Caught PageInit:- ', e.message); 
		}
	}
	function fieldChanged(scriptContext)
	{
		try
		{
			/* var intra = 1;
			var inter = 2;*/

			var currentRecordObj = scriptContext.currentRecord;
			if((scriptContext.sublistId != 'item' && scriptContext.fieldId == "location") || scriptContext.fieldId == "custpage_location")
			{
				SourceLocationDetails(currentRecordObj);
			}// end if ((scriptContext.fieldId == "location" || scriptContext.fieldId == "custpage_location") && !(_logValidation(scriptContext.sublistId)))

			if (scriptContext.fieldId == "billaddresslist"){
				var addressObject="";
				var entityId = currentRecordObj.getValue({fieldId: 'entity'});				
				var billingAddress = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));
				addressObject = setEntityGstDetails(entityId, billingAddress);

				if(_logValidation(addressObject))
				{
					var entityStateCode = addressObject[0].entitystatecode;
					var entityGstNumber = addressObject[0].entitygstin;
					var addrCountry = addressObject[0].entityCountry;
					var gstRegType = addressObject[0].gstRegType;

					if((gstRegType &&gstRegType =='SEZ Registered')||(addrCountry && addrCountry != "IN")){
						var objFldSezPaymentType = currentRecordObj.getField({fieldId: 'custbody_gst_exprt_typ'});
						if(objFldSezPaymentType){
							objFldSezPaymentType.isMandatory =true;
						}
					}
					else{
						var objFldSezPaymentType = currentRecordObj.getField({fieldId: 'custbody_gst_exprt_typ'});
						if(objFldSezPaymentType){
							objFldSezPaymentType.isMandatory =false;
						}
					}
				}
				if(_logValidation(entityGstNumber))	
					currentRecordObj.setValue({fieldId: 'custbody_gst_customerregno',value: entityGstNumber,ignoreFieldChange: true,fireSlavingSync: true});
				else
					currentRecordObj.setValue({fieldId: 'custbody_gst_customerregno',value: '',ignoreFieldChange: true,fireSlavingSync: true});

				if(_logValidation(entityStateCode))
					currentRecordObj.setValue({fieldId: 'custbody_gst_destinationstate',value: entityStateCode,ignoreFieldChange: true,fireSlavingSync: true});
				else
					currentRecordObj.setValue({fieldId: 'custbody_gst_destinationstate',value: '',ignoreFieldChange: true,fireSlavingSync: true});

				//if(addrCountry != "IN")
				if(addrCountry && addrCountry != "IN")                                           
					currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: true});                    
				else
					currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: false});

				var locationGSTNumber = currentRecordObj.getValue({fieldId: 'custbody_gst_locationregno'});
				locationGSTNumber = locationGSTNumber.toString();
				locationGSTNumber = locationGSTNumber.substr(0, 2);

				var getLocationGSTRegType="";
				var tranSubsidiary = currentRecordObj.getValue({fieldId: 'subsidiary'});              

				if (!isEnable)                  
					var locationGstNumber = searchOnSubsidiary(tranSubsidiary);    
				else {
					var location = currentRecordObj.getValue({fieldId: 'location'});

					if(location)
					{
						//var locationGstNumber = searchOnLocation(location);
						var locationDetails = searchOnLocation(location);

						if(locationDetails){
							var splitLocationDetails = locationDetails.split('$$');
							getLocationGSTRegType = splitLocationDetails[1];
						}
					}				
				}

				if (Number(locationGSTNumber) == Number(entityStateCode) && (gstRegType && (gstRegType !='SEZ Registered' && getLocationGSTRegType !='FTWZ'))) 
				{
					currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra});
				}                   
				else 
				{
					currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter});
				}                   
				currentRecordObj.setValue({fieldId: 'custbody_gst_totalcgst',value: ''});
				currentRecordObj.setValue({fieldId: 'custbody_gst_totaligst',value: ''});
				currentRecordObj.setValue({fieldId: 'custbody_gst_totalsgst',value: ''});
			}
			if(scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_itemschedule')
			{
				var addressObject="";
				/*var entityId = currentRecordObj.getValue({fieldId: 'entity'});
				var billingAddress = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));
				addressObject = setEntityGstDetails(entityId, billingAddress);

				if(_logValidation(addressObject)){
					var gstRegType = addressObject[0].gstRegType;
				}*/
				
				addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
				if(_logValidation(addressObject)){
					var gstRegType = addressObject.getValue('custrecord_gst_registration_type');
				}
				
				var taxCodeId;
				var scheduleId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule'});

				var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});
				var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});
				var sezPaymentType = currentRecordObj.getText({fieldId: 'custbody_gst_exprt_typ'});

				//Search on GST Tax Code Matrix to get the tax code, reversal tax code, reversal purchase and payable items for cgst, sgst and igst.
				if(_logValidation(gstType) && _logValidation(scheduleId))
				{
					//if(((customerIsNRI == true && sezPaymentType=='WOPAY') || (gstRegType =='SEZ Registered' && sezPaymentType=='WOPAY' ) )&& scheduleId != 1 )
					if(((customerIsNRI == true && sezPaymentType=='WOPAY') || (gstRegType ==11 && sezPaymentType=='WOPAY' ) )&& scheduleId != 1 )
					{
						alert('You can not change Item schedule for this Import/SEZWOP Vendor');
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',value: 1,ignoreFieldChange: false});
					}
					else{
						var taxCodeSearch = GetTaxCodeFromMatrix(gstType,scheduleId);
						var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});							
						if (_logValidation(arrSearchResults[0]))
						{
							taxCodeId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
						}
					}
				}
				if (_logValidation(taxCodeId))
					currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeId,ignoreFieldChange: false});					

				return true;
			}//end if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_itemschedule') 
			if(scriptContext.sublistId == 'expense' && scriptContext.fieldId == 'custcol_gst_itemschedule' )
			{
				var addressObject;

				/*var entityId = currentRecordObj.getValue({fieldId: 'entity'});
				var billingAddress = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));
				addressObject = setEntityGstDetails(entityId, billingAddress);

				if(_logValidation(addressObject)){
					var gstRegType = addressObject[0].gstRegType;
				}*/
				addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
				if(_logValidation(addressObject)){
					var gstRegType = addressObject.getValue('custrecord_gst_registration_type');
				}
				var taxCodeId;
				var scheduleId = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule'});

				var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});
				var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});
				var sezPaymentType = currentRecordObj.getText({fieldId: 'custbody_gst_exprt_typ'});

				//Search on GST Tax Code Matrix to get the tax code, reversal tax code, reversal purchase and payable items for cgst, sgst and igst.
				if(_logValidation(gstType) && _logValidation(scheduleId))
				{
					//if(((customerIsNRI == true && sezPaymentType=='WOPAY') || (gstRegType =='SEZ Registered' && sezPaymentType=='WOPAY' ) )&& scheduleId != 1 )
					if(((customerIsNRI == true && sezPaymentType=='WOPAY') || (gstRegType ==11 && sezPaymentType=='WOPAY' ) )&& scheduleId != 1 )
					{
						alert('You can not change Item schedule for this Import/SEZWOP Vendor');
						//alert('You can not change Item schedule for this Export customer');
						currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: 1,ignoreFieldChange: false});
					}
					else{
						var taxCodeSearch = GetTaxCodeFromMatrix(gstType,scheduleId);
						var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});						
						if (_logValidation(arrSearchResults[0]))
						{
							taxCodeId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
						}
					}
				}
				if (_logValidation(taxCodeId))
					currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: taxCodeId,ignoreFieldChange: false});					
				return true;
			}//end if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_itemschedule') 

			if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_reversal_line') 
			{                   
				var scheduleId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule'});
				if(!(_logValidation(scheduleId)))
				{
					var itemId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
					var ScheduleLookUp = search.lookupFields({type: 'item',id: itemId,columns: 'custitem_gst_itemschedule'});

					if (ScheduleLookUp.custitem_gst_itemschedule[0])					
						scheduleId = ScheduleLookUp.custitem_gst_itemschedule[0].value;						
					else 
					{
						alert('Schedule is not available for this particular item');
						return;
					}
				}                
				var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});

				if(_logValidation(gstType) && _logValidation(scheduleId))
				{
					var taxCodeSearch = GetTaxCodeFromMatrix(gstType,scheduleId);
					var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});						
					if (arrSearchResults[0]) 
					{
						var taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
						var reversalTaxCode = arrSearchResults[0].getValue('custrecord_gst_reversal_taxcode');
					} else {
						alert('Custom GST tax record for the selected destination state not found');
						return;
					}
					var getApplyvalue = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_line'});

					//If check-box not checked set the old tax code.
					if (!getApplyvalue)
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false});
					//If checked then set the reversal tax code.
					else
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: reversalTaxCode,ignoreFieldChange: false});						
				}
			}// end if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_reversal_apply') 
			if (scriptContext.sublistId == 'expense' && scriptContext.fieldId == 'custcol_gst_reversal_line') 
			{                   
				var scheduleId = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule'});				
				if(!(_logValidation(scheduleId)))
				{
					var categoryId = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'category'});					
					var ScheduleLookUp = search.lookupFields({type: 'expensecategory',id: categoryId,columns: 'custrecord_gst_expenseschedule'});					
					if (ScheduleLookUp.custrecord_gst_expenseschedule[0])					
						scheduleId = ScheduleLookUp.custrecord_gst_expenseschedule[0].value;	
					else 
					{
						alert('Schedule is not available for this particular Category');
						return;
					}
				}                
				var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});

				if(_logValidation(gstType) && _logValidation(scheduleId))
				{
					var taxCodeSearch = GetTaxCodeFromMatrix(gstType,scheduleId);
					var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});						
					if (arrSearchResults[0]) 
					{
						var taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');						
						var reversalTaxCode = arrSearchResults[0].getValue('custrecord_gst_reversal_taxcode');						
					} else {
						alert('Custom GST tax record for the selected destination state not found');
						return;
					}
					var getApplyvalue = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_line'});
					//If check-box not checked set the old tax code.
					if (!getApplyvalue)
						currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false});
					//If checked then set the reversal tax code.
					else
						currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: reversalTaxCode,ignoreFieldChange: false});						
				}
			}// end if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_reversal_apply') 

		}catch(e){
			log.error('Exception Caught fieldChanged:- ', e.id);
			log.error('Exception Caught fieldChanged:- ', e.message);
		}
	}
	function postSourcing(scriptContext)
	{       
		try{

			/*	var intra = 1;
			var inter = 2;
			var getIndiaSubsidiary = [];*/
			var currentRecordObj = scriptContext.currentRecord;
			//var tranSubsidiary = currentRecordObj.getValue({fieldId: 'subsidiary'});
			var tranSubsidiary      = window.nlapiGetFieldValue('subsidiary')
			var scriptObj = runtime.getCurrentScript();
			var getAccountSubsidiary = scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
			getIndiaSubsidiary.push(getAccountSubsidiary);
			var isEnable = runtime.isFeatureInEffect ({feature: "LOCATIONS"});   
			var getTaxCode;	
			var gstRegType;	
			var addrCountry;				

			//Condition for to compare multi India Subsidiary.
			var indiaSubObj	= false;
			var splitSub	= getAccountSubsidiary.split(",");
			var subLength	= splitSub.length;
			for(var i=0; i<subLength; i++) {
				if(Number(splitSub[i]) == Number(tranSubsidiary)) {
					indiaSubObj	= true;
				}
			}

			if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj)
			{   
				/*var entityId = currentRecordObj.getValue({fieldId: 'entity'});
				var billingAddress = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));
				addressObject = setEntityGstDetails(entityId, billingAddress);

				if(_logValidation(addressObject)){
					gstRegType = addressObject[0].gstRegType;
					addrCountry = addressObject[0].entityCountry;
				}	*/	
				
				var addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
				if(_logValidation(addressObject)){
					 gstRegType = addressObject.getValue('custrecord_gst_registration_type');
					 addrCountry = addressObject.getValue('country');
				}

				var sezPaymentType = currentRecordObj.getText({fieldId: 'custbody_gst_exprt_typ'});


				if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')
				{
					//if (((addrCountry && addrCountry != "IN") || (gstRegType && gstRegType== 'SEZ Registered')) && !_logValidation(sezPaymentType))
					if (((addrCountry && addrCountry != "IN") || (gstRegType && gstRegType== 11)) && !_logValidation(sezPaymentType))
					{
						var itemId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
						if(_logValidation(itemId))
						{
							alert('Please select a Export/SEZ Payment Type  first.');
							currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: '',ignoreFieldChange: false});
							return false;
						}
					}//

					if(isEnable)
						var location = currentRecordObj.getValue({fieldId: 'location'});
					else
						var location = currentRecordObj.getValue({fieldId: 'custpage_location'});


					if (!_logValidation(location)) 
					{
						var itemId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
						if(_logValidation(itemId))
						{
							alert('Please select a location first.');
							currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: '',ignoreFieldChange: false});
							return false;
						}
					}
					else 
					{                  
						var itemId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
						if(_logValidation(itemId))
							getTaxCode = search.lookupFields({type: 'item',id: itemId,columns: 'custitem_gst_itemschedule'});

						if (getTaxCode.custitem_gst_itemschedule[0])					
							var scheduleId = getTaxCode.custitem_gst_itemschedule[0].value;						
						else
						{
							alert('Schedule is not available for this particular item');
							return;
						}					
						var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});
						if(_logValidation(gstType) && _logValidation(scheduleId))
						{
							var taxCodeSearch = GetTaxCodeFromMatrix(gstType,scheduleId);
							var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});                          
							if (arrSearchResults[0]) 
							{
								var taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');                               
							} 
							else {
								alert('Custom GST tax record for the selected destination state not found');
								return;
							}

							/*if(_logValidation(taxCodeInternalId))
								currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',value: taxCodeInternalId,ignoreFieldChange: false});
							//currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false});
							 */
							var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});

							//if(customerIsNRI == false  && _logValidation(taxCodeInternalId) && (gstRegType !='SEZ Registered' || sezPaymentType !='WOPAY')){
							if(customerIsNRI == false  && _logValidation(taxCodeInternalId) && (gstRegType !=11 || sezPaymentType !='WOPAY')){
								currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false});	
							}
							else if(customerIsNRI == true && sezPaymentType!='WOPAY'){
								currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false});	
							}
							else  {
								currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',value: 1,ignoreFieldChange: true});
							}

						}// end if(_logValidation(gstType) && _logValidation(scheduleId))

					}// else
				}// end if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')           

				if((scriptContext.sublistId == 'expense' && scriptContext.fieldId == 'account') || (scriptContext.sublistId == 'expense' && scriptContext.fieldId == 'category'))
				{

					//if (((addrCountry && addrCountry != "IN") || (gstRegType && gstRegType== 'SEZ Registered')) && !_logValidation(sezPaymentType))
					if (((addrCountry && addrCountry != "IN") || (gstRegType && gstRegType== 11)) && !_logValidation(sezPaymentType))
					{
						var accountId = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'account'});
						var expenseCatergoryId = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'category'});
						if(_logValidation(accountId) || _logValidation(expenseCatergoryId))
						{
							alert('Please select a Export/SEZ Payment Type  first.');
							currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'category',value: '',ignoreFieldChange: false});
							currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: '',ignoreFieldChange: false});
							return false;
						}
					}//

					if(isEnable)
						var location = currentRecordObj.getValue({fieldId: 'location'});
					else
						var location = currentRecordObj.getValue({fieldId: 'custpage_location'});


					if (!_logValidation(location)) 
					{
						var accountId = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'account'});
						var expenseCatergoryId = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'category'});
						if(_logValidation(accountId) || _logValidation(expenseCatergoryId))
						{
							alert('Please select a location first.');
							currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'category',value: '',ignoreFieldChange: false});
							currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: '',ignoreFieldChange: false});
							return false;
						}
					}

					else{
						var expCategory = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'category'});
						var accountId = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'account'});

						var lookupExpSchedule;

						if(_logValidation(accountId))
						{
							if(expCategory)
							{
								lookupExpSchedule = search.lookupFields({type: 'expensecategory',id: expCategory,columns: ['custrecord_gst_expenseschedule', 'custrecord_gst_hsnsaccode']});
								if(lookupExpSchedule.custrecord_gst_expenseschedule[0])
									var scheduleId = lookupExpSchedule.custrecord_gst_expenseschedule[0].value;							

								if (lookupExpSchedule.custrecord_gst_hsnsaccode)
									var expHsnCode = lookupExpSchedule.custrecord_gst_hsnsaccode;		
								
							}//end if(expCategory)
							var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});
							if(_logValidation(gstType) && _logValidation(scheduleId)) 
							{
								var taxCodeSearch = GetTaxCodeFromMatrix(gstType,scheduleId);						

								var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});							
								if (_logValidation(arrSearchResults[0]))
								{
									taxCodeId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
								}								
								else
								{
									alert('Custom GST tax record for the selected destination state not found');
									return;
								}
								currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_hsnsaccode',value: expHsnCode,ignoreFieldChange: false});
								currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: scheduleId,ignoreFieldChange: false});
								currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_yil_gst_expense_acc',value: accountId,ignoreFieldChange: false});
								var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});

								//if(customerIsNRI ==false && (gstRegType !='SEZ Registered' || sezPaymentType !='WOPAY')){
								if(customerIsNRI ==false && (gstRegType !=11 || sezPaymentType !='WOPAY')){
									currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: taxCodeId,ignoreFieldChange: false});
									//currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: scheduleId,ignoreFieldChange: false});
									//currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_hsnsaccode',value: expHsnCode,ignoreFieldChange: false});
								}
								else if(customerIsNRI == true && sezPaymentType!='WOPAY'){
									currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false});	
								}
								else
								{
									currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: 1,ignoreFieldChange: true});
									//currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_hsnsaccode',value: expHsnCode,ignoreFieldChange: false});
								}

							} 
							else
								return false;						
						}// end if(_logValidation(accountId))
					}
				}// end if (scriptContext.sublistId == 'expense' && scriptContext.fieldId == 'account')
				if(scriptContext.fieldId == 'entity') 
				{	  
					if(!isEnable)
					{						
						var getLocationGstNumber = searchOnSubsidiary(tranSubsidiary);
						currentRecordObj.setValue({fieldId: 'custpage_location',value: getLocationGstNumber});
					}
				}// end if(scriptContext.fieldId == 'entity') 

			}// end if(getIndiaSubsidiary && getIndiaSubsidiary.indexOf(tranSubsidiary) != -1)

		}catch(e){
			log.error('Exception Caught postSourcing:- ', e.id);
			log.error('Exception Caught postSourcing:- ', e.message); 
		}
	}


	//******************* Function Block Starts..... ************************** */
	function setEntityGstDetails(entityId, billingAddress)
	{
		if(entityId)
		{
			var recoType = 'Purchase';
			var resposeObject = '';

			var ResolveURL = url.resolveScript({scriptId: 'customscript_ygst_get_entity_state_sut',deploymentId: 'customdeploy_ygst_get_entity_state_sut',returnExternalUrl: true});	
			//var ResolveURL = url.resolveScript({scriptId: 'customscript_ygst_entity_state_sut_test',deploymentId: 'customdeploy_ygst_entity_state_sut_test',returnExternalUrl: true});

			ResolveURL += "&i_entiry_id=" + entityId;
			ResolveURL += "&s_Ship_To=" + billingAddress;
			ResolveURL += "&s_record_type=" + recoType;


			var resposeObject = https.get({url: ResolveURL});										   

			if(_logValidation(resposeObject)) 
			{
				var o_json_resource_data = resposeObject.body;				
				var o_json_resource_data_parse = JSON.parse(o_json_resource_data);               
			}// end if(_logValidation(resposeObject))             
		}//end if(entityId)
		if(_logValidation(o_json_resource_data_parse))
			return o_json_resource_data_parse;
	}

	function searchOnSubsidiary(subsidiary)
	{
		var getLocationGstNumber;
		var subsidiarySearchObj = search.create({type: "subsidiary",
			filters:
				[
					["internalid","anyof",subsidiary]
					],
					columns:
						[
							search.createColumn({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"})
							]
		});
		var searchResultCount = subsidiarySearchObj.runPaged().count;       
		subsidiarySearchObj.run().each(function(result){			
			getLocationGstNumber = result.getValue({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"});			
			return true;
		});
		return getLocationGstNumber;
	}

	function SourceLocationDetails(currentRecordObj)
	{  
		var locationGstNumber="";
		var getLocationGSTRegType="";
		var placeofSupplyValue="";
		var intra = 1;
		var inter = 2;
		var isEnable = runtime.isFeatureInEffect ({feature: "LOCATIONS"});        
		var tranSubsidiary = currentRecordObj.getValue({fieldId: 'subsidiary'});              
		if (!isEnable)                  
			var locationGstNumber = searchOnSubsidiary(tranSubsidiary);    
		else {
			var location = currentRecordObj.getValue({fieldId: 'location'});
			if(location)
			{
				//var locationGstNumber = searchOnLocation(location);
				var locationDetails = searchOnLocation(location);
				if(locationDetails){
					var splitLocationDetails = locationDetails.split('$$');
					locationGstNumber = splitLocationDetails[0];
					getLocationGSTRegType = splitLocationDetails[1];
					var placeofSupply= splitLocationDetails[2];
					placeofSupplyValue =  getPlaceofSupply(placeofSupply);

				}

			}				
		}
		var objAddress="";
	/*	var entityId = currentRecordObj.getValue({fieldId: 'entity'});
		var billingAddress = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));
		objAddress = setEntityGstDetails(entityId, billingAddress);
		if(_logValidation(objAddress)){
			var gstRegType = objAddress[0].gstRegType;
		}*/

		objAddress = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
		if(_logValidation(objAddress)){
			var gstRegType = objAddress.getValue('custrecord_gst_registration_type');
		}
		
		if(placeofSupplyValue)
			currentRecordObj.setValue({fieldId: 'custbody_gst_place_of_supply',value: placeofSupplyValue});

		currentRecordObj.setValue({fieldId: 'custbody_gst_locationregno',value: locationGstNumber});
		var customerGstNumber = currentRecordObj.getValue({fieldId: 'custbody_gst_customerregno'});
		var destiStateCode = currentRecordObj.getValue({fieldId: 'custbody_gst_destinationstate'});

		if (!(_logValidation(customerGstNumber)) && _logValidation(locationGstNumber))
		{
			var destiStateCode = currentRecordObj.getValue({fieldId: 'custbody_gst_destinationstate'});
			locationGstNumber = locationGstNumber.toString();
			locationGstNumber = locationGstNumber.substr(0, 2);

			//if((Number(locationGstNumber) == Number(destiStateCode)) &&(gstRegType &&  (gstRegType !='SEZ Registered' && getLocationGSTRegType !='FTWZ' )))
			if((Number(locationGstNumber) == Number(destiStateCode)) &&(gstRegType &&  (gstRegType !=11 && getLocationGSTRegType !=10 )))
				currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra});                        
			//If location state and customer's address state does not matches set gst type to inter.
			else
				currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter});
		}
		else if(_logValidation(customerGstNumber) && _logValidation(locationGstNumber))
		{
			locationGstNumber = locationGstNumber.toString();
			locationGstNumber = locationGstNumber.substr(0, 2);

			customerGstNumber = customerGstNumber.toString();
			customerGstNumber = customerGstNumber.substr(0, 2);

			//if((Number(locationGstNumber) == Number(customerGstNumber)) && (gstRegType && (gstRegType !='SEZ Registered' && getLocationGSTRegType !='FTWZ')))
			if((Number(locationGstNumber) == Number(customerGstNumber)) && (gstRegType && (gstRegType !=11 && getLocationGSTRegType !=10)))
				currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra});
			else
				currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter});                        
		}
		else
			currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter});

		currentRecordObj.setValue({fieldId: 'custbody_gst_total_cgst',value: '',});
		currentRecordObj.setValue({fieldId: 'custbody_gst_totaligst',value: '',});
		currentRecordObj.setValue({fieldId: 'custbody_gst_totalsgst',value: '',});
	}// end function SourceLocationDetails()

	function searchOnLocation(location)
	{
		var getLocationGstNumber;
		var getLocationGSTRegType='';
		var stateValue='';
		var subsidiarySearchObj = search.create({
			type: "location",
			filters:
				[
					["internalid","anyof",location]
					],
					columns:
						[
							search.createColumn({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"}),
							search.createColumn({name: "custrecord_gst_registration_type", join:"address" ,label:"GST Registration Type"}),
							search.createColumn({name: "state", join:"address" ,label:"State"})
							]
		});
		var searchResultCount = subsidiarySearchObj.runPaged().count;

		subsidiarySearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			getLocationGstNumber = result.getValue({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"});
			getLocationGSTRegType = result.getText({name: "custrecord_gst_registration_type", join:"address" ,label:"GST Registration Type"});
			stateValue = result.getValue({name: "state", join:"address" ,label:"State"});
			return true;
		});
		//return getLocationGstNumber;
		return getLocationGstNumber +'$$'+ getLocationGSTRegType +'$$'+ stateValue;
	}// end function searchOnLocation(location)

	function GetTaxCodeFromMatrix(gstType,scheduleId)
	{
		var filterTaxCodeMatrix = [];
		var columnTaxCodeMatrix = [];

		filterTaxCodeMatrix.push(search.createFilter({name: 'isinactive',operator: search.Operator.IS,values: false}));
		filterTaxCodeMatrix.push(search.createFilter({name: 'custrecord_gst_type',operator: search.Operator.IS,values: gstType}));
		filterTaxCodeMatrix.push(search.createFilter({name: 'custrecord_gst_item_schedule',operator: search.Operator.IS,values: scheduleId}));

		columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_gst_tax_code'}));
		columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_gst_reversal_taxcode'}));

		var taxCodeSearch = search.create({"type": "customrecord_gst_tax_code_matrix","filters": filterTaxCodeMatrix,"columns": columnTaxCodeMatrix});
		return taxCodeSearch;
	}
	function getPlaceofSupply(placeofSupply){

		var placeofSupplyValue = "";

		if(placeofSupply){
			var customrecord_gst_state_list_SearchObj = search.create({
				type: "customrecord_gst_state_list_",
				filters:
					[
						["custrecord_gst_state_abbreviation","is",placeofSupply]
						],
						columns:
							[
								search.createColumn({name: "internalid", label: "Internal ID"})		      
								]
			});
			var searchResultCount = customrecord_gst_state_list_SearchObj.runPaged().count;

			customrecord_gst_state_list_SearchObj.run().each(function(result){
				// .run().each has a limit of 4,000 results
				placeofSupplyValue = result.getValue({name: "internalid", label: "Internal ID"});
				return true;
			});
		}		

		return placeofSupplyValue;
	}
	function _logValidation(value) 
	{
		if(value!='null' && value != null && value != '' && value != undefined && value != 'undefined' && value != 'NaN' && value != NaN) 
		{
			return true;
		}
		else 
		{ 
			return false;
		}
	}
	return {
		pageInit: pageInit,
		fieldChanged: fieldChanged,
		postSourcing: postSourcing
	};
		});
