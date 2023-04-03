/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/*************************************************************
Script Name: YGST:Sales Set GST taxDetails UES
Script Type: User Event Script
Created Date: 06/05/2020
Created By: Prashant Lokhande
Company : Yantra Inc.
Description: This script will set tax details on Sales side transactions.
 *************************************************************/


define(['N/search', 'N/error', 'N/record', 'N/runtime', 'N/ui/serverWidget'],

		function (search, error, record, runtime, serverWidget)
		{
	var GST_TAXCODE_MATRIX_ARR = {};
	function beforeLoad(scriptContext)
	{
		try 
		{
			var form = scriptContext.form;
			//Gets the Location field is enable or not.
			var isEnable = runtime.isFeatureInEffect({feature: "LOCATIONS"});
			if (!isEnable) 
			{
				form.addField({id: 'custpage_location',type: serverWidget.FieldType.TEXT,label: 'Location'});
			}   
		}// end try
		catch(e) 
		{
			log.error({title: e.name,details: e.message});
		}
	}// end function beforeLoad(scriptContext)
	function afterSubmit(scriptContext)
	{
		try 
		{
			var recordId = scriptContext.newRecord.id;
			var recordType = scriptContext.newRecord.type;
			var getIndiaSubsidiary = [];
			var locationStateCode = '';
			var intra = 1;
			var inter = 2;
			var totalSgstAmount = 0;
			var totalCgstAmount = 0;
			var totalIgstAmount = 0;
			var checkGstType="";
			var customerRecord = '';
			var gstRegType='';
			var placeofSupply="";

			var isEnable = runtime.isFeatureInEffect({feature: "LOCATIONS"});
			var tranSubsidiary = scriptContext.newRecord.getValue({fieldId: 'subsidiary'});
			log.debug('AfterSubmit tranSubsidiary: ',tranSubsidiary);

			var scriptObj = runtime.getCurrentScript();
			var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});//custscript_ygst_global_india_subsidiary
			log.debug('getAccountSubsidiary: ',getAccountSubsidiary);
			var billingAddressParam= scriptObj.getParameter({name:'custscript_ygst_billing_address_param'});

			//------------------------------ Start - Condition for to compare multi-India Subsidiary ------------------------//
			var indiaSubObj	= false;
			var splitSub	= getAccountSubsidiary.split(",");
			log.debug({title: "splitSub", details: splitSub});
			var subLength	= splitSub.length;
			for(var i=0; i<subLength; i++) {
				if(Number(splitSub[i]) == Number(tranSubsidiary)) {
					indiaSubObj	= true;
				}
			}
			log.debug({title: "indiaSubObj", details: indiaSubObj});
			//------------------------------ End - Condition for to compare multi-India Subsidiary ------------------------//

			if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj){
				var entityGstNumber = '';
				var placeofSupplyValue="";
				var addressObject="";

				getTaxCodeMatrixDetails();

				var loadRecordObject = record.load({type: recordType,id: recordId,isDynamic: true});

				var shipToStateCode = loadRecordObject.getValue({fieldId: 'custbody_gst_destinationstate'});				                
				var getLocationGstNumber = loadRecordObject.getValue({fieldId: 'custbody_gst_locationregno'});
				var gstType = loadRecordObject.getValue({fieldId: 'custbody_gst_gsttype'});
				var sezPaymentType = Number(loadRecordObject.getValue({fieldId: 'custbody_gst_exprt_typ'}));

				if(!billingAddressParam && (billingAddressParam == false || billingAddressParam=='false')){
					addressObject = loadRecordObject.getSubrecord({fieldId: 'shippingaddress'});
				}
				else{
					addressObject = loadRecordObject.getSubrecord({fieldId: 'billingaddress'});
				}

				if(_dataValidation(addressObject)){
					placeofSupply = addressObject.getValue('state');
					gstRegType = addressObject.getText('custrecord_gst_registration_type');
				}
				if(!_dataValidation(shipToStateCode))
				{                
					if(_dataValidation(addressObject))
					{
						shipToStateCode = addressObject.getValue('custrecord_gst_addressstatecode');
						//log.debug('AfterSubmit shipToStateCode: ',shipToStateCode);
						entityGstNumber = addressObject.getValue('custrecord_gst_nocustomeraddr');	
						//log.debug('AfterSubmit entityGstNumber: ',entityGstNumber);
					}

					if(_dataValidation(entityGstNumber))
						loadRecordObject.setValue({fieldId: 'custbody_gst_customerregno',value: entityGstNumber,ignoreFieldChange: true,fireSlavingSync: true});
					else
						loadRecordObject.setValue({fieldId: 'custbody_gst_customerregno',value: '',ignoreFieldChange: true,fireSlavingSync: true});

					if(_dataValidation(shipToStateCode))
						loadRecordObject.setValue({fieldId: 'custbody_gst_destinationstate',value: shipToStateCode,ignoreFieldChange: true,fireSlavingSync: true});
					else
						loadRecordObject.setValue({fieldId: 'custbody_gst_destinationstate',value: '',ignoreFieldChange: true,fireSlavingSync: true});
				}// end if(!_dataValidation(shipToStateCode))
				if(!_dataValidation(getLocationGstNumber))
				{
					if(!isEnable) 
					{
						var getLocationGstNumber = searchOnSubsidiary(tranSubsidiary);
						loadRecordObject.setValue({fieldId: 'custpage_location',value: getLocationGstNumber});                        
					}
					else
					{
						var getLocation =  loadRecordObject.getValue({fieldId: 'location'});
						if(_dataValidation(getLocation))
						{
							//var getLocationGstNumber = searchOnLocation(getLocation);
							var locationDetails = searchOnLocation(location);
							log.debug('AfterSubmit locationDetails : ', locationDetails);
							if(locationDetails){
								var splitLocationDetails = locationDetails.split('$$');
								log.debug('AfterSubmit  splitLocationDetails : ', splitLocationDetails);

								var getLocationGstNumber = splitLocationDetails[0];
								log.debug('AfterSubmit Location GSTIN : ',getLocationGstNumber);

								getLocationGSTRegType = splitLocationDetails[1];
								log.debug('AfterSubmit getLocationGSTRegType : ', getLocationGSTRegType);
							}

						}
					}
					loadRecordObject.setValue({fieldId: 'custbody_gst_locationregno',value: getLocationGstNumber});
				}// end if(!_dataValidation(getLocationGstNumber))
				if(!_dataValidation(gstType))
				{
					if(!_dataValidation(locationStateCode))
					{
						getLocationGstNumber = getLocationGstNumber.toString();
						locationStateCode = getLocationGstNumber.substr(0, 2);                    
					}
					if((Number(locationStateCode)== Number(shipToStateCode)) &&(gstRegType && gstRegType !='SEZ Registered' && gstRegType !='DEXP' && gstRegType !='UIN Holder' ))
					{
						loadRecordObject.setValue({fieldId: 'custbody_gst_gsttype',value: intra});
						checkGstType = 'intra'
							gstType =1;
					}                     
					else if(Number(locationStateCode)!= Number(shipToStateCode) && gstRegType =='SEZ Registered')
					{
						loadRecordObject.setValue({fieldId: 'custbody_gst_gsttype',value: inter});
						checkGstType = 'inter'
							gstType =2;
					}
					else
						loadRecordObject.setValue({fieldId: 'custbody_gst_gsttype',value: ''});
				}// end if(!_dataValidation(gstType))
				var customerIsNRI = '';                
				//if(runtime.executionContext == runtime.ContextType.USER_INTERFACE)
				//  customerIsNRI = loadRecordObject.getValue({fieldId: 'custbody_ygst_is_nri_customer'});
				//else
				//{
				/*		if(!(_dataValidation(customerRecord)))
				{
					var entityId = loadRecordObject.getValue({fieldId: 'entity'}); 
					customerRecord = record.load({type: record.Type.CUSTOMER,id: entityId});
				}   
				var country ="";

				if(!billingAddressParam && (billingAddressParam == false || billingAddressParam=='false')){
					country = getCountry(customerRecord,shippingAddress);
				}
				else if(billingAddressParam && (billingAddressParam == true || billingAddressParam=='true')){

					country = getCountry(customerRecord,billingAddress);
				}*/

				country = addressObject.getValue('country');				
				log.debug('country : ', country);
				if((country && country != "IN") || (gstRegType && gstRegType=='DEXP'))
				{                            
					loadRecordObject.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: true});
					customerIsNRI = true;
				}
				else
				{
					loadRecordObject.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: false});
					customerIsNRI = false;
				}

				if(placeofSupply){
					placeofSupplyValue =  getPlaceofSupply(placeofSupply);
					//log.debug('placeofSupplyValue PageInit 1: ',placeofSupplyValue);
				}

				if(placeofSupplyValue)
					loadRecordObject.setValue({fieldId: 'custbody_gst_place_of_supply',value: placeofSupplyValue,ignoreFieldChange: true,fireSlavingSync: true});

				log.debug('customerIsNRI : ', customerIsNRI);
				if(customerIsNRI == true)
				{
					loadRecordObject.setValue({fieldId: 'custbody_gst_inv_type',value: 3});
					//loadRecordObject.setValue({fieldId: 'custbody_gst_exprt_typ',value: 2});                    
				}
				if(gstRegType =='SEZ Registered'){
					loadRecordObject.setValue({fieldId: 'custbody_gst_inv_type',value: 2});
				}

				var item_count = loadRecordObject.getLineCount({sublistId: 'item'});
				log.debug('item count:-', item_count);
				//Load Search for discount Items...
				var discountItemSearch = search.load({id: 'customsearch_tds_wht_items'});
				var arrDiscountItems = discountItemSearch.run().getRange({start: 0,end: 1000});
				// Array for list of discount Items...
				var discountItemIds = [];
				var taxCodeInternalId = '';
				var taxRate = '';
				for (var t = 0; t < arrDiscountItems.length; t++) 
				{
					var discountId = arrDiscountItems[t].getValue({name: 'internalid'});
					discountItemIds.push(discountId);
				}// end for (var t = 0; t < arrDiscountItems.length; t++)
				log.debug('discountItemIds list:- : ', JSON.stringify(discountItemIds));
				for (var k = 0; k < item_count; k++) 
				{
					loadRecordObject.selectLine({sublistId: 'item',line: k});
					var getItem = loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'item',line: k});
					log.debug('getItem ', getItem);

					var getItemName = loadRecordObject.getSublistText({sublistId: 'item',fieldId: 'item',line: k});
					log.debug('getItemName ', getItemName);
					if(getItemName && getItemName !='End of Group')
					{
						if (discountItemIds.indexOf(getItem) == -1) 
						{
							var scheduleId;
							//if(customerIsNRI == true || (gstRegType =='SEZ Registered' && sezPaymentType=='WOPAY' ))
							if((customerIsNRI == true || gstRegType =='SEZ Registered' ) && sezPaymentType=='WOPAY' )
							{
								//scheduleId = 1;                            
								loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',value: 1});                            
							}
							else 
							{                          
								scheduleId = loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',line: k});
							}
							log.debug('scheduleId ', scheduleId);
							var amount = loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'amount',line: k});
							log.debug('AMOUNT : ', amount);
							if (_dataValidation(gstType) && _dataValidation(scheduleId))
							{
								//Search on GST Tax Code Matrix to get the tax code, reversal tax code, reversal purchase and payable items for cgst, sgst and igst.					 
								/*var arrSearchResults = getTaxDetailsFromMatrix(gstType,scheduleId);
								if(arrSearchResults[0])
								{
									taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
									taxRate = arrSearchResults[0].getValue({name: "rate",join: "CUSTRECORD_GST_TAX_CODE",label: "Rate"});
									checkGstType = arrSearchResults[0].getText('custrecord_gst_type');                                
								}  */       

								taxCodeInternalId = GST_TAXCODE_MATRIX_ARR[gstType+scheduleId].GstTaxcode
								taxRate = GST_TAXCODE_MATRIX_ARR[gstType+scheduleId].GstRate
								checkGstType = GST_TAXCODE_MATRIX_ARR[gstType+scheduleId].StrGstType                                

								log.debug('taxCodeInternalId:- ', taxCodeInternalId);
								log.debug('taxRate:- ', taxRate);
								log.debug('checkGstType:- ', checkGstType);
								loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeInternalId});                            

								if(checkGstType == 'Intra')
								{
									var csGstRate = taxRate/2;                                

									var cgstAmount = amount * (csGstRate / 100);
									cgstAmount = cgstAmount.toFixed(2);
									//cgstAmount = (parseInt( cgstAmount * 100) / 100).toFixed(2);
									var sgstAmount = amount * (csGstRate / 100);
									sgstAmount = sgstAmount.toFixed(2);
									//sgstAmount = (parseInt( sgstAmount * 100) / 100).toFixed(2);

									log.debug('Inra cgstAmount:- ', cgstAmount);
									log.debug('Inra sgstAmount:- ', sgstAmount);

									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: csGstRate});
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: cgstAmount});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: csGstRate});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: sgstAmount});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: 0});

									//Total CGST & SGST amount
									totalCgstAmount = Number(totalCgstAmount) + Number(cgstAmount);
									totalSgstAmount = Number(totalSgstAmount) + Number(sgstAmount);
								}//end if(gstType = intra)
								else if(checkGstType == 'Inter')
								{                                
									var igstAmount = amount * (taxRate / 100);
									igstAmount = igstAmount.toFixed(2);   
									log.debug('Inra igstAmount:- ', igstAmount);                             

									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: taxRate});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: igstAmount});
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: 0});
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: 0});

									//Total IGST amount
									totalIgstAmount = Number(totalIgstAmount) + Number(igstAmount);
								}// end else if(gstType = inter)
							}// end if (_dataValidation(gstType) && _dataValidation(scheduleId))
						}// end if (discountItemIds.indexOf(getItem) == -1) 
					}
					loadRecordObject.commitLine({sublistId: 'item'});
				}// end for (var k = 0; k < item_count; k++)

				if (totalCgstAmount && totalSgstAmount)
				{
					log.debug('Total Cgst amount:-', totalCgstAmount);
					log.debug('Total Sgst amount:-', totalSgstAmount);
					loadRecordObject.setValue({fieldId: 'custbody_gst_totalcgst',value: Number(totalCgstAmount)});
					loadRecordObject.setValue({fieldId: 'custbody_gst_totalsgst',value: Number(totalSgstAmount)});
					loadRecordObject.setValue({fieldId: 'custbody_gst_totaligst',value: 0});
				} else {
					loadRecordObject.setValue({fieldId: 'custbody_gst_totaligst',value: Number(totalIgstAmount)});
					loadRecordObject.setValue({fieldId: 'custbody_gst_totalcgst',value: 0});
					loadRecordObject.setValue({fieldId: 'custbody_gst_totalsgst',value: 0});
				}
				loadRecordObject.save({enableSourcing: true,ignoreMandatoryFields: true});
			}// end if(getIndiaSubsidiary && getIndiaSubsidiary.indexOf(tranSubsidiary) != -1)        
		}// end try
		catch(e) 
		{
			log.error({title: e.name,details: e.message});
		}
	}// end function afterSubmit(scriptContext)


