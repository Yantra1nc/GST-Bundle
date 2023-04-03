/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */

/*************************************************************
 * File Header
 * Script Type: Client Script
 * Script Name: Lower TDS
 * File Name  : GST_TDS_Cli.js
 * Created On : 30/03/2020
 * Modified On: 23/09/2020
 * Created By : Siddhant (Yantra Inc.)
 * Modified By: Siddhant (Yantra Inc.)
 * Description: Script is to implement lower TDS functinality for vendors.
 ************************************************************/

define(['N/currentRecord','N/search', 'N/record', 'N/format', 'N/runtime'], function(currentRecord, search, record, format, runtime) {

	var TDS_DETAILS = {};
	var INVOICE_TOTAL={};
	var SECTION_VALUE = "";
	var ARR_SECTION_VALUE=[];
	var ITEM_DEFAULT_WH_TAXCODE={};

	function pageInit(context)
	{
		var totalAmt	= 0;
		var tranAmt_1	= 0;
		var tranAmt_2	= 0;
		var tranAmt		= 0;
		var amountObj	= 0;
		var arrItemId = [];

		try 
		{					
			var currentRecObj= context.currentRecord;
			var recMode         = context.mode;

			//----------------------------------- Start - Condition to compare multi India Subsidiary---------------------------------------//
			var scriptObj 			= runtime.getCurrentScript();
			var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_gst_sub_id'});				
			var tranSubsidiary 		= currentRecObj.getValue({fieldId: 'subsidiary'});
			var indiaSubObj	= false;
			var splitSub	= getAccountSubsidiary.split(",");
			var subLength	= splitSub.length;
			for(var i=0; i<subLength; i++) {
				if(Number(splitSub[i]) == Number(tranSubsidiary)){
					indiaSubObj	= true;
				}
			}			
			log.debug({title: "pageInit:indiaSubObj", details: indiaSubObj});
			//----------------------------------- End - Condition to compare multi India Subsidiary---------------------------------------//

			if(tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj)
			{	
				var isExportcustomer = currentRecObj.getValue({fieldId : "custbody_ygst_is_nri_customer"});
				if(!isExportcustomer){

					var transid = gup('id');				
					var getItemType         = scriptObj.getParameter({name: 'custscript_ygst_item_type'});
					var NRECharges          = scriptObj.getParameter({name: 'custscript_ygst_nre_charges'});			
					var NRETDS             = scriptObj.getParameter({name: 'custscript_ygst_nre_tds_section'});

					var recId		= currentRecObj.getValue('id');		
					var vendorObj	= currentRecObj.getValue({fieldId : "entity"});
					var dateObj		= currentRecObj.getValue({fieldId : "trandate"});
					var lineCnt		= currentRecObj.getLineCount({sublistId:"item"});
					var expenceCnt	= currentRecObj.getLineCount({sublistId:"expense"});	

					//Get all TDS Section from the Entity
					SECTION_VALUE = getTDSSectionFromEntity(vendorObj,tranSubsidiary);

					getTDSDetails(vendorObj,tranSubsidiary);

					//Get default WH TaxCode 
					if(NRECharges){
						getDefaltWHTaxCode(NRECharges);
					}

					if(transid && recMode == 'copy')
					{				
						//var itemTypeObj    = false;
						//for(var j= 0; j< lineCnt; j++){
						for(var i= 0; i< lineCnt; i++){

							var itemTypeObj    = false;
							var itemType = currentRecObj.getSublistText({sublistId: "item", fieldId : "custcol_yil_item_type", line: i});

							if(itemType)
							{
								var splitItemType  = getItemType.split(",");
								var itemTypeLength	= splitItemType.length;
								for(var p=0; p<itemTypeLength; p++) {
									if(splitItemType[p] == itemType) {
										itemTypeObj	= true;
									}
								}
								log.debug("pageInit:itemTypeObj",itemTypeObj);
							}
							//}
							//}
							if(itemTypeObj)
							{	
								if(SECTION_VALUE)
								{
									tranAmt_1		= currentRecObj.getSublistValue({sublistId: "item", fieldId : "amount", line: 0});
									//for(var i= 0; i< lineCnt; i++)
									{
										tranAmt_2	= currentRecObj.getSublistValue({sublistId: "item", fieldId : "amount", line: i});
										tranAmt		= Number(tranAmt)+Number(tranAmt_2);							

										var applyLTDS			= "";
										var tdsTaxCode			= "";
										var thresholdLimit		= "";
										var cerIssueDate		= "";
										var cerExpiryDate		= "";
										var ltdsTaxCode			= "";
										var vendorThreshLimit="";							

										if(TDS_DETAILS[SECTION_VALUE+tranSubsidiary]){
											applyLTDS = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetApplyLTDS; 
											tdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetTdsTaxcode;
											thresholdLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetThresholdLimit;
											cerIssueDate= TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerIssueDate;
											cerExpiryDate = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerExpiryDate;
											ltdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetLtdsTaxCode;
											vendorThreshLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetVendorThreshLimit;
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

										getInvoiceTotal(recId,vendorObj,cerIssueDate,cerExpiryDate,tranSubsidiary);

										if(INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary]){
											amountObj = INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary].InvTotal;
										}

										totalAmt	= Number(amountObj)+Number(tranAmt_1)+Number(tranAmt);
										totalAmt	= ConvertToPositive(totalAmt);

										if(Number(vendorThreshLimit) > Number(totalAmt)){
											if(lineCnt>0){
												var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: i });
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: false,ignoreFieldChange: true,fireSlavingSync: true});
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,fireSlavingSync: true});
												currentRecObj.commitLine({ sublistId: 'item' });
												//alert("TDS");
											}else{
												var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: 0 });
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: false,ignoreFieldChange: true,fireSlavingSync: true});
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,fireSlavingSync: true});
												currentRecObj.commitLine({ sublistId: 'item' });
											}									
										}
										if(vendorThreshLimit == '' || Number(vendorThreshLimit) < Number(totalAmt)) //Added by Nikita
										{
											var tdsSecVal="";
											var tranAmt_item="";
											//Start of: added by Nikita to autocheck WH tax Code checkbox & to autoset TDS section
											if(lineCnt > 0 ){
												tdsSecVal		= currentRecObj.getSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section", line: i});
												tranAmt_item    = currentRecObj.getSublistValue({sublistId: "item", fieldId : "item", line: i});
											}
											else{
												tdsSecVal		= currentRecObj.getSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section", line: 0});
												tranAmt_item    = currentRecObj.getSublistValue({sublistId: "item", fieldId : "item", line: 0});	
											}
											if(tdsSecVal == '' && tranAmt_item != NRECharges){
												if(lineCnt > 0 )
												{
													var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: i });
													currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: true,ignoreFieldChange: true,fireSlavingSync: true});
													currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: SECTION_VALUE,ignoreFieldChange: true,fireSlavingSync: true});
													currentRecObj.commitLine({ sublistId: 'item' });
												}
												else{
													var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: 0 });
													currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: true,ignoreFieldChange: true,fireSlavingSync: true});
													currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: SECTION_VALUE,ignoreFieldChange: true,fireSlavingSync: true});
													currentRecObj.commitLine({ sublistId: 'item' });
												}
											}

											if(tranAmt_item && tdsSecVal == ''  && tranAmt_item == NRECharges){

												var WHTaxVal ="";
												if(ITEM_DEFAULT_WH_TAXCODE[tranAmt_item]){
													WHTaxVal = ITEM_DEFAULT_WH_TAXCODE[tranAmt_item].WHTaxCodeValue
												}
												log.debug({title: "pageInit:WHTaxVal", details: WHTaxVal});

												if(WHTaxVal)
												{
													if(lineCnt > 0 ){
														var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: i });
														currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: true,ignoreFieldChange: true,fireSlavingSync: true});
														if(NRETDS){
															currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: NRETDS,ignoreFieldChange: true,fireSlavingSync: true}); 
														}
														currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxcode',value: WHTaxVal});
														currentRecObj.commitLine({ sublistId: 'item' });
													}
													else{
														var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: 0 });
														currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: true,ignoreFieldChange: true,fireSlavingSync: true});
														if(NRETDS){
															currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: NRETDS,ignoreFieldChange: true,fireSlavingSync: true}); 
														}
														currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxcode',value: WHTaxVal});
														currentRecObj.commitLine({ sublistId: 'item' });
													}
												}
											} 

											//End of: added by Nikita to autocheck WH tax Code checkbox & to autoset TDS section

											if(SECTION_VALUE) {
												if(!applyLTDS) {
													if(lineCnt > 0 ){
														var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: i });
														currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
														//alert("TDS");
														currentRecObj.commitLine({ sublistId: 'item' });
													}
													else{
														var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: 0 });
														currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
														//alert("TDS");
														currentRecObj.commitLine({ sublistId: 'item' });
													}
												}
												else if(comDate >= fromDate && comDate <= toDate){
													if(Number(thresholdLimit) >= Number(totalAmt)) {
														if(lineCnt > 0 ){
															var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: i });
															currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: Number(ltdsTaxCode)});
															//alert("LTDS");
															currentRecObj.commitLine({ sublistId: 'item' });
														}
														else{
															var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: 0 });
															currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: Number(ltdsTaxCode)});
															//alert("LTDS");
															currentRecObj.commitLine({ sublistId: 'item' });
														}
													}
													else {
														if(lineCnt > 0 ){
															var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: i });
															currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
															//alert("TDS");
															currentRecObj.commitLine({ sublistId: 'item' });
														}
														else{
															var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: 0 });
															currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
															//alert("TDS");
															currentRecObj.commitLine({ sublistId: 'item' });
														}
													}
												}
												else {
													if(lineCnt > 0 )
													{
														var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: i });
														currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
														//alert("TDS");
														currentRecObj.commitLine({ sublistId: 'item' });
													}
													else{
														var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: 0 });
														currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
														//alert("TDS");
														currentRecObj.commitLine({ sublistId: 'item' });
													}
												}
											}
											else {
												if(lineCnt > 0 )
												{
													var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: i });
													currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: null});
													currentRecObj.commitLine({ sublistId: 'item' });
												}
												else{
													var lineNum = currentRecObj.selectLine({ sublistId: 'item', line: 0 });
													currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: null});
													currentRecObj.commitLine({ sublistId: 'item' });
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		catch(e) {
			log.error("Exception in pageInit",e);
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
		var totalTranAmount_Exp =0;
		var totalTranAmount_Item =0;

		var currentRecObj		= context.currentRecord;
		var subListObj			= context.sublistId;
		var fieldObj			= context.fieldId;

		var scriptObj 			= runtime.getCurrentScript();
		var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
		var getItemType         = scriptObj.getParameter({name: 'custscript_ygst_item_type'});
		var NRECharges          = scriptObj.getParameter({name: 'custscript_ygst_nre_charges'});				
		var NRETDS             = scriptObj.getParameter({name: 'custscript_ygst_nre_tds_section'});

		var recId		= currentRecObj.getValue('id');	
		var vendorObj	= currentRecObj.getValue({fieldId : "entity"});
		var dateObj		= currentRecObj.getValue({fieldId : "trandate"});
		var lineCnt		= currentRecObj.getLineCount({sublistId:"item"});
		var expenceCnt	= currentRecObj.getLineCount({sublistId:"expense"});

		if(fieldObj == "subsidiary"){
			var tranSubsidiary 		= context.currentRecord.getValue({fieldId: 'subsidiary'});
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
				SECTION_VALUE = getTDSSectionFromEntity(vendorObj,tranSubsidiary);

				getTDSDetails(vendorObj,tranSubsidiary);

				//Get default WH TaxCode 
				if(NRECharges){
					getDefaltWHTaxCode(NRECharges);
				}
			}

		}

		if(fieldObj == "custcol_yantragst_tds_section"  || fieldObj == "category"|| fieldObj =="amount" || fieldObj =="rate") {
			try {
				var tranSubsidiary 		= context.currentRecord.getValue({fieldId: 'subsidiary'});
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
					var itemType = currentRecObj.getCurrentSublistText({sublistId: "item", fieldId : "custcol_yil_item_type"});
					if(itemType){						
						var splitItemType  = getItemType.split(",");					
						var itemTypeLength	= splitItemType.length;						
						for(var i=0; i<itemTypeLength; i++) {
							if(splitItemType[i] == itemType) {
								itemTypeObj	= true;
							}
						}
						log.debug("fieldChanged:itemTypeObj",itemTypeObj);
					}

					//if(tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj && itemTypeObj)
					if(itemTypeObj)
					{
						if(subListObj == "item" ) {
							var flag =0;
							if(fieldObj == "custcol_yantragst_tds_section" ){
								var secVal1 		 = currentRecObj.getCurrentSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section"});
								log.debug("fieldChanged:secVal1",secVal1);

								if(!secVal1){
									flag=1;
									currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,forceSyncSourcing:true});
									currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: false/*,ignoreFieldChange: true,forceSyncSourcing:true*/});																					
									//currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxcode',value: '',ignoreFieldChange: true,forceSyncSourcing:true});
								}

								if(secVal1){
									if(ARR_SECTION_VALUE){
										if(ARR_SECTION_VALUE.indexOf(secVal1) === -1 &&  secVal1!= '')
										{
											try{
												flag=1;
												alert("This selected section is not configured for this vendor and subsidiary record.");
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,forceSyncSourcing:true});
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: false/*,ignoreFieldChange: true,forceSyncSourcing:true*/});																					
												//currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxcode',value: '',ignoreFieldChange: true,forceSyncSourcing:true});
											}
											catch(e){
												log.debug({title: "fieldChanged:Exception Error", details: e.message});
											}
										}
									}
								}
							}

							/*	if(fieldObj =="item" || fieldObj =="amount"|| fieldObj =="rate"){

								if(SECTION_VALUE){
									var tranAmt_1		= currentRecObj.getCurrentSublistValue({sublistId: "item", fieldId : "amount"});
									for(var i= 0; i< lineCnt; i++) {
										tranAmt_2	= currentRecObj.getSublistValue({sublistId: "item", fieldId : "amount", line: i});										
										tranAmt		= Number(tranAmt)+Number(tranAmt_2);										
									}																	
									var applyLTDS			= "";
									var tdsTaxCode			= "";
									var thresholdLimit		= "";
									var cerIssueDate		= "";
									var cerExpiryDate		= "";
									var ltdsTaxCode			= "";
									var vendorThreshLimit="";							

									if(TDS_DETAILS[SECTION_VALUE+tranSubsidiary]){
										applyLTDS = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetApplyLTDS; 
										tdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetTdsTaxcode;
										thresholdLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetThresholdLimit;
										cerIssueDate= TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerIssueDate;
										cerExpiryDate = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerExpiryDate;
										ltdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetLtdsTaxCode;
										vendorThreshLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetVendorThreshLimit;
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

									getInvoiceTotal(recId,vendorObj,cerIssueDate,cerExpiryDate,tranSubsidiary);

									if(INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary]){
										amountObj = INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary].InvTotal;
									}
									totalAmt	= Number(amountObj)+Number(tranAmt_1)+Number(tranAmt);															
								}

								if(Number(vendorThreshLimit) > Number(totalAmt))
								{
									currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: false});
									currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: ''});
									currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxcode',value: ''});
								}
								if(vendorThreshLimit == '' || Number(vendorThreshLimit) < Number(totalAmt)) //Added by Nikita
								{
									//Start of: added by Nikita to autocheck WH tax Code checkbox & to autoset TDS section
									if(subListObj == "item" && (fieldObj == "item"|| fieldObj == "amount"|| fieldObj =="rate"))
									{
										tdsSecVal		= currentRecObj.getCurrentSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section"});
										tranAmt_item    = currentRecObj.getCurrentSublistValue({sublistId: "item", fieldId : "item"});
										if(tdsSecVal == '' && tranAmt_item != NRECharges){
											if(SECTION_VALUE)
											{
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: true});
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: SECTION_VALUE});
											}
										}

										if(tranAmt_item && tdsSecVal == ''  && tranAmt_item == NRECharges)
										{									
											var WHTaxVal ="";
											if(ITEM_DEFAULT_WH_TAXCODE[tranAmt_item]){
												WHTaxVal = ITEM_DEFAULT_WH_TAXCODE[tranAmt_item].WHTaxCodeValue
											}
											log.debug({title: "fieldChanged: WHTaxVal", details: WHTaxVal});

											if(WHTaxVal)
											{
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: true});
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: NRETDS}); 
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxcode',value: WHTaxVal});
											}
										} 
									}
									//End of: added by Nikita to autocheck WH tax Code checkbox & to autoset TDS section
								}
								else {
									currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: null});
								}
							}*/
							if(fieldObj == "custcol_yantragst_tds_section" || fieldObj =="amount"|| fieldObj =="rate")
							{						

								if(flag==0){
									var tranAmt =0;	
									var tdsSection			= currentRecObj.getCurrentSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section"});				
									if(!tdsSection){
										tdsSection = SECTION_VALUE;
									}

									//-----------------------Get Expense Line Amount for TDS Validation---------------------------//
									var expenceLineCnt	= currentRecObj.getLineCount({sublistId:"expense"});									
									for(var elc= 0; elc < expenceLineCnt; elc++) {									
										var previuesTDSSection_Exp	= currentRecObj.getSublistValue({sublistId: "expense", fieldId : "custcol_yantragst_tds_section", line: elc});
										if(tdsSection ==previuesTDSSection_Exp ){
											var tranAmt_Exp	= currentRecObj.getSublistValue({sublistId: "expense", fieldId : "amount", line: elc});											
											totalTranAmount_Exp = Number(totalTranAmount_Exp) + Number(tranAmt_Exp);											
										}
									}									

									var tranAmt_1		= currentRecObj.getCurrentSublistValue({sublistId: "item", fieldId : "amount"});															
									for(var i= 0; i< lineCnt; i++) {
										var previuesTDSSection	= currentRecObj.getSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section", line: i});
										if(tdsSection ==previuesTDSSection ){
											var tranAmt_2	= currentRecObj.getSublistValue({sublistId: "item", fieldId : "amount", line: i});
											tranAmt		= Number(tranAmt)+Number(tranAmt_2);
											//tranAmt		= Number(tranAmt)+Number(tranAmt_2)+Number(totalTranAmount_Exp);
										}
									}

									var applyLTDS			= "";
									var tdsTaxCode			= "";
									var thresholdLimit		= "";
									var cerIssueDate		= "";
									var cerExpiryDate		= "";
									var ltdsTaxCode			= "";
									var vendorThreshLimit="";							

									if(TDS_DETAILS[tdsSection+tranSubsidiary]){
										applyLTDS = TDS_DETAILS[tdsSection+tranSubsidiary].GetApplyLTDS; 
										tdsTaxCode = TDS_DETAILS[tdsSection+tranSubsidiary].GetTdsTaxcode;
										thresholdLimit = TDS_DETAILS[tdsSection+tranSubsidiary].GetThresholdLimit;
										cerIssueDate= TDS_DETAILS[tdsSection+tranSubsidiary].GetCerIssueDate;
										cerExpiryDate = TDS_DETAILS[tdsSection+tranSubsidiary].GetCerExpiryDate;
										ltdsTaxCode = TDS_DETAILS[tdsSection+tranSubsidiary].GetLtdsTaxCode;
										vendorThreshLimit = TDS_DETAILS[tdsSection+tranSubsidiary].GetVendorThreshLimit;
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

									getInvoiceTotal(recId,vendorObj,cerIssueDate,cerExpiryDate,tranSubsidiary);

									if(INVOICE_TOTAL[tdsSection+tranSubsidiary]){
										amountObj = INVOICE_TOTAL[tdsSection+tranSubsidiary].InvTotal;
									}
									//totalAmt	= Number(amountObj)+Number(tranAmt_1)+Number(tranAmt);
									totalAmt	= Number(amountObj)+Number(tranAmt_1)+Number(tranAmt)+Number(totalTranAmount_Exp);
								}
							}
							if(flag==0){								
								if(Number(vendorThreshLimit) > Number(totalAmt))
								{
									currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: false,ignoreFieldChange: true,fireSlavingSync: true});
									currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: ''});
									currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,fireSlavingSync: true});									
								}
								if(vendorThreshLimit == '' || Number(vendorThreshLimit) < Number(totalAmt)) //Added by Nikita
								{
									if(tdsSection || SECTION_VALUE) {
										currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: true,ignoreFieldChange: true,fireSlavingSync: true});
										currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: tdsSection,ignoreFieldChange: true,fireSlavingSync: true});
										if(!applyLTDS) {
											currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});										
										}
										else if(comDate >= fromDate && comDate <= toDate){
											if(Number(thresholdLimit) >= Number(totalAmt)) {
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: Number(ltdsTaxCode)});											
											}
											else {
												currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});											
											}
										}
										else {
											currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});										
										}
									}
								}
								else {
									currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: null});
								}
							}//
						}
					}
					else if(subListObj == "expense") {

						//Start of: added by Nikita to autocheck WH tax Code checkbox & to autoset TDS section
						/*	if(subListObj == "expense" && fieldObj == "category"  )
						{
							var tdsSecVal		= currentRecObj.getCurrentSublistValue({sublistId: "expense", fieldId : "custcol_yantragst_tds_section"});								
							if(tdsSecVal == '' && fieldObj == "category")
							{					
								if(SECTION_VALUE)
								{
									var tranAmt_1		= currentRecObj.getCurrentSublistValue({sublistId: "expense", fieldId : "amount"});
									for(var i= 0; i< expenceCnt; i++) {
										tranAmt_2	= currentRecObj.getSublistValue({sublistId: "expense", fieldId : "amount", line: i});
										tranAmt		= Number(tranAmt)+Number(tranAmt_2);	
									}

									var applyLTDS			= "";
									var tdsTaxCode			= "";
									var thresholdLimit		= "";
									var cerIssueDate		= "";
									var cerExpiryDate		= "";
									var ltdsTaxCode			= "";
									var vendorThreshLimit   = "";

									if(TDS_DETAILS[SECTION_VALUE+tranSubsidiary]){
										applyLTDS = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetApplyLTDS; 
										tdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetTdsTaxcode;
										thresholdLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetThresholdLimit;
										cerIssueDate= TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerIssueDate;
										cerExpiryDate = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerExpiryDate;
										ltdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetLtdsTaxCode;
										vendorThreshLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetVendorThreshLimit;
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

									getInvoiceTotal(recId,vendorObj,cerIssueDate,cerExpiryDate,tranSubsidiary);

									if(INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary]){
										amountObj = INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary].InvTotal;
									}
									totalAmt	= Number(amountObj)+Number(tranAmt_1)+Number(tranAmt);

									alert("fieldChanged:category: vendorThreshLimit=="+vendorThreshLimit);
									alert("fieldChanged:category: totalAmt=="+totalAmt);

									if(Number(vendorThreshLimit) > Number(totalAmt))
									{
										currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,fireSlavingSync: true});
										currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxapplies',value: false,ignoreFieldChange: true,fireSlavingSync: true});
										currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxcode_exp',value: ''});
									}

									if(vendorThreshLimit == '' || vendorThreshLimit < totalAmt) //Added by Nikita
									{
										currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxapplies',value: true,/*ignoreFieldChange: true,fireSlavingSync: true*///});
						/*currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_yantragst_tds_section',value: SECTION_VALUE,ignoreFieldChange: true,fireSlavingSync: true});										
										if(TDS_DETAILS[SECTION_VALUE+tranSubsidiary]){
											var tdsTaxCode1 = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetTdsTaxcode
										}
										if(tdsTaxCode1){
											alert('fieldChanged:category:tdsTaxCode1=='+tdsTaxCode1)
											currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxcode_exp',value: tdsTaxCode1});
										}
									}
								}
							}
						}*/

						//End of: added by Nikita to autocheck WH tax Code checkbox & to autoset TDS section

						if( fieldObj == "category" || fieldObj == "custcol_yantragst_tds_section" || fieldObj =="amount")
						{
							//var tranAmt=0;							

							var flag =0;
							if(fieldObj == "custcol_yantragst_tds_section" ){
								var secVal1 		 = currentRecObj.getCurrentSublistValue({sublistId: "expense", fieldId : "custcol_yantragst_tds_section"});
								log.debug("fieldChanged:secVal1",secVal1);

								if(!secVal1){
									flag=1;
									currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,forceSyncSourcing:true});
									currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxapplies',value: false/*,ignoreFieldChange: true,forceSyncSourcing:true*/});																					
									//currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxcode',value: '',ignoreFieldChange: true,forceSyncSourcing:true});
								}

								if(secVal1){
									if(ARR_SECTION_VALUE){
										if(ARR_SECTION_VALUE.indexOf(secVal1) === -1 &&  secVal1!= '')
										{
											try{
												flag=1;
												alert("This selected section is not configured for this vendor and subsidiary record.");
												currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,forceSyncSourcing:true});
												currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxapplies',value: false/*,ignoreFieldChange: true,forceSyncSourcing:true*/});																					
												//currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxcode',value: '',ignoreFieldChange: true,forceSyncSourcing:true});
											}
											catch(e){
												log.debug({title: "fieldChanged:Exception Error", details: e.message});
											}
										}
									}
								}
							}

							if(flag==0){

								var tdsSection_exp = currentRecObj.getCurrentSublistValue({sublistId: "expense", fieldId : "custcol_yantragst_tds_section"});

								if(!tdsSection_exp){
									tdsSection_exp = SECTION_VALUE;
								}

								//-----------------------Get Item Line Amount for TDS Validation---------------------------//
								var itemLineCnt		= currentRecObj.getLineCount({sublistId:"item"});								
								for(var ilc= 0; ilc< itemLineCnt; ilc++) {									
									var previuesTDSSection_Item	= currentRecObj.getSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section", line: ilc});
									if(tdsSection_exp ==previuesTDSSection_Item ){
										var tranAmt_Item	= currentRecObj.getSublistValue({sublistId: "item", fieldId : "amount", line: ilc});										
										totalTranAmount_Item = Number(totalTranAmount_Item) + Number(tranAmt_Item);										
									}
								}

								var tranAmt_1		= currentRecObj.getCurrentSublistValue({sublistId: "expense", fieldId : "amount"});								
								for(var e= 0; e< expenceCnt; e++) {
									var previuesTDSSection_exp	= currentRecObj.getSublistValue({sublistId: "expense", fieldId : "custcol_yantragst_tds_section", line: e});
									if(tdsSection_exp ==previuesTDSSection_exp ){
										var tranAmt_2	= currentRecObj.getSublistValue({sublistId: "expense", fieldId : "amount", line: e});									
										tranAmt		= Number(tranAmt)+Number(tranAmt_2);
										//tranAmt		= Number(tranAmt)+Number(tranAmt_2)+Number(totalTranAmount_Item);
									}
								}								

								var applyLTDS			= "";
								var tdsTaxCode			= "";
								var thresholdLimit		= "";
								var cerIssueDate		= "";
								var cerExpiryDate		= "";
								var ltdsTaxCode			= "";
								var vendorThreshLimit   = "";

								if(TDS_DETAILS[tdsSection_exp+tranSubsidiary]){
									applyLTDS = TDS_DETAILS[tdsSection_exp+tranSubsidiary].GetApplyLTDS; 
									tdsTaxCode = TDS_DETAILS[tdsSection_exp+tranSubsidiary].GetTdsTaxcode;
									thresholdLimit = TDS_DETAILS[tdsSection_exp+tranSubsidiary].GetThresholdLimit;
									cerIssueDate= TDS_DETAILS[tdsSection_exp+tranSubsidiary].GetCerIssueDate;
									cerExpiryDate = TDS_DETAILS[tdsSection_exp+tranSubsidiary].GetCerExpiryDate;
									ltdsTaxCode = TDS_DETAILS[tdsSection_exp+tranSubsidiary].GetLtdsTaxCode;
									vendorThreshLimit = TDS_DETAILS[tdsSection_exp+tranSubsidiary].GetVendorThreshLimit;
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

								getInvoiceTotal(recId,vendorObj,cerIssueDate,cerExpiryDate,tranSubsidiary);

								if(INVOICE_TOTAL[tdsSection_exp+tranSubsidiary]){
									amountObj = INVOICE_TOTAL[tdsSection_exp+tranSubsidiary].InvTotal;
								}

								totalAmt	= Number(amountObj)+Number(tranAmt_1)+Number(tranAmt)+Number(totalTranAmount_Item);
							}
						}
						if(flag==0){							
							if(Number(vendorThreshLimit) > Number(totalAmt))
							{
								currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxcode_exp',value: ''});
							}
							if(vendorThreshLimit == '' || vendorThreshLimit < totalAmt) //Added by Nikita
							{
								if(tdsSection_exp) {
									currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxapplies',value: true,/*ignoreFieldChange: true,fireSlavingSync: true*/});
									currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_yantragst_tds_section',value: tdsSection_exp,ignoreFieldChange: true,fireSlavingSync: true});
									if(!applyLTDS) {									
										currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});										
										//currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxcode_exp',value: tdsTaxCode});
										//alert("TDS");
									}
									else if(comDate >= fromDate && comDate <= toDate)
									{									
										if(Number(thresholdLimit) >= Number(totalAmt)) {										
											currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custpage_4601_witaxcode',value: ltdsTaxCode});
											//currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxcode_exp',value: ltdsTaxCode});										
											//alert("LTDS");
										}
										else {										
											currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
											//currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxcode_exp',value: tdsTaxCode});
											//alert("TDS");
										}
									}
									else {									
										currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
										//currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxcode_exp',value: tdsTaxCode});
										//alert("TDS");
									}
								}
							}
							else {
								//currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custpage_4601_witaxcode',value: null});
								currentRecObj.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_4601_witaxcode_exp',value: tdsTaxCode});
							}

						}
					}
					//}
				}
			}
			catch(exp) {
				log.debug({title: "Exception Error", details: exp.message});
			}
		}
	}

	function postSourcing(scriptContext)
	{
		try{
			var currentRecObj = scriptContext.currentRecord;
			//var tranSubsidiary = window.nlapiGetFieldValue('subsidiary')
			var tranSubsidiary = currentRecObj.getValue('subsidiary')
			var scriptObj = runtime.getCurrentScript();
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
					var isExportcustomer = currentRecObj.getValue({fieldId : "custbody_ygst_is_nri_customer"});
					if(!isExportcustomer){
						var totalAmt	= 0;
						var tranAmt_1	= 0;
						var tranAmt_2	= 0;
						var tranAmt		= 0;
						var amountObj	= 0;
						var totalTranAmount_Exp =0;

						//---------------------------------------------------- Start - Compare Item Type with Item type mentioned into Global Param -----------------------------//
						var itemType = currentRecObj.getCurrentSublistText({sublistId: "item", fieldId : "custcol_yil_item_type"});						
						//alert('postSourcing:itemType=='+itemType);

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

							var NRECharges          = scriptObj.getParameter({name: 'custscript_ygst_nre_charges'});				
							var NRETDS             = scriptObj.getParameter({name: 'custscript_ygst_nre_tds_section'});

							var recId		= currentRecObj.getValue('id');	
							var vendorObj	= currentRecObj.getValue({fieldId : "entity"});
							var dateObj		= currentRecObj.getValue({fieldId : "trandate"});
							var lineCnt		= currentRecObj.getLineCount({sublistId:"item"});
							var expenceCnt	= currentRecObj.getLineCount({sublistId:"expense"});

							if(SECTION_VALUE){

								//-----------------------Get Expense Line Amount for TDS Validation---------------------------//

								/*for(var e= 0; e< expenceCnt; e++) {
									var previuesTDSSection_Exp	= currentRecObj.getSublistValue({sublistId: "expense", fieldId : "custcol_yantragst_tds_section", line: e});
									if(SECTION_VALUE ==previuesTDSSection_Exp ){
										var tranAmt_Exp	= currentRecObj.getSublistValue({sublistId: "expense", fieldId : "amount", line: e});
										alert("postSourrcing: tranAmt_Exp=="+tranAmt_Exp);
										totalTranAmount_Exp = Number(totalTranAmount_Exp) + Number(tranAmt_Exp);
										alert("postSourrcing: totalTranAmount_Exp=="+totalTranAmount_Exp);
									}
								}*/

								var tranAmt_1		= currentRecObj.getCurrentSublistValue({sublistId: "item", fieldId : "amount"});
								for(var i= 0; i< lineCnt; i++) {
									tranAmt_2	= currentRecObj.getSublistValue({sublistId: "item", fieldId : "amount", line: i});										
									tranAmt		= Number(tranAmt)+Number(tranAmt_2);
									//tranAmt		= Number(tranAmt)+Number(tranAmt_2)+Number(totalTranAmount_Exp) ;
								}																	
								var applyLTDS			= "";
								var tdsTaxCode			= "";
								var thresholdLimit		= "";
								var cerIssueDate		= "";
								var cerExpiryDate		= "";
								var ltdsTaxCode			= "";
								var vendorThreshLimit="";							

								if(TDS_DETAILS[SECTION_VALUE+tranSubsidiary]){
									applyLTDS = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetApplyLTDS; 
									tdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetTdsTaxcode;
									thresholdLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetThresholdLimit;
									cerIssueDate= TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerIssueDate;
									cerExpiryDate = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetCerExpiryDate;
									ltdsTaxCode = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetLtdsTaxCode;
									vendorThreshLimit = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetVendorThreshLimit;
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

								getInvoiceTotal(recId,vendorObj,cerIssueDate,cerExpiryDate,tranSubsidiary);

								if(INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary]){
									amountObj = INVOICE_TOTAL[SECTION_VALUE+tranSubsidiary].InvTotal;
								}
								totalAmt	= Number(amountObj)+Number(tranAmt_1)+Number(tranAmt);															
							}

							if(Number(vendorThreshLimit) > Number(totalAmt))
							{
								currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: false,ignoreFieldChange: true,fireSlavingSync: true});
								currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: '',ignoreFieldChange: true,fireSlavingSync: true});
								currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxcode',value: ''});
							}
							if(vendorThreshLimit == '' || Number(vendorThreshLimit) < Number(totalAmt)) //Added by Nikita
							{
								//Start of: added by Nikita to autocheck WH tax Code checkbox & to autoset TDS section
								tdsSecVal		= currentRecObj.getCurrentSublistValue({sublistId: "item", fieldId : "custcol_yantragst_tds_section"});
								tranAmt_item    = currentRecObj.getCurrentSublistValue({sublistId: "item", fieldId : "item"});
								if(tdsSecVal == '' && tranAmt_item != NRECharges){
									if(SECTION_VALUE)
									{
										var tdsTaxCode_item="";
										currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: true/*,ignoreFieldChange: false,fireSlavingSync: false*/});
										currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: SECTION_VALUE/*,ignoreFieldChange: true,fireSlavingSync: false*/});
										/*	log.debug({title: "postSourcing: TDS_DETAILS[SECTION_VALUE+tranSubsidiary]", details: TDS_DETAILS[SECTION_VALUE+tranSubsidiary]});
										if(TDS_DETAILS[SECTION_VALUE+tranSubsidiary]){
											tdsTaxCode_item = TDS_DETAILS[SECTION_VALUE+tranSubsidiary].GetTdsTaxcode
										}
										if(tdsTaxCode_item){
											log.debug({title: "postSourcing: tdsTaxCode_item:",details: tdsTaxCode_item});
											currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxcode',value: tdsTaxCode_item,ignoreFieldChange: false,fireSlavingSync: false});
										}*/
									}
								}

								if(tranAmt_item && tdsSecVal == ''  && tranAmt_item == NRECharges)
								{									
									var WHTaxVal ="";
									if(ITEM_DEFAULT_WH_TAXCODE[tranAmt_item]){
										WHTaxVal = ITEM_DEFAULT_WH_TAXCODE[tranAmt_item].WHTaxCodeValue
									}
									log.debug({title: "postSourcing: WHTaxVal", details: WHTaxVal});

									if(WHTaxVal)
									{
										currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxapplies',value: true,ignoreFieldChange: true,fireSlavingSync: true});
										currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_yantragst_tds_section',value: NRETDS,ignoreFieldChange: true,fireSlavingSync: true}); 
										currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custcol_4601_witaxcode',value: WHTaxVal});
									}
								} 

								//End of: added by Nikita to autocheck WH tax Code checkbox & to autoset TDS section
							}
							else {
								currentRecObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: null});
							}
						}
					}
				}
			}

		}
		catch(e){
			log.error({title: "postSourcing Exception Error", details: e.message});
		}
	}


	function saveRecord(context)
	{
		var recObj		= context.currentRecord;
		var subListObj	= context.sublistId;
		var recId		= recObj.getValue('id');
		log.debug({title: "recId", details:recId});
		var totalAmt	= 0;
		var tranAmt_1	= 0;
		var tranAmt_2	= 0;
		var tranAmt		= 0;
		var amountObj	= 0;
		try {
			var tranSubsidiary 		= context.currentRecord.getValue({fieldId: 'subsidiary'});
			log.debug('saveRecord tranSubsidiary: ',tranSubsidiary);

			var scriptObj 			= runtime.getCurrentScript();
			var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_gst_sub_id'});//custscript_ygst_global_india_subsidiary
			var getItemType         = scriptObj.getParameter({name: 'custscript_ygst_item_type'});
			//log.debug('fieldChanged getAccountSubsidiary: ',getAccountSubsidiary);
			log.debug('saveRecord getAccountSubsidiary: ',getAccountSubsidiary);
			//Condition to compare multi India Subsidiary.
			var indiaSubObj	= false;
			var itemTypeObj = false;

			var splitSub	= getAccountSubsidiary.split(",");
			log.debug({title: "splitSub", details: splitSub});

			var subLength	= splitSub.length;
			for(var i=0; i<subLength; i++) {
				if(Number(splitSub[i]) == Number(tranSubsidiary)) {
					indiaSubObj	= true;
				}
			}
			log.debug({title: "indiaSubObj", details: indiaSubObj});
			if(tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj)
			{
				var vendorObj	= recObj.getValue({fieldId : "entity"});
				var dateObj		= recObj.getValue({fieldId : "trandate"});
				var lineCnt		= recObj.getLineCount({sublistId:"item"});
				var expenceCnt	= recObj.getLineCount({sublistId:"expence"});
				log.debug({title: "lineCnt SR", details: lineCnt});
				var resultIndex = 0; 
				var resultStep = 1000;
				for(var j= 0; j<lineCnt; j++) {
					tranAmt_2	= recObj.getSublistValue({sublistId: "item", fieldId : "amount", line: j});
					tranAmt		= Number(tranAmt)+Number(tranAmt_2);
					//alert("tranAmt "+tranAmt);
					var itemId 	       = recObj.getSublistValue({sublistId: "item", fieldId : "item", line: j});
					if(itemId)
					{
						var itemSearchObj = search.create({
							type: "item",
							filters: [["internalid","anyof",itemId]],
							columns: [search.createColumn({name: "type", label: "Type"})]
						});
						var searchCount = itemSearchObj.runPaged().count;
						//log.debug("itemSearchObj result count",searchResultCount);

						var searchResult = itemSearchObj.run().getRange({
							start: resultIndex,
							end: resultIndex + resultStep
						});
						for(var m=0; m< searchCount;m++) {
							itemType  = searchResult[m].getValue({name: "type", label: "Type"});
							//log.debug("itemType",itemType);
						}

						var splitItemType  = getItemType.split(",");
						//log.debug({title: "splitItemType", details: splitItemType});
						var itemTypeLength	= splitItemType.length;
						//log.debug({title: "itemTypeLength", details: itemTypeLength});
						for(var i=0; i<itemTypeLength; i++) {
							if(splitItemType[i] == itemType) {
								itemTypeObj	= true;
							}
						}
						log.debug("itemTypeObj SR",itemTypeObj);
					}
					//log.debug({title: "indiaSubObj", details: indiaSubObj});

				}
				if(lineCnt > 0 && itemTypeObj) {

					var applyLTDS			= "";
					var tdsTaxCode			= "";
					var thresholdLimit		= "";
					var cerIssueDate		= "";
					var cerExpiryDate		= "";
					var ltdsTaxCode			= "";
					var vendorThreshLimit   = "";
					for(var j=0; j<lineCnt; j++) {
						var searchFilter_TDSD	= [];
						var searchColumn_TDSD	= [];
						var tdsSection			= recObj.getSublistValue({sublistId: 'item', fieldId: 'custcol_yantragst_tds_section', line: j});
					}
					//Search For Vendor TDS Details
					if(vendorObj) {
						searchFilter_TDSD.push(search.createFilter({name: "custrecord_yantragst_vendor", operator: search.Operator.IS, values: vendorObj}));
					}
					if(tdsSection) {
						searchFilter_TDSD.push(search.createFilter({name: "custrecord_yantragst_tds_section", operator: search.Operator.ANYOF, values: tdsSection}));
					}
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_apply_lower_tds"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_taxcode"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_threshold_limit"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_cert_issue_date"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_cert_exp_date"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_taxcode_tds"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_ygst_vendor_threshold_limit"}));

					var tdsSearchObj	= search.create({type: "customrecord_yantragst_vendor_tds_detail", filters: searchFilter_TDSD, columns: searchColumn_TDSD});
					var countObj		= tdsSearchObj.runPaged().count;
					log.debug({title: "rds countObj", details:countObj});
					tdsSearchObj.run().each(function(result) {
						applyLTDS		= result.getValue({name: "custrecord_yantragst_apply_lower_tds"});
						tdsTaxCode		= result.getValue({name: "custrecord_yantragst_taxcode"});
						log.debug({title: "rds tdsTaxCode", details:tdsTaxCode});
						thresholdLimit	= result.getValue({name: "custrecord_yantragst_threshold_limit"});
						cerIssueDate	= result.getValue({name: "custrecord_yantragst_cert_issue_date"});
						cerExpiryDate	= result.getValue({name: "custrecord_yantragst_cert_exp_date"});
						ltdsTaxCode		= result.getValue({name: "custrecord_yantragst_taxcode_tds"});
						vendorThreshLimit = result.getValue({name: "custrecord_ygst_vendor_threshold_limit"});
						return true;
					});

					/*if(ltdsTaxCode != null && ltdsTaxCode != "") {
						//alert("ltdsTaxCode Entered "+ltdsTaxCode);
						var interId			= _toGetWHTaxCodeIntId(ltdsTaxCode);
						//alert("search data"+interId);
						ltdsTaxCode			= interId;
					}
					if(tdsTaxCode != null && tdsTaxCode != "") {
						//alert("tdsTaxCode Entered "+tdsTaxCode);
						var interId			= _toGetWHTaxCodeIntId(tdsTaxCode);
						//alert("search data"+interId);
						tdsTaxCode			= interId;
					}*/
					if(cerIssueDate) {
						//alert("cerIssueDate "+cerIssueDate);
						var fromCerDate		= format.parse({value: cerIssueDate, type: format.Type.DATE});
					}

					if(cerExpiryDate) {
						//alert("cerExpiryDate "+cerExpiryDate);
						var toCerDate		= format.parse({value: cerExpiryDate, type: format.Type.DATE});
					}

					var comDate			= Date.parse(dateObj);
					var fromDate		= Date.parse(fromCerDate);
					var toDate			= Date.parse(toCerDate);

					var searchFilter_Vendor	= [];
					var searchColumn_Vendor	= [];
					var searchSetting_Vendor= [];


					//Search For VendorBill
					if(recId) {
						searchFilter_Vendor.push(search.createFilter({name: "internalid", operator: search.Operator.NONEOF, values: recId}));
					}
					if(tdsSection) {
						searchFilter_Vendor.push(search.createFilter({name: "custcol_yantragst_tds_section", operator: search.Operator.ANYOF, values: tdsSection}));
					}
					searchFilter_Vendor.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
					searchFilter_Vendor.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: vendorObj}));
					if(cerIssueDate && cerExpiryDate) {
						searchFilter_Vendor.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [cerIssueDate, cerExpiryDate]}));
					}
					//searchColumn_Vendor.push(search.createColumn({name: "amount",summary: "SUM"}));//,label: "Amount"
					searchColumn_Vendor.push(search.createColumn({ name: "fxamount", summary: "SUM", label: "Amount (Foreign Currency)" }));
					searchSetting_Vendor.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));
					var searchObj	= search.create({type: "vendorbill", filters: searchFilter_Vendor, columns: searchColumn_Vendor, settings: searchSetting_Vendor});
					var countObj	= searchObj.runPaged().count;

					searchObj.run().each(function(result) {
						//amountObj	= result.getValue({name: "amount",summary: "SUM"});
						amountObj	= result.getValue({ name: "fxamount", summary: "SUM", label: "Amount (Foreign Currency)" });
					});
					log.debug({title: "amountObj", details:amountObj});
					totalAmt	= Number(amountObj)+Number(tranAmt);
					log.debug({title: "totalAmt", details:totalAmt});
					log.debug({title: "thresholdLimit", details: thresholdLimit});

					if(Number(vendorThreshLimit) > Number(totalAmt))
					{
						recObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: ''});
					}

					if(vendorThreshLimit == '' || vendorThreshLimit < totalAmt) //Added by Nikita
					{
						if(tdsSection) {
							//alert("Entered");
							//alert("subListObj "+subListObj);
							if(!applyLTDS) {
								log.debug({title: "Inside appLTDS Not Checked", details: "Entered"});
								recObj.setCurrentSublistValue({sublistId:'item', fieldId:'custpage_4601_witaxcode',value:tdsTaxCode});
							}
							else if(comDate >= fromDate && comDate <= toDate){
								log.debug({title: "Inside Compare Date", details:"Entered"});
								if(Number(thresholdLimit) >= Number(totalAmt)) {
									recObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: ltdsTaxCode});
								}
								else {
									var comVar	= Number(lineCnt)-1;
									log.debug({title: "comVar", details:comVar});
									for(var k=0; k < lineCnt; k++) {
										var applyWHTax	= recObj.getSublistValue({sublistId:'item', fieldId:'custcol_4601_witaxapplies',value:tdsTaxCode, line: k});
										if(applyWHTax) {
											var selectLine = recObj.selectLine({sublistId: 'item',line: k});
											recObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
											recObj.commitLine({sublistId: 'item'});
										}
									}
								}
							}
							else {
								recObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
							}
						}	
					}

					else {
						recObj.setCurrentSublistValue({sublistId: 'item',fieldId: 'custpage_4601_witaxcode',value: null});
					}
					return true;
				}

				else {
					//alert("Entered");
					return true;
				}


				///////
				for(var i= 0; i< expenceCnt; i++) {
					tranAmt_2	= recObj.getSublistValue({sublistId: "expence", fieldId : "amount", line: i});
					tranAmt		= Number(tranAmt)+Number(tranAmt_2);
					//alert("tranAmt "+tranAmt);
				}
				if(expenceCnt > 0) {
					var applyLTDS			= "";
					var tdsTaxCode			= "";
					var thresholdLimit		= "";
					var cerIssueDate		= "";
					var cerExpiryDate		= "";
					var ltdsTaxCode			= "";
					var vendorThreshLimit   = "";

					for(var j=0; j<lineCnt; j++) {
						var searchFilter_TDSD	= [];
						var searchColumn_TDSD	= [];
						var tdsSection			= recObj.getSublistValue({sublistId: 'expence', fieldId: 'custcol_yantragst_tds_section', line: j});
					}

					//Search For Vendor TDS Details
					if(vendorObj) {
						searchFilter_TDSD.push(search.createFilter({name: "custrecord_yantragst_vendor", operator: search.Operator.IS, values: vendorObj}));
					}
					if(tdsSection) {
						searchFilter_TDSD.push(search.createFilter({name: "custrecord_yantragst_tds_section", operator: search.Operator.ANYOF, values: tdsSection}));
					}
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_apply_lower_tds"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_taxcode"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_threshold_limit"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_cert_issue_date"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_cert_exp_date"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_yantragst_taxcode_tds"}));
					searchColumn_TDSD.push(search.createColumn({name: "custrecord_ygst_vendor_threshold_limit"}));

					var tdsSearchObj	= search.create({type: "customrecord_yantragst_vendor_tds_detail", filters: searchFilter_TDSD, columns: searchColumn_TDSD});
					var countObj		= tdsSearchObj.runPaged().count;
					log.debug({title: "rds countObj", details:countObj});
					tdsSearchObj.run().each(function(result) {
						applyLTDS		= result.getValue({name: "custrecord_yantragst_apply_lower_tds"});
						tdsTaxCode		= result.getValue({name: "custrecord_yantragst_taxcode"});
						thresholdLimit	= result.getValue({name: "custrecord_yantragst_threshold_limit"});
						cerIssueDate	= result.getValue({name: "custrecord_yantragst_cert_issue_date"});
						cerExpiryDate	= result.getValue({name: "custrecord_yantragst_cert_exp_date"});
						ltdsTaxCode		= result.getValue({name: "custrecord_yantragst_taxcode_tds"});
						vendorThreshLimit = result.getValue({name: "custrecord_ygst_vendor_threshold_limit"});
						return true;
					});
					if(cerIssueDate) {						
						var fromCerDate		= format.parse({value: cerIssueDate, type: format.Type.DATE});
					}
					if(cerExpiryDate){						
						var toCerDate		= format.parse({value: cerExpiryDate, type: format.Type.DATE});
					}

					var comDate			= Date.parse(dateObj);
					var fromDate		= Date.parse(fromCerDate);
					var toDate			= Date.parse(toCerDate);
					var searchFilter_Vendor	= [];
					var searchColumn_Vendor	= [];
					var searchSetting_Vendor= [];

					//Search For VendorBill
					if(recId) {
						searchFilter_Vendor.push(search.createFilter({name: "internalid", operator: search.Operator.NONEOF, values: recId}));
					}
					searchFilter_Vendor.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
					searchFilter_Vendor.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: vendorObj}));
					if(cerIssueDate && cerExpiryDate) {
						searchFilter_Vendor.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [cerIssueDate, cerExpiryDate]}));
					}
					//searchColumn_Vendor.push(search.createColumn({name: "amount",summary: "SUM"}));//,label: "Amount"
					searchColumn_Vendor.push(search.createColumn({ name: "fxamount", summary: "SUM", label: "Amount (Foreign Currency)" }));
					searchSetting_Vendor.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));
					var searchObj	= search.create({type: "vendorbill", filters: searchFilter_Vendor, columns: searchColumn_Vendor, settings: searchSetting_Vendor});
					var countObj	= searchObj.runPaged().count;

					searchObj.run().each(function(result) {
						//amountObj	= result.getValue({name: "amount",summary: "SUM"});
						amountObj	= result.getValue({ name: "fxamount", summary: "SUM", label: "Amount (Foreign Currency)" });
					});
					log.debug({title: "amountObj", details:amountObj});
					totalAmt	= Number(amountObj)+Number(tranAmt);
					log.debug({title: "totalAmt", details:totalAmt});
					log.debug({title: "thresholdLimit", details: thresholdLimit});
					if(Number(vendorThreshLimit) > Number(totalAmt))
					{
						recObj.setCurrentSublistValue({sublistId: 'expence',fieldId: 'custcol_4601_witaxcode_exp',value: ''});
					}
					if(vendorThreshLimit == '' || vendorThreshLimit < totalAmt) //Added by Nikita
					{
						if(tdsSection) 
						{							
							if(!applyLTDS) {
								log.debug({title: "Inside appLTDS Not Checked", details: "Entered"});
								//	recObj.setCurrentSublistValue({sublistId:'expence', fieldId:'custpage_4601_witaxcode',value:tdsTaxCode});
								recObj.setCurrentSublistValue({sublistId:'expence', fieldId:'custcol_4601_witaxcode_exp',value:tdsTaxCode});
							}
							else if(comDate >= fromDate && comDate <= toDate){
								log.debug({title: "Inside Compare Date", details:"Entered"});
								if(Number(thresholdLimit) >= Number(totalAmt)) {
									//recObj.setCurrentSublistValue({sublistId: 'expence',fieldId: 'custpage_4601_witaxcode',value: ltdsTaxCode});
									recObj.setCurrentSublistValue({sublistId: 'expence',fieldId: 'custcol_4601_witaxcode_exp',value: ltdsTaxCode});
								}
								else {
									var comVar	= Number(expenceCnt)-1;
									//log.debug({title: "comVar", details:comVar});
									for(var k=0; k < expenceCnt; k++) {
										var applyWHTax	= recObj.getSublistValue({sublistId:'expence', fieldId:'custcol_4601_witaxapplies',value:tdsTaxCode, line: k});
										if(applyWHTax) {
											var selectLine = recObj.selectLine({sublistId: 'expence',line: k});
											recObj.setCurrentSublistValue({sublistId: 'expence',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
											recObj.commitLine({sublistId: 'expence'});
										}
									}
								}
							}
							else {
								recObj.setCurrentSublistValue({sublistId: 'expence',fieldId: 'custpage_4601_witaxcode',value: tdsTaxCode});
							}	
						}
					}
					else {
						recObj.setCurrentSublistValue({sublistId: 'expence',fieldId: 'custpage_4601_witaxcode',value: null});
					}
					return true;
				}
			}
			else  {
				return true;
			}

		}
		catch(exp) {
			log.debug({title: "Exception Error", details: exp.message});
		}
	}

	function _toGetWHTaxCodeIntId(ltdsTaxCode){
		//alert("Inside Search"+ltdsTaxCode);
		var interId		= "";
		var customrecord_yantragst_tax_code_detailsSearchObj = search.create({type: "customrecord_yantragst_tax_code_details",
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
		//alert("last search"+interId);
		return interId;
	}

	function gup(name) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if (results == null)
			return "";
		else
			return results[1];
	}
	function ConvertToPositive(foo){
		var bar=foo;
		// check our value should be in negative
		if(foo<0)
		{
			bar=foo*-1; // multiply by -1
		}
		// return positive value;
		return bar; 
	}

	/*	function getItemType(arrItemId){

		var arrItemType =[];
		if(arrItemId){
			var itemSearchObj = search.create({type: "item",
				filters: [["internalid","anyof",arrItemId]],
				columns: [
					search.createColumn({name: "internalid", label: "Internal ID"}),
					search.createColumn({name: "type", label: "Type"})				
					]
			});
			var searchCount = itemSearchObj.runPaged().count;
			var resultIndex = 0; 
			var resultStep = 1000;
			var searchResult = itemSearchObj.run().getRange({ start: resultIndex, end: resultIndex + resultStep });
			for(var m=0; m< searchCount;m++) {
				var itemInternalId  = searchResult[m].getValue({name: "internalid", label: "Internal ID"});
				var itemType  = searchResult[m].getValue({name: "type", label: "Type"});
				arrItemType.push({'itemInternalId':itemInternalId,'itemType':itemType})
			}
		}
		return arrItemType;
	} */

	//----------------------------------------- Start - Search on Vendor  to get TDS Section ----------------------------------------------------------//
	function getTDSSectionFromEntity(entityId,tranSubsidiary){
		var secVal="";
		ARR_SECTION_VALUE=[];
		if(entityId && tranSubsidiary){
			var customerSearchObj = search.create({type: "vendor",
				filters:
					[
						["isinactive","is","F"],"AND", ["custrecord_yantragst_vendor.isinactive","is","F"],"AND", ["custrecord_yantragst_vendor.custrecord_yil_tds_subsidiary","is",tranSubsidiary],"AND",["internalid","anyof",entityId]

						],
						columns:
							[	
								search.createColumn({ name: "internalid", join: "CUSTRECORD_YANTRAGST_VENDOR"/*,sort: search.Sort.DESC*/ ,label: "Internal ID" }),
								search.createColumn({ name: "custrecord_yantragst_tds_section", join: "CUSTRECORD_YANTRAGST_VENDOR",sort: search.Sort.DESC, label: "TDS Section" })
								]
			});
			//var searchCount		= customerSearchObj.runPaged().count;
			var resultIndex = 0; 
			var resultStep = 1000;
			var searchResult = customerSearchObj.run().getRange({ start: resultIndex, end: resultIndex + resultStep });
			for(var t=0; t< searchResult.length;t++) {

				secVal  = searchResult[t].getValue({name: "custrecord_yantragst_tds_section",join: "CUSTRECORD_YANTRAGST_VENDOR"});

				if(secVal){
					ARR_SECTION_VALUE.push(secVal);
				}
			}
		}
		log.debug({title: "getTDSSectionFromEntity : secVal", details: secVal});
		log.debug({title: "getTDSSectionFromEntity : ARR_SECTION_VALUE", details: ARR_SECTION_VALUE});

		return secVal;
	}
//	----------------------------------------- End - Search on Vendor to get TDS Section ----------------------------------------------------------//

//	-------------------------------------- Start - Get details of TDS Details Record --------------------------------------------------------//
	function getTDSDetails(vendorObj,tranSubsidiary){

		var getApplyLTDS="";
		var getTdsTaxCode="";
		var getThresholdLimit="";
		var getCerIssueDate="";
		var getCerExpiryDate="";
		var getLtdsTaxCode="";
		var getVendorThreshLimit="";
		var getLdsSectionValue="";
		var getSubsidiaryValue="";

		var searchFilter_TDSD	= [];
		var searchColumn_TDSD	= [];

		searchFilter_TDSD.push(search.createFilter({name: "isinactive", operator: search.Operator.IS, values: false}));
		if(vendorObj){
			searchFilter_TDSD.push(search.createFilter({name: "custrecord_yantragst_vendor", operator: search.Operator.IS, values: vendorObj}));
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
		searchColumn_TDSD.push(search.createColumn({name: "custrecord_ygst_vendor_threshold_limit"}));
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
				getVendorThreshLimit = result.getValue({name: "custrecord_ygst_vendor_threshold_limit"});
				getLdsSectionValue = result.getValue({name: "custrecord_yantragst_tds_section"});
				getSubsidiaryValue = result.getValue({name: "custrecord_yil_tds_subsidiary"});

				TDS_DETAILS[getLdsSectionValue+getSubsidiaryValue] = {"GetApplyLTDS":getApplyLTDS,"GetTdsTaxcode" :getTdsTaxCode,"GetThresholdLimit":getThresholdLimit,"GetCerIssueDate":getCerIssueDate,"GetCerExpiryDate":getCerExpiryDate,
						"GetLtdsTaxCode":getLtdsTaxCode,"GetVendorThreshLimit":getVendorThreshLimit};
				return true;
			});
		}
		log.debug("getTDSDetails:TDS_DETAILS==",JSON.stringify(TDS_DETAILS));
	}
