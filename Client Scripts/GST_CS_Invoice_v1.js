/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @Author 
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/runtime', 'N/log'],

    function(currentRecord, record, search, runtime, log) {

        var gstNumber;
        var intra = 1;
        var inter = 2;
        var country = '';

        function pageInit(scriptContext) {
            try {
                var currentRecordObj = scriptContext.currentRecord;
				var subsidiary = currentRecordObj.getValue({
                    fieldId: 'subsidiary'
                });
				log.debug({title: "subsidiary : ", details:subsidiary});
				
                var scriptObj = runtime.getCurrentScript();
                var getIndiaSubsidiary = [];
                var getSubsidiary = scriptObj.getParameter({name: 'custscript_gst_sales_cs_indiasubsi_v1'});
                getIndiaSubsidiary.push(getSubsidiary);
				//log.debug({title: "getSubsidiary", details:getSubsidiary});
				log.debug({title: "getIndiaSubsidiary", details:getIndiaSubsidiary.indexOf(subsidiary)});
                //Gets the Location firld is enable or not.
                var isEnable = runtime.isFeatureInEffect({
                    feature: "LOCATIONS"
                });
				
				//According to Subsidiary parameter and subsidiary from record it will gets the line item fields...
                if (getIndiaSubsidiary && (getIndiaSubsidiary.indexOf(subsidiary) != -1)) {
					log.debug({title: "Inside If Condition PageInit", details:getIndiaSubsidiary});
                    if (scriptContext.mode == 'copy') {
                        var lineItemCount = currentRecordObj.getLineCount({
                            sublistId: 'item'
                        });
                        for (var i = 0; i < lineItemCount; i++) {
                            currentRecordObj.selectLine({
                                sublistId: 'item',
                                line: i
                            });

                            currentRecordObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_gst_sgstrate ',
                                value: ''
                            });

                            currentRecordObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_gst_cgstrate',
                                value: ''
                            });

                            currentRecordObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_gst_igstrate',
                                value: ''
                            });

                            currentRecordObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_gst_igstamount',
                                value: ''
                            });

                            currentRecordObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_gst_sgstamount',
                                value: ''
                            });

                            currentRecordObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_gst_cgstamount',
                                value: ''
                            });

                            currentRecordObj.commitLine({
                                sublistId: 'item'
                            });

                        }

                        return;
                    }

                    var customerId = currentRecordObj.getValue({fieldId: 'entity'});
                    var shippingAddress = currentRecordObj.getValue({fieldId: 'shipaddresslist'});
                    var billingAddress = currentRecordObj.getValue({fieldId: 'billaddresslist'});                    
                    var subsidiary = currentRecordObj.getValue({fieldId: 'subsidiary'});                    
                    if(_dataValidation(customerId) && Number(shippingAddress)>0)
                    {                    
                        var customerRecord = record.load({type: record.Type.CUSTOMER,id: customerId});
                        country = getCountry(customerRecord,shippingAddress);
                        if(country != "IN")
                        {
                            //alert(country);
                            currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: true});
                        }
                        else
                            currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: false});
                        //log.debug('PostSource country :-', country);
                    }

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
							log.debug('Customer GSTIN PI __' , locGstNo);
							log.debug('Customer GSTIN PI __' , customerGstNumber);

                            //If customer gst number not found.
                            if (customerGstNumber == null || customerGstNumber == "") {
								log.debug('Inside customerGstNumber == null Condition' , customerGstNumber);
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
        
        /*function saveRecord(scriptContext)
        {
            try {
                var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});
                if(customerIsNRI == false)


                return true;
            } catch (exp) {
                log.debug('Exception Log in SaveRecord:-', exp.id);
                log.debug('Exception Log in SaveRecord:-', exp.message);
            }
        }*/

        //Function to set the gst number and gst type based on the change of Ship Address, Billing Address and location
        function fieldChanged(scriptContext) {
            try {

                var currentRecordObj = scriptContext.currentRecord;
                var subsidiary = currentRecordObj.getValue({
                    fieldId: 'subsidiary'
                });
				var scriptObj = runtime.getCurrentScript();
                var getIndiaSubsidiary = [];
                var getSubsidiary = scriptObj.getParameter({
                    name: 'custscript_gst_sales_cs_indiasubsi_v1'
                });
                getIndiaSubsidiary.push(getSubsidiary);

                var intra = 1;
                var inter = 2;

                //Location field is enable or not.
                var isEnable = runtime.isFeatureInEffect({
                    feature: "LOCATIONS"
                });
				//Check if customer's subsidiary matches India Subsidiary. If matched then check the fields change condition's.
                if (getIndiaSubsidiary && (getIndiaSubsidiary.indexOf(subsidiary) != -1)) {
					if ((scriptContext.fieldId == "location" || scriptContext.fieldId == "custpage_location") && (scriptContext.sublistId == null || scriptContext.sublistId == 'null')) {
						if (!isEnable) {
                            var location = currentRecordObj.getValue({
                                fieldId: 'custpage_location'
                            });
                            //alert('location --'+location);
                        } else {
                            var location = currentRecordObj.getValue({
                                fieldId: 'location'
                            });
                            //alert('location FC--'+location);
                        }

                        if (location) {
                            //Load location to get the state and gst number from location address.
                            if (isEnable) {
                                //var locationRecordObj = record.load({type: record.Type.LOCATION,id: location});
								var locationRecordObj = searchOnLocation(location);
                            } else {
                                //var locationRecordObj = record.load({type: record.Type.SUBSIDIARY,id: subsidiary});
								var locationRecordObj = searchOnSubsidiary(subsidiary);
                            }


                            /*var subrec = locationRecordObj.getSubrecord({
                                fieldId: 'mainaddress'
                            });
                            var companyState = subrec.getText({
                                fieldId: 'custrecord_state_gst'
                            });
                            var locationGstNumber = subrec.getValue({
                                fieldId: 'custrecord_gst_nocustomeraddr'
                            });*/
							log.debug({title: "locationRecordObj", details:locationRecordObj});
							var locationGstNumber =	locationRecordObj;
								
                            currentRecordObj.setValue({fieldId: 'custbody_gst_locationregno',
														value: locationGstNumber});

                            var customerGstNumber = currentRecordObj.getValue({
                                fieldId: 'custbody_gst_customerregno'
                            });
							log.debug({title:'customerGstNumber FieldChange:', details:customerGstNumber});
								
                            //If customer gst number not found.
                            if (!customerGstNumber) {

                                var getCustGSTType = currentRecordObj.getText({
                                    fieldId: 'custbody_gst_destinationstate'
                                });

                                locationGstNumber = locationGstNumber.toString();
                                locationGstNumber = locationGstNumber.substr(0, 2);
								log.debug({title:'getCustGSTType FieldChange:', details:getCustGSTType});
								log.debug({title:'locationGstNumber FieldChange:', details:locationGstNumber});
                                //alert('customerGstNumber FC:'+customerGstNumber+'companyGstNumber FC :'+companyGstNumber);

                                //If location state and customer's address state matches set gst type to intra.
                                if (Number(locationGstNumber) == Number(getCustGSTType)) {

                                    currentRecordObj.setValue({
                                        fieldId: 'custbody_gst_gsttype',
                                        value: intra,

                                    });

                                }
                                //If location state and customer's address state does not matches set gst type to inter.
                                else {
                                    currentRecordObj.setValue({
                                        fieldId: 'custbody_gst_gsttype',
                                        value: inter,
                                    });

                                }

                            } else {
								log.debug({title: "Inside Else", details: "Entered"});
                                var companyGstNumber = currentRecordObj.getValue({
                                    fieldId: 'custbody_gst_locationregno'
                                });
                                var customerGstNumber = currentRecordObj.getValue({
                                    fieldId: 'custbody_gst_customerregno'
                                });
								log.debug({title: "companyGstNumber inside else", details:companyGstNumber});
								log.debug({title: "customerGstNumber inside else", details:customerGstNumber});
									
                                //If both the GST number's i.e. of customer and company are there then get the GST type.
                                if (companyGstNumber && customerGstNumber) {

                                    companyGstNumber = companyGstNumber.toString();
                                    companyGstNumber = companyGstNumber.substr(0, 2);

                                    customerGstNumber = customerGstNumber.toString();
                                    customerGstNumber = customerGstNumber.substr(0, 2);

                                    //alert('customerGstNumber :'+customerGstNumber+'companyGstNumber :'+companyGstNumber);

                                    if (Number(companyGstNumber) == Number(customerGstNumber)) {

                                        currentRecordObj.setValue({
                                            fieldId: 'custbody_gst_gsttype',
                                            value: intra,

                                        });

                                    } else {

                                        currentRecordObj.setValue({
                                            fieldId: 'custbody_gst_gsttype',
                                            value: inter,
                                        });

                                    }
                                }
                                //If Location's GST Number is blank then GST Type: Inter...
                                else {
                                    currentRecordObj.setValue({
                                        fieldId: 'custbody_gst_gsttype',
                                        value: inter,
                                    });
                                }
                            }
                        } else {
                            //alert('else location');
                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_locationregno',
                                value: ''
                            });
                        }

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totalcgst',
                            value: '',

                        });
                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totaligst',
                            value: '',

                        });
                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totalsgst',
                            value: '',

                        });

                    }

                    var isBillingAddress = currentRecordObj.getValue({
                        fieldId: 'custbody_gst_billing_address'
                    });

                    //If isBillingAddress is false then gets the shipping Address's state and GST No 
                    if (scriptContext.fieldId == "shipaddresslist" && (isBillingAddress == false || isBillingAddress == 'false')) {
                        //  alert('A');
                        var inter = 2;
                        var intra = 1;

                        var customerId = currentRecordObj.getValue({
                            fieldId: 'entity'
                        });
                        var shippingAddress = Number(currentRecordObj.getValue({
                            fieldId: 'shipaddresslist'
                        }));

                        var locationText = currentRecordObj.getText({
                            fieldId: 'location'
                        });
                        var destinationLocation = currentRecordObj.getText({
                            fieldId: 'custbody_gst_destinationstate'
                        });

                        var customerRecord = record.load({
                            type: record.Type.CUSTOMER,
                            id: customerId
                        });
                        //****************** Code added by Prashant Lokhande For NRI Customer Date 29/05/2020  */
                        country = getCountry(customerRecord,shippingAddress);
                        if(country != "IN")
                        {
                            //alert(country);
                            currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: true});
                        }
                        else
                            currentRecordObj.setValue({fieldId: 'custbody_ygst_is_nri_customer',value: false});
                    //****************** End Code added by Prashant Lokhande For NRI Customer Date 29/05/2020  */ 
                        var addressDetailsObject = getGstOnAddress(customerRecord, shippingAddress); //Gets the GST No and State
                        var state = addressDetailsObject.state;

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_customerregno',
                            value: addressDetailsObject.gstNumber,

                        });

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_destinationstate',
                            value: state,
                            ignoreFieldChange: true,
                            fireSlavingSync: true
                        });

                        var gstRegistrationNumber = currentRecordObj.getValue({
                            fieldId: 'custbody_gst_locationregno'
                        });

                        //According to GST No, splits the STATE ABBREVIATION and sets the GST Type 
                        gstRegistrationNumber = gstRegistrationNumber.toString();
                        gstRegistrationNumber = gstRegistrationNumber.substr(0, 2);

                        var custGSTNumber = addressDetailsObject.gstNumber;
                        custGSTNumber = custGSTNumber.toString();
                        custGSTNumber = custGSTNumber.substr(0, 2); //STATE ABBREVIATION like: MH,GJ

                        // GST Type of same state
                        if (Number(gstRegistrationNumber) == Number(custGSTNumber)) {

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_gsttype',
                                value: intra,

                            });

                        }
                        //GST Type according to different states
                        else {

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_gsttype',
                                value: inter,

                            });

                        }

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totalcgst',
                            value: '',

                        });

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totaligst',
                            value: '',

                        });

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totalsgst',
                            value: '',

                        });

                    }
                    //If Billing Address exist but false then gets the shipping Address's state and GST No
                    else if (scriptContext.fieldId == "custbody_gst_billing_address" && (isBillingAddress == false || isBillingAddress == 'false')) {
                        //   alert('B');
                        var inter = 2;
                        var intra = 1;

                        var customerId = currentRecordObj.getValue({
                            fieldId: 'entity'
                        });
                        var shippingAddress = Number(currentRecordObj.getValue({
                            fieldId: 'shipaddresslist'
                        }));

                        var locationText = currentRecordObj.getText({
                            fieldId: 'location'
                        });
                        var destinationLocation = currentRecordObj.getText({
                            fieldId: 'custbody_gst_destinationstate'
                        });

                        var customerRecord = record.load({
                            type: record.Type.CUSTOMER,
                            id: customerId
                        });

                        var addressDetailsObject = getGstOnAddress(customerRecord, shippingAddress);
                        var state = addressDetailsObject.state;

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_customerregno',
                            value: addressDetailsObject.gstNumber,

                        });

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_destinationstate',
                            value: state,
                            ignoreFieldChange: true,
                            fireSlavingSync: true
                        });

                        var gstRegistrationNumber = currentRecordObj.getValue({
                            fieldId: 'custbody_gst_locationregno'
                        });

                        gstRegistrationNumber = gstRegistrationNumber.toString();
                        gstRegistrationNumber = gstRegistrationNumber.substr(0, 2);

                        var custGSTNumber = addressDetailsObject.gstNumber;
                        custGSTNumber = custGSTNumber.toString();
                        custGSTNumber = custGSTNumber.substr(0, 2);

                        if (Number(gstRegistrationNumber) == Number(custGSTNumber)) {

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_gsttype',
                                value: intra,

                            });

                        } else {

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_gsttype',
                                value: inter,

                            });

                        }

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totalcgst',
                            value: '',

                        });

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totaligst',
                            value: '',

                        });

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totalsgst',
                            value: '',

                        });

                    }

                    //If Billing Address exist and Billing Address is true then gets the Billing Address's state and GST No
                    else if (scriptContext.fieldId == "custbody_gst_billing_address" && (isBillingAddress == true || isBillingAddress == 'true')) {
                        // alert('C');
                        var inter = 2;
                        var intra = 1;

                        //If GST Billing Address checkbox is checked 
                        if (isBillingAddress == true) {

                            var customerId = currentRecordObj.getValue({
                                fieldId: 'entity'
                            });

                            var billingAddress = Number(currentRecordObj.getValue({
                                fieldId: 'billaddresslist'
                            }));

                            var locationText = currentRecordObj.getText({
                                fieldId: 'location'
                            });
                            var destinationLocation = currentRecordObj.getText({
                                fieldId: 'custbody_gst_destinationstate'
                            });

                            var customerRecord = record.load({
                                type: record.Type.CUSTOMER,
                                id: customerId
                            });

                            var addressDetailsObject = getGstOnAddress(customerRecord, billingAddress);
                            var state = addressDetailsObject.state;

                            currentRecordObj.setValue({

                                fieldId: 'custbody_gst_customerregno',
                                value: addressDetailsObject.gstNumber,

                            });

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_destinationstate',
                                value: state,
                                ignoreFieldChange: true,
                                fireSlavingSync: true
                            });

                            var gstRegistrationNumber = currentRecordObj.getValue({
                                fieldId: 'custbody_gst_locationregno'
                            });

                            gstRegistrationNumber = gstRegistrationNumber.toString();
                            gstRegistrationNumber = gstRegistrationNumber.substr(0, 2);

                            var custGSTNumber = addressDetailsObject.gstNumber;
                            custGSTNumber = custGSTNumber.toString();
                            custGSTNumber = custGSTNumber.substr(0, 2);

                            if (Number(gstRegistrationNumber) == Number(custGSTNumber)) {

                                currentRecordObj.setValue({
                                    fieldId: 'custbody_gst_gsttype',
                                    value: intra,

                                });

                            } else {

                                currentRecordObj.setValue({
                                    fieldId: 'custbody_gst_gsttype',
                                    value: inter,

                                });

                            }

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_totalcgst',
                                value: '',

                            });

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_totaligst',
                                value: '',

                            });

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_totalsgst',
                                value: '',

                            });

                        } else {
                            var customerId = currentRecordObj.getValue({
                                fieldId: 'entity'
                            });

                            var shippingAddress = Number(currentRecordObj.getValue({
                                fieldId: 'shipaddresslist'
                            }));

                            var locationText = currentRecordObj.getText({
                                fieldId: 'location'
                            });
                            var destinationLocation = currentRecordObj.getText({
                                fieldId: 'custbody_gst_destinationstate'
                            });

                            var customerRecord = record.load({
                                type: record.Type.CUSTOMER,
                                id: customerId
                            });

                            var addressDetailsObject = getGstOnAddress(customerRecord, shippingAddress); //getGstOnBillingAddress
                            var state = addressDetailsObject.state;

                            currentRecordObj.setValue({

                                fieldId: 'custbody_gst_customerregno',
                                value: addressDetailsObject.gstNumber,

                            });

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_destinationstate',
                                value: state,
                                ignoreFieldChange: true,
                                fireSlavingSync: true
                            });

                            var gstRegistrationNumber = currentRecordObj.getValue({
                                fieldId: 'custbody_gst_locationregno'
                            });

                            gstRegistrationNumber = gstRegistrationNumber.toString();
                            gstRegistrationNumber = gstRegistrationNumber.substr(0, 2);

                            var custGSTNumber = addressDetailsObject.gstNumber;
                            custGSTNumber = custGSTNumber.toString();
                            custGSTNumber = custGSTNumber.substr(0, 2);

                            if (Number(gstRegistrationNumber) == Number(custGSTNumber)) {

                                currentRecordObj.setValue({
                                    fieldId: 'custbody_gst_gsttype',
                                    value: intra,

                                });

                            } else {

                                currentRecordObj.setValue({
                                    fieldId: 'custbody_gst_gsttype',
                                    value: inter,

                                });

                            }

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_totalcgst',
                                value: '',

                            });

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_totaligst',
                                value: '',

                            });

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_totalsgst',
                                value: '',

                            });


                        }

                    }

                    //If Billing Address is true then gets the Billing Address's state and GST No
                    else if (scriptContext.fieldId == "billaddresslist" && (isBillingAddress == true || isBillingAddress == 'true')) {
                        // alert('D');
                        var inter = 2;
                        var intra = 1;

                        var customerId = currentRecordObj.getValue({
                            fieldId: 'entity'
                        });
                        var billingAddress = Number(currentRecordObj.getValue({
                            fieldId: 'billingAddress'
                        }));

                        var locationText = currentRecordObj.getText({
                            fieldId: 'location'
                        });
                        var destinationLocation = currentRecordObj.getText({
                            fieldId: 'custbody_gst_destinationstate'
                        });

                        var customerRecord = record.load({
                            type: record.Type.CUSTOMER,
                            id: customerId
                        });

                        var addressDetailsObject = getGstOnAddress(customerRecord, billingAddress);
                        var state = addressDetailsObject.state;

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_customerregno',
                            value: addressDetailsObject.gstNumber,

                        });

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_destinationstate',
                            value: state,
                            ignoreFieldChange: true,
                            fireSlavingSync: true
                        });

                        var gstRegistrationNumber = currentRecordObj.getValue({
                            fieldId: 'custbody_gst_locationregno'
                        });

                        gstRegistrationNumber = gstRegistrationNumber.toString();
                        gstRegistrationNumber = gstRegistrationNumber.substr(0, 2);

                        var custGSTNumber = addressDetailsObject.gstNumber;
                        custGSTNumber = custGSTNumber.toString();
                        custGSTNumber = custGSTNumber.substr(0, 2);

                        if (Number(gstRegistrationNumber) == Number(custGSTNumber)) {

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_gsttype',
                                value: intra,

                            });

                        } else {

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_gsttype',
                                value: inter,

                            });

                        }

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totalcgst',
                            value: '',

                        });

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totaligst',
                            value: '',

                        });

                        currentRecordObj.setValue({
                            fieldId: 'custbody_gst_totalsgst',
                            value: '',

                        });
                    }

                    if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item') {
						if (isEnable) {
                            var location = currentRecordObj.getValue({
                                fieldId: 'location'
                            });

                            if (location == '' || location == null) {

                                var itemId = currentRecordObj.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item'
                                });

                                if (itemId != '' && itemId != null) {

                                    alert('Please select a location first.');

                                    currentRecordObj.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',
                                        value: '',
                                        ignoreFieldChange: false
                                    });

                                    return false;

                                }
                            }
                        } else {
                            return false;
                        }
                    }

                    //Function to edit Tax scheduled on th line level of the record.
                    if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_itemschedule')
                    {
						log.debug({title: "Inside Item Condition FC", details:"Entered" });                        
                        var taxCodeId;
                        var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});                        
                        var gstType = currentRecordObj.getValue({fieldId: 'custbody_gst_gsttype'});
                        var scheduleId = currentRecordObj.getCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule'});
                        
                        //Search on GST Tax Code Matrix to get the tax code, reversal tax code, reversal purchase and payable items for cgst, sgst and igst.
                        if ((gstType != '' && gstType != null) && (scheduleId != '' && scheduleId != null)) {
							log.debug({title: "Inside Tax Code Search", details:"Entered" });
                            var filterTaxCodeMatrix = new Array();
                            var columnTaxCodeMatrix = new Array();

                            filterTaxCodeMatrix.push(search.createFilter({
                                name: 'isinactive',
                                operator: search.Operator.IS,
                                values: false
                            }));

                            filterTaxCodeMatrix.push(search.createFilter({
                                name: 'custrecord_gst_type',
                                operator: search.Operator.IS,
                                values: gstType
                            }));

                            filterTaxCodeMatrix.push(search.createFilter({
                                name: 'custrecord_gst_item_schedule',
                                operator: search.Operator.IS,
                                values: scheduleId
                            }));


                            columnTaxCodeMatrix.push(search.createColumn({
                                name: 'custrecord_gst_tax_code'
                            }));

                            columnTaxCodeMatrix.push(search.createColumn({
                                name: 'custrecord_sgst_revpur_item'
                            }));

                            columnTaxCodeMatrix.push(search.createColumn({
                                name: 'custrecord_sgst_revpay_item'
                            }));

                            columnTaxCodeMatrix.push(search.createColumn({
                                name: 'custrecord_cgst_revpur_item'
                            }));

                            columnTaxCodeMatrix.push(search.createColumn({
                                name: 'custrecord_cgst_revpay_item'
                            }));

                            columnTaxCodeMatrix.push(search.createColumn({
                                name: 'custrecord_igst_revpur_item'
                            }));

                            columnTaxCodeMatrix.push(search.createColumn({
                                name: 'custrecord_igst_revpay_item'
                            }));

                            columnTaxCodeMatrix.push(search.createColumn({
                                name: 'custrecord_gst_reversal_taxcode'
                            }));

                            var searchTaxCodeMatrix = search.create({
                                "type": "customrecord_gst_tax_code_matrix",
                                "filters": filterTaxCodeMatrix,
                                "columns": columnTaxCodeMatrix
                            });

                            var arraySearchTaxCodeMatrix = searchTaxCodeMatrix.run().getRange({
                                start: 0,
                                end: 1
                            });

                            //If search record found. Get the values of tax code, reversal tax code, and all the reversal items of cgst, sgst and igst.
                            if (_dataValidation(arraySearchTaxCodeMatrix[0]))
                            {
                                taxCodeId = arraySearchTaxCodeMatrix[0].getValue('custrecord_gst_tax_code');
                            }
                            if(customerIsNRI == true && scheduleId != 1)
                            {
                                //alert('scheduleId : '+scheduleId);
                                alert('You can not change Item schedule for this Export customer');
                            }
                        }
						if (taxCodeId != '' && taxCodeId != null) {
						
                        var taxSet=  currentRecordObj.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'taxcode',
                                value: taxCodeId,
                                ignoreFieldChange: false
                            });
						
                        }
                        return true;
                      /*}// end if(customerIsNRI == false)
                      else if(_dataValidation(scheduleId) && customerIsNRI == true)
                      {
                        alert('You can not change Item schedule');
                        return false;
                      }*/
                    }// end if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'custcol_gst_itemschedule')
                    if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'taxcode')
                    {
                        var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});
                        var LineTaxCode = currentRecordObj.getCurrentSublistText({sublistId: 'item',fieldId: 'taxcode'});                        
                        //alert('LineTaxCode: '+LineTaxCode);
                        if(customerIsNRI == true && _dataValidation(LineTaxCode) && LineTaxCode != "IGST:Inter_0%")
                        {
                            if(LineTaxCode.includes("Intra") || LineTaxCode.includes("Inter"))
                            {
                                alert('You can not change Tax code for this Export customer');
                            }
                        }
                        //return false;
                    }

                    return true;
                  
                }

            } catch (exp) {
                log.debug('Exception Log in FC:-', exp.id);
                log.debug('Exception Log in FC:-', exp.message);
            }
        }

        //To be written
        function postSourcing(scriptContext) {
            try {
				var intra = 1;
                var inter = 2;
                var currentRecordObj = scriptContext.currentRecord;
                //Gets the Location firld is enable or not.
                var isEnable = runtime.isFeatureInEffect({
                    feature: "LOCATIONS"
                });

                if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item') {

                    var subsidiary = currentRecordObj.getValue({
                        fieldId: 'subsidiary'
                    });

                    var scriptObj = runtime.getCurrentScript();

                    var getIndiaSubsidiary = [];
                    var getSubsidiary = scriptObj.getParameter({
                        name: 'custscript_gst_sales_cs_indiasubsi_v1'
                    });
                    getIndiaSubsidiary.push(getSubsidiary);

                    if (getIndiaSubsidiary && (getIndiaSubsidiary.indexOf(subsidiary) != -1)) {
                        var myStateCode = currentRecordObj.getValue({
                            fieldId: 'custbody_gst_locationregno'
                        });

                        if (myStateCode != null && myStateCode != '') {
                            myStateCode = myStateCode.substr(0, 2);
                        }

                        var itemId = currentRecordObj.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item'
                        });

                        var getTaxCode;

                        if (itemId) {

                            getTaxCode = search.lookupFields({
                                type: 'item',
                                id: itemId,
                                columns: 'custitem_gst_itemschedule'
                            });

                            if (getTaxCode.custitem_gst_itemschedule[0]) {
                                var scheduleId = getTaxCode.custitem_gst_itemschedule[0].value;
                            } else {
                                alert('Schedule is not set for this particular item');
                                return;
                            }

                            var shipToState = currentRecordObj.getValue({
                                fieldId: 'custbody_gst_destinationstate'
                            });
                            var custgstn = currentRecordObj.getValue({
                                fieldId: 'custbody_gst_customerregno'
                            });

                            var gstType = currentRecordObj.getValue({
                                fieldId: 'custbody_gst_gsttype'
                            });


                            if ((gstType != '' && gstType != null) && (scheduleId != '' && scheduleId != null)) {
                                var taxCodeFilters = [];
                                var taxCodeColumns = [];

                                taxCodeFilters.push(search.createFilter({
                                    name: 'custrecord_gst_type',
                                    operator: search.Operator.IS,
                                    values: gstType
                                }));

                                taxCodeFilters.push(search.createFilter({
                                    name: 'custrecord_gst_item_schedule',
                                    operator: search.Operator.IS,
                                    values: scheduleId
                                }));

                                taxCodeColumns.push(search.createColumn({
                                    name: 'custrecord_gst_tax_code'
                                }));

                                taxCodeColumns.push(search.createColumn({
                                    name: 'custrecord_gst_tax_code'
                                }));

                                var taxCodeSearch = search.create({
                                    "type": "customrecord_gst_tax_code_matrix",
                                    "filters": taxCodeFilters,
                                    "columns": taxCodeColumns
                                });

                                var arrSearchResults = taxCodeSearch.run().getRange({
                                    start: 0,
                                    end: 1
                                });
                                var scriptObj = runtime.getCurrentScript();
                                var taxCodeInternalId;
                                if (arrSearchResults) {

                                    taxCodeInternalId = arrSearchResults[0].getValue('custrecord_gst_tax_code');
                                  //  alert('PS TAX CODE ID__'+taxCodeInternalId);
                                } else {

                                    alert('Custom GST tax record for the selected destination state not found');
                                    return;
                                }
                                taxCodeInternalId = Number(taxCodeInternalId);
                                var customerIsNRI = currentRecordObj.getValue({fieldId: 'custbody_ygst_is_nri_customer'});
                                if(customerIsNRI == false)                           
                                    currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: taxCodeInternalId,ignoreFieldChange: false});
                                else                                                            
                                    currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',value: 1,ignoreFieldChange: false});                            
                            }
                            return true;

                        }

                        return true;
                    }// end if (getIndiaSubsidiary && (getIndiaSubsidiary.indexOf(subsidiary) != -1))

                    return true;
                }// end if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')

                if (scriptContext.fieldId == 'entity') 
                {
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
                    }
                    else{
                        var getLocation = currentRecordObj.getValue({
                            fieldId: 'location'
                        });
                        log.debug('getLocation PS__' , getLocation);

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
							
                            log.debug('Location GSTIN PS __' , locGstNo);

                            currentRecordObj.setValue({
                                fieldId: 'custbody_gst_locationregno',
                                value: locGstNo
                            });
							
							//---start GST TYPE on PS -- //
							var customerGstNumber = currentRecordObj.getValue({
                                fieldId: 'custbody_gst_customerregno'
                            });
							log.debug('Customer GSTIN PS __' , locGstNo);
							

                            //If customer gst number not found.
                            if (!customerGstNumber) {

                                var getCustGSTType = currentRecordObj.getText({
                                    fieldId: 'custbody_gst_destinationstate'
                                });

                                locGstNo = locGstNo.toString();
                                locGstNo = locGstNo.substr(0, 2);
                                //alert('customerGstNumber FC:'+customerGstNumber+'companyGstNumber FC :'+companyGstNumber);
								log.debug({title: "getCustGSTType Inside PostSourcing", details: getCustGSTType});
								log.debug({title: "locGstNo Inside PostSourcing", details: locGstNo});
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
								log.debug({title: "Inside Else POST Sourcing", details:"Entered"});
                                var companyGstNumber = locGstNo;
                                var customerGstNumber = currentRecordObj.getValue({
                                    fieldId: 'custbody_gst_customerregno'
                                });
								log.debug('else part of Cust:-',companyGstNumber + 'and' +customerGstNumber);

                                //If both the GST number's i.e. of customer and company are there then get the GST type.
                                if (companyGstNumber && customerGstNumber) {
									log.debug('01');

                                    companyGstNumber = companyGstNumber.toString();
                                    companyGstNumber = companyGstNumber.substr(0, 2);

                                    customerGstNumber = customerGstNumber.toString();
                                    customerGstNumber = customerGstNumber.substr(0, 2);

                                    //alert('customerGstNumber :'+customerGstNumber+'companyGstNumber :'+companyGstNumber);

                                    if (Number(companyGstNumber) == Number(customerGstNumber)) {
										log.debug('11');

                                        currentRecordObj.setValue({
                                            fieldId: 'custbody_gst_gsttype',
                                            value: intra

                                        });

                                    } else {
										log.debug('12');

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
									log.debug('02');
                                    currentRecordObj.setValue({
                                        fieldId: 'custbody_gst_gsttype',
                                        value: inter
                                    });
                                }
                            }
							
							//-- end --- //
                        }
                    }
                }// end if (scriptContext.fieldId == 'entity')

                return true;

            } catch (exp) {
                log.debug('Exception Log in PS:-', exp.id);
                log.debug('Exception Log in PS:-', exp.message);
            }

        }

        //Function to get the GST number from the address book
        function getGstOnAddress(customerRecord, shippingAddress) {

            //Initialize variables to return the values from the address book.
            var customerGstID;
            var state;

            //Get the sublistId of AddressBook subrecord
            var lineCount = customerRecord.getLineCount({
                sublistId: 'addressbook'
            });

            var billingAddress = shippingAddress;

            //If Shipping Address exist
            if (shippingAddress != null && shippingAddress != '' && shippingAddress != undefined) {
                // alert('1');
                for (var i = 0; i < lineCount; i++) {

                    var addressId = customerRecord.getSublistValue({
                        sublistId: 'addressbook',
                        fieldId: 'id',
                        line: i
                    });

                    //If the address book id on the current record matches with the address lineItem on the customer record then gets the GST Number and State.
                    if (Number(shippingAddress) == Number(addressId)) {
                        var addressSubrecord = customerRecord.getSublistSubrecord({
                            sublistId: 'addressbook',
                            fieldId: 'addressbookaddress',
                            line: i
                        });

                        customerGstID = addressSubrecord.getValue({
                            fieldId: 'custrecord_gst_nocustomeraddr'
                        });

                        state = addressSubrecord.getValue({
                            fieldId: 'custrecord_gst_addressstatecode'
                        });
                        //alert('1 customerGstID'+customerGstID+ 'state '+state);
                    }

                }

            }
            //If Billing Address exist then gets the GST Number and state
            else if (billingAddress != null && billingAddress != '' && billingAddress != undefined) {
                // alert('2');
                for (var b = 0; b < lineCount; b++) {

                    var addressId = customerRecord.getSublistValue({
                        sublistId: 'addressbook',
                        fieldId: 'id',
                        line: b
                    });

                    //If the address book id on the current record matches the address line on the customer the get the GST Number and State.
                    if (Number(billingAddress) == Number(addressId)) {
                        var addressSubrecord = customerRecord.getSublistSubrecord({
                            sublistId: 'addressbook',
                            fieldId: 'addressbookaddress',
                            line: b
                        });

                        customerGstID = addressSubrecord.getValue({
                            fieldId: 'custrecord_gst_nocustomeraddr'
                        });

                        state = addressSubrecord.getValue({
                            fieldId: 'custrecord_gst_addressstatecode'
                        });
                        //	alert('2 customerGstID'+customerGstID+ 'state '+state);
                    }

                }

            }
            //If the shipping address is empty then state and gst number are defaulted to the 1st line address book values.
            else {
                //  alert('3');
                var addressId = customerRecord.getSublistValue({
                    sublistId: 'addressbook',
                    fieldId: 'id',
                    line: 0
                });

                var addressSubrecord = customerRecord.getSublistSubrecord({
                    sublistId: 'addressbook',
                    fieldId: 'addressbookaddress',
                    line: 0
                });

                customerGstID = addressSubrecord.getValue({
                    fieldId: 'custrecord_gst_nocustomeraddr'
                });

                state = addressSubrecord.getValue({
                    fieldId: 'custrecord_gst_addressstatecode'
                });
                //alert('3 customerGstID'+customerGstID+ 'state '+state);

            }

            var addressDetailObj = {
                'gstNumber': customerGstID,
                'state': state
            }

            return addressDetailObj;
        }

        //Function to get the GST type based on the state code mapping.
        function getGstType(sourceGstNumber, destinationGst, state, locationText, destinationLocation) {

            var intra = 1;
            var inter = 2;

            if (destinationGst == null || destinationGst == '') {
                return inter;
            } else {
                sourceGstNumber = sourceGstNumber.toString();
                sourceGstNumber = sourceGstNumber.substr(0, 2);
                if (!destinationGst) {
                    var stateFilter = [];
                    var stateColumn = [];

                    stateFilter.push(search.createFilter({
                        name: 'custrecord_state',
                        operator: search.Operator.IS,
                        values: state
                    }));

                    taxCodeColumns.push(search.createColumn({
                        name: 'custrecord_state_code'
                    }));

                    var stateRecordSearch = search.create({
                        "type": "customrecord_state_code_mapping",
                        "filters": stateFilter,
                        "columns": stateColumn
                    });

                    stateRecordSearch = stateRecordSearch.run().getRange({
                        start: 0,
                        end: 1
                    });
                    if (stateRecordSearch[0]) {
                        var stateCode = arrSearchResults[0].getValue('custrecord_gst_tax_code')
                        destinationGst = stateCode;
                    }
                } else {

                    destinationGst = destinationGst.toString();
                    destinationGst = destinationGst.substr(0, 2);

                }

                if (Number(sourceGstNumber) == Number(destinationGst)) {
                    return intra;
                } else {

                    return inter;
                }
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
        //By fetching the data from record, gets the GST Number and State
        function setCustomerGstNumber(customerId, subsidiary, shippingAddress, currentRecordObj) {

            if (customerId && subsidiary) {

                var intra = 1;
                var inter = 2;

                var rec = record.load({
                    type: record.Type.CUSTOMER,
                    id: customerId
                });
                var addressObject = getGstOnAddress(rec, shippingAddress);

                var state = addressObject.state;
                //alert('cust GST PI :- '+addressObject.gstNumber +'Cust StatePI :-'+state);

                if (addressObject.gstNumber) {

                    currentRecordObj.setValue({
                        fieldId: 'custbody_gst_customerregno',
                        value: addressObject.gstNumber,
                        ignoreFieldChange: true,
                        fireSlavingSync: true
                    });

                }

                currentRecordObj.setValue({
                    fieldId: 'custbody_gst_destinationstate',
                    value: state,
                    ignoreFieldChange: true,
                    fireSlavingSync: true
                });

            }

        }
		
		//Code added to resolve mainaddress is not subrecord field issue
		function searchOnSubsidiary(subsidiary)
		{
			var getLocationGstNumber;
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
			search.createColumn({name: "custrecord_gst_nocustomeraddr",join: "address",label: "GST Number"}),
			search.createColumn({name: "state", join: "address"})
			]
			});
			var searchResultCount = subsidiarySearchObj.runPaged().count;
			subsidiarySearchObj.run().each(function(result){
			getLocationGstNumber	= result.getValue({name: "custrecord_gst_nocustomeraddr", join: "address",label: "GST Number"});
			return true;
			});
			//alert("Inside searchOnLocation Function "+getLocationGstNumber);
			return getLocationGstNumber;
        }
        
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
            pageInit: pageInit,
            //saveRecord:saveRecord,
            fieldChanged: fieldChanged,
            postSourcing: postSourcing

        };

    });
