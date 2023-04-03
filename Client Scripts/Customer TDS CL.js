/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */

/*************************************************************
 * File Header
 * Script Type: Client Script
 * Script Name: Customer TDS CL
 * File Name  : GST_TDS_For_Customer_CL.js
 * Created On : 15/12/2020
 * Modified On: 
 * Created By : Siddhant (Yantra Inc.)
 * Modified By: 
 * Description: Script is to implement TDS functinality for customer.
 ************************************************************/

define(['N/currentRecord','N/search', 'N/record', 'N/format', 'N/runtime'], function(currentRecord, search, record, format, runtime) {
	var TDS_DETAILS = {};
	var INVOICE_TOTAL={};
	var SECTION_VALUE = "";
	var ARR_SECTION_VALUE=[];

	function pageInit(context){

		try{
			//var tranSubsidiary      = window.nlapiGetFieldValue('subsidiary')
			var tranSubsidiary      = context.currentRecord.getValue('subsidiary');			
			var scriptObj 			= runtime.getCurrentScript();
			var isCreateJE = scriptObj.getParameter({name: 'custscript_ygst_tds_je_invoice'});
			if(isCreateJE){
				var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
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
				log.debug({title: "pageInit : tranSubsidiary", details: tranSubsidiary});
				log.debug({title: "pageInit : indiaSubObj", details: indiaSubObj});
				if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj)
				{
					var isExportcustomer = context.currentRecord.getValue({fieldId : "custbody_ygst_is_nri_customer"});
					if(!isExportcustomer){
						var entityId = context.currentRecord.getValue({fieldId : "entity"});
						if(entityId){						
							SECTION_VALUE = getTDSSectionFromEntity(entityId,tranSubsidiary);

							getTDSDetails(entityId,tranSubsidiary);
						}		
					}
				}
			}
		}
		catch (exp) {
			log.error('Exception Caught PageInit:- ', exp.id);
			log.error('Exception Caught PageInit:- ', exp.message);
		}
	}

	function fieldChanged(context)
	{
		var totalAmt	= 0;
		var tranAmt_1	= 0;
		var tranAmt_2	= 0;
		var tranAmt		= 0;
		var amountObj	= 0;
		var tdsSecArray = [];

		var scriptObj 			= runtime.getCurrentScript();
		var isCreateJE = scriptObj.getParameter({name: 'custscript_ygst_tds_je_invoice'});
			if(isCreateJE){
		var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});				
		var getItemType         = scriptObj.getParameter({name: 'custscript_ygst_item_type'});				

		var currentRecordObj		= context.currentRecord;
		var subListObj			= context.sublistId;
		var fieldObj			= context.fieldId;
		var recId		= currentRecordObj.getValue('id');
		var custObj		= currentRecordObj.getValue({fieldId : "entity"});

		if(fieldObj == "subsidiary"){
			var tranSubsidiary 		= currentRecordObj.getValue({fieldId: 'subsidiary'});
			log.debug({title: "fieldChanged: tranSubsidiary", details: tranSubsidiary});

			//------------------------------------------------------- Start - Condition to compare multi India Subsidiary.--------------------------------------------------------------//
			var indiaSubObj	= false;
			var itemTypeObj    = false;
			var splitSub	= getAccountSubsidiary.split(",");
			var subLength	= splitSub.length;
			for(var i=0; i<subLength; i++) {
				if(Number(splitSub[i]) == Number(tranSubsidiary)) {
					indiaSubObj	= true;
				}
			}
			log.debug({title: "fieldChanged:indiaSubObj", details: indiaSubObj});
			//------------------------------------------------------- End - Condition to compare multi India Subsidiary.--------------------------------------------------------------//
			if(tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj)
			{
				//Get all TDS Section from the Entity
				SECTION_VALUE = getTDSSectionFromEntity(custObj,tranSubsidiary);

				getTDSDetails(custObj,tranSubsidiary);
			}

		}

		if(fieldObj == "custcol_yantragst_tds_section" || fieldObj =="amount" || fieldObj =="rate") {
			try {							
				var dateObj		= currentRecordObj.getValue({fieldId : "trandate"});
				var lineCnt		= currentRecordObj.getLineCount({sublistId:"item"});

				var tranSubsidiary 		= context.currentRecord.getValue({fieldId: 'subsidiary'});
				log.debug('fieldChanged: tranSubsidiary: ',tranSubsidiary);				

				//------------------------------------ Start - Condition for to compare multi India Subsidiary---------------------------------------------------//
				var indiaSubObj	= false;
				var splitSub	= getAccountSubsidiary.split(",");
				var subLength	= splitSub.length;
				for(var i=0; i<subLength; i++) {
					if(Number(splitSub[i]) == Number(tranSubsidiary)) {
						indiaSubObj	= true;
					}
				}
				log.debug({title: "fieldChanged: indiaSubObj", details: indiaSubObj});
				//------------------------------------ End - Condition for to compare multi India Subsidiary---------------------------------------------------//
				if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj ) {

					var isExportcustomer = currentRecordObj.getValue({fieldId : "custbody_ygst_is_nri_customer"});

					if(!isExportcustomer){

						//---------------------------------------------------- Start - Compare Item Type with Item type mentioned into Global Param -----------------------------//
						var itemType = currentRecordObj.getCurrentSublistText({sublistId: "item", fieldId : "custcol_yil_item_type"});

						var itemTypeObj    = false;
						if(itemType){
							var splitItemType  = getItemType.split(",");
							var itemTypeLength	= splitItemType.length;
							for(var i=0; i<itemTypeLength; i++) {							
								if(splitItemType[i] == itemType) {
									itemTypeObj	= true;
								}
							}
						}
						log.debug("fieldChanged: itemTypeObj",itemTypeObj);

						//---------------------------------------------------- Start - Compare Item Type with Item type mentioned into Global Param -----------------------------//
						if(itemTypeObj){

							//if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj && itemTypeObj) {
							if(subListObj == "item") {						

								//Start of: added by Nikita to autocheck APPLY TDS ON INVOICE checkbox & to autoset TDS section
								/*if(fieldObj == "item" || fieldObj =="amount" ||  fieldObj =="rate" )
							{
								var tdsSecVal		= currentRecordObj.getCurrentSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section"});
								if(tdsSecVal == '')	
								{
									if(SECTION_VALUE)
									{										
										tranAmt_1		= currentRecordObj.getCurrentSublistValue({sublistId: "item", fieldId : "amount"});
										for(var i= 0; i< lineCnt; i++) {
											tranAmt_2	= currentRecordObj.getSublistValue({sublistId: "item", fieldId : "amount", line: i});
											tranAmt		= Number(tranAmt)+Number(tranAmt_2);
										}											
										var applyLTDS = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetApplyLTDS; 
										var tdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetTdsTaxcode;
										var thresholdLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetThresholdLimit;
										var cerIssueDate= TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerIssueDate;
										var cerExpiryDate = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerExpiryDate;
										var ltdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetLtdsTaxCode;
										var customerThreshLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCustomerThreshLimit;

										if(cerIssueDate) {											
											var fromCerDate		= format.parse({value: cerIssueDate, type: format.Type.DATE});
										}
										if(cerExpiryDate) {											
											var toCerDate		= format.parse({value: cerExpiryDate, type: format.Type.DATE});
										}										
										var comDate			= Date.parse(dateObj);
										var fromDate		= Date.parse(fromCerDate);
										var toDate			= Date.parse(toCerDate);

										getInvoiceTotal(recId,custObj,cerIssueDate,cerExpiryDate);

										if(INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary]){
											amountObj = INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary].InvTotal;
										}

										//---------------------------------------------------- End - Search On Invoice record to -------------------------------------------------------------//
										totalAmt	= Number(amountObj)+Number(tranAmt_1)+Number(tranAmt);

										if(Number(customerThreshLimit) > Number(totalAmt)){
											currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_apply_tds_inv',value: false,ignoreFieldChange: true,fireSlavingSync: true});
											currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: '',ignoreFieldChange: true,fireSlavingSync: true});
											currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,fireSlavingSync: true});
										}

										if(customerThreshLimit == '' || Number(customerThreshLimit) < Number(totalAmt)) //Added by Nikita
										{
											currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_apply_tds_inv',value: true,ignoreFieldChange: true,fireSlavingSync: true});
											currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: SECTION_VALUE,ignoreFieldChange: true,fireSlavingSync: true});											

											if(TDS_DETAILS[SECTION_VALUE+tranSubsidiary]){
											var tdsTaxCode1 = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetTdsTaxcode;
											}

											if(tdsTaxCode1)
												currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: tdsTaxCode1,ignoreFieldChange: true,fireSlavingSync: true});
										}
									}
								}
							}*/

								if(fieldObj == "custcol_yantragst_tds_section" || fieldObj =="amount"||  fieldObj =="rate")
								{
									var flag=0;
									var tdsSection			= currentRecordObj.getCurrentSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section"});									
									if(fieldObj == "custcol_yantragst_tds_section" )
									{
										var tdsSectionValue 		 = currentRecordObj.getCurrentSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section"});										
										if(ARR_SECTION_VALUE){										
											if(ARR_SECTION_VALUE.indexOf(tdsSectionValue) === -1){
												flag=1;
												alert("This selected section is not configured for this customer and subsidiary record.");
												currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_apply_tds_inv',value: false,ignoreFieldChange: true,fireSlavingSync: true});
												currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,fireSlavingSync: true});
												currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: '',ignoreFieldChange: true,fireSlavingSync: true});												
											}
										}
									}
									if(flag==0){
										var 	tranAmt_1		= currentRecordObj.getCurrentSublistValue({sublistId: "item", fieldId : "amount"});

										for(var z= 0; z< lineCnt; z++) {										
											var previuesTDSSection	= currentRecordObj.getSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section", line: z});											
											if(tdsSection==previuesTDSSection){
												var tranAmt_2	= currentRecordObj.getSublistValue({sublistId: "item", fieldId : "amount", line: z});
												tranAmt		= Number(tranAmt)+Number(tranAmt_2);
											}
										}
										//var tdsSection			= currentRecordObj.getCurrentSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section"});
										if(!tdsSection){
											tdsSection = SECTION_VALUE;
										}

										var applyLTDS ="";
										var tdsTaxCode ="";
										var thresholdLimit ="";
										var cerIssueDate="";
										var cerExpiryDate ="";
										var ltdsTaxCode ="";
										var customerThreshLimit ="";
										if(TDS_DETAILS[tdsSection+tranSubsidiary]){
											applyLTDS = TDS_DETAILS[tdsSection+tranSubsidiary].GetApplyLTDS; 
											tdsTaxCode = TDS_DETAILS[tdsSection+tranSubsidiary].GetTdsTaxcode;
											thresholdLimit = TDS_DETAILS[tdsSection+tranSubsidiary].GetThresholdLimit;
											cerIssueDate= TDS_DETAILS[tdsSection+tranSubsidiary].GetCerIssueDate;
											cerExpiryDate = TDS_DETAILS[tdsSection+tranSubsidiary].GetCerExpiryDate;
											ltdsTaxCode = TDS_DETAILS[tdsSection+tranSubsidiary].GetLtdsTaxCode;
											customerThreshLimit = TDS_DETAILS[tdsSection+tranSubsidiary].GetCustomerThreshLimit;
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

										getInvoiceTotal(recId,custObj,cerIssueDate,cerExpiryDate);

										if(INVOICE_TOTAL[tdsSection+tranSubsidiary]){
											amountObj = INVOICE_TOTAL[tdsSection+tranSubsidiary].InvTotal;
										}
										totalAmt	= Number(amountObj)+Number(tranAmt_1)+Number(tranAmt);
									}
								}
								if(flag==0){
									if(Number(customerThreshLimit) > Number(totalAmt)){
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_apply_tds_inv',value: false,ignoreFieldChange: true,fireSlavingSync: true});
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,fireSlavingSync: true});
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: '',ignoreFieldChange: true,fireSlavingSync: true});									
									}
									if(customerThreshLimit == '' || Number(customerThreshLimit) < Number(totalAmt)) //Added by Nikita
									{
										if(tdsSection || SECTION_VALUE) {
											currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_apply_tds_inv',value: true,ignoreFieldChange: true,fireSlavingSync: true});
											currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: tdsSection,ignoreFieldChange: true,fireSlavingSync: true});	
											if(!applyLTDS) {
												currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: tdsTaxCode/*,ignoreFieldChange: true,fireSlavingSync: true*/});
												/*if(fieldObj =="amount"|| fieldObj =="rate"){
												//alert("TDS Applied");
											}*/
											}
											else if(comDate >= fromDate && comDate <= toDate){
												if(Number(thresholdLimit) >= Number(totalAmt)) {
													currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: Number(ltdsTaxCode)/*,ignoreFieldChange: true,fireSlavingSync: true*/});
													/*if(fieldObj =="amount" || fieldObj =="rate"){
													//alert("LTDS Applied");
												}*/
												}
												else {
													currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: tdsTaxCode/*,ignoreFieldChange: true,fireSlavingSync: true*/});
													/*if(fieldObj =="amount"|| fieldObj =="rate"){
													//alert("TDS Applied");
												}*/
												}
											}
											else {
												currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: tdsTaxCode/*,ignoreFieldChange: true,fireSlavingSync: true*/});
												/*if(fieldObj =="amount" || fieldObj =="rate"){
												//alert("TDS Applied");
											}*/
											}										
										}
									}
									else {
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: null/*,ignoreFieldChange: true,fireSlavingSync: true*/});
									}
								}
							}
						}
					}
				}
			}
			catch(exp) {
				log.error({title: "fieldChanged Exception Error", details: exp.message});
			}
		}
		}
	}

	function validateField(context) {
		var currentRecord 	= context.currentRecord;
		var sublistName		= context.sublistId;
		var sublistFieldName= context.fieldId;
		var scriptObj 		= runtime.getCurrentScript();
		var isCreateJE = scriptObj.getParameter({name: 'custscript_ygst_tds_je_invoice'});
		if(isCreateJE){
			var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
			var getItemType         = scriptObj.getParameter({name: 'custscript_ygst_item_type'});

			var tranSubsidiary 		= context.currentRecord.getValue({fieldId: 'subsidiary'});
			//------------------------------Start - Condition for to compare multi India Subsidiary--------------------------------------------------------//
			var indiaSubObj	= false;
			var splitSub	= getAccountSubsidiary.split(",");
			var subLength	= splitSub.length;
			for(var i=0; i<subLength; i++) {
				if(Number(splitSub[i]) == Number(tranSubsidiary)) {
					indiaSubObj	= true;
				}
			}
			//------------------------------End - Condition for to compare multi India Subsidiary--------------------------------------------------------//
			if(indiaSubObj){
				if (sublistName === 'item') {
					try{
						if (sublistFieldName === 'custcol_yantragst_tds_section') {

							var isExportcustomer = currentRecord.getValue({fieldId : "custbody_ygst_is_nri_customer"});
							if(!isExportcustomer){
								var tdsSection	= currentRecord.getCurrentSublistValue({sublistId:'item', fieldId:'custcol_yantragst_tds_section'});						

								//---------------------------------------------------- Start - Compare Item Type with Item type mentioned into Global Param -----------------------------//
								var itemTypeObj    = false;
								var itemType = currentRecord.getCurrentSublistText({sublistId: "item", fieldId : "custcol_yil_item_type"});
								if(itemType){							
									var splitItemType  = getItemType.split(",");
									var itemTypeLength	= splitItemType.length;
									for(var i=0; i<itemTypeLength; i++) {
										if(splitItemType[i] == itemType) {
											itemTypeObj	= true;
										}
									}
								}
								log.debug("itemTypeObj",itemTypeObj);
								//---------------------------------------------------- Start - Compare Item Type with Item type mentioned into Global Param -----------------------------//
								if (tdsSection != null && tdsSection != "" && indiaSubObj && itemTypeObj) {
									var tdsApplyCB	= currentRecord.getCurrentSublistValue({sublistId:'item', fieldId:'custcol_gst_apply_tds_inv'});
									//alert("tdsApplyCB validateField"+tdsApplyCB);
									if(!tdsApplyCB) {
										alert("Please Check APPLY TDS ON INVOICE CheckBox");
										return false;
									}
								}
							}
						}
					}
					catch(exp) {
						log.error({title: "validateField Exception Error", details: exp.message});
					}
				}
			}
		}
		return true;
	}

	function postSourcing(scriptContext)
	{
		try{
			var currentRecordObj = scriptContext.currentRecord;
			var tranSubsidiary = currentRecordObj.getValue({fieldId: 'subsidiary'});

			//var tranSubsidiary = window.nlapiGetFieldValue('subsidiary')
			var scriptObj = runtime.getCurrentScript();
			var isCreateJE = scriptObj.getParameter({name: 'custscript_ygst_tds_je_invoice'});
			if(isCreateJE){
			var getAccountSubsidiary = scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});


			//-------------------------- Start - Condition for to compare multi India Subsidiary.-------------------------------------//
			var indiaSubObj	= false;
			var splitSub	= getAccountSubsidiary.split(",");			
			var subLength	= splitSub.length;
			for(var i=0; i<subLength; i++) {
				if(Number(splitSub[i]) == Number(tranSubsidiary)) {
					indiaSubObj	= true;
				}
			}
			//-------------------------- End - Condition for to compare multi India Subsidiary.-------------------------------------//
			if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj)
			{
				if (scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')
				{
					var isExportcustomer = currentRecordObj.getValue({fieldId : "custbody_ygst_is_nri_customer"});
					if(!isExportcustomer){
						var totalAmt	= 0;
						var tranAmt_1	= 0;
						var tranAmt_2	= 0;
						var tranAmt		= 0;
						var amountObj	= 0;

						//---------------------------------------------------- Start - Compare Item Type with Item type mentioned into Global Param -----------------------------//
						var itemType = currentRecordObj.getCurrentSublistText({sublistId: "item", fieldId : "custcol_yil_item_type"});

						var itemTypeObj    = false;
						if(itemType){
							var getItemType         = scriptObj.getParameter({name: 'custscript_ygst_item_type'});	
							var splitItemType  = getItemType.split(",");
							var itemTypeLength	= splitItemType.length;
							for(var i=0; i<itemTypeLength; i++) {								
								if(splitItemType[i] == itemType) {
									itemTypeObj	= true;
								}
							}
						}
						log.debug("postSourcing:itemTypeObj",itemTypeObj);
						//---------------------------------------------------- End - Compare Item Type with Item type mentioned into Global Param -----------------------------//

						if(itemTypeObj){
							var recId		= currentRecordObj.getValue('id');
							var custObj		= currentRecordObj.getValue({fieldId : "entity"});
							var dateObj		= currentRecordObj.getValue({fieldId : "trandate"});
							var lineCnt		= currentRecordObj.getLineCount({sublistId:"item"});

							var tdsSecVal		= currentRecordObj.getCurrentSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section"});
							if(tdsSecVal == '')	
							{
								if(SECTION_VALUE)
								{
									tranAmt_1		= currentRecordObj.getCurrentSublistValue({sublistId: "item", fieldId : "amount"});
									for(var i= 0; i< lineCnt; i++) {
										tranAmt_2	= currentRecordObj.getSublistValue({sublistId: "item", fieldId : "amount", line: i});
										tranAmt		= Number(tranAmt)+Number(tranAmt_2);
									}	

									if(TDS_DETAILS[SECTION_VALUE+tranSubsidiary]){
										var applyLTDS = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetApplyLTDS; 
										var tdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetTdsTaxcode;
										var thresholdLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetThresholdLimit;
										var cerIssueDate= TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerIssueDate;
										var cerExpiryDate = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerExpiryDate;
										var ltdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetLtdsTaxCode;
										var customerThreshLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCustomerThreshLimit;
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

									getInvoiceTotal(recId,custObj,cerIssueDate,cerExpiryDate);

									if(INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary]){
										amountObj = INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary].InvTotal;
									}

									totalAmt	= Number(amountObj)+Number(tranAmt_1)+Number(tranAmt);

									if(Number(customerThreshLimit) > Number(totalAmt)){
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_apply_tds_inv',value: false,ignoreFieldChange: true,fireSlavingSync: true});
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,fireSlavingSync: true});
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: '',ignoreFieldChange: true,fireSlavingSync: true});										
									}

									if(customerThreshLimit == '' || Number(customerThreshLimit) < Number(totalAmt)) //Added by Nikita
									{
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_apply_tds_inv',value: true,ignoreFieldChange: true,fireSlavingSync: true});
										currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: SECTION_VALUE,ignoreFieldChange: true,fireSlavingSync: true});											

										if(TDS_DETAILS[SECTION_VALUE+tranSubsidiary]){
											var tdsTaxCode1 = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetTdsTaxcode

											if(tdsTaxCode1)
												currentRecordObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_gst_tds_taxcode_inv',value: tdsTaxCode1,ignoreFieldChange: true,fireSlavingSync: true});
										}
									}

								}
							}
						}
					}
				}
			}
			}
		}catch(e){
			//log.error({title: e.name,details: e.message}); 
			log.error({title: "postSourcing Exception Error", details: e.message});
		}
		
	}

	function _toGetWHTaxCodeIntId(ltdsTaxCode)
	{
		var interId		= "";
		try{
			var customrecord_yantragst_tax_code_detailsSearchObj = search.create({
				type: "customrecord_yantragst_tax_code_details",
				filters:
					[
						["custrecord_yantragst_tax_code","is",ltdsTaxCode.trim()]
						],
						columns:
							[
								search.createColumn({name: "custrecord_yantragst_int_id", label: "Internal ID"})
								]
			});
			var searchResultCount = customrecord_yantragst_tax_code_detailsSearchObj.runPaged().count;
			log.debug("customrecord_yantragst_tax_code_detailsSearchObj result count",searchResultCount);
			customrecord_yantragst_tax_code_detailsSearchObj.run().each(function(result){
				interId		= result.getValue({name: "custrecord_yantragst_int_id"});
				return true;
			});
		}catch(e){
			log.error({title: "_toGetWHTaxCodeIntId Exception Error", details: e.message});
		}
		return interId;
	}	

	//----------------------------------------- Start - Search on Customer to get TDS Section ----------------------------------------------------------//
	function getTDSSectionFromEntity(entityId,tranSubsidiary){
		var secVal="";
		try{
			if(entityId && tranSubsidiary ){
				var customerSearchObj = search.create({type: "customer",
					filters:
						[
							["isinactive","is","F"], "AND", ["custrecord_yantragst_customer.isinactive","is","F"],"AND", ["custrecord_yantragst_customer.custrecord_yil_tds_subsidiary","is",tranSubsidiary], "AND", ["internalid","anyof",entityId]

							],
							columns:
								[	
									search.createColumn({ name: "internalid", join: "CUSTRECORD_YANTRAGST_CUSTOMER"/*,sort: search.Sort.DESC*/, label: "Internal ID" }),
									search.createColumn({ name: "custrecord_yantragst_tds_section", join: "CUSTRECORD_YANTRAGST_CUSTOMER",sort: search.Sort.DESC, label: "TDS Section" })
									]
				});
				//var searchCount		= customerSearchObj.runPaged().count;
				var resultIndex = 0; 
				var resultStep = 1000;
				var searchResult = customerSearchObj.run().getRange({ start: resultIndex, end: resultIndex + resultStep });
				for(var t=0; t< searchResult.length;t++) {
					/*if(t==0){
					secVal  = searchResult[0].getValue({name: "custrecord_yantragst_tds_section",join: "CUSTRECORD_YANTRAGST_CUSTOMER"});
				}*/

					secVal  = searchResult[t].getValue({name: "custrecord_yantragst_tds_section",join: "CUSTRECORD_YANTRAGST_CUSTOMER"});

					if(secVal){
						ARR_SECTION_VALUE.push(secVal);
					}
				}
			}
			//log.debug({title: "getTDSSectionFromEntity : secVal", details: secVal});
			//log.debug({title: "getTDSSectionFromEntity : ARR_SECTION_VALUE", details: ARR_SECTION_VALUE});
		}catch(e){
			log.error({title: "getTDSSectionFromEntity Exception Error", details: e.message});
		}
		return secVal;
	}