//	--------------------------------------End - Get details of TDS Details Record --------------------------------------------------------//

//	---------------------------------------------------- Start -get  all existing  Invoice total sum  ----------------------------------------------//
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

		var searchObj	= search.create({type: "vendorbill", filters: searchFilter_Cust, columns: searchColumn_Cust, settings: searchSetting_Cust});
		var countObj	= searchObj.runPaged().count;

		searchObj.run().each(function(result) {
			//InvTotal	= result.getValue({name: "amount",summary: "SUM"});
			invTotal	= result.getValue({ name: "fxamount", summary: "SUM", label: "Amount (Foreign Currency)" });
			tdsSectionValue = result.getValue({ name: "custcol_yantragst_tds_section", summary: "GROUP", label: "TDS Section" });
			subsidiaryValue = result.getValue({ name: "subsidiary", summary: "GROUP", label: "Subsidiary" });

			INVOICE_TOTAL[tdsSectionValue+subsidiaryValue] =  {"InvTotal":invTotal};
			return true;
		});
		log.debug("getInvoiceTotal:INVOICE_TOTAL==",JSON.stringify(INVOICE_TOTAL));
	}
//	---------------------------------------------------- End -get  all existing  Invoice total sum  ----------------------------------------------//

//	------------------------------------------------------Start - Get Default TaxCode for NRE Item from Item Master -------------------------//
	function getDefaltWHTaxCode(NRECharges){

		var itemInternalId = "";
		var WHTaxCodeValue = "";
		var itemSearchObj = search.create({type: "item",
			filters:
				[
					["internalid","anyof",NRECharges], "AND",
					["isinactive","is",'F'] /*,	"AND",['custitem_4601_defaultwitaxcode']*/

					],
					columns:
						[
							search.createColumn({ name: "internalid", label: "Internal ID" }),
							search.createColumn({ name: "custitem_4601_defaultwitaxcode", label: "Default WT Code" })
							]
		});
		var itemsearchCount		= itemSearchObj.runPaged().count;
		/*var resultIndex = 0; 
		var resultStep = 1000;
		var itemsearchResult = itemSearchObj.run().getRange({ start: resultIndex, end: resultIndex + resultStep });
		for(var t=0; t< itemsearchCount;t++) {
			WHTaxVal = itemsearchResult[0].getValue({name: "custitem_4601_defaultwitaxcode", label: "Default WT Code"});
		}*/
		if(itemsearchCount>0){
			itemSearchObj.run().each(function(result) {
				itemInternalId = result.getValue({ name: "internalid", label: "Internal ID" });
				WHTaxCodeValue = result.getValue({ name: "custitem_4601_defaultwitaxcode", label: "Default WT Code" });

				ITEM_DEFAULT_WH_TAXCODE[itemInternalId] ={'WHTaxCodeValue':WHTaxCodeValue};

				return true;
			});			
		}
		//log.debug("getDefaltWHTaxCode: ITEM_DEFAULT_WH_TAXCODE==",JSON.stringify(ITEM_DEFAULT_WH_TAXCODE));
	}
//	------------------------------------------------------End - Get Default TaxCode for NRE Item from Item Master -------------------------//

	return {
		pageInit:pageInit,
		fieldChanged : fieldChanged,
		postSourcing : postSourcing
		//saveRecord	: saveRecord
	}
});
