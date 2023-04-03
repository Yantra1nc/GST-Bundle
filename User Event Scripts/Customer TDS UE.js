/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
//Test
/*************************************************************
 * File Header
 * Script Type: User Event Script
 * Script Name: Customer TDS UE
 * File Name  : GST_TDS_For_Customer_UE.js
 * Created On : 16/12/2020
 * Modified On: 
 * Created By : Siddhant (Yantra Inc.)
 * Modified By: 
 * Description: Script is to implement TDS functinality for customer.
 ************************************************************/
define(['N/record', 'N/runtime', 'N/search', 'N/format'], function(record, runtime, search, format) {

	var TDS_DETAILS = {};
	var INVOICE_TOTAL={};
	var WH_TAXCODE_DETAILS={};
	var WH_TAXTYPE_DETAILS={};
	
	function afterSubmit(context) 
	{
		var totalAmt	= 0;
		var tranAmt_1	= 0;
		var tranAmt_2	= 0;
		var tranAmt		= 0;
		var amountObj	= 0;

		var recObj		= context.newRecord;

		if (context.type != context.UserEventType.DELETE) 
		{
			try {
				var scriptObj 			= runtime.getCurrentScript();
				var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
				var isCreateJE = scriptObj.getParameter({name: 'custscript_ygst_tds_je_invoice'});
				var getItemType         = scriptObj.getParameter({name: 'custscript_ygst_item_type'});

				var tranSubsidiary 		= recObj.getValue({fieldId: 'subsidiary'});
				log.debug('afterSubmit:tranSubsidiary: ',tranSubsidiary);				

				//------------------------------ Start - Condition for to compare multi India Subsidiary--------------------------------------------------//
				var indiaSubObj	= false;
				var splitSub	= getAccountSubsidiary.split(",");
				var subLength	= splitSub.length;
				for(var i=0; i<subLength; i++) {
					if(Number(splitSub[i]) == Number(tranSubsidiary)) {
						indiaSubObj	= true;
					}
				}
				log.debug({title: "afterSubmit:indiaSubObj", details: indiaSubObj});
				//------------------------------ End - Condition for to compare multi India Subsidiary--------------------------------------------------//
				if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj) {					

					var custObj		= recObj.getValue({fieldId : "entity"});
					var dateObj		= recObj.getValue({fieldId : "trandate"});
					var lineCnt		= recObj.getLineCount({sublistId:"item"});
					var expenseCnt	= recObj.getLineCount({sublistId:"expense"});

					var recLoad		= record.load({type: recObj.type, id: recObj.id});

					var isExportCustomer = recLoad.getValue({fieldId: 'custbody_ygst_is_nri_customer'});					
					if(!isExportCustomer){
						var invRecId = recLoad.getValue({fieldId: 'internalid'});
						var invoiceCurrency = recLoad.getValue({fieldId: 'currency'});

						//------------------------------- Start - Added this code when record will be created through integration or csv upload------------------------//
							if(runtime.executionContext != runtime.ContextType.USER_INTERFACE) {
							var recLoad_1		= record.load({type: recObj.type, id: recObj.id, isDynamic: true});							
							var tdsSection_1	= "";
							if(custObj != "", custObj != null) {
								var tds_Section_1		  = "";
								var customrecord_yantragst_vendor_tds_detailSearchObj = search.create({type: "customrecord_yantragst_vendor_tds_detail",
									filters:
										[
											["custrecord_yantragst_customer","anyof",custObj]
											],
											columns:
												[
													search.createColumn({name: "custrecord_yantragst_tds_section", label: "TDS Section"})
													]
								});
								var searchResultCount = customrecord_yantragst_vendor_tds_detailSearchObj.runPaged().count;
								log.debug("customrecord_yantragst_vendor_tds_detailSearchObj result count",searchResultCount);
								customrecord_yantragst_vendor_tds_detailSearchObj.run().each(function(result){
									tds_Section_1	= result.getValue({name: "custrecord_yantragst_tds_section", label: "TDS Section"});
									return true;
								});								
							}
						}
						//------------------------------- End - Added this code when record will be created through integration or csv upload------------------------//
						//	if(runtime.executionContext != runtime.ContextType.USER_INTERFACE) {
						//Get TDS Details
						getTDSDetails(custObj,tranSubsidiary)

						var applyLTDS			= "";
						var tdsTaxCode			= "";
						var thresholdLimit		= "";
						var cerIssueDate		= "";
						var cerExpiryDate		= "";
						var ltdsTaxCode			= "";
						var customerThreshLimit = "";	

						if(lineCnt > 0) {

							for(var i= 0; i< lineCnt; i++) {
								tranAmt_2	= recLoad.getSublistValue({sublistId: "item", fieldId : "amount", line: i});
								tranAmt		= Number(tranAmt)+Number(tranAmt_2);
							}					

							for(var j=0; j<lineCnt; j++) {
								var tdsSection			= recLoad.getSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section", line: j});							
								var applyTDSInv	       = recLoad.getSublistValue({sublistId: "item", fieldId : "custcol_gst_apply_tds_inv", line: j});
								var tdsTaxCode = recLoad.getSublistValue({sublistId: "item", fieldId : "custcol_gst_tds_taxcode_inv", line: j});

								// ---------------------------- Start - Compare Item Type with Item types mentioned in the Global Parameter-------------------------//
								var itemType = recLoad.getSublistText({sublistId: "item", fieldId : "custcol_yil_item_type", line: j});
								var itemTypeObj    = false;
								var splitItemType  = getItemType.split(",");							
								var itemTypeLength	= splitItemType.length;							
								for(var i=0; i<itemTypeLength; i++) {
									if(splitItemType[i] == itemType) {
										itemTypeObj	= true;
									}
								}
								log.debug("afterSubmit:itemTypeObj",itemTypeObj);
								// ---------------------------- End - Compare Item Type with Item types mentioned in the Global Parameter-------------------------//

								if(applyTDSInv == true && itemTypeObj && tdsTaxCode=="" ){

									if(TDS_DETAILS[tdsSection]){
										applyLTDS = TDS_DETAILS[tdsSection].GetApplyLTDS; 
										tdsTaxCode = TDS_DETAILS[tdsSection].GetTdsTaxcode;
										thresholdLimit = TDS_DETAILS[tdsSection].GetThresholdLimit;
										cerIssueDate= TDS_DETAILS[tdsSection].GetCerIssueDate;
										cerExpiryDate = TDS_DETAILS[tdsSection].GetCerExpiryDate;
										ltdsTaxCode = TDS_DETAILS[tdsSection].GetLtdsTaxCode;
										customerThreshLimit = TDS_DETAILS[tdsSection].GetCustomerThreshLimit;
									}

									if(cerIssueDate) {
										var fromCerDate		= format.parse({value: cerIssueDate, type: format.Type.DATE});
									}
									if(cerExpiryDate) {
										var toCerDate		= format.parse({value: cerExpiryDate, type: format.Type.DATE});
									}

									var comDate			= Date.parse(dateObj);
									var fromDate		= Date.parse(fromCerDate);
									var toDate			= Date.parse(toCerDate);

									getInvoiceTotal(recObj.id,custObj,cerIssueDate,cerExpiryDate)

									if(INVOICE_TOTAL[tdsSection]){
										amountObj = INVOICE_TOTAL[tdsSection].InvTotal
									}

									totalAmt	= Number(amountObj)+Number(tranAmt);
									//Line Level Check Box
									var applyTDS	= recLoad.getSublistValue({sublistId: "item", fieldId : "custcol_gst_apply_tds_inv", line: j});

									if(Number(customerThreshLimit) > Number(totalAmt)){
										recLoad.setSublistValue({sublistId: 'item',fieldId: 'custcol_gst_apply_tds_inv',value: false, line: j});
										recLoad.setSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: '', line: j});
										recLoad.setSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',line: j});
									}
									if(customerThreshLimit == '' || Number(customerThreshLimit) < Number(totalAmt)) //Added by Nikita
									{	
										if(applyTDS && tdsSection != null && tdsSection != "") {
											if(!applyLTDS) {
												log.debug({title: "afterSubmit:tdsTaxCode SET", details: tdsTaxCode});
												recLoad.setSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: tdsTaxCode, line: j});
											}
											else if(comDate >= fromDate && comDate <= toDate){
												if(Number(thresholdLimit) >= Number(totalAmt)) {
													log.debug({title: "afterSubmit:ltdsTaxCode SET", details: ltdsTaxCode});
													recLoad.setSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: Number(ltdsTaxCode), line: j});
												}
												else {
													log.debug({title: "afterSubmit:tdsTaxCode SET 1", details: tdsTaxCode});
													recLoad.setSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: tdsTaxCode, line: j});
												}
											}
											else {
												log.debug({title: "afterSubmit:tdsTaxCode SET 2", details: tdsTaxCode});
												recLoad.setSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: tdsTaxCode, line: j});
											}
										}
									}
									else {
										log.debug({title: "tdsTaxCode SET 3", details: tdsTaxCode});
										//recLoad.setSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: null, line: j});
										recLoad.setSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: '', line: j});
									} 
								}
							}
						}

						var invRecId	= recLoad.save({enableSourcing: true,ignoreMandatoryFields: true});
					//}
						log.debug({title: "afterSubmit:invRecId", details: invRecId});
						log.debug({title: "afterSubmit:CUSTOMER_THRESHOLD_LIMIT", details: customerThreshLimit});
						log.debug({title: "afterSubmit:TOTAL_AMOUNT", details: totalAmt});
						if(isCreateJE){
							if (context.type == context.UserEventType.CREATE && (customerThreshLimit == '' || Number(customerThreshLimit) < Number(totalAmt) ))						 
							{
								var invNumber	= recLoad.getValue({fieldId: "tranid"});

								//JE Creation Code After record saved succesfully
								var tdsTaxAmt		= [];
								var tdsDebitAcc		= [];
								if(_logValidation(invRecId))
								{
									var invAccId	= _getInvAccId(invRecId);
									log.debug({title: "invAccId", details: invAccId});

									var searchData	= _getTdsTaxCodeAndAmt(invRecId);
									log.debug({title: "searchData", details: searchData});
									if(_logValidation(searchData)) {

										var splitTdsSearchData	= searchData.split("|::|");
										log.debug({title: "splitTdsSearchData", details: splitTdsSearchData});

										var lineAmt		= splitTdsSearchData[0].split(",");
										var tdsTaxCode	= splitTdsSearchData[1].split(",");
										var searchCnt	= splitTdsSearchData[2];					

										log.debug({title: "tdsTaxCode", details: tdsTaxCode});
										log.debug({title: "lineAmt", details: lineAmt});
										log.debug({title: "tdsTaxCode .length", details: tdsTaxCode.length});
										log.debug({title: "lineAmt .length", details: lineAmt.length});

										//Get All  Withholding Tax Code's Details available in the Instance
										getWHTaxcodes();
										//Get All  Withholding Tax Types Details available in the Instance
										getWHTaxTypes();

										//Lookup to get tax type and tax rate : lookUp is on tax code
										for(var p=0; p<tdsTaxCode.length; p++) {

											/*var fieldLookUp_TC	= search.lookupFields({type: 'customrecord_4601_witaxcode',id: tdsTaxCode[p], columns: ['custrecord_4601_wtc_witaxtype', 'custrecord_4601_wtc_rate']});
									log.debug({title: "fieldLookUp_TC", details: fieldLookUp_TC.custrecord_4601_wtc_witaxtype});
									var tdsTaxType		= fieldLookUp_TC.custrecord_4601_wtc_witaxtype[0].value									;
									log.debug({title: "tdsTaxType", details: tdsTaxType});
									var tdsTaxRate		= fieldLookUp_TC.custrecord_4601_wtc_rate;*/

											if(WH_TAXCODE_DETAILS[tdsTaxCode[p]]){
												var tdsTaxType = WH_TAXCODE_DETAILS[tdsTaxCode[p]].WtcTaxType
												var tdsTaxRate = WH_TAXCODE_DETAILS[tdsTaxCode[p]].WtcRate
												var tdsSplitRate	= tdsTaxRate.split('%');
												log.debug({title: "tdsSplitRate", details: tdsSplitRate[0]});
												var calTDSTaxAmt	= Number(lineAmt[p]) * (Number(tdsSplitRate[0] / 100));
												log.debug({title: "calTDSTaxAmt", details: calTDSTaxAmt});
												if(calTDSTaxAmt){
													tdsTaxAmt.push(calTDSTaxAmt);
												}
											}

											//Lookup to get sale item account : lookUp is on tax type
											/*var fieldLookUp_TT 	= search.lookupFields({type: 'customrecord_4601_witaxtype',id: tdsTaxType, columns: ['custrecord_4601_wtt_saleaccount']});
									log.debug({title: "fieldLookUp_TT", details: fieldLookUp_TT.custrecord_4601_wtt_saleaccount});
									var salesAccId		= fieldLookUp_TT.custrecord_4601_wtt_saleaccount[0].value;*/

											if(WH_TAXTYPE_DETAILS[tdsTaxType]){
												var salesAccId = WH_TAXTYPE_DETAILS[tdsTaxType].SalesTaxAccont	
											}
											log.debug({title: "salesAccId", details: salesAccId});
											if(salesAccId){
												tdsDebitAcc.push(salesAccId);
											}
											//return true;
										}
									}
									var custName	= recLoad.getValue({fieldId: "entity"});
									var lineCount = recLoad.getLineCount({sublistId: 'item'});
									log.debug({title: "tdsTaxAmt", details: tdsTaxAmt});
									log.debug({title: "tdsDebitAcc", details: tdsDebitAcc});
									
									var dept;
									var product;
									var locationVal;
									for(var i=0;i<lineCount;i++)
									{
										dept = recLoad.getSublistValue({sublistId: "item", fieldId : "department", line: i});
										product = recLoad.getSublistValue({sublistId: "item", fieldId : "class", line: i});
										locationVal = recLoad.getSublistValue({sublistId: "item", fieldId : "location", line: i});
									}
									var tdsTaxAmtLength		= tdsTaxAmt.length;
									var tdsDebitAccLeng		= tdsDebitAcc.length;
									log.debug({title: "tdsTaxAmtLength", details: tdsTaxAmtLength});
									log.debug({title: "tdsDebitAccLeng", details: tdsDebitAccLeng});
									if(tdsTaxAmtLength == tdsDebitAccLeng) {
										for(var k=0; k<tdsDebitAccLeng ; k++) {
											var journalEntry	= record.create({type: record.Type.JOURNAL_ENTRY, isDynamic: true});
											journalEntry.setValue({fieldId: "subsidiary", value:tranSubsidiary});
											journalEntry.setText({fieldId: "memo", text:"Customer TDS Provision - "+invNumber});
											journalEntry.setValue({fieldId: "custbody_yil_tds_invoice", value:invRecId});
											journalEntry.insertLine({sublistId: 'line',line: 0});
											journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', line: 0, value: tdsDebitAcc[k]});
											journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', line: 0, value: tdsTaxAmt[k]});
											journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', line: 0, value: custName});
											if(_logValidation(dept)){
												journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'department', line: 0, value: dept});
											}
											if(_logValidation(product)){
												journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'class', line: 0, value: product});
											}
											if(_logValidation(locationVal)){
												journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'location', line: 0, value: locationVal});
											}
											journalEntry.setCurrentSublistText({sublistId: 'line', fieldId: 'memo', line: 0, text: "Customer TDS Provision - "+invNumber});
											journalEntry.commitLine({sublistId : 'line'});
											journalEntry.insertLine({sublistId: 'line',line: 1});
											journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account', line: 1, value: invAccId});
											journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', line: 1, value: tdsTaxAmt[k]});
											journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity', line: 1, value: custName});
											if(_logValidation(dept)){
												journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'department', line: 1, value: dept});
											}
											if(_logValidation(product)){
												journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'class', line: 1, value: product});
											}
											if(_logValidation(locationVal)){
												journalEntry.setCurrentSublistValue({sublistId: 'line', fieldId: 'location', line: 1, value: locationVal});
											}
											journalEntry.setCurrentSublistText({sublistId: 'line', fieldId: 'memo', line: 1, text: "Customer TDS Provision - "+invNumber});
											journalEntry.commitLine({ sublistId : 'line'});
											var jeId	= journalEntry.save({enableSourcing: true,ignoreMandatoryFields: true});
											log.debug({title: "jeId", details: jeId});
										}
									}
								}
							}
						}
					}
				}
			}
			catch(exp) {
				log.debug({title: "afterSubmit:Exception Error", details: exp.message});
			}
		}
	}
	//--------------------------------------------------------------------- Start - Custom functions --------------------------------------------------------------//
	function _getDebitAccIds(accName) {
		var accId	= "";
		if(accName != null && accName != "") {
			var accountSearchObj = search.create({type: "account",
				filters:
					[
						["name","is",accName]
						],
						columns:
							[
								search.createColumn({name: "internalid", label: "Internal ID"})
								]
			});
			var searchResultCount = accountSearchObj.runPaged().count;
			log.debug("accountSearchObj result count",searchResultCount);
			accountSearchObj.run().each(function(result){
				accId	= result.getValue({name: "internalid", label: "Internal ID"});
				return true;
			});
		}
		return accId
	}

	function _getInvAccId(invId) {
		var accId	= "";
		var invoiceSearchObj = search.create({type: "invoice",
			filters:
				[
					["type","anyof","CustInvc"], "AND", ["internalidnumber","equalto",invId], "AND", ["mainline","is","T"]
					],
					columns:
						[
							search.createColumn({name: "account", label: "Account"})
							]
		});
		var searchResultCount = invoiceSearchObj.runPaged().count;
		log.debug("invoiceSearchObj result count",searchResultCount);
		invoiceSearchObj.run().each(function(result){
			accId	= result.getValue({name: "account", label: "Account"});
			return true;
		});
		return accId;
	}

	function _getTdsTaxCodeAndAmt(invId) {
		var totalAmt		= "";
		var tdsTaxCodeId	= "";
		var totalAmt_Arr	= [];
		var tdsTaxCodeId_Arr= [];
		var invoiceSearchObj= search.create({
			type: "invoice",
			filters:
				[
					["type","anyof","CustInvc"], "AND", ["internalid","anyof",invId], "AND", ["taxline","is","F"], "AND", ["cogs","is","F"], "AND", ["custcol_gst_tds_taxcode_inv","noneof","@NONE@"], "AND", ["custcol_gst_apply_tds_inv","is","T"]
					],
					columns:
						[
							search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{fxamount}"}),
							search.createColumn({name: "custcol_gst_tds_taxcode_inv",summary: "GROUP"})
							]
		});
		var searchResultCount = invoiceSearchObj.runPaged().count;
		log.debug("invoiceSearchObj result count",searchResultCount);
		invoiceSearchObj.run().each(function(result){
			totalAmt		= result.getValue({name: "formulacurrency",summary: "SUM",formula: "{fxamount}"});
			totalAmt_Arr.push(totalAmt);
			tdsTaxCodeId	= result.getValue({name: "custcol_gst_tds_taxcode_inv",summary: "GROUP"});
			tdsTaxCodeId_Arr.push(tdsTaxCodeId);
			return true;
		});
		return totalAmt_Arr+"|::|"+tdsTaxCodeId_Arr+"|::|"+searchResultCount;
	}

