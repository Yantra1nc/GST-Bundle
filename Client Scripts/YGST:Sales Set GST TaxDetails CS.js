/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @Author 
 */

/*************************************************************
Script Name: YGST:Sales Set GST TaxDetails CS
Script Type: Client Script
Created Date: 10/06/2020
Created By: Prashant Lokhande
Company : Yantra Inc.
Description: This script will set all GST transaction details. 
 *************************************************************/

define(['N/currentRecord', 'N/record', 'N/search', 'N/runtime', 'N/log','N/https','N/url'],

		function(currentRecord, record, search, runtime, log, https, url) 
		{
	var getIndiaSubsidiary = [];
	var intra = 1;
	var inter = 2;
	var gstRegType='';
	var isEnable = runtime.isFeatureInEffect({feature: "LOCATIONS"});
	function pageInit(scriptContext) 
	{
		try{

			var addressId='';
			var addressObject = "";
			var getLocationGstNumber = '';
			var getLocationGSTRegType='';
			var placeofSupplyValue='';

			var currentRecordObj    = scriptContext.currentRecord;
			var tranSubsidiary      = window.nlapiGetFieldValue('subsidiary')
			var scriptObj 			= runtime.getCurrentScript();
			var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});			
			var billingAddressParam= scriptObj.getParameter({name:'custscript_ygst_billing_address_param'});

			//------------------------------------ Start - Condition for to compare multi India Subsidiary ----------------------------------------------------------//
			var indiaSubObj	= false;
			var splitSub	= getAccountSubsidiary.split(",");
			var subLength	= splitSub.length;
			for(var i=0; i<subLength; i++) {
				if(Number(splitSub[i]) == Number(tranSubsidiary)) {
					indiaSubObj	= true;
				}
			}
			//------------------------------------ End - Condition for to compare multi India Subsidiary ----------------------------------------------------------//
			if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj)
			{
				if(scriptContext.mode == 'copy')
				{
					var lineItemCount = currentRecordObj.getLineCount({sublistId: 'item'});
					for (var i = 0; i < lineItemCount; i++)
					{
						currentRecordObj.selectLine({sublistId: 'item',line: i});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						currentRecordObj.commitLine({sublistId: 'item'});
					}// end for (var i = 0; i < lineItemCount; i++)
					return;
				}// end if(scriptContext.mode == 'copy')

				//var customerId = currentRecordObj.getValue({fieldId: 'entity'});
				if(billingAddressParam !=true){
					//addressId = currentRecordObj.getValue({fieldId: 'shipaddresslist'});		
					addressObject = currentRecordObj.getSubrecord({fieldId: 'shippingaddress'});
				}
				//else if(billingAddressParam==true){
				else{
					//addressId  = currentRecordObj.getValue({fieldId: 'billaddresslist'});	
					addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
				}

				if (scriptContext.mode != 'edit' && scriptContext.mode != 'xedit') 
				{
					//addressObject = setEntityGstDetails(customerId, addressId);

					if(_dataValidation(addressObject))
					{
						/*var entityStateCode = addressObject[0].entitystatecode;
						var entityGstNumber = addressObject[0].entitygstin;				
						var addrCountry = addressObject[0].entityCountry;

						var placeofSupply = addressObject[0].stateValue;					
						gstRegType = addressObject[0].gstRegType;*/

						var entityStateCode = addressObject.getValue('custrecord_gst_addressstatecode');
						var entityGstNumber = addressObject.getValue('custrecord_gst_nocustomeraddr');				
						var addrCountry = addressObject.getValue('country');

						var placeofSupply = addressObject.getValue('state');					
						//gstRegType = addressObject.getText('custrecord_gst_registration_type');
						gstRegType = addressObject.getValue('custrecord_gst_registration_type');

						if(placeofSupply){
							placeofSupplyValue =  getPlaceofSupply(placeofSupply);
						}

						//if((gstRegType =='SEZ Registered') || (addrCountry && addrCountry != "IN")){
						if((gstRegType ==11) || (addrCountry && addrCountry != "IN")){//11- SEZ Registered
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
					if(placeofSupplyValue)
						currentRecordObj.setValue({fieldId: 'custbody_gst_place_of_supply',value: placeofSupplyValue,ignoreFieldChange: true,fireSlavingSync: true});					
					if(entityGstNumber)		
						currentRecordObj.setValue({fieldId: 'custbody_gst_customerregno',value: entityGstNumber,ignoreFieldChange: true,fireSlavingSync: true});
					else
						currentRecordObj.setValue({fieldId: 'custbody_gst_customerregno',value: '',ignoreFieldChange: true,fireSlavingSync: true});
					if(entityStateCode)
						currentRecordObj.setValue({fieldId: 'custbody_gst_destinationstate',value: entityStateCode,ignoreFieldChange: true,fireSlavingSync: true});
					else
						currentRecordObj.setValue({fieldId: 'custbody_gst_destinationstate',value: '',ignoreFieldChange: true,fireSlavingSync: true});

					//if((addrCountry && addrCountry != "IN") || (gstRegType && gstRegType=='DEXP'))
					if((addrCountry && addrCountry != "IN") || (gstRegType && gstRegType==9))//9-'DEXP'
						currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: true,ignoreFieldChange: true,fireSlavingSync: true});                    
					else
						currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: false,ignoreFieldChange: true,fireSlavingSync: true});
				}// end if (scriptContext.mode != 'edit' && scriptContext.mode != 'xedit')
				if (!isEnable) 
				{
					getLocationGstNumber = searchOnSubsidiary(tranSubsidiary);
					currentRecordObj.setValue({fieldId: 'custpage_location',value: getLocationGstNumber,ignoreFieldChange: true,fireSlavingSync: true});
				}// end if (!isEnable)
				else
				{
					var getLocation = currentRecordObj.getValue({fieldId: 'location'});
					if (_dataValidation(getLocation))
					{
						var locationDetails = searchOnLocation(getLocation);

						if(locationDetails){
							var splitLocationDetails = locationDetails.split('$$');
							getLocationGstNumber = splitLocationDetails[0];					
							getLocationGSTRegType = splitLocationDetails[1];
						}
						currentRecordObj.setValue({fieldId: 'custbody_gst_locationregno',value: getLocationGstNumber,ignoreFieldChange: true,fireSlavingSync: true});
					}// end if (_dataValidation(getLocation))                    
				}// else
				var customerGstNumber = currentRecordObj.getValue({fieldId: 'custbody_gst_customerregno'});
				var custGSTStateCode = currentRecordObj.getValue({fieldId: 'custbody_gst_destinationstate'});

				if(!_dataValidation(customerGstNumber) && _dataValidation(custGSTStateCode) && _dataValidation(getLocationGstNumber))
				{
					if(!addressObject){
						//addressObject = setEntityGstDetails(customerId, addressId);
						if(billingAddressParam !=true){									
							addressObject = currentRecordObj.getSubrecord({fieldId: 'shippingaddress'});
						}
						else{	
							addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
						}
					}
					if(_dataValidation(addressObject))
					{
						/*var entityStateCode = addressObject[0].entitystatecode;
						var entityGstNumber = addressObject[0].entitygstin;	
						var addrCountry = addressObject[0].entityCountry;
						gstRegType = addressObject[0].gstRegType;*/

						var entityStateCode = addressObject.getValue('custrecord_gst_addressstatecode');
						var entityGstNumber = addressObject.getValue('custrecord_gst_nocustomeraddr');				
						var addrCountry = addressObject.getValue('country');				
						//gstRegType = addressObject.getText('custrecord_gst_registration_type');
						gstRegType = addressObject.getValue('custrecord_gst_registration_type');

						//if((gstRegType =='SEZ Registered') || (addrCountry && addrCountry != "IN")){
						if((gstRegType ==11) || (addrCountry && addrCountry != "IN")){//11-SEZ Registered
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
					//if ((Number(getLocationGstNumber) == Number(custGSTStateCode)) && (gstRegType && (gstRegType !='SEZ Registered' && getLocationGSTRegType !='FTWZ') && gstRegType !='DEXP' && gstRegType !='UIN Holder') ){
					//11-SEZ Registered , 10-FTWZ, 9-DEXP, 3- UIN Holder
					if ((Number(getLocationGstNumber) == Number(custGSTStateCode)) && (gstRegType && (gstRegType !=11 && getLocationGSTRegType !=10) && gstRegType !=9 && gstRegType !=3) ){
						currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra,ignoreFieldChange: true,fireSlavingSync: true});
					}
					//If location state and customer's address state does not matches set gst type to inter.
					else{
						currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter,ignoreFieldChange: true,fireSlavingSync: true});
					}
				}
				else if(_dataValidation(customerGstNumber) && _dataValidation(getLocationGstNumber))
				{	
					if(!addressObject){
						//addressObject = setEntityGstDetails(customerId, addressId);
						if(billingAddressParam !=true){									
							addressObject = currentRecordObj.getSubrecord({fieldId: 'shippingaddress'});
						}
						else{	
							addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
						}
					}
					if(_dataValidation(addressObject))
					{
						/*var entityStateCode = addressObject[0].entitystatecode;
						var entityGstNumber = addressObject[0].entitygstin;	
						var addrCountry = addressObject[0].entityCountry;
						gstRegType = addressObject[0].gstRegType;*/

						var entityStateCode = addressObject.getValue('custrecord_gst_addressstatecode');
						var entityGstNumber = addressObject.getValue('custrecord_gst_nocustomeraddr');				
						var addrCountry = addressObject.getValue('country');				
						//gstRegType = addressObject.getText('custrecord_gst_registration_type');
						gstRegType = addressObject.getValue('custrecord_gst_registration_type');

						//if((gstRegType && gstRegType =='SEZ Registered') || (addrCountry && addrCountry != "IN")){
						if((gstRegType && gstRegType ==11) || (addrCountry && addrCountry != "IN")){//11-SEZ Registered
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

					customerGstNumber = customerGstNumber.toString();
					customerGstNumber = customerGstNumber.substr(0, 2);

					//if ((Number(getLocationGstNumber) == Number(customerGstNumber) )&& (gstRegType && (gstRegType !='SEZ Registered' && getLocationGSTRegType !='FTWZ')&& gstRegType !='DEXP' && gstRegType !='UIN Holder')){
					//11- SEZ Registered, 10-FTWZ,9-DEXP,3- UIN Holder
					if ((Number(getLocationGstNumber) == Number(customerGstNumber) )&& (gstRegType && (gstRegType !=11 && getLocationGSTRegType !=10)&& gstRegType !=9 && gstRegType !=3)){
						currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra,ignoreFieldChange: true,fireSlavingSync: true});
					}
					//If location state and customer's address state does not matches set gst type to inter.
					else{
						currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter,ignoreFieldChange: true,fireSlavingSync: true});
					}
				}
				return true;
			}//end if(getIndiaSubsidiary && getIndiaSubsidiary.indexOf(tranSubsidiary) != -1)
		}// end try
		catch (exp) {
			log.error('Exception Caught PageInit:- ', exp.id);
			log.error('Exception Caught PageInit:- ', exp.message);
		}
	}// end function pageInit(scriptContext)

	function fieldChanged(scriptContext) 
	{
		try{
			var currentRecordObj = scriptContext.currentRecord;
			var tranSubsidiary = window.nlapiGetFieldValue('subsidiary')
			var scriptObj = runtime.getCurrentScript();
			var getAccountSubsidiary = scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});           
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
				/*if(scriptContext.fieldId == 'entity'){

					//var billingAddressParam= scriptObj.getParameter({name:'custscript_ygst_billing_address_param'});
					//var entityId = currentRecordObj.getValue({fieldId: 'entity'});

					if(billingAddressParam == true ){
						addressId = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));
					}
					else	{
						addressId = Number(currentRecordObj.getValue({fieldId: 'shipaddresslist'}));				
					}

					if(entityId && addressId )
						addressObject = setEntityGstDetails(entityId, addressId);

					if(_dataValidation(addressObject))	{
						gstRegType = addressObject[0].gstRegType;
						addrCountry = addressObject[0].entityCountry;
					}			
					
					var addrCountry = addressObject.getValue('country');									
					//var gstRegType = addressObject.getText('custrecord_gst_registration_type');
					var gstRegType = addressObject.getValue('custrecord_gst_registration_type');
					
				}*/

				if((scriptContext.sublistId != 'item' && scriptContext.fieldId == "location") || scriptContext.fieldId == "custpage_location")
				{
					var getLocation = Number(currentRecordObj.getValue({fieldId: 'location'}));
					var getVirtualLocation = Number(currentRecordObj.getValue({fieldId: 'custpage_location'}));
					if(getLocation || getVirtualLocation){
						if(currentRecordObj){
							SourceLocationDetails(currentRecordObj);
						}
					}// end if ((scriptContext.fieldId == "location" || scriptContext.fieldId == "custpage_location") && !(_dataValidation(scriptContext.sublistId)))
				}


			if (scriptContext.fieldId == "shipaddresslist" ||  scriptContext.fieldId == "billaddresslist")
				//if (scriptContext.fieldId == "shippingaddress" ||  scriptContext.fieldId == "billingaddress")
				{
					var getShippingAddress = Number(currentRecordObj.getValue({fieldId: 'shipaddresslist'}));
					var getBillingAddress = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));
					//var getShippingAddress = Number(currentRecordObj.getValue({fieldId: 'shippingaddress'}));
					//var getBillingAddress = Number(currentRecordObj.getValue({fieldId: 'billingaddress'}));
					if(getShippingAddress || getBillingAddress)
					{
						var addressId ="";
						var addressObject ="";
						var placeofSupplyValue ="";

						var entityId = currentRecordObj.getValue({fieldId: 'entity'});
						var isBillingAddress = currentRecordObj.getValue({fieldId: 'custbody_gst_billing_address'});

						if(billingAddressParam == true ){
							addressId = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));
						}
						else{
							addressId = Number(currentRecordObj.getValue({fieldId: 'shipaddresslist'}));							
						}
						if(entityId && addressId){
							addressObject = setEntityGstDetails(entityId, addressId);
						}
						
						/*if(billingAddressParam ==true){							
							addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
						}
						else{
							addressObject = currentRecordObj.getSubrecord({fieldId: 'shippingaddress'});
						}*/
						
						if(_dataValidation(addressObject))
						{
							var entityStateCode = addressObject[0].entitystatecode;
							var entityGstNumber = addressObject[0].entitygstin;	
							var addrCountry = addressObject[0].entityCountry;
							var gstRegType = addressObject[0].gstRegType;
							var placeofSupply = addressObject[0].stateValue;
							
							//alert("addressObject=="+JSON.stringify(addressObject));
						/*	var entityStateCode = addressObject.getValue('custrecord_gst_addressstatecode');
							var entityGstNumber = addressObject.getValue('custrecord_gst_nocustomeraddr');				
							var addrCountry = addressObject.getValue('country');
							//var gstRegType = addressObject.getText('custrecord_gst_registration_type');
							var gstRegType = addressObject.getValue('custrecord_gst_registration_type');
							var placeofSupply = addressObject.getValue('state');		*/						

							if(placeofSupply){
								placeofSupplyValue =  getPlaceofSupply(placeofSupply);
							}

							if((gstRegType && gstRegType ==11) ||  (addrCountry && addrCountry != "IN")){//11-SEZ Registered
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
						if(placeofSupplyValue)
							currentRecordObj.setValue({fieldId: 'custbody_gst_place_of_supply',value: placeofSupplyValue,ignoreFieldChange: true,fireSlavingSync: true});
						
						if(_dataValidation(entityGstNumber))	
							currentRecordObj.setValue({fieldId: 'custbody_gst_customerregno',value: entityGstNumber,ignoreFieldChange: true,fireSlavingSync: true});
						else
							currentRecordObj.setValue({fieldId: 'custbody_gst_customerregno',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						
						if(_dataValidation(entityStateCode))
							currentRecordObj.setValue({fieldId: 'custbody_gst_destinationstate',value: entityStateCode,ignoreFieldChange: true,fireSlavingSync: true});
						else
							currentRecordObj.setValue({fieldId: 'custbody_gst_destinationstate',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						
						//if(addrCountry != "IN")
						if((addrCountry && addrCountry != "IN") || (gstRegType && gstRegType=='DEXP') )
						//if((addrCountry && addrCountry != "IN") || (gstRegType && gstRegType==9) )//9-DEXP                                           
							currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: true,ignoreFieldChange: true,fireSlavingSync: true});                    
						else
							currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: false,ignoreFieldChange: true,fireSlavingSync: true});

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
						if (Number(locationGSTNumber) == Number(entityStateCode) && (gstRegType !='SEZ Registered' && getLocationGSTRegType !='FTWZ')&& gstRegType !='DEXP' && gstRegType !='UIN Holder' )
						//if (Number(locationGSTNumber) == Number(entityStateCode) && (gstRegType !=11 && getLocationGSTRegType !=10)&& gstRegType !=9 && gstRegType !=3 )
						{
							currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra,ignoreFieldChange: true,fireSlavingSync: true});
						}                   
						else 
						{
							currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter,ignoreFieldChange: true,fireSlavingSync: true});
						}                   
						currentRecordObj.setValue({fieldId: 'custbody_gst_totalcgst',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						currentRecordObj.setValue({fieldId: 'custbody_gst_totaligst',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						currentRecordObj.setValue({fieldId: 'custbody_gst_totalsgst',value: '',ignoreFieldChange: true,fireSlavingSync: true});
					}// end if (scriptContext.fieldId == "shipaddresslist" || scriptContext.fieldId == "custbody_gst_billing_address" || scriptContext.fieldId == "billaddresslist")
				}

				if(scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_itemschedule') 
				{
					var getLineItemSchedule = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule'});
					if(getLineItemSchedule)
					{
						var addressObject;

						/*	var entityId = currentRecordObj.getValue({fieldId: 'entity'});

						if(billingAddressParam == true ){
							var billingAddress = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));
							addressObject = setEntityGstDetails(entityId, billingAddress);
						}
						else	{
							var shippingAddress = Number(currentRecordObj.getValue({fieldId: 'shipaddresslist'}));
							if(entityId && shippingAddress){
								addressObject = setEntityGstDetails(entityId, shippingAddress);
							}
						}
						if(_dataValidation(addressObject))
						{
							var gstRegType = addressObject[0].gstRegType;
						}*/

						if(billingAddressParam == true ){
							addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
						}
						else{
							addressObject = currentRecordObj.getSubrecord({fieldId: 'shippingaddress'});
						}
						if(_dataValidation(addressObject))
						{
							var gstRegType = addressObject.getValue('custrecord_gst_registration_type');
						}
						
						var taxCodeId;
						var scheduleId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule'});

						var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});
						var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});

						var sezPaymentType = currentRecordObj.getText({fieldId: 'custbody_gst_exprt_typ'});

						//Search on GST Tax Code Matrix to get the tax code, reversal tax code, reversal purchase and payable items for cgst, sgst and igst.
						if(_dataValidation(gstType) && _dataValidation(scheduleId))
						{
							//if(customerIsNRI == true && scheduleId != 1 )
							//if((customerIsNRI == true) || (gstRegType && ( (gstRegType =='SEZ Registered' && sezPaymentType=='WOPAY' ) || gstRegType =='DEXP' || gstRegType =='UIN Holder' ) )&& scheduleId != 1 )
							//if((customerIsNRI == true && sezPaymentType=='WOPAY' ) ||   (gstRegType =='SEZ Registered' && sezPaymentType=='WOPAY' ) || gstRegType =='UIN Holder' || gstRegType =='DEXP' && scheduleId != 1 )
							if((customerIsNRI == true && sezPaymentType=='WOPAY' ) ||   (gstRegType ==11 && sezPaymentType=='WOPAY' ) || gstRegType ==3 || gstRegType ==9 && scheduleId != 1 )
							{
								//alert('scheduleId : '+scheduleId);
								alert('You can not change Item schedule for this Export/SEZWOP/Deemed Export/UIN Holder customer');
								//alert('You can not change Item schedule for this Export customer');
								//currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',value: 1,ignoreFieldChange: false});
								currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',value: 1,ignoreFieldChange: true,fireSlavingSync: true});
								//currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',value: 1,ignoreFieldChange: true,fireSlavingSync: true});
							}
							else
							{
								if(gstType && scheduleId ){
									var taxCodeSearch = GetTaxCodeFromMatrix(gstType,scheduleId);
									var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});							
									if (_dataValidation(arrSearchResults[0]))
									{
										taxCodeId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
									}
								}
							}
						}
						if (_dataValidation(taxCodeId))
							//alert(taxCodeId)
							currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeId,ignoreFieldChange: false,fireSlavingSync: true});					

						return true;
					}//end if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_itemschedule')
				}

				if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'taxcode')
				{
					var getLineTaxCode = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode'});
					if(getLineTaxCode)
					{
						var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});
						var LineTaxCode = currentRecordObj.getCurrentSublistText({sublistId: 'item',fieldId: 'taxcode'});
						if(customerIsNRI == true && _dataValidation(LineTaxCode) && LineTaxCode != "IGST:Inter_0%")
						{
							if(LineTaxCode.includes("Intra") || LineTaxCode.includes("Inter"))
							{
								alert('You can not change Tax code for this Export customer');
							}
						}
					}//end if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'taxcode')
				}
			}// end if(getIndiaSubsidiary && getIndiaSubsidiary.indexOf(tranSubsidiary) != -1)
		}// end try
		catch (exp) {
			log.error('Exception Caught fieldChanged:- ', exp.id);
			log.error('Exception Caught fieldChanged:- ', exp.message);
		}
	}
	function postSourcing(scriptContext)
	{
		try{

			var addressObject="";
			var addressId ="";
			var gstRegType="";
			var addrCountry="";

			var currentRecordObj = scriptContext.currentRecord;
			//var tranSubsidiary = currentRecordObj.getValue({fieldId: 'subsidiary'});
			var tranSubsidiary = window.nlapiGetFieldValue('subsidiary')
			var scriptObj = runtime.getCurrentScript();
			var getAccountSubsidiary = scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
			getIndiaSubsidiary.push(getAccountSubsidiary);       
			//Condition for to compare multi India Subsidiary.
			var indiaSubObj	= false;
			var splitSub	= getAccountSubsidiary.split(",");
			//log.debug({title: "postSourcing: splitSub==", details: splitSub});
			var subLength	= splitSub.length;
			for(var i=0; i<subLength; i++) {
				if(Number(splitSub[i]) == Number(tranSubsidiary)) {
					indiaSubObj	= true;
				}
			}
			//log.debug({title: "postSourcing:indiaSubObj==", details: indiaSubObj});
			if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj)
			{

				//log.debug({title: "postSourcing:indiaSubObj==", details: indiaSubObj});

				if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')
				{
					var billingAddressParam= scriptObj.getParameter({name:'custscript_ygst_billing_address_param'});
/*					var entityId = currentRecordObj.getValue({fieldId: 'entity'});

					if(billingAddressParam == true ){
						addressId = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));
					}
					else	{
						addressId = Number(currentRecordObj.getValue({fieldId: 'shipaddresslist'}));				
					}

					if(entityId && addressId )
						addressObject = setEntityGstDetails(entityId, addressId);

					if(_dataValidation(addressObject))	{
						gstRegType = addressObject[0].gstRegType;
						addrCountry = addressObject[0].entityCountry;
					}	*/		
					
					if(billingAddressParam == true ){
						addressObject = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
					}
					else	{
						addressObject = currentRecordObj.getSubrecord({fieldId: 'shippingaddress'});				
					}
					if(_dataValidation(addressObject))	{
						gstRegType = addressObject.getValue('custrecord_gst_registration_type');
						addrCountry = addressObject.getValue('country');
					}
					var sezPaymentType = currentRecordObj.getText({fieldId: 'custbody_gst_exprt_typ'});

					//if (( (gstRegType && gstRegType== 'SEZ Registered') || (addrCountry && addrCountry != "IN")) && !_dataValidation(sezPaymentType))
					//alert('gstRegType=='+gstRegType);
					//alert('sezPaymentType=='+sezPaymentType);
					//alert('addrCountry=='+addrCountry);
					//if (( (gstRegType && gstRegType== 'SEZ Registered') && !_dataValidation(sezPaymentType)) || ((addrCountry && addrCountry != "IN") && !_dataValidation(sezPaymentType )))
					if (( (gstRegType && gstRegType== 11) && !_dataValidation(sezPaymentType)) || ((addrCountry && addrCountry != "IN") && !_dataValidation(sezPaymentType )))
					{
						var itemId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
						if(_dataValidation(itemId))
						{
							alert('Please select a Export/SEZ Payment Type  first.');
							//currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: '',ignoreFieldChange: false,fireSlavingSync: true});
							currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: '',ignoreFieldChange: true,fireSlavingSync: true});
							return false;
						}
					}//end if (!_dataValidation(location))

					if(isEnable)
						var location = currentRecordObj.getValue({fieldId: 'location'});
					else
						var location = currentRecordObj.getValue({fieldId: 'custpage_location'});

					if (!_dataValidation(location)) 
					{
						var itemId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
						if(_dataValidation(itemId))
						{
							alert('Please select a location first.');
							currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: '',ignoreFieldChange: false,fireSlavingSync: true});
							return false;
						}
					}//end if (!_dataValidation(location))
					else 
					{                  
						var itemId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
						if(_dataValidation(itemId)){
							var getTaxCode = search.lookupFields({type: 'item',id: itemId,columns: 'custitem_gst_itemschedule'});

							if (getTaxCode && getTaxCode.custitem_gst_itemschedule[0]){				
								var scheduleId = getTaxCode.custitem_gst_itemschedule[0].value;	
							}							
							else
							{
								alert('Schedule is not available for this particular item');
								return;
							}	
						}						
						var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});
						if(_dataValidation(gstType) && _dataValidation(scheduleId))
						{
							if(gstType && scheduleId){
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
								var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});
								//if(customerIsNRI == false && _dataValidation(taxCodeInternalId) && (gstRegType && (gstRegType !='SEZ Registered' || sezPaymentType !='WOPAY') && gstRegType !='DEXP' && gstRegType !='UIN Holder'))
								if(customerIsNRI == false && _dataValidation(taxCodeInternalId) && (gstRegType && (gstRegType !=11  || sezPaymentType !='WOPAY') && gstRegType !=9 && gstRegType !=3))
								{
									if(taxCodeInternalId){
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false,fireSlavingSync: true});
									}
								}
								else if(customerIsNRI == true && gstRegType !=9 &&  sezPaymentType !='WOPAY' ){
									if(taxCodeInternalId){
										//alert("taxCodeInternalId"+taxCodeInternalId);
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false,fireSlavingSync: true});
									}
								}
								else {  
									//currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',value: 1,ignoreFieldChange: false});
									currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',value: 1,ignoreFieldChange: false,fireSlavingSync: true});
								}
							}
						}// end if(_dataValidation(gstType) && _dataValidation(scheduleId))
						return true;
					}// else
					return true;
				}// end if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')
				if(scriptContext.fieldId == 'entity') 
				{	  
					if(!isEnable)
					{						
						var getLocationGstNumber = searchOnSubsidiary(tranSubsidiary);
						if(getLocationGstNumber){
							currentRecordObj.setValue({fieldId: 'custpage_location',value: getLocationGstNumber,ignoreFieldChange: true,fireSlavingSync: true});
						}
					}
				}// end if(scriptContext.fieldId == 'entity')

			}//end if(getIndiaSubsidiary && getIndiaSubsidiary.indexOf(tranSubsidiary) != -1) 
		}catch(e){
			log.error({title: e.name,details: e.message}); 
		}// end catch
	}// end function postSourcing(scriptContext)