//	***************** Other Functions block started.........  */
	function setEntityGstDetails(entity_Record, shippingAddress)
	{
		var DataArray =new Array();   
		if(_dataValidation(entity_Record) && _dataValidation(shippingAddress))
		{		         
			var addressCount = entity_Record.getLineCount({sublistId: 'addressbook'});
			log.debug({  title: ' setEntityGstDetails:', details:'addressCount: '+addressCount});

			for(var i_Temp = 0; i_Temp <addressCount; i_Temp++)
			{
				var s_Lable = entity_Record.getSublistValue({sublistId: 'addressbook',fieldId: 'addressid',line: i_Temp});
				log.debug({  title: ' setEntityGstDetails:', details:'s_Lable: '+s_Lable});
				if(_dataValidation(s_Lable) && (shippingAddress == s_Lable))
				{
					var addrSubrecord = entity_Record.getSublistSubrecord({sublistId: 'addressbook',fieldId: 'addressbookaddress',line: i_Temp});
					log.debug({  title: ' setEntityGstDetails:', details:'addrSubrecord: '+addrSubrecord});
					if(_dataValidation(addrSubrecord))
					{
						var entityStateCode = addrSubrecord.getValue({fieldId: 'custrecord_gst_addressstatecode'});
						log.debug({  title: ' setEntityGstDetails:', details:'entityStateCode: '+entityStateCode});
						var entityGSTIN = addrSubrecord.getValue({fieldId: 'custrecord_gst_nocustomeraddr'});     
						log.debug({  title: ' setEntityGstDetails:', details:'entityGSTIN: '+entityGSTIN});
						var gstRegType = addrSubrecord.getText({fieldId: 'custrecord_gst_registration_type'});     
						log.debug({  title: ' setEntityGstDetails:', details:'gstRegType: '+gstRegType}); 
						var stateValue = addrSubrecord.getValue({fieldId: 'state'});     
						log.debug({  title: ' setEntityGstDetails:', details:'stateValue: '+stateValue});
						DataArray.push({
							'entitystatecode' : entityStateCode,
							'entitygstin' : entityGSTIN,
							'gstRegType':gstRegType,
							'stateValue':stateValue
						});                                                 
					}
				}// end if(_dataValidation(s_Lable) && (i_shipTo == s_Lable))
			}// end for(var i_Temp = 1; i_Temp <= addressCount; i_Temp++)
			//var o_json_resource_data_parse = JSON.parse(JSON.stringify(DataArray));            
		}//end if(_dataValidation(i_Entity) && _dataValidation(shippingAddress))
		log.debug({  title: ' setEntityGstDetails:', details:'DataArray: '+DataArray});
		return DataArray;
	}// end function setEntityGstDetails(i_Entity, shippingAddress)

	function getCountry(customerRecord,shippingAddress)
	{            
		var country;
		//Get the sublistId of AddressBook subrecord
		var lineCount = customerRecord.getLineCount({sublistId: 'addressbook'});   
		//If Shipping Address exist
		if (shippingAddress != null && shippingAddress != '' && shippingAddress != undefined) 
		{                
			for (var i = 0; i < lineCount; i++) 
			{
				var addressId = customerRecord.getSublistValue({sublistId: 'addressbook',fieldId: 'id',line: i});
				//log.debug({  title: ' addressId:', details:'addressId: '+addressId});  
				//If the address book id on the current record matches with the address lineItem on the customer record then gets the GST Number and State.
				if (Number(shippingAddress) == Number(addressId)) 
				{
					var addressSubrecord = customerRecord.getSublistSubrecord({sublistId: 'addressbook',fieldId: 'addressbookaddress',line: i});
					country = addressSubrecord.getValue({fieldId: 'country'});
				}
			}// end for (var i = 0; i < lineCount; i++)
		}// end if (shippingAddress != null && shippingAddress != '' && shippingAddress != undefined) 
		return country;
	}// end function getCountry(customerRecord,shippingAddress)

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
	} // end function searchOnSubsidiary(subsidiary)

	function searchOnLocation(location)
	{
		var getLocationGstNumber;
		var getLocationGSTRegType = "";
		var subsidiarySearchObj = search.create({
			type: "location",
			filters:
				[
					["internalid","anyof",location]
					],
					columns:
						[
							search.createColumn({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"}),
							search.createColumn({name: "custrecord_gst_registration_type", join:"address" ,label:"GST Registration Type"})
							]
		});
		var searchResultCount = subsidiarySearchObj.runPaged().count;
		//log.debug("subsidiarySearchObj result count",searchResultCount);
		subsidiarySearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			getLocationGstNumber = result.getValue({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"});
			getLocationGSTRegType = result.getText({name: "custrecord_gst_registration_type", join:"address" ,label:"GST Registration Type"});
			return true;
		});
		return getLocationGstNumber +'$$'+ getLocationGSTRegType;
	}// end function searchOnLocation(location)

	function getTaxDetailsFromMatrix(gstType,scheduleId)
	{
		var taxCodeFilters = [];
		var taxCodeColumns = [];        

		taxCodeFilters.push(search.createFilter({name: 'custrecord_gst_type',operator: search.Operator.IS,values: gstType}));
		taxCodeFilters.push(search.createFilter({name: 'custrecord_gst_item_schedule',operator: search.Operator.IS,values: scheduleId}));

		taxCodeColumns.push(search.createColumn({name: 'custrecord_gst_tax_code'}));
		taxCodeColumns.push(search.createColumn({name: "rate",join: "CUSTRECORD_GST_TAX_CODE",label: "Rate"}));
		taxCodeColumns.push(search.createColumn({name: "custrecord_gst_type", label: "GST TYPE"}));

		var taxCodeSearch = search.create({"type": "customrecord_gst_tax_code_matrix","filters": taxCodeFilters,"columns": taxCodeColumns});
		var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});		
		log.debug('arrSearchResults', JSON.stringify(arrSearchResults));		

		return arrSearchResults;
	}// end function getTaxDetailsFromMatrix(gstType,scheduleId)

	// -------------------------------------- Start - Function to get details of GST TaxCode Matric records ----------------------------------------//
	function getTaxCodeMatrixDetails(){

		var gstType = "";
		var gstTaxcode ="";
		var gstItemSchedule="";
		var gstRate="";
		var customrecord_gst_tax_code_matrixSearchObj = search.create({type: "customrecord_gst_tax_code_matrix",
			filters:
				[
					],
					columns:
						[
							search.createColumn({name: "custrecord_gst_type", label: "GST TYPE"}),
							search.createColumn({name: "custrecord_gst_item_schedule", label: "Item Schedule"}),
							search.createColumn({name: "custrecord_gst_tax_code", label: "GST Tax Code"}),
							search.createColumn({ name: "rate", join: "CUSTRECORD_GST_TAX_CODE", label: "Rate" })
							]
		});
		var searchResultCount = customrecord_gst_tax_code_matrixSearchObj.runPaged().count;
		log.debug("getTaxCodeMatrixDetails","gstTaxmatrix result count"+searchResultCount);
		customrecord_gst_tax_code_matrixSearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results

			gstType = result.getValue({name: "custrecord_gst_type", label: "GST TYPE"});
			strGstType = result.getText({name: "custrecord_gst_type", label: "GST TYPE"});
			gstItemSchedule = result.getValue({name: "custrecord_gst_item_schedule", label: "Item Schedule"});
			gstTaxcode = result.getValue({name: "custrecord_gst_tax_code", label: "GST Tax Code"});
			gstRate = result.getValue({name: "rate", join: "CUSTRECORD_GST_TAX_CODE", label: "Rate"});	


			GST_TAXCODE_MATRIX_ARR[gstType+gstItemSchedule] = {"StrGstType":strGstType,"GstType" :gstType,"GstTaxcode":gstTaxcode,"GstRate":gstRate};

			return true;
		});


		log.debug("getTaxCodeMatrixDetails","GST_TAXCODE_MATRIX_ARR"+JSON.stringify(GST_TAXCODE_MATRIX_ARR));


	}
	//-------------------------------------- End - Function to get details of GST TaxCode Matric records ----------------------------------------//



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
			log.debug("customrecord_gst_state_list_SearchObj result count",searchResultCount);
			customrecord_gst_state_list_SearchObj.run().each(function(result){
				// .run().each has a limit of 4,000 results
				placeofSupplyValue = result.getValue({name: "internalid", label: "Internal ID"});
				return true;
			});
		}		
		log.debug('getPlaceofSupply','placeofSupplyValue=='+placeofSupplyValue);
		return placeofSupplyValue;
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
		beforeLoad: beforeLoad,
		afterSubmit: afterSubmit
	};
		});