//	-------------------------------------- Start - Get details of TDS Details Record --------------------------------------------------------//
	function getTDSDetails(custObj,tranSubsidiary){

		var getApplyLTDS="";
		var getTdsTaxCode="";
		var getThresholdLimit="";
		var getCerIssueDate="";
		var getCerExpiryDate="";
		var getLtdsTaxCode="";
		var getCustomerThreshLimit="";
		var getLdsSectionValue="";
		var getSubsidiaryValue="";

		var searchFilter_TDSD	= [];
		var searchColumn_TDSD	= [];

		if(custObj){
			searchFilter_TDSD.push(search.createFilter({name: "custrecord_yantragst_customer", operator: search.Operator.IS, values: custObj}));
		}
		if(tranSubsidiary){
			searchFilter_TDSD.push(search.createFilter({name: "custrecord_yil_tds_subsidiary", operator: search.Operator.IS, values: tranSubsidiary}));
		}
		searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_apply_lower_tds"}));
		searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_taxcode"}));
		searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_threshold_limit"}));
		searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_cert_issue_date"}));
		searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_cert_exp_date"}));
		searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_taxcode_tds"}));
		searchColumn_TDSD.push(search.createColumn({name: "custrecord_ygst_customer_threshold_limit"}));
		searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_tds_section"}));
		searchColumn_TDSD.push(search.createColumn({name: "custrecord_yil_tds_subsidiary"}));

		var tdsSearchObj	= search.create({type: "customrecord_yantragst_vendor_tds_detail", filters: searchFilter_TDSD, columns: searchColumn_TDSD});

		var countObj		= tdsSearchObj.runPaged().count;
		//log.debug("countObj ",countObj);
		if(countObj > 0)
		{
			tdsSearchObj.run().each(function(result) {
				getApplyLTDS		= result.getValue({name: "custrecord_yantragst_apply_lower_tds"});
				getTdsTaxCode		= result.getValue({name: "custrecord_yantragst_taxcode"});
				getThresholdLimit	= result.getValue({name: "custrecord_yantragst_threshold_limit"});
				getCerIssueDate	= result.getValue({name: "custrecord_yantragst_cert_issue_date"});
				getCerExpiryDate	= result.getValue({name: "custrecord_yantragst_cert_exp_date"});
				getLtdsTaxCode		= result.getValue({name: "custrecord_yantragst_taxcode_tds"});
				getCustomerThreshLimit = result.getValue({name: "custrecord_ygst_customer_threshold_limit"});
				getLdsSectionValue = result.getValue({name: "custrecord_yantragst_tds_section"});
				getSubsidiaryValue  = result.getValue({name: "custrecord_yil_tds_subsidiary"});

				TDS_DETAILS[getLdsSectionValue+getSubsidiaryValue] = {"GetApplyLTDS":getApplyLTDS,"GetTdsTaxcode" :getTdsTaxCode,"GetThresholdLimit":getThresholdLimit,"GetCerIssueDate":getCerIssueDate,"GetCerExpiryDate":getCerExpiryDate,
						"GetLtdsTaxCode":getLtdsTaxCode,"GetCustomerThreshLimit":getCustomerThreshLimit};
				return true;
			});
		}
		log.debug("getTDSDetails: TDS_DETAILS==",JSON.stringify(TDS_DETAILS));
	}
	//--------------------------------------End - Get details of TDS Details Record --------------------------------------------------------//

	//---------------------------------------------------- Start -get  all existing  Invoice total sum  ----------------------------------------------//
	function getInvoiceTotal(recId,custObj,cerIssueDate,cerExpiryDate,tranSubsidiary){

		var invTotal=0;
		var tdsSectionValue="";
		var subsidiaryValue="";

		var searchFilter_Cust	= [];
		var searchColumn_Cust	= [];
		var searchSetting_Cust	= [];

		if(recId) {
			searchFilter_Cust.push(search.createFilter({name: "internalid", operator: search.Operator.NONEOF, values: recId}));
		}
		if(custObj){
			searchFilter_Cust.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
		}
		if(tranSubsidiary){
			searchFilter_Cust.push(search.createFilter({name: "subsidiary", operator: search.Operator.IS, values: tranSubsidiary}));
		}
		if(cerIssueDate && cerExpiryDate) {
			searchFilter_Cust.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [cerIssueDate, cerExpiryDate]}));
		}
		searchFilter_Cust.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));

		//searchColumn_Cust.push(search.createColumn({name: "amount",summary: "SUM"}));//,label: "Amount"
		searchColumn_Cust.push(search.createColumn({ name: "fxamount", summary: "SUM", label: "Amount (Foreign Currency)" }));
		searchColumn_Cust.push(search.createColumn({ name: "custcol_yantragst_tds_section", summary: "GROUP", label: "TDS Section" }));
		searchColumn_Cust.push(search.createColumn({ name: "subsidiary", summary: "GROUP", label: "Subsidiary" }));
		searchSetting_Cust.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

		var searchObj	= search.create({type: "invoice", filters: searchFilter_Cust, columns: searchColumn_Cust, settings: searchSetting_Cust});
		var countObj	= searchObj.runPaged().count;

		searchObj.run().each(function(result) {
			//InvTotal	= result.getValue({name: "amount",summary: "SUM"});
			invTotal	= result.getValue({ name: "fxamount", summary: "SUM", label: "Amount (Foreign Currency)" });
			tdsSectionValue = result.getValue({ name: "custcol_yantragst_tds_section", summary: "GROUP", label: "TDS Section" });
			subsidiaryValue = result.getValue({ name: "subsidiary", summary: "GROUP", label: "Subsidiary" });
			INVOICE_TOTAL[tdsSectionValue+subsidiaryValue] =  {"InvTotal":invTotal};
			return true;
		});
		//log.debug("getInvoiceTotal: INVOICE_TOTAL==",JSON.stringify(INVOICE_TOTAL));
	}
	//---------------------------------------------------- End -get  all existing  Invoice total sum  ----------------------------------------------//
	//---------------------------------------------------- Start -get Values from Withholding Tax Code record ----------------------------------------------//
	function getWHTaxcodes(){

		var wtcInternalId="";
		var wtcRate ="";
		var wtcTaxType ="";

		var customrecord_4601_witaxcodeSearchObj = search.create({type: "customrecord_4601_witaxcode",
			filters:
				[
					["isinactive","is","F"]
					],
					columns:
						[
							search.createColumn({name: "internalid", label: "Internal ID"}),
							search.createColumn({name: "custrecord_4601_wtc_rate", label: "Rate"}),
							search.createColumn({name: "custrecord_4601_wtc_witaxtype", label: "Withholding Tax Type"})
							]
		});
		var searchResultCount = customrecord_4601_witaxcodeSearchObj.runPaged().count;
		log.debug("customrecord_4601_witaxcodeSearchObj result count",searchResultCount);
		customrecord_4601_witaxcodeSearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			wtcInternalId = result.getValue({name: "internalid", label: "Internal ID"});
			wtcRate = result.getValue({ name: "custrecord_4601_wtc_rate", label: "Rate"});
			wtcTaxType = result.getValue({ name: "custrecord_4601_wtc_witaxtype", label: "Withholding Tax Type" });

			WH_TAXCODE_DETAILS[wtcInternalId]= {"WtcRate":wtcRate,"WtcTaxType":wtcTaxType};

			return true;
		});
		log.debug("getWHTaxcodes: WH_TAXCODE_DETAILS==",JSON.stringify(WH_TAXCODE_DETAILS));
	}
	//---------------------------------------------------- End -get Values from Withholding Tax Code record ----------------------------------------------//

	//---------------------------------------------------- Start -get Values from Withholding Tax Type record ----------------------------------------------//
	function getWHTaxTypes(){

		var wttInternalId ="";
		var salesTaxAccont="";

		var customrecord_4601_witaxtypeSearchObj = search.create({type: "customrecord_4601_witaxtype",
			filters:
				[
					["isinactive","is","F"]
					],
					columns:
						[
							search.createColumn({name: "internalid", label: "Internal ID"}),
							search.createColumn({name: "custrecord_4601_wtt_saleaccount", label: "Asset/Sales Tax Account"})
							]
		});
		var searchResultCount = customrecord_4601_witaxtypeSearchObj.runPaged().count;
		log.debug("customrecord_4601_witaxtypeSearchObj result count",searchResultCount);
		customrecord_4601_witaxtypeSearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results

			wttInternalId = result.getValue({name: "internalid", label: "Internal ID"});
			salesTaxAccont = result.getValue({name: "custrecord_4601_wtt_saleaccount", label: "Asset/Sales Tax Account"});

			WH_TAXTYPE_DETAILS[wttInternalId] = {"SalesTaxAccont":salesTaxAccont};

			return true;
		});
		log.debug("getWHTaxTypes: WH_TAXTYPE_DETAILS==",JSON.stringify(WH_TAXTYPE_DETAILS));

	}
//	---------------------------------------------------- End -get Values from Withholding Tax Type record ----------------------------------------------//

	function _logValidation(value)
	{
		if(value != null && value != '' && value != undefined && value != 'undefined' && value != 'NaN' && value != ' ')	{
			return true;
		}
		else	{
			return false;
		}
	}
//	--------------------------------------------------------------------- End - Custom functions --------------------------------------------------------------//
	return {
		afterSubmit : afterSubmit
	}
});
