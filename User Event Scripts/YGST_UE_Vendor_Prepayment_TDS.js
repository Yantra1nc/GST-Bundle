/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */

/*************************************************************
 * File Header
 * Script Type: User Event Script
 * Script Name: YGST Vendor Prepayment
 * File Name  : YGST_Vendor_Prepayment_UE.js
 * Created On : 24/02/2021
 * Modified On:
 * Created By : Siddhant (Yantra Inc.)
 * Modified By:
 * Description: Script creates JE record according.
 ************************************************************/
define(['N/record', 'N/runtime', 'N/search', 'N/format'], function(record, runtime, search, format) {
	function afterSubmit(context)
	{
		if (context.type != context.UserEventType.DELETE)
		{
			try {
				var recObj = context.newRecord;
				var recId = recObj.id;
				var recType = recObj.type;

				var tranSubsidiary = recObj.getValue({fieldId: 'subsidiary'});
				log.debug('tranSubsidiary: ',tranSubsidiary);
				var scriptObj = runtime.getCurrentScript();
				var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});//custscript_ygst_global_india_subsidiary
				log.debug('getAccountSubsidiary: ',getAccountSubsidiary);

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

				if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj && context.type == context.UserEventType.CREATE) {
					if(recType == 'vendorprepayment')
					{
					var payeeID = recObj.getValue({fieldId: "entity"});
					log.debug("payeeID",payeeID);
					}
					else if(recType == 'customerpayment')
					{
					var payeeID = recObj.getValue({fieldId: "customer"});
					log.debug("payeeID",payeeID);
					}
					var payAmt = recObj.getValue({fieldId: "payment"});
					var payDate = recObj.getValue({fieldId: "trandate"});
					log.debug("payDate",payDate);
					var tdsSec = recObj.getValue({fieldId: "custbody_tds_section"});
					var tdsTaxCode = recObj.getValue({fieldId: "custbody_tds_taxcode"});
					
					//Added by Nikita S on 28th dec 2022 to set class,loc and dept values on JE
					var locVal 		= recObj.getValue({fieldId: "location"});
					var deptVal 	= recObj.getValue({fieldId: "department"});
					var classVal 	= recObj.getValue({fieldId: "class"});
					
					if(recType == 'vendorprepayment')
					{
					var prePayAcc = recObj.getValue({fieldId: "prepaymentaccount"});
					}else if(recType == 'customerpayment')
					{
					  var prePayAcc = recObj.getValue({fieldId: "aracct"});
					}
					log.debug("account selected:",prePayAcc);
					var recordCurrency = recObj.getValue({fieldId: "currency"});
//					var fieldLookUp_TT = search.lookupFields({type: 'customrecord_4601_witaxtype',id: tdsSec, columns: ['custrecord_4601_wtt_purcaccount']});

					var fieldLookUp_TC ="";
					var taxCodeRate="";
					var taxTypeId="";
					var fieldLookUp_TT="";
					var tdsPurchAcc="";
					if(tdsTaxCode){
						fieldLookUp_TC = search.lookupFields({type: 'customrecord_4601_witaxcode',id: tdsTaxCode, columns: ['custrecord_4601_wtc_rate','custrecord_4601_wtc_witaxtype']});
						if(fieldLookUp_TC){
//							var tdsPurchAcc = fieldLookUp_TT.custrecord_4601_wtt_purcaccount[0].value;
							taxCodeRate = fieldLookUp_TC.custrecord_4601_wtc_rate;
							taxTypeId = fieldLookUp_TC.custrecord_4601_wtc_witaxtype[0].value;
						}
					}

					if(taxTypeId){
						fieldLookUp_TT = search.lookupFields({type: 'customrecord_4601_witaxtype',id: taxTypeId, columns: ['custrecord_4601_wtt_purcaccount']});
						if(fieldLookUp_TT){
							tdsPurchAcc = fieldLookUp_TT.custrecord_4601_wtt_purcaccount[0].value;
						}
					}

					log.debug({title: "payAmt", details: payAmt});
					log.debug({title: "tdsSec", details: tdsSec});
					log.debug({title: "fieldLookUp_TT", details: fieldLookUp_TT});
					log.debug({title: "fieldLookUp_TC", details: fieldLookUp_TC});
					log.debug({title: "tdsPurchAcc", details: tdsPurchAcc});
					log.debug({title: "taxCodeRate", details: taxCodeRate});

					var splitRate = taxCodeRate.split("%");
					log.debug({title: "splitRate", details: splitRate[0]});

					//	To get actual amount with tds
					if(recType == 'vendorprepayment')
					{
					var totalAmt = Number(payAmt) / (Number(100) - Number(splitRate[0])) * Number(100);
					log.debug({title: "totalAmt", details: totalAmt});

					// To get amount according to their tax code rate
					var jeAmt = (Number(splitRate[0]) / Number(100)) * Number(totalAmt);   //use same for Cust payment.
					log.debug({title: "jeAmt", details: jeAmt});
					}else if(recType == 'customerpayment')
					{
						var jeAmt = (Number(splitRate[0]) / Number(100)) * Number(payAmt);  
					}

					var journalEntry = record.create({type: record.Type.JOURNAL_ENTRY, isDynamic: true});

					journalEntry.setValue({fieldId: "subsidiary", value:tranSubsidiary});	
					if(recordCurrency){
						journalEntry.setValue({fieldId: "currency", value:recordCurrency});
					}
					journalEntry.setValue({fieldId: "custbody_yil_tds_invoice", value:recId});
					journalEntry.setValue({fieldId: "approvalstatus", value:2});
					
					//journalEntry.setValue({fieldId: "memo", value:'This JE is created by TDS deduction on Customer Payment'});
					
					//Condition added by Nikita S on 29th Dec 20222
					if(recType == 'vendorprepayment'){
						journalEntry.setValue({fieldId: "memo", value:'This JE is created by TDS deduction on Vendor Payment'});
					}
					if(recType == 'customerpayment'){
						journalEntry.setValue({fieldId: "memo", value:'This JE is created by TDS deduction on Customer Payment'});
					}
					journalEntry.setValue({fieldId: "trandate", value:payDate});

					journalEntry.insertLine({sublistId: 'line',line: 0});
					if(recType == 'vendorprepayment')
					{
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', line: 0, value: prePayAcc});
					}
					else if(recType == 'customerpayment')
					{
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', line: 0, value: tdsPurchAcc});
					}
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', line: 0, value: jeAmt});
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', line: 0, value: payeeID});
					
					//Added by Nikita S on 28th dec 2022 to set class,loc and dept values on JE
					if(_logValidation(deptVal)){
						journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'department', line: 0, value: deptVal});
					}
					if(_logValidation(classVal)){
						journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'class', line: 0, value: classVal});
					}
					if(_logValidation(locVal)){
						journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'location', line: 0, value: locVal});
					}
					
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'custcol_yantragst_tds_section', line: 0, value: tdsSec});
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'custcol_gst_tds_taxcode_inv', line: 0, value: tdsTaxCode});
					journalEntry.commitLine({sublistId : 'line'});
					journalEntry.insertLine({sublistId: 'line',line: 1});
					if(recType == 'vendorprepayment')
					{
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', line: 1, value: tdsPurchAcc});
					}
					else if(recType == 'customerpayment')
					{
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', line: 1, value: prePayAcc});
					}
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', line: 1, value: jeAmt});
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', line: 1, value: payeeID});
					
					//Added by Nikita S on 28th dec 2022 to set class,loc and dept values on JE
					if(_logValidation(deptVal)){
						journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'department', line: 1, value: deptVal});
					}
					if(_logValidation(classVal)){
						journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'class', line: 1, value: classVal});
					}
					if(_logValidation(locVal)){
						journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'location', line: 1, value: locVal});
					}
					
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'custcol_yantragst_tds_section', line: 1, value: tdsSec});
					journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'custcol_gst_tds_taxcode_inv', line: 1, value: tdsTaxCode});
					journalEntry.commitLine({ sublistId : 'line'});

					var jeId = journalEntry.save();
					log.debug({title: "jeId", details: jeId});

					if(jeId){
						var vpId = record.submitFields({type:recType,id: recId,values: { custbody_yil_tds_je_no:jeId },options: {enableSourcing: true,ignoreMandatoryFields : true}});
						log.debug({title: "vpId", details: vpId});
					}
				}
			}
			catch(exp) {
				log.debug({title: "Exception Error", details: exp.message});
			}
		}
	}
	
	function _logValidation(value)
	{
		if(value != null && value != '' && value != undefined && value != 'undefined' && value != 'NaN' && value != ' ')	{
			return true;
		}
		else	{
			return false;
		}
	}
	return {
		afterSubmit : afterSubmit
	}
});
