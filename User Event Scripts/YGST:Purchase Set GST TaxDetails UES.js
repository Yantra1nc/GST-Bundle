/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/*************************************************************
Script Name: YGST:Purchase Set GST taxDetails UES
Script Type: User Event Script
Created Date: 06/05/2020
Created By: Prashant Lokhande
Company : Yantra Inc.
Description: This script will set tax details and create RCM reverse lines on Purchase side transactions.
 *************************************************************/

define(['N/search', 'N/error', 'N/record', 'N/runtime', 'N/url', 'N/ui/serverWidget'],

		function (search, error, record, runtime, url, serverWidget)
		{
	var GST_TAXCODE_MATRIX_ARR = {};
	function beforeLoad(scriptContext)
	{
		var form = scriptContext.form;
		var currentRecordObj = scriptContext.newRecord;

		//Gets the Location field is enable or not.
		var isEnable = runtime.isFeatureInEffect({feature: "LOCATIONS"});
		if (!isEnable)        
			form.addField({id: 'custpage_location',type: serverWidget.FieldType.TEXT,label: 'Location'});        
	}// end function beforeLoad(scriptContext)

	function afterSubmit(scriptContext) 
	{
		try
		{
			var taxCodeId, getTaxCode, revSGSTPurchaseItem, revSGSTPayableItem, revCGSTPurchaseItem, revCGSTPayableItem, revIGSTPurchaseItem, revIGSTPayableItem;
			var expAcctIGSTPurchaseAcctID, expAcctIGSTPayableAcctID, expAcctCGSTPurchaseAcctID, expAcctCGSTPayableAcctID, expAcctSGSTPurchaseAcctID, expAcctSGSTPayableAcctID;
			var recordId = scriptContext.newRecord.id;
			var recordType = scriptContext.newRecord.type;
			var getIndiaSubsidiary = [];
			var entityStateCode = '';
			var entityGstNumber = '';
			var locationStateCode = '';
			var totalIgstAmount = 0.0;
			var totalCgstAmount = 0.0;
			var totalSgstAmount = 0.0;
			var intra = 1;
			var inter = 2;
			var discountItemIds = [];
			var discountAcctIds = [];

			var isEnable = runtime.isFeatureInEffect({feature: "LOCATIONS"});

			var tranSubsidiary = scriptContext.newRecord.getValue({fieldId: 'subsidiary'});
			log.debug('AfterSubmit tranSubsidiary: ',tranSubsidiary);
			var scriptObj 			= runtime.getCurrentScript();
			var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
			log.debug('getAccountSubsidiary: ',getAccountSubsidiary);

			//Condition for to compare multi India Subsidiary.
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
			if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj)
			{   
				getTaxCodeMatrixDetails();

				var placeofSupplyValue = "";
				var gstIndiaForm = scriptObj.getParameter({name: 'custscript_ygst_india_form'});
				log.debug('AfterSubmit gstIndiaForm: ',gstIndiaForm);
				
				var loadRecordObject = record.load({type: recordType,id: recordId,isDynamic: true});
				
				var gstType = loadRecordObject.getValue({fieldId: 'custbody_gst_gsttype'}); 
				var entityStateCode = loadRecordObject.getValue({fieldId: 'custbody_gst_destinationstate'}); 
				var getLocationGstNumber = loadRecordObject.getValue({fieldId: 'custbody_gst_locationregno'}); 
				var sezPaymentType  = loadRecordObject.getText({fieldId: 'custbody_gst_exprt_typ'});

				//------------------------Start -  Written Code only for CyberArk Setting Form and Location ----------------------------------//
				if (runtime.executionContext !== runtime.ContextType.USERINTERFACE) {
					log.debug('USERINTERFACE: ','Entered');
					loadRecordObject.setValue({fieldId: 'customform', value: gstIndiaForm});					
				}
				//------------------------Start -  Written Code only for CyberArk Setting Form and Location ----------------------------------//
				//End
				//Start++  GST Export Functinality:- Updated on 11-Dec-2020 By Siddhant 
				//var form_Id			= loadRecordObject.setValue({fieldId: 'customform', value: 158});
				//log.debug('form_Id: ','form_Id');
				var vendorId		= loadRecordObject.getValue({fieldId: 'entity'});
				if(_dataValidation(vendorId)) {
					//var getCountry	= loadRecordObject.getValue({fieldId: "billcountry"});
					/*var mergedData	= venAddDetail(vendorId);

					log.debug({title: "mergedData", details:mergedData});
					var splitData	= mergedData.split("|::|");
					var gstNo		= splitData[0];
					log.debug({title: "gstNo", details:gstNo});
					var getCountry	= splitData[1];
					log.debug({title: "getCountry", details:getCountry});*/

					//----------------------- Billing Address on invoice ------------------------//
					var billsubrec = loadRecordObject.getSubrecord({fieldId: 'billingaddress'});					
					var gstNo =billsubrec.getValue('custrecord_gst_nocustomeraddr');					
					var getCountry =billsubrec.getValue('country');					
					var getGSTRegType =billsubrec.getText('custrecord_gst_registration_type');					
					//----------------------- Billing Address on invoice ------------------------//

					var fieldLookUp = search.lookupFields({type: 'customrecord_gst_tax_code_matrix',id: '1',columns: ['custrecord_gst_tax_code']});
					log.debug({title: "fieldLookUp", details: fieldLookUp.custrecord_gst_tax_code});
					var expTaxCode	= fieldLookUp.custrecord_gst_tax_code[0].value;
					log.debug({title: "expTaxCode", details: expTaxCode});
				}
				//if(getCountry != "IN") {
				if(getCountry && getCountry != "IN") {
					loadRecordObject.setValue({fieldId: 'custbody_gst_inv_type', value: 3});
				}
				else if(getGSTRegType =='SEZ Registered'){
					loadRecordObject.setValue({fieldId: 'custbody_gst_inv_type', value: 2});
				}
				//else if(getCountry == "IN" && !(_dataValidation(gstNo))) {
				/*else if(getCountry && getCountry == "IN" && !(_dataValidation(gstNo))) {
					loadRecordObject.setValue({fieldId: 'custbody_gst_inv_type', value: 1});
				}*/
				//END 11-Dec-2020
				if(!(_dataValidation(entityStateCode)))
				{
					/*var entityId = loadRecordObject.getValue({fieldId: 'entity'});
					var billingAddress = Number(loadRecordObject.getValue({fieldId: 'billaddresslist'}));   
					log.debug('billingAddress Added: ',billingAddress);
					var billingAddress_Added = Number(loadRecordObject.getValue({fieldId: 'billaddress'}));   
					log.debug('billingAddress_Added Added: ',billingAddress_Added);
					var addressObject = setEntityGstDetails(entityId, billingAddress);*/

					var addressObject = loadRecordObject.getSubrecord({fieldId: 'billingaddress'});

					if(_dataValidation(addressObject))
					{
						/*			entityStateCode = addressObject[0].entitystatecode;
						log.debug('AfterSubmit entityStateCode: ',entityStateCode);
						entityGstNumber = addressObject[0].entitygstin;	
						log.debug('AfterSubmit entityGstNumber: ',entityGstNumber);
						addrCountry = addressObject[0].entityCountry;	
						log.debug('AfterSubmit addrCountry: ',addrCountry);
						gstRegType = addressObject[0].gstRegType;
						log.error('AfterSubmit gstRegType : ',gstRegType);*/

						entityStateCode = addressObject.getValue('custrecord_gst_addressstatecode');
						entityGstNumber = addressObject.getValue('custrecord_gst_nocustomeraddr');
						addrCountry = addressObject.getValue('country');
						gstRegType = addressObject.getText('custrecord_gst_registration_type');

					}
					if(_dataValidation(entityGstNumber)){
						loadRecordObject.setValue({fieldId: 'custbody_gst_customerregno',value: entityGstNumber,ignoreFieldChange: true,fireSlavingSync: true});
					}
					else{
						loadRecordObject.setValue({fieldId: 'custbody_gst_customerregno',value: '',ignoreFieldChange: true,fireSlavingSync: true});
						loadRecordObject.setValue({fieldId: 'custbody_gst_destinationstate',value: '',ignoreFieldChange: true,fireSlavingSync: true});
					}
					if(_dataValidation(entityGstNumber)) {
						loadRecordObject.setValue({fieldId: 'custbody_gst_destinationstate',value: entityStateCode,ignoreFieldChange: true,fireSlavingSync: true});
						//Added Code to set place of supply
						//var getStateName	= _getStateName(entityStateCode);
						//commented place of supply because of new update in gst
						//loadRecordObject.setValue({fieldId: 'custbody_gst_place_of_supply',value: getStateName,ignoreFieldChange: true,fireSlavingSync: true});

						if(addrCountry && addrCountry != "IN")
							loadRecordObject.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: true});                    
						else
							loadRecordObject.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: false});
					}

				}// end if(!(_dataValidation(entityStateCode)))
				if(!(_dataValidation(getLocationGstNumber)))
				{
					if(!isEnable) 
					{
						getLocationGstNumber = searchOnSubsidiary(tranSubsidiary);
						loadRecordObject.setValue({fieldId: 'custpage_location',value: getLocationGstNumber});                        
					}
					else
					{
						var getLocation =  loadRecordObject.getValue({fieldId: 'location'});
						log.debug('getLocation: ',getLocation);
						if(_dataValidation(getLocation))
						{
							//getLocationGstNumber = searchOnLocation(getLocation);
							var locationDetails = searchOnLocation(getLocation);							
							if(locationDetails){
								var splitLocationDetails = locationDetails.split('$$');
								getLocationGstNumber = splitLocationDetails[0];								
								var placeofSupply = splitLocationDetails[1];								
								placeofSupplyValue =  getPlaceofSupply(placeofSupply);								
							}							

							if(placeofSupplyValue)
								loadRecordObject.setValue({fieldId: 'custbody_gst_place_of_supply',value: placeofSupplyValue});

							//Added Code
							locationStateCode = loadRecordObject.setValue({fieldId: 'custbody_gst_locationregno',value: getLocationGstNumber});                            
						}
					}
				}// end if(!(_dataValidation(getLocationGstNumber)))

				if(!(_dataValidation(gstType)))
				{
					getLocationGstNumber = getLocationGstNumber.toString();
					locationStateCode = getLocationGstNumber.substr(0, 2);
					if((Number(locationStateCode)== Number(entityStateCode)) && gstRegType !='SEZ Registered')
					{
						loadRecordObject.setValue({fieldId: 'custbody_gst_gsttype',value: intra});
						gstType = intra;
					}                     
					else
					{
						loadRecordObject.setValue({fieldId: 'custbody_gst_gsttype',value: inter});
						gstType = inter;
					}
				}// end if(!(_dataValidation(gstType))) 

				var lineExpenseCount = loadRecordObject.getLineCount({sublistId: 'expense'});
				log.debug('AfterSubmit lineExpense Count :-', lineExpenseCount);

				var lineItemCount = loadRecordObject.getLineCount({sublistId: 'item'});
				log.debug('AfterSubmit lineItem Count:-', lineItemCount);

				var mainDiscountItemAccIds = discountItemsAcct();
				discountItemIds = mainDiscountItemAccIds[0].discountItemIds;
				if(lineItemCount > 0)
				{
					for(var p=0;p<lineItemCount;p++)
					{
						var TotalTaxRate;
						var checkGstType;

						var getItem = loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'item',line: p});

						if (discountItemIds.indexOf(getItem) == -1)
						{
							var isReversalApply		= loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_line',line: p});
							var isReversalLine 		= loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_apply',line: p});
							var isReversalProcess 	= loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_process',line: p});
							var getLocation			= loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'location',line: p});
							var getDepartment		= loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'department',line: p});
							var getClass		    = loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'class',line: p});
							var getScheduleId		= loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',line: p});
							var getAmount			= loadRecordObject.getSublistValue({sublistId: 'item',fieldId: 'amount',line: p});

							log.debug('getScheduleId : ', getScheduleId);
							log.debug('getLocation : ', getLocation);
							log.debug('isReversalApply : ', isReversalApply);

							//--------------------------- Start - Commented this code as part of script optimization on 01 June2022 -----------------------------------// 
							/*if(!_dataValidation(getScheduleId))
							{
								//getScheduleId = search.lookupFields({type: 'item',id: getItem,columns: 'custitem_gst_itemschedule'});
								var itemFldLookup = search.lookupFields({type: 'item',id: getItem,columns: 'custitem_gst_itemschedule'});

								getScheduleId =itemFldLookup.custitem_gst_itemschedule[0].value;
								log.debug('Item LookUp scheduleId : ', getScheduleId);
							}*/
							//--------------------------- End - Commented this code as part of script optimization on 01 June2022 -----------------------------------//
							if(_dataValidation(getScheduleId) && _dataValidation(gstType))
							{
								//--------------------------- Start - Commented this code as part of script optimization on 01 June2022 -----------------------------------//
								/*	var arraySearchTaxCodeMatrix = getTaxDetailsFromMatrix(gstType,getScheduleId);
								if(_dataValidation(arraySearchTaxCodeMatrix))
								{									 
									taxCodeId 			= arraySearchTaxCodeMatrix[0].getValue('custrecord_gst_tax_code');
									revSGSTPurchaseItem	= arraySearchTaxCodeMatrix[0].getValue('custrecord_sgst_revpur_item');
									revSGSTPayableItem	= arraySearchTaxCodeMatrix[0].getValue('custrecord_sgst_revpay_item');
									revCGSTPurchaseItem = arraySearchTaxCodeMatrix[0].getValue('custrecord_cgst_revpur_item');
									revCGSTPayableItem 	= arraySearchTaxCodeMatrix[0].getValue('custrecord_cgst_revpay_item');
									revIGSTPurchaseItem = arraySearchTaxCodeMatrix[0].getValue('custrecord_igst_revpur_item');
									revIGSTPayableItem 	= arraySearchTaxCodeMatrix[0].getValue('custrecord_igst_revpay_item');
									revTaxCode 			= arraySearchTaxCodeMatrix[0].getValue('custrecord_gst_reversal_taxcode');
									TotalTaxRate		= arraySearchTaxCodeMatrix[0].getValue({name: "rate",join: "CUSTRECORD_GST_TAX_CODE",label: "Rate"});
									checkGstType 		= arraySearchTaxCodeMatrix[0].getText('custrecord_gst_type');      																		

									log.debug("Inside if search record found.", 'taxCodeId :-' + taxCodeId + ' revSGSTPurchaseItem ' + revSGSTPurchaseItem + ' revSGSTPayableItem ' + revSGSTPayableItem);
									log.debug("Inside if search record found.", 'revCGSTPurchaseItem ' + revCGSTPurchaseItem + ' revCGSTPayableItem ' + revCGSTPayableItem);
									log.debug("Inside if search record found.", 'revIGSTPurchaseItem ' + revIGSTPurchaseItem + ' revIGSTPayableItem ' + revIGSTPayableItem + ' revTaxCode ' + revTaxCode);
								}// end if(_dataValidation(arraySearchTaxCodeMatrix))
								*/
								//--------------------------- End - Commented this code as part of script optimization on 01 June2022 -----------------------------------//
								
								taxCodeId = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].GstTaxcode
								TotalTaxRate = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].GstRate
								checkGstType = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].StrGstType
								revSGSTPurchaseItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevSgstPurchaseItem
								revSGSTPayableItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevSgstPayableItem
								revCGSTPurchaseItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevCgstPurchaseItem
								revCGSTPayableItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevCgstPayableItem
								revIGSTPurchaseItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevIgstPurchaseItem
								revIGSTPayableItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevIgstPayableItem
								revTaxCode = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].GstReversalTaxcode
								
								log.debug("Inside if search record found.", 'taxCodeId :-' + taxCodeId + ' revSGSTPurchaseItem ' + revSGSTPurchaseItem + ' revSGSTPayableItem ' + revSGSTPayableItem);
								log.debug("Inside if search record found.", 'revCGSTPurchaseItem ' + revCGSTPurchaseItem + ' revCGSTPayableItem ' + revCGSTPayableItem);
								log.debug("Inside if search record found.", 'revIGSTPurchaseItem ' + revIGSTPurchaseItem + ' revIGSTPayableItem ' + revIGSTPayableItem + ' revTaxCode ' + revTaxCode);

								var cgstRate, sgstRate, igstRate;
								//var isIGST = 'F';

								/*var loadTaxGroup = record.load({type: record.Type.TAX_GROUP,id: taxCodeId});
                                log.debug("loadTaxGroup:- ", loadTaxGroup);

                                var taxLineItems = loadTaxGroup.getLineCount({sublistId: 'taxitem'});
                                log.debug("taxLineItems:- ", taxLineItems);

                                var TotalTaxRate = loadTaxGroup.getValue({fieldId: 'rate'});*/
								log.debug("TotalTaxRate:- ", TotalTaxRate);
								log.debug("checkGstType:- ", checkGstType);


								var isRCMLineAdded = false;

								if(checkGstType == 'Inter')
								{
									igstRate = Number(TotalTaxRate);                                        
									var purchaseAmountigst = getAmount * (igstRate / 100);									
									var negativeAmountigst = -purchaseAmountigst;

									//totalIgstAmount = Number(totalIgstAmount) + Number(purchaseAmountigst);
									//log.debug("totalIgstAmount:- ", totalIgstAmount);

									//isIGST = 'T';
								}// end if(taxLineItems == 1)
								else if(checkGstType == 'Intra')
								{
									cgstRate = Number(TotalTaxRate)/2;
									sgstRate = Number(TotalTaxRate)/2;

									var purchaseAmountcgst = getAmount * (cgstRate / 100);									
									var negativeAmountcgst = -purchaseAmountcgst;                                        
									var purchaseAmountsgst = getAmount * (sgstRate / 100);									
									var negativeAmountsgst = -purchaseAmountsgst;

									//totalCgstAmount = Number(totalCgstAmount) + Number(purchaseAmountcgst);
									//log.debug("totalCgstAmount:- ", totalCgstAmount);

									//totalSgstAmount = Number(totalSgstAmount) + Number(purchaseAmountsgst);
									//log.debug("totalSgstAmount:- ", totalSgstAmount);

									//isIGST = 'F';   
								}// end else if(taxLineItems == 2)

								if (isReversalApply == true && isReversalProcess == false)
								{
									log.debug("reversal checkbox is true and process is false");
									loadRecordObject.selectLine({sublistId: 'item',line: p});
									// loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});//commented on 25/06/2021 to resolve tax amount issue in RCM scenario
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: false});//added on 25/06/2021 to resolve tax amount issue in RCM scenario
									loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_process',value: true});
									loadRecordObject.commitLine({sublistId: 'item'});

									if (checkGstType == 'Inter')
									{
										loadRecordObject.selectNewLine({sublistId: 'item'});

										//Set IGST Purchase Item and Calculated IGST Rate and Amount.
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: revIGSTPurchaseItem});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: purchaseAmountigst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: purchaseAmountigst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_apply',value: true});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'location',value: getLocation});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'department',value: getDepartment});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'class',value: getClass});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: igstRate});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: purchaseAmountigst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: 0});        
										loadRecordObject.commitLine({sublistId: 'item'});

										//Set IGST Payable Item and Calculated Negative IGST Rate and Amount on the second line by selecting the item.
										loadRecordObject.selectNewLine({sublistId: 'item'});        
										log.debug('revIGSTPayableItem set:- ', revIGSTPayableItem);

										//Set IGST Payable Item and Calculated Negative IGST Rate and Amount.
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: revIGSTPayableItem});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: negativeAmountigst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: negativeAmountigst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_apply',value: true});        
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'location',value: getLocation});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'department',value: getDepartment});     
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'class',value: getClass});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: igstRate});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: purchaseAmountigst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: 0});       
										loadRecordObject.commitLine({sublistId: 'item'});   
										isRCMLineAdded = true;
									}// end if (isIGST == 'T' || isIGST == "T")

									else if (checkGstType == 'Intra')
									{
										loadRecordObject.selectNewLine({sublistId: 'item'});

										//Set SGST Purchase Item and Calculated SGST Rate and Amount.
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: revSGSTPurchaseItem});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: purchaseAmountsgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: purchaseAmountsgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: sgstRate});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: purchaseAmountsgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_apply',value: true});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'location',value: getLocation});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'department',value: getDepartment});        
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'class',value: getClass});
										loadRecordObject.commitLine({sublistId: 'item'});

										//if condition is F then set on second line...
										loadRecordObject.selectNewLine({sublistId: 'item'});

										//Set SGST Payable Item and Calculated Negative SGST Rate and Amount.
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: revSGSTPayableItem});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: negativeAmountsgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: negativeAmountsgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: sgstRate});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: purchaseAmountsgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_apply',value: true});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'location',value: getLocation});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'department',value: getDepartment});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'class',value: getClass});
										loadRecordObject.commitLine({sublistId: 'item'});

										//On 3rd line of CGST calculations....
										loadRecordObject.selectNewLine({sublistId: 'item'});        

										//Set CGST Purchase Item and Calculated CGST Rate and Amount.
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: revCGSTPurchaseItem});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: purchaseAmountcgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: purchaseAmountcgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: cgstRate});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: purchaseAmountcgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_apply',value: true});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'location',value: getLocation});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'department',value: getDepartment});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'class',value: getClass});
										loadRecordObject.commitLine({sublistId: 'item'});

										//4th line CGST item...
										loadRecordObject.selectNewLine({sublistId: 'item'});      

										//Set CGST Payable Item and Calculated Negative CGST Rate and Amount.
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: revCGSTPayableItem});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'rate',value: negativeAmountcgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value: negativeAmountcgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: cgstRate});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: purchaseAmountcgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_apply',value: true});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'location',value: getLocation});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'department',value: getDepartment});                                            
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'class',value: getClass});
										loadRecordObject.commitLine({sublistId: 'item'}); 
										isRCMLineAdded =true;
									}// end else if (isIGST == 'F' || isIGST == "F")
								}// end if (isReversal == true)
								else if (isReversalApply == false && isReversalLine == false)
								{
									if (checkGstType == 'Inter') 
									{
										log.debug(" IGST TRUE taxCodeId else:- ", taxCodeId);        
										loadRecordObject.selectLine({sublistId: 'item',line: p});        
										//Set the IGST rate and calculated amount for the item selected.

										//Start++  GST Export Functinality:- Updated on 11-Dec-2020 By Siddhant 
										if((getCountry != "IN" && sezPaymentType!='WPAY') || (getCountry == "IN" && !(_dataValidation(gstNo))) ) {
											log.debug("expTaxCode 1",expTaxCode)
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: expTaxCode,ignoreFieldChange: true});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'tax1amt',value: 0});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxrate',value: 0});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: 0});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: 0});
										}
										else {
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeId,ignoreFieldChange: true});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxrate1',value: TotalTaxRate});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: igstRate});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: purchaseAmountigst});
										}
										//END 11-Dec-2020
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: igstRate});
										//loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: purchaseAmountigst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: 0}); 
										loadRecordObject.commitLine({sublistId: 'item'});   
									} 
									else if (checkGstType == 'Intra')
									{
										log.debug(" IGST FALSE:- ", taxCodeId);        
										loadRecordObject.selectLine({sublistId: 'item',line: p});        
										//Set the cgst and sgst rate and amount for the item selected.
										//Start++  GST Export Functinality:- Updated on 11-Dec-2020 By Siddhant 
										if((getCountry != "IN" && sezPaymentType!='WPAY') || (getCountry == "IN" && !(_dataValidation(gstNo)))) {
											log.debug("expTaxCode 2",expTaxCode)
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: expTaxCode, ignoreFieldChange: true});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'tax1amt',value: 0});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxrate',value: 0});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: 0});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: 0});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: 0});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: 0});
										}
										else {
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeId, ignoreFieldChange: true});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxrate1',value: TotalTaxRate});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: cgstRate});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: purchaseAmountcgst});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: sgstRate});
											loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: purchaseAmountsgst});
										}
										//End 11-Dec-2020
										// loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstrate',value: cgstRate});
										// loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_cgstamount',value: purchaseAmountcgst});
										// loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstrate',value: sgstRate});
										// loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_sgstamount',value: purchaseAmountsgst});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_igstamount',value: 0});        
										loadRecordObject.commitLine({sublistId: 'item'});       

									}
								}// end else if (isReversal == false && isReversalLine == false)

								if(checkGstType == 'Inter')
								{
									var purchaseAmountigst_total=0.00;     

									if(isRCMLineAdded==false){
										var igstRate_total = Number(TotalTaxRate);
										purchaseAmountigst_total = getAmount * (igstRate_total / 100);
									}									
									else if(isRCMLineAdded==true){
										purchaseAmountigst_total=0;
									}

									totalIgstAmount = Number(totalIgstAmount) + Number(purchaseAmountigst_total);
									log.debug("totalIgstAmount:- ", totalIgstAmount);

									//isIGST = 'T';
								}// end if(taxLineItems == 1)
								else if(checkGstType == 'Intra')
								{
									var purchaseAmountcgst_total =0.00;
									var purchaseAmountsgst_total =0.00;

									if(isRCMLineAdded==false){
										var cgstRate_total = Number(TotalTaxRate)/2;
										var sgstRate_total = Number(TotalTaxRate)/2;

										purchaseAmountcgst_total = getAmount * (cgstRate_total / 100);									                                        
										purchaseAmountsgst_total = getAmount * (sgstRate_total / 100);
									}
									else if(isRCMLineAdded==true){
										purchaseAmountcgst_total =0;
										purchaseAmountsgst_total =0;
									}

									totalCgstAmount = Number(totalCgstAmount) + Number(purchaseAmountcgst_total);
									log.debug("totalCgstAmount:- ", totalCgstAmount);

									totalSgstAmount = Number(totalSgstAmount) + Number(purchaseAmountsgst_total);
									log.debug("totalSgstAmount:- ", totalSgstAmount);

									isIGST = 'F';   
								}// end else if(taxLineItems == 2)


							}// end if(_dataValidation(getScheduleId) && _dataValidation(gstType))
						}// end if (discountItemIds.indexOf(getItem) == -1)
					}// end for(var p=0;p<lineItemCount;p++)
				}// end if (lineItemCount > 0)
				//var mainDiscountAcctIds = discountItemsAcct();
				discountAcctIds = mainDiscountItemAccIds[0].discountAcctIds;
				//log.debug('discount Acct Ids in edit/after submit:- : ', JSON.stringify(mainDiscountAcctIds));

				for (var p = 0; p < lineExpenseCount; p++) 
				{
					var expCategory = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'category',line: p});
					log.debug('expense category - ', expCategory);

					var accountId = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'account',line: p});
					log.debug(' exp accountId - ', accountId);
					var TotalTaxRate;
					var checkGstType;
					if(discountAcctIds.indexOf(accountId) == -1) 
					{
						var isReversal = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_line',line: p});
						log.debug('After Submit Expense isReversal :-', isReversal);
						var isReversalLine = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_apply',line: p});
						log.debug('After Submit Expense isReversalLine:-', isReversalLine);
						var reversalProcess = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_process',line: p});
						log.debug('After Submit Expense isReversalLine:-', reversalProcess);
						var getLoc = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'location',line: p});
						log.debug(' exp getLoc - ', getLoc);
						var getDept = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'department',line: p});
						log.debug(' exp getDept - ', getDept);
						var getClass = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'class',line: p});
						log.debug(' exp getClass - ', getClass); 
						var getAmount = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'amount',line: p});
						log.debug('exp amount - ', getAmount);
						var getTaxCode = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'taxcode',line: p});
						log.debug('exp TaxCode - ', getTaxCode);
						var getScheduleId = loadRecordObject.getSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',line: p});
						log.debug('exp getScheduleId - ', getScheduleId);

						//Lookup on item to get the Expense Category's schedule id.
						if (_dataValidation(expCategory)) 
						{
							//--------------------------- Start - Commented this code as part of script optimization on 01 June2022 -----------------------------------// 
							/*if(!(_dataValidation(getScheduleId)))
							{
								var lookupScheduleId = search.lookupFields({type: 'expensecategory',id: expCategory,columns: 'custrecord_gst_expenseschedule'});
								log.debug('exp category scheduleId - ', lookupScheduleId);
								if (_dataValidation(lookupScheduleId.custrecord_gst_expenseschedule[0]))
								{
									getScheduleId = lookupScheduleId.custrecord_gst_expenseschedule[0].value;
									log.debug('After Submit Expense scheduleId- ', getScheduleId);
								}
							}*/
							//--------------------------- End - Commented this code as part of script optimization on 01 June2022 -----------------------------------// 
							// }
							if(_dataValidation(getScheduleId) && _dataValidation(gstType))
							{
								//--------------------------- Start - Commented this code as part of script optimization on 01 June2022 -----------------------------------// 
								/*var arraySearchTaxCodeMatrix = getTaxDetailsFromMatrix(gstType,getScheduleId);
								if(_dataValidation(arraySearchTaxCodeMatrix))
								{									
									getTaxCode = arraySearchTaxCodeMatrix[0].getValue('custrecord_gst_tax_code');
									revSGSTPurchaseItem = arraySearchTaxCodeMatrix[0].getValue('custrecord_sgst_revpur_item');
									revSGSTPayableItem = arraySearchTaxCodeMatrix[0].getValue('custrecord_sgst_revpay_item');
									revCGSTPurchaseItem = arraySearchTaxCodeMatrix[0].getValue('custrecord_cgst_revpur_item');
									revCGSTPayableItem = arraySearchTaxCodeMatrix[0].getValue('custrecord_cgst_revpay_item');
									revIGSTPurchaseItem = arraySearchTaxCodeMatrix[0].getValue('custrecord_igst_revpur_item');
									revIGSTPayableItem = arraySearchTaxCodeMatrix[0].getValue('custrecord_igst_revpay_item');
									revTaxCode = arraySearchTaxCodeMatrix[0].getValue('custrecord_gst_reversal_taxcode');                                        
									expAcctIGSTPurchaseAcctID = arraySearchTaxCodeMatrix[0].getValue({name: "expenseaccount",join: "CUSTRECORD_IGST_REVPUR_ITEM",label: "Expense/COGS Account"});
									expAcctIGSTPayableAcctID = arraySearchTaxCodeMatrix[0].getValue({name: "expenseaccount", join: "CUSTRECORD_IGST_REVPAY_ITEM",label: "Expense/COGS Account"});
									expAcctCGSTPurchaseAcctID = arraySearchTaxCodeMatrix[0].getValue({name: "expenseaccount",join: "CUSTRECORD_CGST_REVPUR_ITEM",label: "Expense/COGS Account"});
									expAcctCGSTPayableAcctID = arraySearchTaxCodeMatrix[0].getValue({name: "expenseaccount",join: "CUSTRECORD_CGST_REVPAY_ITEM",label: "Expense/COGS Account"});
									expAcctSGSTPurchaseAcctID = arraySearchTaxCodeMatrix[0].getValue({name: "expenseaccount",join: "CUSTRECORD_SGST_REVPUR_ITEM",label: "Expense/COGS Account"});
									expAcctSGSTPayableAcctID = arraySearchTaxCodeMatrix[0].getValue({name: "expenseaccount",join: "CUSTRECORD_SGST_REVPAY_ITEM",label: "Expense/COGS Account"});
									TotalTaxRate = arraySearchTaxCodeMatrix[0].getValue({name: "rate",join: "CUSTRECORD_GST_TAX_CODE",label: "Rate"});
									checkGstType = arraySearchTaxCodeMatrix[0].getText('custrecord_gst_type');    

									log.debug("Inside if search record found.", 'taxCodeId :-' + taxCodeId + ' revSGSTPurchaseItem ' + revSGSTPurchaseItem + ' revSGSTPayableItem ' + revSGSTPayableItem);
									log.debug("Inside if search record found.", 'revCGSTPurchaseItem ' + revCGSTPurchaseItem + ' revCGSTPayableItem ' + revCGSTPayableItem);
									log.debug("Inside if search record found.", 'revIGSTPurchaseItem ' + revIGSTPurchaseItem + ' revIGSTPayableItem ' + revIGSTPayableItem + ' revTaxCode ' + revTaxCode);
									log.debug("Inside if search record found.", 'expAcctIGSTPurchaseAcctID :-' + expAcctIGSTPurchaseAcctID + ' expAcctIGSTPayableAcctID ' + expAcctIGSTPayableAcctID + ' expAcctCGSTPurchaseAcctID ' + expAcctCGSTPurchaseAcctID + ' expAcctCGSTPayableAcctID ' + expAcctCGSTPayableAcctID + ' expAcctSGSTPurchaseAcctID ' + expAcctSGSTPurchaseAcctID + ' expAcctSGSTPayableAcctID ' + expAcctSGSTPayableAcctID);
								}// end if(_dataValidation(arraySearchTaxCodeMatrix))
								*/
								//--------------------------- End - Commented this code as part of script optimization on 01 June2022 -----------------------------------//
								getTaxCode = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].GstTaxcode
								revSGSTPurchaseItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevSgstPurchaseItem
								revSGSTPayableItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevSgstPayableItem
								revCGSTPurchaseItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevCgstPurchaseItem
								revCGSTPayableItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevCgstPayableItem
								revIGSTPurchaseItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevIgstPurchaseItem
								revIGSTPayableItem = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevIgstPayableItem
								revTaxCode = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].GstReversalTaxcode
								expAcctIGSTPurchaseAcctID = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevIgstRevPurchaseAccId
								expAcctIGSTPayableAcctID = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevIgstRevPayableAccId
								expAcctCGSTPurchaseAcctID = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevCgstRevPurchaseAccId
								expAcctCGSTPayableAcctID = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevCgstRevPayableAccId
								expAcctSGSTPurchaseAcctID = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevSgstPurchaseAccId
								expAcctSGSTPayableAcctID = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].RevSgstRevPayableAccId
								TotalTaxRate = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].GstRate 
								checkGstType = GST_TAXCODE_MATRIX_ARR[gstType+getScheduleId].StrGstType     
								
								log.debug("Inside if search record found.", 'taxCodeId :-' + taxCodeId + ' revSGSTPurchaseItem ' + revSGSTPurchaseItem + ' revSGSTPayableItem ' + revSGSTPayableItem);
								log.debug("Inside if search record found.", 'revCGSTPurchaseItem ' + revCGSTPurchaseItem + ' revCGSTPayableItem ' + revCGSTPayableItem);
								log.debug("Inside if search record found.", 'revIGSTPurchaseItem ' + revIGSTPurchaseItem + ' revIGSTPayableItem ' + revIGSTPayableItem + ' revTaxCode ' + revTaxCode);
								log.debug("Inside if search record found.", 'expAcctIGSTPurchaseAcctID :-' + expAcctIGSTPurchaseAcctID + ' expAcctIGSTPayableAcctID ' + expAcctIGSTPayableAcctID + ' expAcctCGSTPurchaseAcctID ' + expAcctCGSTPurchaseAcctID + ' expAcctCGSTPayableAcctID ' + expAcctCGSTPayableAcctID + ' expAcctSGSTPurchaseAcctID ' + expAcctSGSTPurchaseAcctID + ' expAcctSGSTPayableAcctID ' + expAcctSGSTPayableAcctID);
								
								
							}// end if(_dataValidation(getScheduleId) && _dataValidation(gstType))
							var cgstRate, sgstRate, igstRate;
							//var isIGST = 'F';

							/*var loadTaxGroup = record.load({type: record.Type.TAX_GROUP,id: getTaxCode});
                            log.debug("loadTaxGroup:- ", loadTaxGroup);

                            var taxLineItems = loadTaxGroup.getLineCount({sublistId: 'taxitem'});
                            log.debug("taxLineItems:- ", taxLineItems);

                            var TotalTaxRate = loadTaxGroup.getValue({fieldId: 'rate'});*/
							log.debug("Expense TotalTaxRate:- ", TotalTaxRate);
							log.debug("Expense checkGstType:- ", checkGstType);

							var isRCMLineAdded = false;

							if(checkGstType == 'Inter')
							{
								igstRate = Number(TotalTaxRate);                                        
								var purchaseAmountigst = getAmount * (igstRate / 100);
								var negativeAmountigst = -purchaseAmountigst;

								//totalIgstAmount = Number(totalIgstAmount) + Number(purchaseAmountigst);
								//log.debug("totalIgstAmount:- ", totalIgstAmount);


								//isIGST = 'T';
							}// end if(taxLineItems == 1)
							else if(checkGstType == 'Intra')
							{
								cgstRate = Number(TotalTaxRate)/2;
								sgstRate = Number(TotalTaxRate)/2;

								var purchaseAmountcgst = getAmount * (cgstRate / 100);
								var negativeAmountcgst = -purchaseAmountcgst;                                        
								var purchaseAmountsgst = getAmount * (sgstRate / 100);
								var negativeAmountsgst = -purchaseAmountsgst;

								//totalCgstAmount = Number(totalCgstAmount) + Number(purchaseAmountcgst);
								//log.debug("totalCgstAmount:- ", totalCgstAmount);

								//totalSgstAmount = Number(totalSgstAmount) + Number(purchaseAmountsgst);
								//log.debug("totalSgstAmount:- ", totalSgstAmount);

								//isIGST = 'F';   
							}// end else if(taxLineItems == 2)
							if (isReversal == true && reversalProcess == false)
							{
								log.debug("reversal checkbox is true on Expense Line");    
								loadRecordObject.selectLine({sublistId: 'expense',line: p});                                        
								//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});//commented on 25/06/2021 to resolve tax amount issue in RCM scenario
								loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: false});//added on 25/06/2021 to resolve tax amount issue in RCM scenario
								loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_process',value: true});   
								loadRecordObject.commitLine({sublistId: 'expense'});

								//If isIGST is true - GST type is considered as Inter on edit.
								if(checkGstType == 'Inter') 
								{                                      
									loadRecordObject.selectNewLine({sublistId: 'expense'});    
									//Set IGST Purchase Acct and Calculated IGST Rate and Amount.    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: expAcctIGSTPurchaseAcctID});   
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'rate',value: purchaseAmountigst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: purchaseAmountigst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_apply',value: true});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: getLoc});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: getDept});
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: getClass});
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: igstRate});    
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: purchaseAmountigst});
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: 0});									
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: 0});    
									loadRecordObject.commitLine({sublistId: 'expense'});

									//Set IGST Payable Acct and Calculated Negative IGST Rate and Amount on the second line by selecting the item.
									loadRecordObject.selectNewLine({sublistId: 'expense'});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: expAcctIGSTPayableAcctID});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'rate',value: negativeAmountigst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: negativeAmountigst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: revTaxCode});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_apply',value: true});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: getLoc});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: getDept});
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: getClass});
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: igstRate});    
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: purchaseAmountigst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: 0});    
									loadRecordObject.commitLine({sublistId: 'expense'}); 
									isRCMLineAdded =true;
								}// end if(isIGST == 'T' || isIGST == "T")     

								//If isIGST is false - GST Type is considered as Intra.
								else if (checkGstType == 'Intra') 
								{
									loadRecordObject.selectNewLine({sublistId: 'expense'});
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: expAcctSGSTPurchaseAcctID});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'rate',value: purchaseAmountsgst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: purchaseAmountsgst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});    
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: sgstRate});    
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: purchaseAmountsgst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_apply',value: true});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: getLoc});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: getDept}); 
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: getClass});
									loadRecordObject.commitLine({sublistId: 'expense'});    

									loadRecordObject.selectNewLine({sublistId: 'expense'});   
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: expAcctSGSTPayableAcctID});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'rate',value: negativeAmountsgst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: negativeAmountsgst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});    
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: sgstRate});    
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: purchaseAmountsgst});  
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: 0});
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_apply',value: true});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: getLoc});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: getDept});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: getClass});
									loadRecordObject.commitLine({sublistId: 'expense'});    

									loadRecordObject.selectNewLine({sublistId: 'expense'});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: expAcctCGSTPurchaseAcctID});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'rate',value: purchaseAmountcgst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: purchaseAmountcgst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});    
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: cgstRate});    
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: purchaseAmountcgst});  
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: 0});
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_apply',value: true});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: getLoc});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: getDept});
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: getClass});
									loadRecordObject.commitLine({sublistId: 'expense'});    

									loadRecordObject.selectNewLine({sublistId: 'expense'});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: expAcctCGSTPayableAcctID});
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'rate',value: negativeAmountcgst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: negativeAmountcgst});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: revTaxCode, ignoreFieldChange: true});    
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: cgstRate});    
									//loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: purchaseAmountcgst});  
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: 0});  
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_apply',value: true});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: getLoc});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: getDept}); 
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: getClass});
									loadRecordObject.commitLine({sublistId: 'expense'});
									isRCMLineAdded =true;
								}// end else if (isIGST == 'F' || isIGST == "F")
							}// end if (isReversal == true)

							if (isReversal == false && reversalProcess == false) 
							{
								if(checkGstType == 'Inter') 
								{
									log.debug("Normal Taxcode set up:- ", taxCodeId);    
									loadRecordObject.selectLine({sublistId: 'expense',line: p});
									//Start++  GST Export Functinality:- Updated on 11-Dec-2020 By Siddhant 
									if((getCountry != "IN" && sezPaymentType!='WPAY') || (getCountry == "IN" && !(_dataValidation(gstNo)))) {
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: expTaxCode, ignoreFieldChange: true});   
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'tax1amt',value: 0});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxrate',value: 0});
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: 0});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: 0});    
									}
									else  {
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: getTaxCode});
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxrate1',value: TotalTaxRate});
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: igstRate});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: purchaseAmountigst});    
									}
									//End 11-Dec-2020
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: 0});    
									loadRecordObject.commitLine({sublistId: 'expense'});    
								} // end if(isIGST == 'T' || isIGST == "T") 
								else if(checkGstType == 'Intra') 
								{    
									loadRecordObject.selectLine({sublistId: 'expense',line: p});     
									//Start++  GST Export Functinality:- Updated on 11-Dec-2020 By Siddhant 
									if(getCountry != "IN" || (getCountry == "IN" && !(_dataValidation(gstNo)))) {
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: expTaxCode, ignoreFieldChange: true});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'tax1amt',value: 0});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxrate',value: 0});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: 0});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: 0});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: 0});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: 0});    
									}
									else {
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: getTaxCode, ignoreFieldChange: true});
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxrate1',value: TotalTaxRate});
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstrate',value: cgstRate});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_cgstamount',value: purchaseAmountcgst});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstrate',value: sgstRate});    
										loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_sgstamount',value: purchaseAmountsgst});    
									}
									//End 11-Dec-2020
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstrate',value: 0});    
									loadRecordObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_igstamount',value: 0});    
									loadRecordObject.commitLine({sublistId: 'expense'});    
								}//end else if(isIGST == 'F' || isIGST == "F")
							}// end if (isReversal == false && reversalProcess == false) 

							if(checkGstType == 'Inter')
							{
								var purchaseAmountigst_total=0.00;     

								if(isRCMLineAdded==false){
									var igstRate_total = Number(TotalTaxRate);
									purchaseAmountigst_total = getAmount * (igstRate_total / 100);
								}									
								else if(isRCMLineAdded==true){
									purchaseAmountigst_total=0;
								}

								totalIgstAmount = Number(totalIgstAmount) + Number(purchaseAmountigst_total);
								log.debug("totalIgstAmount:- ", totalIgstAmount);

								//isIGST = 'T';
							}// end if(taxLineItems == 1)
							else if(checkGstType == 'Intra')
							{
								var purchaseAmountcgst_total =0.00;
								var purchaseAmountsgst_total =0.00;

								if(isRCMLineAdded==false){
									var cgstRate_total = Number(TotalTaxRate)/2;
									var sgstRate_total = Number(TotalTaxRate)/2;

									purchaseAmountcgst_total = getAmount * (cgstRate_total / 100);									                                        
									purchaseAmountsgst_total = getAmount * (sgstRate_total / 100);
								}
								else if(isRCMLineAdded==true){
									purchaseAmountcgst_total =0;
									purchaseAmountsgst_total =0;
								}

								totalCgstAmount = Number(totalCgstAmount) + Number(purchaseAmountcgst_total);
								log.debug("totalCgstAmount:- ", totalCgstAmount);

								totalSgstAmount = Number(totalSgstAmount) + Number(purchaseAmountsgst_total);
								log.debug("totalSgstAmount:- ", totalSgstAmount);

								isIGST = 'F';   
							}// end else if(taxLineItems == 2)

						}// end if (_dataValidation(expCategory))                             
					}// end if (discountAcctIds.indexOf(accountId) == -1) 
				}// end for (var p = 0; p < lineExpenseCount; p++)
				if(checkGstType == 'Intra') 
				{
					loadRecordObject.setValue({fieldId: 'custbody_gst_totalcgst',value: totalCgstAmount});
					loadRecordObject.setValue({fieldId: 'custbody_gst_totalsgst',value: totalSgstAmount});
					loadRecordObject.setValue({fieldId: 'custbody_gst_totaligst',value: 0});
				}// end if(isIGST == 'F' || isIGST == "F") 
				else if(checkGstType == 'Inter') 
				{
					loadRecordObject.setValue({fieldId: 'custbody_gst_totaligst',value: totalIgstAmount});
					loadRecordObject.setValue({fieldId: 'custbody_gst_totalcgst',value: 0});
					loadRecordObject.setValue({fieldId: 'custbody_gst_totalsgst',value: 0});
				}// end if(isIGST == 'T' || isIGST == "T") 
				
				var recordIdOnedit = loadRecordObject.save({enableSourcing: true, ignoreMandatoryFields: true});
				log.debug('Record saved id :- ', recordIdOnedit);
			}// end if(getIndiaSubsidiary && getIndiaSubsidiary.indexOf(tranSubsidiary) != -1)
		}catch(e){
			log.debug ({title: e.name,details: e.message}); 
		}

	}    


	//******************* Function Block Starts..... ************************** */
	function setEntityGstDetails(i_Entity, billingAddress)
	{  
		if(_dataValidation(i_Entity) && _dataValidation(billingAddress))
		{
			var DataArray =new Array();
			var entity_Record = record.load({type: record.Type.VENDOR,id: i_Entity});
			if(_dataValidation(entity_Record))
			{
				var addressCount = entity_Record.getLineCount({sublistId: 'addressbook'});
				log.debug({  title: ' addressCount:', details:'addressCount: '+addressCount});

				for(var i_Temp = 0; i_Temp < addressCount; i_Temp++)
				{
					var s_Lable = entity_Record.getSublistValue({sublistId: 'addressbook',fieldId: 'addressid',line: i_Temp});
					log.debug({  title: ' s_Lable:', details:'s_Lable: '+s_Lable});
					if(_dataValidation(s_Lable) && (billingAddress == s_Lable))
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
							DataArray.push({
								'entitystatecode' : entityStateCode,
								'entitygstin' : entityGSTIN,
								'entityCountry':entityCountry,
								'gstRegType' : gstRegType
							});                                                 
						}
						break;
					}// end if(_dataValidation(s_Lable) && (i_shipTo == s_Lable))
				}// end for(var i_Temp = 1; i_Temp <= addressCount; i_Temp++)
			}// end if(_dataValidation(entity_Record))            
			//var o_json_resource_data_parse = JSON.parse(JSON.stringify(DataArray));
			return DataArray;
		}//end if(_dataValidation(i_Entity) && _dataValidation(billingAddress))
	}// end function setEntityGstDetails(i_Entity, billingAddress)

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
							search.createColumn({name: "state", join:"address" ,label:"State"})
							]
		});
		var searchResultCount = subsidiarySearchObj.runPaged().count;
		//log.debug("subsidiarySearchObj result count",searchResultCount);
		subsidiarySearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			getLocationGstNumber = result.getValue({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"});	
			stateValue = result.getValue({name: "state", join:"address" ,label:"State"});
			return true;
		});
		return getLocationGstNumber +'$$'+stateValue;
	}// end function searchOnLocation(location)


	function discountItemsAcct() 
	{
		// Array for list of discount Items...
		var discountItemIds = [];
		var discountAcctIds = [];

		//Load Search for discount Items to set tax code ...
		var discountItemSearch = search.load({id: 'customsearch_tds_wht_items'});
		log.debug('discountItemSearch:- ', JSON.stringify(discountItemSearch));

		var arrDiscountItems = discountItemSearch.run().getRange({start: 0,end: 1000});

		for (var t = 0; t < arrDiscountItems.length; t++) 
		{
			var discountId = arrDiscountItems[t].getValue({name: 'internalid'});
			discountItemIds.push(discountId);

			var disAcctId = arrDiscountItems[t].getValue({name: 'expenseaccount'});
			discountAcctIds.push(disAcctId);
		}
		log.debug('discountItemIds list:- : ', JSON.stringify(discountItemIds));
		log.debug('discountAcctIds list:- : ', JSON.stringify(discountAcctIds));

		var returnJSON = [];
		returnJSON.push({
			discountItemIds: discountItemIds,
			discountAcctIds: discountAcctIds

		});
		return returnJSON;
	}// end function discountItemsAcct()

	function getTaxDetailsFromMatrix(gstType,scheduleId)
	{
		log.debug("getTaxDetailsFromMatrix","gstType=="+gstType);
		log.debug("getTaxDetailsFromMatrix","scheduleId=="+JSON.stringify(scheduleId));
		var filterTaxCodeMatrix = new Array();
		var columnTaxCodeMatrix = [];

		filterTaxCodeMatrix.push(search.createFilter({name: 'isinactive',operator: search.Operator.IS,values: false}));
		filterTaxCodeMatrix.push(search.createFilter({name: 'custrecord_gst_type',operator: search.Operator.IS,values: gstType}));
		filterTaxCodeMatrix.push(search.createFilter({name: 'custrecord_gst_item_schedule',operator: search.Operator.IS,values: scheduleId}));

		columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_gst_tax_code'}));
		columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_sgst_revpur_item'}));
		columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_sgst_revpay_item'}));
		columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_cgst_revpur_item'}));
		columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_cgst_revpay_item'}));
		columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_igst_revpur_item'}));                               
		columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_igst_revpay_item'}));
		columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_gst_reversal_taxcode'}));
		columnTaxCodeMatrix.push(search.createColumn({name: "expenseaccount",join: "CUSTRECORD_CGST_REVPAY_ITEM",label: "Expense/COGS Account"})),
		columnTaxCodeMatrix.push(search.createColumn({name: "expenseaccount",join: "CUSTRECORD_CGST_REVPUR_ITEM",label: "Expense/COGS Account"})),
		columnTaxCodeMatrix.push(search.createColumn({name: "expenseaccount",join: "CUSTRECORD_IGST_REVPAY_ITEM",label: "Expense/COGS Account"})),
		columnTaxCodeMatrix.push(search.createColumn({name: "expenseaccount",join: "CUSTRECORD_IGST_REVPUR_ITEM",label: "Expense/COGS Account"})),
		columnTaxCodeMatrix.push(search.createColumn({name: "expenseaccount",join: "CUSTRECORD_SGST_REVPAY_ITEM",label: "Expense/COGS Account"})),
		columnTaxCodeMatrix.push(search.createColumn({name: "expenseaccount",join: "CUSTRECORD_SGST_REVPUR_ITEM",label: "Expense/COGS Account"})),
		columnTaxCodeMatrix.push(search.createColumn({name: "rate",join: "CUSTRECORD_GST_TAX_CODE",label: "Rate"})),
		columnTaxCodeMatrix.push(search.createColumn({name: "custrecord_gst_type", label: "GST TYPE"}))

		var searchTaxCodeMatrix = search.create({"type": "customrecord_gst_tax_code_matrix",
			"filters": filterTaxCodeMatrix,
			"columns": columnTaxCodeMatrix
		});

		var arraySearchTaxCodeMatrix = searchTaxCodeMatrix.run().getRange({start: 0,end: 1});
		log.debug("getTaxDetailsFromMatrix","arraySearchTaxCodeMatrix=="+JSON.stringify(arraySearchTaxCodeMatrix));
		return arraySearchTaxCodeMatrix;
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

//	search to get GST No and country code.
	function venAddDetail(venId)
	{
		var gstNo		= "";
		var counCode	= "";
		var customerSearchObj = search.create({
			type: "vendor",
			filters:
				[	
					["internalidnumber","equalto",venId],
					"AND",
					["isinactive","is","F"]
					],
					columns:
						[
							search.createColumn({name: "custrecord_gst_nocustomeraddr",join: "Address"}),
							search.createColumn({name: "country",join: "Address"})
							]
		});
		var searchResultCount = customerSearchObj.runPaged().count;
		log.debug("customerSearchObj result count",searchResultCount);
		customerSearchObj.run().each(function(result){
			gstNo	= result.getValue({name: "custrecord_gst_nocustomeraddr",join: "Address"});
			counCode = result.getValue({name: "country",join: "Address"});
			return true;
		});
		var mergedData	= gstNo+"|::|"+counCode;
		return mergedData;
	}

	function _getStateName(stateCode) 
	{
		var stateName	= "";
		var customrecord_gst_state_list_SearchObj = search.create({
			type: "customrecord_gst_state_list_",
			filters:
				[
					["custrecord_gst_state_code","equalto",stateCode]
					],
					columns:
						[
							search.createColumn({name: "internalid"})
							]
		});
		var searchResultCount = customrecord_gst_state_list_SearchObj.runPaged().count;	
		log.debug("customrecord_gst_state_list_SearchObj result count",searchResultCount);
		customrecord_gst_state_list_SearchObj.run().each(function(result){
			stateName	= result.getValue({name: "internalid"});
			return true;
		});
		return stateName;
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

	// -------------------------------------- Start - Function to get details of GST TaxCode Matric records ----------------------------------------//
	function getTaxCodeMatrixDetails(){

		var gstType = "";
		var gstTaxcode ="";
		var gstItemSchedule="";
		var gstRate="";
		var revSgstPurchaseItem="";
		var revSgstPayableItem="";
		var revCgstPurchaseItem="";
		var revCgstPayableItem="";
		var revIgstPurchaseItem="";
		var revIgstPayableItem="";
		var gstReversalTaxcode ="";
		var revSgstPurchaseAccId="";
		var revSgstRevPayableAccId="";
		var revCgstRevPurchaseAccId="";
		var revCgstRevPayableAccId="";
		var revIgstRevPurchaseAccId="";
		var revIgstRevPayableAccId="";


		var customrecord_gst_tax_code_matrixSearchObj = search.create({type: "customrecord_gst_tax_code_matrix",
			filters:
				[
					["isinactive","is",'F']
					],
					columns:
						[
							search.createColumn({name: "custrecord_gst_type", label: "GST TYPE"}),
							search.createColumn({name: "custrecord_gst_item_schedule", label: "Item Schedule"}),
							search.createColumn({name: "custrecord_gst_tax_code", label: "GST Tax Code"}),
							search.createColumn({ name: "rate", join: "CUSTRECORD_GST_TAX_CODE", label: "Rate" }),
							search.createColumn({name: 'custrecord_sgst_revpur_item'}),
							search.createColumn({name: 'custrecord_sgst_revpay_item'}),
							search.createColumn({name: 'custrecord_cgst_revpur_item'}),
							search.createColumn({name: 'custrecord_cgst_revpay_item'}),
							search.createColumn({name: 'custrecord_igst_revpur_item'}),                               
							search.createColumn({name: 'custrecord_igst_revpay_item'}),
							search.createColumn({name: 'custrecord_gst_reversal_taxcode'}),
							search.createColumn({name: "expenseaccount",join: "CUSTRECORD_CGST_REVPAY_ITEM",label: "Expense/COGS Account"}),
							search.createColumn({name: "expenseaccount",join: "CUSTRECORD_CGST_REVPUR_ITEM",label: "Expense/COGS Account"}),
							search.createColumn({name: "expenseaccount",join: "CUSTRECORD_IGST_REVPAY_ITEM",label: "Expense/COGS Account"}),
							search.createColumn({name: "expenseaccount",join: "CUSTRECORD_IGST_REVPUR_ITEM",label: "Expense/COGS Account"}),
							search.createColumn({name: "expenseaccount",join: "CUSTRECORD_SGST_REVPAY_ITEM",label: "Expense/COGS Account"}),
							search.createColumn({name: "expenseaccount",join: "CUSTRECORD_SGST_REVPUR_ITEM",label: "Expense/COGS Account"})
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
			revSgstPurchaseItem=result.getValue({name: "custrecord_sgst_revpur_item"});
			revSgstPayableItem=result.getValue({name: "custrecord_sgst_revpay_item"});
			revCgstPurchaseItem=result.getValue({name: "custrecord_cgst_revpur_item"});
			revCgstPayableItem=result.getValue({name: "custrecord_cgst_revpay_item"});
			revIgstPurchaseItem=result.getValue({name: "custrecord_igst_revpur_item"});
			revIgstPayableItem=result.getValue({name: "custrecord_igst_revpay_item"});
			gstReversalTaxcode =result.getValue({name: "custrecord_gst_reversal_taxcode", label: "Reversal Taxcode"});
			revCgstRevPurchaseAccId=result.getValue({name: "expenseaccount",join: "CUSTRECORD_CGST_REVPUR_ITEM",label: "CGST Reversal Purchase Account"});
			revCgstRevPayableAccId=result.getValue({name: "expenseaccount",join: "CUSTRECORD_CGST_REVPAY_ITEM",label: "CGST Reversal Payable Account"});
			revSgstPurchaseAccId=result.getValue({name: "expenseaccount",join: "CUSTRECORD_SGST_REVPUR_ITEM",label: "SGST Reversal Purchase Account"});
			revSgstRevPayableAccId=result.getValue({name: "expenseaccount",join: "CUSTRECORD_SGST_REVPAY_ITEM",label: "SGST Reversal Payable Account"});
			revIgstRevPurchaseAccId=result.getValue({name: "expenseaccount",join: "CUSTRECORD_IGST_REVPUR_ITEM",label: "IGST Reversal Purchase Account"});
			revIgstRevPayableAccId=result.getValue({name: "expenseaccount",join: "CUSTRECORD_IGST_REVPAY_ITEM",label: "IGST Reversal Payable Account"});


			GST_TAXCODE_MATRIX_ARR[gstType+gstItemSchedule] = {"StrGstType":strGstType,"GstType" :gstType,"GstTaxcode":gstTaxcode,"GstRate":gstRate,'RevSgstPurchaseItem':revSgstPurchaseItem,'RevSgstPayableItem':revSgstPayableItem,'RevCgstPurchaseItem':revCgstPurchaseItem,
					'RevCgstPayableItem':revCgstPayableItem,'RevIgstPurchaseItem':revIgstPurchaseItem,'RevIgstPayableItem':revIgstPayableItem,'GstReversalTaxcode':gstReversalTaxcode,'RevSgstPurchaseAccId':revSgstPurchaseAccId,'RevSgstRevPayableAccId':revSgstRevPayableAccId,
					'RevCgstRevPurchaseAccId':revCgstRevPurchaseAccId,'RevCgstRevPayableAccId':revCgstRevPayableAccId,'RevIgstRevPurchaseAccId':revIgstRevPurchaseAccId,'RevIgstRevPayableAccId':revIgstRevPayableAccId};

			return true;
		});
		log.debug("getTaxCodeMatrixDetails","GST_TAXCODE_MATRIX_ARR"+JSON.stringify(GST_TAXCODE_MATRIX_ARR));
	}
	//-------------------------------------- End - Function to get details of GST TaxCode Matric records ----------------------------------------//

	return {
		beforeLoad: beforeLoad,
		afterSubmit: afterSubmit
	};
		});
