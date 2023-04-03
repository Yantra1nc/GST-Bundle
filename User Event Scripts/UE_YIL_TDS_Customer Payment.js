/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */

/*************************************************************
 * File Header
 * Script Type: User Event Script
 * Script Name: UE TDS JE Creation
 * File Name  : UE_tds_je_creation.js.js
 * Created On : 01/10/2022
 * Modified On:
 * Created By : Pralhhad (Yantra Inc.)
 * Modified By:
 * Description: Script creates JE record according.
 ************************************************************/
define(['N/record', 'N/runtime', 'N/search', 'N/format'], function(record, runtime, search, format) {
	function afterSubmit(context)
	{
		if (context.type != context.UserEventType.DELETE)
		{
			try {

				var scriptObj = runtime.getCurrentScript();

				var isCreateJE = scriptObj.getParameter({name: 'custscript_ygst_tds_je_invoice'});
                 log.debug("isCreateJE",isCreateJE);

				if(!isCreateJE){

					var recObj = context.newRecord;
					var recId = recObj.id;
					var recType = recObj.type;
					var tranSubsidiary = recObj.getValue({fieldId: 'subsidiary'});
					log.debug('tranSubsidiary: ',tranSubsidiary);

                    var CUSTOMER_ID = recObj.getValue({fieldId: 'customer'});
					log.debug('CUSTOMER_ID: ',CUSTOMER_ID);


					var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
					log.debug('getAccountSubsidiary: ',getAccountSubsidiary);

					var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
					//	-----------------------------------------------Start- Condition for to compare multi India Subsidiary.---------------------------------------------------//
					var indiaSubObj = false;
					var splitSub = getAccountSubsidiary.split(",");
					log.debug({title: "splitSub", details: splitSub});
					var subLength = splitSub.length;
					for(var i=0; i<subLength; i++) {
						if(Number(splitSub[i]) == Number(tranSubsidiary)) {
							indiaSubObj = true;
						}
					}
					log.debug({title: "indiaSubObj", details: indiaSubObj});
					//-----------------------------------------------End- Condition for to compare multi India Subsidiary.---------------------------------------------------//
					//if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj && context.type == context.UserEventType.CREATE) {
					if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj && (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT)) {

						var tdsJERef = recObj.getValue({fieldId: "custbody_yil_tds_je_no"});

						if(!tdsJERef){

							var payeeID = recObj.getValue({fieldId: "customer"});					
							var prePayAcc = recObj.getValue({fieldId: "aracct"});
							var tdsSec = recObj.getValue({fieldId: "custbody_tds_section"});
							var tdsTaxCode = recObj.getValue({fieldId: "custbody_tds_taxcode"});
							var recordCurrency = recObj.getValue({fieldId: "currency"});
							var payDate = recObj.getValue({fieldId: "trandate"});
							//Added by Nikita S on 4th Jan 2023 to set class,loc and dept values on JE
							var locVal 		= recObj.getValue({fieldId: "location"});
							var deptVal 	= recObj.getValue({fieldId: "department"});
							var classVal 	= recObj.getValue({fieldId: "class"});
							
							var fieldLookUp_TC ="";
							var taxCodeRate="";
							var taxTypeId="";
							var fieldLookUp_TT="";
							var tdsPurchAcc="";

							if(tdsTaxCode){
								fieldLookUp_TC = search.lookupFields({type: 'customrecord_4601_witaxcode',id: tdsTaxCode, columns: ['custrecord_4601_wtc_rate','custrecord_4601_wtc_witaxtype']});
								if(fieldLookUp_TC){								
									taxCodeRate = fieldLookUp_TC.custrecord_4601_wtc_rate;
									taxTypeId = fieldLookUp_TC.custrecord_4601_wtc_witaxtype[0].value;
								}
							}

							if(taxTypeId){
								fieldLookUp_TT = search.lookupFields({type: 'customrecord_4601_witaxtype',id: taxTypeId, columns: ['custrecord_4601_wtt_saleaccount']});
								if(fieldLookUp_TT){
									tdsPurchAcc = fieldLookUp_TT.custrecord_4601_wtt_saleaccount[0].value;
								}
							}var splitRate = taxCodeRate.split("%");
							log.debug({title: "splitRate", details: splitRate[0]});					 

							var paymentTotal = 0;
							var currPaymentAmount;
							var applyLineCount  = recObj.getLineCount({sublistId: 'apply'});
							var jeAmtArr = [];
							var invoiceDetails = [];
							var INV_ARR = [];
							var INVOICE_ID = "";
							var JE_ID = "";
							var JE_AMT = "";
                            var INV_JSON = {}; 
							for(var i =0; i< applyLineCount; i++)
							{
								var applyValue = recObj.getSublistValue({sublistId: 'apply',fieldId: 'apply',line:i});
								if(applyValue == true)
								{
									var invoiceInternalId = recObj.getSublistValue({sublistId: 'apply',fieldId: 'internalid',line:i});
									
									var currPaymentAmount = 0 ;
									try   
									{
									 if(invoiceInternalId){
										var o_inv_b = record.load({type: 'invoice', id: invoiceInternalId, isDynamic: false,}); //search.lookupFields({type: 'invoice',id: invoiceInternalId, columns: ['subtotal']});
										if(o_inv_b){								
											currPaymentAmount = o_inv_b.getValue('subtotal');
											//taxTypeId = fieldLookUp_TC.custrecord_4601_wtc_witaxtype[0].value;
										}
									}
									}
									catch(excd)
									{
									log.debug("afterSubmit","excd=="+excd);	
									}									

								//	currPaymentAmount = recObj.getSublistValue({sublistId: 'apply',fieldId: 'amount',line:i});
								
									//	To get actual amount with tds
								//	var totalAmt = Number(currPaymentAmount) / (Number(100) - Number(splitRate[0])) * Number(100);
								//	log.debug({title: "totalAmt", details: totalAmt});
								
								     var totalAmt =  Number(currPaymentAmount) ;   

									// To get amount according to their tax code rate
									var jeAmt = (Number(splitRate[0]) / Number(100)) * Number(totalAmt);
									log.debug({title: "jeAmt", details: jeAmt});							

									/*var jeAmt = (Number(splitRate[0]) / Number(100)) * Number(currPaymentAmount);
							log.debug("jeAmt",jeAmt);*/
									jeAmtArr.push(jeAmt);
								//	log.debug("jeAmtArr",jeAmtArr);

									invoiceDetails.push({'invoiceInternalId':invoiceInternalId,'tdsAmount':jeAmt});
									INVOICE_ID = invoiceInternalId ;
									INV_ARR.push(invoiceInternalId);
									INV_JSON[invoiceInternalId] = {'tdsAmount' : jeAmt};
								}
							}

							var journalEntry = record.create({type: record.Type.JOURNAL_ENTRY, isDynamic: true});

							journalEntry.setValue({fieldId: "subsidiary", value:tranSubsidiary});					
							journalEntry.setValue({fieldId: "currency", value:recordCurrency});
							//journalEntry.setValue({fieldId: "custbody_yil_tds_invoice", value:recId});
							journalEntry.setValue({fieldId: "custbody_yil_tds_payment_ref", value:recId});
							journalEntry.setValue({fieldId: "approvalstatus", value:2});
							journalEntry.setValue({fieldId: "memo", value:'This JE is created by TDS deduction on Customer Payment'});
							journalEntry.setValue({fieldId: "trandate", value:payDate});
							
							var counter =0;
							var creditAmount =0;

							//for(var j= 0;j<jeAmtArr.length;j++)
							for(var j= 0;j<invoiceDetails.length;j++)
							{
								journalEntry.insertLine({sublistId: 'line',line: j});
								journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', line: j, value: tdsPurchAcc});					
								//journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', line: j, value: jeAmtArr[j]});
								journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', line: j, value:invoiceDetails[j].tdsAmount});
								journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', line: j, value: payeeID});
								journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'custcol_yantragst_tds_section', line: j, value: tdsSec});
								journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'custcol_gst_tds_taxcode_inv', line: j, value: tdsTaxCode});
								journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'custcol_yil_gst_tds_invoice_ref', line: j, value: invoiceDetails[j].invoiceInternalId});
								if(_logValidation(deptVal)){
									journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'department', line: j, value: deptVal});
								}
								if(_logValidation(classVal)){
									journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'class', line: j, value: classVal});
								}
								if(_logValidation(locVal)){
									journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'location', line: j, value: locVal});
								}
								journalEntry.commitLine({sublistId : 'line'});

								creditAmount = parseFloat(creditAmount) +  parseFloat(jeAmtArr[j]);

								counter++;
								
								//}
							}
							
							journalEntry.insertLine({sublistId: 'line',line: counter});					
							journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', line:counter, value: prePayAcc});
							journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', line: counter, value: creditAmount});
							journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', line: counter, value: payeeID});
							journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'custcol_yantragst_tds_section', line: counter, value: tdsSec});
							journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'custcol_gst_tds_taxcode_inv', line: counter, value: tdsTaxCode});
							if(_logValidation(deptVal)){
								journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'department', line: counter, value: deptVal});
							}
							if(_logValidation(classVal)){
								journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'class', line: counter, value: classVal});
							}
							if(_logValidation(locVal)){
								journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'location', line: counter, value: locVal});
							}
							journalEntry.commitLine({ sublistId : 'line'});
							
							JE_AMT = creditAmount ;

							var jeId = journalEntry.save({enableSourcing: true,ignoreMandatoryFields : true});
							JE_ID = jeId ;
							log.debug({title: "jeId", details: jeId});

							if(jeId){
								var vpId = record.submitFields({type:recType,id: recId,values: { custbody_yil_tds_je_no:jeId },options: {enableSourcing: true,ignoreMandatoryFields : true}});
								log.debug({title: "vpId", details: vpId});
								
								/////////// =============== CUSTOMER ============== /////////////////////
								
								
								try
								{
								 var o_recordOBJ = record.transform({fromType: 'customer',fromId: CUSTOMER_ID ,toType:'customerpayment',isDynamic: false,});
								
								 	var applyLineCount  = o_recordOBJ.getLineCount({sublistId: 'apply'});
									
									var creditLineCount  = o_recordOBJ.getLineCount({sublistId: 'credit'});
										
									var jeAmtArr = [];
									var invoiceDetails = [];

									for(var i =0; i< applyLineCount; i++)
									{
									//	o_recordOBJ.selectLine({sublistId: 'apply',line: i});
										var applyValue = o_recordOBJ.getSublistValue({sublistId: 'apply',fieldId: 'apply',line: i});
									//	if(applyValue == true)
										{
											var invoiceInternalId_OTHER = o_recordOBJ.getSublistValue({sublistId: 'apply',fieldId: 'internalid',line: i});
												
											if(_logValidation(INV_ARR))
											{
												var check_X = INV_ARR.indexOf(invoiceInternalId_OTHER);
												
												if(check_X > -1)
												{
													try{
														var JE_AMT_X = INV_JSON[invoiceInternalId_OTHER].tdsAmount ; 
													}catch(exw){}
													//  if(invoiceInternalId_OTHER == INVOICE_ID)
													{	
														o_recordOBJ.setSublistValue({sublistId: 'apply',fieldId: 'apply',value: true , line:i });										
														o_recordOBJ.setSublistValue({sublistId: 'apply',fieldId: 'amount',value:JE_AMT_X ,line : i });
													  //  o_recordOBJ.commitLine({sublistId:'apply'});
													}
												}
									
											}
                                   
								          
										}
									}
									
									for(var icc =0;icc< creditLineCount;icc++)
									{                                   
									//	o_recordOBJ.selectLine({sublistId: 'apply',line: icc});
										var applyValue = o_recordOBJ.getSublistValue({sublistId: 'credit',fieldId: 'apply' ,line: icc});
										//if(applyValue == true)
										{
											var creditInternalId_OTHER = o_recordOBJ.getSublistValue({sublistId: 'credit',fieldId: 'internalid', line: icc});
											
								            if(creditInternalId_OTHER == JE_ID)
											{
												log.debug("afterSubmit","creditInternalId_OTHER=="+creditInternalId_OTHER+'JE_ID -->'+JE_ID);
                                   
												o_recordOBJ.setSublistValue({sublistId: 'credit',fieldId: 'apply',line: icc , value:true });
												o_recordOBJ.setSublistValue({sublistId: 'credit',fieldId: 'amount',line: icc , value:JE_AMT });
				                             //   o_recordOBJ.commitLine({sublistId:'credit'});
											}
										}
									}
								
								
								 var i_submitID = o_recordOBJ.save({enableSourcing: true,ignoreMandatoryFields : true});
						         log.debug('afterSubmit' , 'Customer Payment Submit ID -->' + i_submitID);
								
								}
								catch(exsww)
								{							
								 log.debug('ERROR' , 'Exception Caught -->' + exsww);									
								}					
								
							}

						}

					}
				}
			}

			catch(exp) {
				log.debug({title: "Exception Error", details: exp.message});
			}
		}
	}
	function _logValidation(value) {
		if (value != null && value != '' && value != undefined && value.toString() != 'NaN' && value != NaN) {
			return true;
		} else {
			return false;
		}
	}
	return {
		afterSubmit : afterSubmit
	}
});