//	----------------------------------------- End - Search on Customer to get TDS Section ----------------------------------------------------------//

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
		try{
			var searchFilter_TDSD	= [];
			var searchColumn_TDSD	= [];

			searchFilter_TDSD.push(search.createFilter({name: "isinactive", operator: search.Operator.IS, values: false}));
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
					getSubsidiaryValue = result.getValue({name: "custrecord_yil_tds_subsidiary"});

					TDS_DETAILS[getLdsSectionValue+getSubsidiaryValue] = {"GetApplyLTDS":getApplyLTDS,"GetTdsTaxcode" :getTdsTaxCode,"GetThresholdLimit":getThresholdLimit,"GetCerIssueDate":getCerIssueDate,"GetCerExpiryDate":getCerExpiryDate,
							"GetLtdsTaxCode":getLtdsTaxCode,"GetCustomerThreshLimit":getCustomerThreshLimit};
					return true;
				});
			}
			//log.debug("TDS_DETAILS==",JSON.stringify(TDS_DETAILS));
		}catch(e){
			log.error({title: "getTDSDetails Exception Error", details: e.message});
		}
	}
//	--------------------------------------End - Get details of TDS Details Record --------------------------------------------------------//

//	---------------------------------------------------- Start -get  all existing  Invoice total sum  ----------------------------------------------//
	function getInvoiceTotal(recId,custObj,cerIssueDate,cerExpiryDate,tranSubsidiary){

		var invTotal=0;
		var tdsSectionValue="";
		var subsidiaryValue="";

		try{
			var searchFilter_Cust	= [];
			var searchColumn_Cust	= [];
			var searchSetting_Cust	= [];

			if(recId) {
				searchFilter_Cust.push(search.createFilter({name: "internalid", operator: search.Operator.NONEOF, values: recId}));
			}
			if(custObj){
				searchFilter_Cust.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
			}
			if(cerIssueDate && cerExpiryDate) {
				searchFilter_Cust.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [cerIssueDate, cerExpiryDate]}));
			}
			if(tranSubsidiary){
				searchFilter_Cust.push(search.createFilter({name: "subsidiary", operator: search.Operator.IS, values: tranSubsidiary}));
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
			//log.debug("INVOICE_TOTAL==",JSON.stringify(INVOICE_TOTAL));
		}catch(e){
			log.error({title: "getInvoiceTotal Exception Error", details: e.message});
		}
	}
//	---------------------------------------------------- End -get  all existing  Invoice total sum  ----------------------------------------------//

	return {
		pageInit : pageInit,
		fieldChanged 	: fieldChanged,
		validateField 	: validateField,
		postSourcing : postSourcing
	}
});