//	******************* Function Block Starts..... ************************** */

	function setEntityGstDetails(entityId, addressId)
	{
		var o_json_resource_data_parse ="";
		if(entityId && addressId){

			var recoType = 'Sale';
			var resposeObject = '';

			var ResolveURL = url.resolveScript({scriptId: 'customscript_ygst_get_entity_state_sut',deploymentId: 'customdeploy_ygst_get_entity_state_sut',returnExternalUrl: true});

			ResolveURL += "&i_entiry_id=" + entityId;
			ResolveURL += "&s_Ship_To=" + addressId;
			ResolveURL += "&s_record_type=" + recoType;

			resposeObject = https.get({url: ResolveURL});										   

			if(_dataValidation(resposeObject)) 
			{
				var o_json_resource_data = resposeObject.body;			
				o_json_resource_data_parse = JSON.parse(o_json_resource_data);               
			}// end if(_dataValidation(resposeObject))             
		}//end if(entityId)
		if(_dataValidation(o_json_resource_data_parse))
			return o_json_resource_data_parse;
	}//end function setEntityGstDetails(entityId, addressId)
	function searchOnSubsidiary(subsidiary)
	{
		var getLocationGstNumber="";
		if(subsidiary){
			var subsidiarySearchObj = search.create({
				type: "subsidiary",
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
				// .run().each has a limit of 4,000 results
				getLocationGstNumber = result.getValue({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"});            
				return true;
			});
		}
		return getLocationGstNumber;
	}// end function searchOnSubsidiary(subsidiary)
	function searchOnLocation(location)
	{
		var getLocationGstNumber="";
		var getLocationGSTRegType = "";
		if(location){
			var subsidiarySearchObj = search.create({
				type: "location",
				filters:
					[
						["internalid","anyof",location]
						],
						columns:
							[
								search.createColumn({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"}),
								search.createColumn({name: "state", join: "address"}),
								search.createColumn({name: "custrecord_gst_registration_type", join:"address" ,label:"GST Registration Type"})
								]
			});
			var searchResultCount = subsidiarySearchObj.runPaged().count;
			subsidiarySearchObj.run().each(function(result){
				getLocationGstNumber = result.getValue({name: "custrecord_gst_nocustomeraddr", join: "address",label: "GST Number"});
				//getLocationGSTRegType = result.getValue({name: "custrecord_gst_registration_type", join:"address" ,label:"GST Registration Type"});
				getLocationGSTRegType = result.getText({name: "custrecord_gst_registration_type", join:"address" ,label:"GST Registration Type"});
				return true;
			});	
		}
		return getLocationGstNumber +'$$'+ getLocationGSTRegType;
	}// end function searchOnLocation(location)


	function SourceLocationDetails(currentRecordObj)
	{
		if(currentRecordObj){
			var getLocationGstNumber="";
			var getLocationGSTRegType="";
			var gstRegType="";

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
						getLocationGstNumber = splitLocationDetails[0];				
						getLocationGSTRegType = splitLocationDetails[1];
					}
				}				
			}

			var objAddress;
			var entityId = currentRecordObj.getValue({fieldId: 'entity'});

			var billingAddress = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));			
			//objAddress = setEntityGstDetails(entityId, billingAddress);
			objAddress = currentRecordObj.getSubrecord({fieldId: 'billingaddress'});
			if(_dataValidation(objAddress)){
				//gstRegType = objAddress[0].gstRegType;
				gstRegType = objAddress.getValue('custrecord_gst_registration_type');
			}
			if(getLocationGstNumber){
				currentRecordObj.setValue({fieldId: 'custbody_gst_locationregno',value: getLocationGstNumber,ignoreFieldChange: true,fireSlavingSync: true});
			}
			if(!getLocationGstNumber){
				currentRecordObj.setValue({fieldId: 'custbody_gst_locationregno',value: '',ignoreFieldChange: true,fireSlavingSync: true});
			}
			var customerGstNumber = currentRecordObj.getValue({fieldId: 'custbody_gst_customerregno'});
			var destiStateCode = currentRecordObj.getValue({fieldId: 'custbody_gst_destinationstate'});

			if (!(_dataValidation(customerGstNumber)) && _dataValidation(getLocationGstNumber) && _dataValidation(destiStateCode))
			{            
				getLocationGstNumber = getLocationGstNumber.toString();
				getLocationGstNumber = getLocationGstNumber.substr(0, 2);

				//if( (Number(getLocationGstNumber) == Number(destiStateCode)) && (gstRegType !='SEZ Registered' && getLocationGSTRegType !='FTWZ') && gstRegType !='DEXP' && gstRegType !='UIN Holder')
				if( (Number(getLocationGstNumber) == Number(destiStateCode)) && (gstRegType !=11 && getLocationGSTRegType !=10) && gstRegType !=9 && gstRegType !=3)
					currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra,ignoreFieldChange: true,fireSlavingSync: true});                        
				//If location state and customer's address state does not matches set gst type to inter.
				else
					currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter,ignoreFieldChange: true,fireSlavingSync: true});
			}
			else if(_dataValidation(customerGstNumber) && _dataValidation(getLocationGstNumber))
			{
				getLocationGstNumber = getLocationGstNumber.toString();
				getLocationGstNumber = getLocationGstNumber.substr(0, 2);

				customerGstNumber = customerGstNumber.toString();
				customerGstNumber = customerGstNumber.substr(0, 2);

				//if((Number(getLocationGstNumber) == Number(customerGstNumber) ) && (gstRegType !='SEZ Registered' && getLocationGSTRegType !='FTWZ') && gstRegType !='DEXP' && gstRegType !='UIN Holder')
				if((Number(getLocationGstNumber) == Number(customerGstNumber) ) && (gstRegType !=11 && getLocationGSTRegType !=10) && gstRegType !=9 && gstRegType !=3)
					currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra,ignoreFieldChange: true,fireSlavingSync: true});
				else
					currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter,ignoreFieldChange: true,fireSlavingSync: true});                        
			}
			else
				currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter,ignoreFieldChange: true,fireSlavingSync: true});

			currentRecordObj.setValue({fieldId: 'custbody_gst_total_cgst',value: '',ignoreFieldChange: true,fireSlavingSync: true});
			currentRecordObj.setValue({fieldId: 'custbody_gst_totaligst',value: '',ignoreFieldChange: true,fireSlavingSync: true});
			currentRecordObj.setValue({fieldId: 'custbody_gst_totalsgst',value: '',ignoreFieldChange: true,fireSlavingSync: true});
		}
	}// end function SourceLocationDetails()

	function GetTaxCodeFromMatrix(gstType,scheduleId)
	{
		var taxCodeSearch="";
		if(gstType && scheduleId ){
			var filterTaxCodeMatrix = [];
			var columnTaxCodeMatrix = [];

			filterTaxCodeMatrix.push(search.createFilter({name: 'isinactive',operator: search.Operator.IS,values: false}));
			filterTaxCodeMatrix.push(search.createFilter({name: 'custrecord_gst_type',operator: search.Operator.IS,values: gstType}));
			filterTaxCodeMatrix.push(search.createFilter({name: 'custrecord_gst_item_schedule',operator: search.Operator.IS,values: scheduleId}));

			columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_gst_tax_code'}));
			columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_gst_reversal_taxcode'}));

			taxCodeSearch = search.create({"type": "customrecord_gst_tax_code_matrix","filters": filterTaxCodeMatrix,"columns": columnTaxCodeMatrix});

		}
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


	function _dataValidation(value) 
	{
		if(value!='null' && value != null && value != '' && value != undefined && value != 'undefined' && value != 'NaN' && value != NaN) 
		{
			return true;
		}
		else
		{ 
			return false;
		}
	}//end function _dataValidation(value)


	return {
		pageInit: pageInit,
		fieldChanged: fieldChanged,
		postSourcing: postSourcing
	};
		});
