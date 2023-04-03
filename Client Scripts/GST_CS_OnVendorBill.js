/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @Author 
 */
 //Capillary Group - Virtual
define(['N/currentRecord', 'N/record', 'N/search', 'N/runtime', 'N/log'],

	function (currentRecord, record, search, runtime, log) {
		var gstNumber;
		var intra = 1;
		var inter = 2;

		function pageInit(scriptContext) {
			
			try{
				var currentRecordObj = scriptContext.currentRecord;
                  				 	
    			//var recordType = currentRecordObj.type;
                //alert(recordType);
				var subsidiary = currentRecordObj.getValue({fieldId: 'subsidiary'});

				var isGSTType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});
				var scriptObj = runtime.getCurrentScript();

				var getIndiaSubsidiary = [];
				var getSubsidiary = scriptObj.getParameter({name: 'custscript_gst_po_cs_indiasubsidiary'});
				//getIndiaSubsidiary.push(getSubsidiary);
				var indiaSubObj	= getSubsidiary.toString();
				log.debug({title: "indiaSubObj", details: indiaSubObj});

				//Gets the Location firld is enable or not.
				var isEnable = runtime.isFeatureInEffect({feature: "LOCATIONS"});

				if (indiaSubObj && indiaSubObj.indexOf(subsidiary) != -1) {
					//alert("Entered");
					if (scriptContext.mode == 'copy') {

						var lineItemCount = currentRecordObj.getLineCount({sublistId: 'item'});
						currentRecordObj.setValue({fieldId: 'custbody_gst_totalcgst',value: ''});
						currentRecordObj.setValue({fieldId: 'custbody_gst_totalsgst',value: ''});
						currentRecordObj.setValue({fieldId: 'custbody_gst_totaligst',value: ''});

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
						}

						return;

					}

					
                    var customerId = currentRecordObj.getValue({
                        fieldId: 'entity'
                    });

                    var shippingAddress = currentRecordObj.getValue({
                        fieldId: 'shipaddresslist'
                    });

                    var billingAddress = currentRecordObj.getValue({
                        fieldId: 'billaddresslist'
                    });



                    //end.............

                    if (scriptContext.mode != 'edit' && scriptContext.mode != 'xedit') {
                        setCustomerGstNumber(customerId, subsidiary, shippingAddress, currentRecordObj);
                    }

                    if (!isEnable) {
                        //Load location to get the state and gst number from location address.
                        /*var locationRecObjSubsidiary = record.load({
                            type: record.Type.SUBSIDIARY,
                            id: subsidiary
                        })

                        var subrec = locationRecObjSubsidiary.getSubrecord({
                            fieldId: 'mainaddress'
                        });

                        var companyState = subrec.getText({
                            fieldId: 'custrecord_state_gst'
                        });

                        //Subsidiary'addr GST No.
                        var getLocationGstNumber = subrec.getValue({
                            fieldId: 'custrecord_gst_nocustomeraddr'
                        });*/
						 var getLocationGstNumber = searchOnSubsidiary(subsidiary);

                        currentRecordObj.setValue({
                            fieldId: 'custpage_location',
                            value: getLocationGstNumber,
                        });
                    } else {
                        var getLocation = currentRecordObj.getValue({
                            fieldId: 'location'
                        });
                        log.debug('getLocation PI__' , getLocation);

                        if (getLocation) {
                            /*var locationRecordObj = record.load({
                                type: record.Type.LOCATION,
                                id: getLocation
                            })
                            var subrec = locationRecordObj.getSubrecord({
                                fieldId: 'mainaddress'
                            });
                            var companyState = subrec.getText({
                                fieldId: 'custrecord_state_gst'
                            });
                            var locGstNo = subrec.getValue({
                                fieldId: 'custrecord_gst_nocustomeraddr'
                            });*/
							var locGstNo = searchOnLocation(getLocation);
                            log.debug('before set PI  __' , locGstNo);

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_locationregno',
                                value: locGstNo
                            });
							
							//---start GST TYPE on PS -- //
							var customerGstNumber = currentRecordObj.getValue({
                                fieldId: 'custbody_gst_customerregno'
                            });
							log.debug('Location GSTIN PI __' , locGstNo);
							log.debug('Customer GSTIN PI __' , customerGstNumber);

                            //If customer gst number not found.
                            if (customerGstNumber == "null" || customerGstNumber == "") {

                                var getCustGSTType = currentRecordObj.getText({
                                    fieldId: 'custbody_gst_destinationstate'
                                });

                                locGstNo = locGstNo.toString();
                                locGstNo = locGstNo.substr(0, 2);
                                //alert('customerGstNumber FC:'+customerGstNumber+'companyGstNumber FC :'+companyGstNumber);
								log.debug({title:'customerGstNumber FC:', details:customerGstNumber});
								log.debug({title:'companyGstNumber FC:', details:companyGstNumber});
                                //If location state and customer's address state matches set gst type to intra.
                                if (Number(locGstNo) == Number(getCustGSTType)) {

                                    currentRecordObj.setValue({
                                        fieldId: 'custbody_gst_gsttype',
                                        value: intra

                                    });

                                }
                                //If location state and customer's address state does not matches set gst type to inter.
                                else {
                                    currentRecordObj.setValue({
                                        fieldId: 'custbody_gst_gsttype',
                                        value: inter
                                    });

                                }

                            } else {
                                var companyGstNumber = locGstNo;
                                var customerGstNumber = currentRecordObj.getValue({
                                    fieldId: 'custbody_gst_customerregno'
                                });
								log.debug('else part of Cust in PI:-',companyGstNumber + 'and' +customerGstNumber);

                                //If both the GST number's i.e. of customer and company are there then get the GST type.
                                if (companyGstNumber && customerGstNumber) {
									log.debug(' PI...01');

                                    companyGstNumber = companyGstNumber.toString();
                                    companyGstNumber = companyGstNumber.substr(0, 2);

                                    customerGstNumber = customerGstNumber.toString();
                                    customerGstNumber = customerGstNumber.substr(0, 2);

                                    //alert('customerGstNumber :'+customerGstNumber+'companyGstNumber :'+companyGstNumber);

                                    if (Number(companyGstNumber) == Number(customerGstNumber)) {
										log.debug(' PI... 11');

                                        currentRecordObj.setValue({
                                            fieldId: 'custbody_gst_gsttype',
                                            value: intra

                                        });

                                    } else {
										log.debug('PI... 12');

                                        currentRecordObj.setValue({
                                            fieldId: 'custbody_gst_gsttype',
                                            value: inter,
											ignoreFieldChange: true,
											forceSyncSourcing: true
                                        });

                                    }
                                }
                                //If Location's GST Number is blank then GST Type: Inter...
                                else {
									log.debug('PI... 02');
                                    currentRecordObj.setValue({
                                        fieldId: 'custbody_gst_gsttype',
                                        value: inter
                                    });
                                }
                            }
							
							//-- end --- //
                        }
                    }
                }
                return true;
            } catch (exp) {
                log.debug('Exception Log in PI:-', exp.id);
                log.debug('Exception Log in PI:-', exp.message);
            }
        }
		//Function to set the gst number and gst type based on the change of ship-address and location
		function fieldChanged(scriptContext)
		{
			try
			{
			var currentRecordObj = scriptContext.currentRecord;
			var subsidiary = currentRecordObj.getValue({fieldId: 'subsidiary'});
			var scriptObj = runtime.getCurrentScript();

			var getIndiaSubsidiary = [];
			var getSubsidiary = scriptObj.getParameter({name: 'custscript_gst_po_cs_indiasubsidiary'});
			//getIndiaSubsidiary.push(getSubsidiary);
			var indiaSubObj	= getSubsidiary.toString();
			log.debug({title: "indiaSubObj", details: indiaSubObj});

			var intra = 1;
			var inter = 2;
          
          //Gets the Location firld is enable or not.
			 var isEnable = runtime.isFeatureInEffect ({feature: "LOCATIONS"});

			//Check if customer's subsidiary matches India Subsidiary. If matched then check the fields change condition's.
			if (indiaSubObj && indiaSubObj.indexOf(subsidiary) != -1) {

				//   if (scriptContext.fieldId == "location" && (scriptContext.sublistId == null || scriptContext.sublistId == 'null')) {
				if ((scriptContext.fieldId == "location" || scriptContext.fieldId == "custpage_location") && (scriptContext.sublistId == null || scriptContext.sublistId == 'null')) {
					//alert("Inside location Field Change");
					isGSTType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});
					if (!isEnable) {
						var location = currentRecordObj.getValue({fieldId: 'custpage_location'});
					
					} else {
						var location = currentRecordObj.getValue({fieldId: 'location'});						
					}

					if (location) {
						if (isEnable) {
							var locationGstNumber	= searchOnLocation(location);
						} else {
							var locationGstNumber	= searchOnSubsidiary(subsidiary);
						}
						currentRecordObj.setValue({fieldId: 'custbody_gst_locationregno',value: locationGstNumber});
						var customerGstNumber = currentRecordObj.getValue({fieldId: 'custbody_gst_customerregno'});
						//If customer gst number not found.
						if (!customerGstNumber) {
							var getCustGSTType = currentRecordObj.getText({fieldId: 'custbody_gst_destinationstate'});

							locationGstNumber = locationGstNumber.toString();
							locationGstNumber = locationGstNumber.substr(0, 2);

							//If location state and customer's address state matches set gst type to intra.
							if (locationGstNumber && (Number(locationGstNumber) == Number(getCustGSTType))) {
								currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra});
							}
							//If location state and customer's address state does not matches set gst type to inter.
							else {
								currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter});
							}						
						} else {

							var companyGstNumber = currentRecordObj.getValue({fieldId: 'custbody_gst_locationregno'});

							var customerGstNumber = currentRecordObj.getValue({fieldId: 'custbody_gst_customerregno'});

							//If both the gst number's i.e. of customer and company are there then get the gst type.
							if (companyGstNumber && customerGstNumber) {

								companyGstNumber = companyGstNumber.toString();
								companyGstNumber = companyGstNumber.substr(0, 2);
								
								customerGstNumber = customerGstNumber.toString();
								customerGstNumber = customerGstNumber.substr(0, 2);
								
								if (companyGstNumber && (Number(companyGstNumber) == Number(customerGstNumber))) {
									currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra});
								} else {
									currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter});
								}
							}
							//If Location GST Number is blank then then GST type is considered as Inter
							else {
								currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter});
							}
						}
					} else {
						//alert('else location');
						currentRecordObj.setValue({fieldId: 'custbody_gst_locationregno',value: ''});
					}
					currentRecordObj.setValue({fieldId: 'custbody_gst_total_cgst',value: '',});
					currentRecordObj.setValue({fieldId: 'custbody_gst_totaligst',value: '',});
					currentRecordObj.setValue({fieldId: 'custbody_gst_totalsgst',value: '',});
				}
				if (scriptContext.fieldId == "billaddresslist") {
					var inter = 2;
					var intra = 1;

					var customerId = currentRecordObj.getValue({fieldId: 'entity'});
					var shippingAddress = Number(currentRecordObj.getValue({fieldId: 'billaddresslist'}));

					var locationText = currentRecordObj.getText({fieldId: 'location'});
					var destinationLocation = currentRecordObj.getText({fieldId: 'custbody_gst_destinationstate'});
				//	alert("Entered");
					/*var vendorSearchObj	= search.create({
						type: "vendor", 
						filters:
						[
						["type","anyof","PurchOrd"], 
						"AND", 
						["name","anyof","5057"], 
						"AND", 
						["mainline","is","T"]
						],
						columns: 
						[
						search.createColumn({name: "entityid", join: "vendor"})
						]
					});
								
					var vendorSearchCount = vendorSearchObj.runPaged().count;
					alert('vendorSearchCount:'+vendorSearchCount);
					vendorSearchObj.run().each(function(result){
						customerRecord = result.getValue({name: "entityid", join: "vendor"});
						
					return true;
					});*/
					/*var customerRecord = '';
					
					var purchaseorderSearchObj = search.create({
					   type: "purchaseorder",
					   filters:
					   [
						  ["type","anyof","PurchOrd"], 
						  "AND", 
						  ["name","anyof",customerId], 
						  "AND", 
						  ["mainline","is","T"]
					   ],
					   columns:
					   [
						  search.createColumn({
							 name: "entityid",
							 join: "vendor"
						  }),
						  search.createColumn({
							 name: "companyname",
							 join: "vendor"
						  })
					   ]
					});
					var searchResultCount = purchaseorderSearchObj.runPaged().count;
				//	alert('searchResultCount:'+searchResultCount);
					purchaseorderSearchObj.run().each(function(result){
					   customerRecord = result.getValue({name: "entityid", join: "vendor"});
					   return true;
					});*/
					
					
					
				//	alert('customerRecord:'+customerRecord);
					var customerRecord = record.load({type: record.Type.VENDOR,id: customerId});
					//alert("End");
					var addressDetailsObject = getGstOnAddress(customerRecord, shippingAddress); //Gets the GST No and State
					var state = addressDetailsObject.state;

					currentRecordObj.setValue({fieldId: 'custbody_gst_customerregno',value: addressDetailsObject.gstNumber});

					currentRecordObj.setValue({fieldId: 'custbody_gst_destinationstate',value: state,ignoreFieldChange: true,fireSlavingSync: true});

					var gstRegistrationNumber = currentRecordObj.getValue({fieldId: 'custbody_gst_locationregno'});

					//According to GST No, splits the STATE ABBREVIATION and sets the GST Type 
					gstRegistrationNumber = gstRegistrationNumber.toString();
					gstRegistrationNumber = gstRegistrationNumber.substr(0, 2);

					var custGSTNumber = addressDetailsObject.gstNumber;
					custGSTNumber = custGSTNumber.toString();
					custGSTNumber = custGSTNumber.substr(0, 2); //STATE ABBREVIATION like: MH,GJ

					// GST Type of same state
					if (Number(gstRegistrationNumber) == Number(custGSTNumber)) 
					{
						currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: intra});
					}
					//GST Type according to different states
					else 
					{
						currentRecordObj.setValue({fieldId: 'custbody_gst_gsttype',value: inter});
					}
					currentRecordObj.setValue({fieldId: 'custbody_gst_totalcgst',value: ''});
					currentRecordObj.setValue({fieldId: 'custbody_gst_totaligst',value: ''});
					currentRecordObj.setValue({fieldId: 'custbody_gst_totalsgst',value: ''});
				}

				if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item') 
				{
					if (isEnable) {
						var location = currentRecordObj.getValue({fieldId: 'location'});
						if (location == '' || location == null) 
						{
							var itemId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
							if (itemId != '' && itemId != null) 
							{
								alert('Please select a location first.');
								currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: '',ignoreFieldChange: false});
								return false;
							}
						}
					} else {
						return false;
					}
				}

				if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_reversal_apply') 
				{
					var itemId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});

					getTaxCode = search.lookupFields({type: 'item',id: itemId,columns: 'custitem_gst_itemschedule'});
					//alert("item getTaxCode "+getTaxCode);

					if (getTaxCode.custitem_gst_itemschedule[0])					
						var scheduleId = getTaxCode.custitem_gst_itemschedule[0].value;						
					else 
					{
						netsuiteAlert('Schedule is not set for this particular item');
						return;
					}

					var shipToState = currentRecordObj.getValue({fieldId: 'custbody_gst_destinationstate'});
					var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});

					if ((gstType != '' && gstType != null) && (scheduleId != '' && scheduleId != null)) 
					{
						var taxCodeFilters = [];
						var taxCodeColumns = [];

						taxCodeFilters.push(search.createFilter({name: 'custrecord_gst_type',operator: search.Operator.IS,values: gstType}));

						taxCodeFilters.push(search.createFilter({name: 'custrecord_gst_item_schedule',operator: search.Operator.IS,values: scheduleId}));

						taxCodeColumns.push(search.createColumn({name: 'custrecord_gst_tax_code'}));

						taxCodeColumns.push(search.createColumn({name: 'custrecord_gst_reversal_taxcode'}));

						var taxCodeSearch = search.create({"type": "customrecord_gst_tax_code_matrix","filters": taxCodeFilters,"columns": taxCodeColumns});

						var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});
						var scriptObj = runtime.getCurrentScript();
						if (arrSearchResults[0]) 
						{
							var taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
							var reversalTaxCode = arrSearchResults[0].getValue('custrecord_gst_reversal_taxcode');
						} else {
							alert('Custom GST tax record for the selected destination state not found');
							return;
						}
						var getApplyvalue = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_apply'});

						//If check-box not checked set the old tax code.
						if (!getApplyvalue)
							currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false});
						//If checked then set the reversal tax code.
						else
							currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: reversalTaxCode,ignoreFieldChange: false});						
					}
				}

				//----If user chanes Scheduled at Line Level...For Item------
				if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_itemschedule') 
				{
					var taxCodeId;
					var scheduleId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule'});
					log.debug('scheduleId ', scheduleId);

					var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});

					//Search on GST Tax Code Matrix to get the tax code, reversal tax code, reversal purchase and payable items for cgst, sgst and igst.
					if ((gstType != '' && gstType != null) && (scheduleId != '' && scheduleId != null)) 
					{
						var filterTaxCodeMatrix = new Array();
						var columnTaxCodeMatrix = new Array();

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
						
						var searchTaxCodeMatrix = search.create({"type": "customrecord_gst_tax_code_matrix","filters": filterTaxCodeMatrix,"columns": columnTaxCodeMatrix});
						
						var arraySearchTaxCodeMatrix = searchTaxCodeMatrix.run().getRange({start: 0,end: 1});

						//If search record found. Get the values of tax code, reversal tax code, and all the reversal items of cgst, sgst and igst.
						if (arraySearchTaxCodeMatrix[0] != '' && arraySearchTaxCodeMatrix[0] != null && arraySearchTaxCodeMatrix[0] != undefined && arraySearchTaxCodeMatrix[0] != 'null' && arraySearchTaxCodeMatrix[0] != 'undefined')
						{
							taxCodeId = arraySearchTaxCodeMatrix[0].getValue('custrecord_gst_tax_code');
							log.debug("Inside if search record found.", 'taxCodeId ' + taxCodeId);
						}
					}
					if (taxCodeId != '' && taxCodeId != null)					
						currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeId,ignoreFieldChange: false});					

					return true;
				}
				//----If user chanes Scheduled at Line Level...For Expense------
				if (scriptContext.sublistId == 'expense' && scriptContext.fieldId == 'custcol_gst_itemschedule') 
				{
					var taxCodeId;
					var scheduleId = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule'});
					log.debug('scheduleId ', scheduleId);

					var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});

					//Search on GST Tax Code Matrix to get the tax code, reversal tax code, reversal purchase and payable items for cgst, sgst and igst.
					if ((gstType != '' && gstType != null) && (scheduleId != '' && scheduleId != null)) 
					{
						var filterTaxCodeMatrix = new Array();
						var columnTaxCodeMatrix = new Array();

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
						
						var searchTaxCodeMatrix = search.create({"type": "customrecord_gst_tax_code_matrix","filters": filterTaxCodeMatrix,"columns": columnTaxCodeMatrix});
						
						var arraySearchTaxCodeMatrix = searchTaxCodeMatrix.run().getRange({start: 0,end: 1});

						//If search record found. Get the values of tax code, reversal tax code, and all the reversal items of cgst, sgst and igst.
						if (arraySearchTaxCodeMatrix[0] != '' && arraySearchTaxCodeMatrix[0] != null && arraySearchTaxCodeMatrix[0] != undefined && arraySearchTaxCodeMatrix[0] != 'null' && arraySearchTaxCodeMatrix[0] != 'undefined')
						{
							taxCodeId = arraySearchTaxCodeMatrix[0].getValue('custrecord_gst_tax_code');
							log.debug("Inside if search record found.", 'taxCodeId ' + taxCodeId);
						}
					}
					if (taxCodeId != '' && taxCodeId != null)					
						currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: taxCodeId,ignoreFieldChange: false});					

					return true;
				}
				return true;
			}
			return true;			
			}catch(e){
			 	log.debug ({title: e.name,details: e.message}); 
		      }
		}

		//To be written
		function postSourcing(scriptContext)
		{
			try
			{
				var currentRecordObj = currentRecord.get();
				var subsidiary = currentRecordObj.getValue({fieldId: 'subsidiary'});
				var scriptObj = runtime.getCurrentScript();
				var getIndiaSubsidiary = [];
				var getSubsidiary = scriptObj.getParameter({name: 'custscript_gst_po_cs_indiasubsidiary'});
				//getIndiaSubsidiary.push(getSubsidiary);
				var indiaSubObj	= getSubsidiary.toString();
				log.debug({title: "indiaSubObj", details: indiaSubObj});

				if (indiaSubObj && indiaSubObj.indexOf(subsidiary) != -1) 
				{
					if(scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item') 
					{
						var myStateCode = currentRecordObj.getValue({fieldId: 'custbody_gst_locationregno'});

						if(myStateCode != null && myStateCode != '') 
						myStateCode = myStateCode.substr(0, 2);					

						var itemId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'item'});
						var getTaxCode;
						if(itemId)
						{
							getTaxCode = search.lookupFields({type: 'item',id: itemId,columns: 'custitem_gst_itemschedule'});						

							if(getTaxCode.custitem_gst_itemschedule[0]) 
								var scheduleId = getTaxCode.custitem_gst_itemschedule[0].value;							
							else 
							{
								alert('Schedule is not set for this particular item');
								return;
							}

							var shipToState = currentRecordObj.getValue({fieldId: 'custbody_gst_destinationstate'});
							var custgstn = currentRecordObj.getValue({fieldId: 'custbody_gst_customerregno'});
							var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});

							var taxCodeFilters = [];
							var taxCodeColumns = [];

							if(gstType)
								taxCodeFilters.push(search.createFilter({name: 'custrecord_gst_type',operator: search.Operator.IS,values: gstType}));
							
							if(scheduleId)
								taxCodeFilters.push(search.createFilter({name: 'custrecord_gst_item_schedule',operator: search.Operator.IS,values: scheduleId}));
						
							taxCodeColumns.push(search.createColumn({name: 'custrecord_gst_tax_code'}));

							var taxCodeSearch = search.create({"type": "customrecord_gst_tax_code_matrix","filters": taxCodeFilters,"columns": taxCodeColumns});

							var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});
							var scriptObj = runtime.getCurrentScript();
							var taxCodeInternalId;
							if (arrSearchResults)						
								taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
							else 
							{
								alert('Custom GST tax record for the selected destination state not found');
								return;
							}
							taxCodeInternalId = Number(taxCodeInternalId);

							currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false});

						return true;
					}
					return true;
				}

				if (scriptContext.sublistId == 'expense' && scriptContext.fieldId == 'account')
				{
					var expCategory = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'category'});
					var accountId = currentRecordObj.getCurrentSublistValue({sublistId: 'expense',fieldId: 'account'});
					var lookupExpSchedule;

					if (accountId)
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

						if ((gstType != '' && gstType != null) && (scheduleId != '' && scheduleId != null)) 
						{
							var taxCodeFilters = [];
							var taxCodeColumns = [];

							taxCodeFilters.push(search.createFilter({name: 'custrecord_gst_type',operator: search.Operator.IS,values: gstType}));
							taxCodeFilters.push(search.createFilter({name: 'custrecord_gst_item_schedule',operator: search.Operator.IS,values: scheduleId}));

							taxCodeColumns.push(search.createColumn({name: 'custrecord_gst_tax_code'}));
							
							var taxCodeSearch = search.create({"type": "customrecord_gst_tax_code_matrix","filters": taxCodeFilters,"columns": taxCodeColumns});

							var arrSearchResults = taxCodeSearch.run().getRange({start: 0,end: 1});

							if(arrSearchResults[0])							
								var taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
							else
							{
								alert('Custom GST tax record for the selected destination state not found');
								return;
							}
							currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false});
							currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: scheduleId,ignoreFieldChange: false});
							currentRecordObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_hsnsaccode',value: expHsnCode,ignoreFieldChange: false});
						} 
						else
							return false;						
					}
				}
				
				if(scriptContext.fieldId == 'entity') 
				{				
					var subsidiary = currentRecordObj.getValue({fieldId: 'subsidiary'});                  
                  	//Gets the Location firld is enable or not.
			     	var isEnable = runtime.isFeatureInEffect ({feature: "LOCATIONS"});				
					if(isEnable)
					{
						//Load location to get the state and gst number from location address.
						//var locationRecObjSubsidiary = record.load({type: record.Type.SUBSIDIARY,id: subsidiary})

						//var subrec = locationRecObjSubsidiary.getSubrecord({fieldId: 'mainaddress'});

						//var companyState = subrec.getText({fieldId: 'custrecord_state_gst'});

						//Subsidiary'addr GST No.
						//var getLocationGstNumber = subrec.getValue({fieldId: 'custrecord_gst_nocustomeraddr' });
						
						//Code added resolve mainaddress is not subrecord field issue
						var getLocationGstNumber	= searchOnSubsidiary(subsidiary);
						currentRecordObj.setValue({fieldId: 'custpage_location',value: getLocationGstNumber,});
			    	}
				}
				return true;
			}
				return true;
			}catch(e){
			 log.debug ({title: e.name,details: e.message}); 
		     }
		}

		//Function to get the gst number from the address book.
		function getGstOnAddress(customerRecord, shippingAddress)
		{
			//Initialize variables to return the values from the address book.
			var customerGstID;
			var state;
			//Get the sublist of address subrecord.
			var lineCount = customerRecord.getLineCount({sublistId: 'addressbook'});

			if (shippingAddress != null && shippingAddress != '' && shippingAddress != undefined)
			{				
				for (var i = 0; i < lineCount; i++)
				{
					var addressId = customerRecord.getSublistValue({sublistId: 'addressbook',fieldId: 'id',line: i});

					//If the address book id on the current record matches the address line on the customer the get the GST Number and State.
					if (Number(shippingAddress) == Number(addressId))
					{
						var addressSubrecord = customerRecord.getSublistSubrecord({sublistId: 'addressbook',fieldId: 'addressbookaddress',line: i});

						customerGstID = addressSubrecord.getValue({fieldId: 'custrecord_gst_nocustomeraddr'}); //custrecord_gst_nocustomeraddr
						state = addressSubrecord.getValue({fieldId: 'custrecord_gst_addressstatecode'});
					}
				}
			}
			//If the shipping address is empty then state and gst number are defaulted to the 1st line address book values.
			else
			{				
				var addressId = customerRecord.getSublistValue({sublistId: 'addressbook',fieldId: 'id',line: 0});
				var addressSubrecord = customerRecord.getSublistSubrecord({sublistId: 'addressbook',fieldId: 'addressbookaddress',line: 0});

				customerGstID = addressSubrecord.getValue({fieldId: 'custrecord_gst_nocustomeraddr'});
				state = addressSubrecord.getValue({fieldId: 'custrecord_gst_addressstatecode'});
			}
			var addressDetailObj = {
				'gstNumber': customerGstID,
				'state': state
			}
			return addressDetailObj;
		}

		//Function to get the gst type based on the state code mapping.
		function getGstType(sourceGstNumber, destinationGst, state, locationText, destinationLocation)
		{
			var intra = 1;
			var inter = 2;

			if (destinationGst == null || destinationGst == '')
			{
				return inter;
			}				
			else 
			{
				sourceGstNumber = sourceGstNumber.toString();
				sourceGstNumber = sourceGstNumber.substr(0, 2);
				if(!destinationGst) 
				{
					var stateFilter = [];
					var stateColumn = [];

					stateFilter.push(search.createFilter({name: 'custrecord_state',operator: search.Operator.IS,values: state}));

					taxCodeColumns.push(search.createColumn({name: 'custrecord_state_code'}));

					var stateRecordSearch = search.create({"type": "customrecord_state_code_mapping","filters": stateFilter,"columns": stateColumn});

					stateRecordSearch = stateRecordSearch.run().getRange({start: 0,end: 1});
					if (stateRecordSearch[0])
					{
						var stateCode = arrSearchResults[0].getValue('custrecord_gst_tax_code')
						destinationGst = stateCode;						
					}
				} else {
					destinationGst = destinationGst.toString();
					destinationGst = destinationGst.substr(0, 2);
				}
				if(Number(sourceGstNumber) == Number(destinationGst))		
					return intra;
				else
					return inter;				
			}
		}

		/**
		 * 
		 * @param customerId
		 * @param subsidiary
		 * @param shippingAddress
		 * @param currentRecordObj
		 *  sets customer and company gst number
		 */
		function setCustomerGstNumber(customerId, subsidiary, shippingAddress, currentRecordObj)
		{
			if (customerId && subsidiary)
			{
				var intra = 1;
				var inter = 2;

				var rec = record.load({type: record.Type.VENDOR,id: customerId});
				var addressObject = getGstOnAddress(rec, shippingAddress);
				var state = addressObject.state;

				if (addressObject.gstNumber)				
					currentRecordObj.setValue({fieldId: 'custbody_gst_customerregno',value: addressObject.gstNumber,ignoreFieldChange: true,fireSlavingSync: true});				

				currentRecordObj.setValue({fieldId: 'custbody_gst_destinationstate',value: state,ignoreFieldChange: true,fireSlavingSync: true});
			}
		}
		//Code added to resolve mainaddress is not subrecord field issue
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
			//log.debug("subsidiarySearchObj result count",searchResultCount);
			subsidiarySearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			getLocationGstNumber = result.getValue({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"});
			//alert('getLocationGstNumber:'+getLocationGstNumber);
			return true;
			});
			return getLocationGstNumber;
		}
		//Code added to resolve mainaddress is not subrecord field issue
		function searchOnLocation(location)
		{
			var getLocationGstNumber;
			var subsidiarySearchObj = search.create({
			type: "location",
			filters:
			[
				["internalid","anyof",location]
			],
			columns:
			[
				search.createColumn({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"})
			]
			});
			var searchResultCount = subsidiarySearchObj.runPaged().count;
			//log.debug("subsidiarySearchObj result count",searchResultCount);
			subsidiarySearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			getLocationGstNumber = result.getValue({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"});
			//alert('getLocationGstNumber:'+getLocationGstNumber);
			return true;
			});
			return getLocationGstNumber;
		}

		return {
			pageInit: pageInit,
			fieldChanged: fieldChanged,
			postSourcing: postSourcing
		};
	});
