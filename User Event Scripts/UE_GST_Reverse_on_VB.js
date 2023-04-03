/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/*************************************************************
 * File Header
 * Script Type: UserEventScript
 * Script Name: UE_GST_Reverse_on_VB
 * File Name  : UE_GST_Reverse_on_VB.js
 * Created On : 8/03/2021
 * Modified On: 
 * Created By : Arpit (Yantra Inc.)
 * Modified By: 
 * Description: Script is for expense account adjustment.
 ************************************************************/

define(['N/search', 'N/record', 'N/runtime', 'N/url', 'N/ui/serverWidget'], function (search, record, runtime, url, serverWidget) {

	var GST_TAXCODE_MATRIX_ARR = {};
	var TAXCODE_DETAILS={};
	var ACCOUNT_ID ={};

	function afterSubmit(scriptContext)
	{
		try {
			if (scriptContext.type != scriptContext.UserEventType.DELETE) {

				//------------------------------------------ Start - Get Parameters values ---------------------------------------//
				var scriptObj = runtime.getCurrentScript();

				var  undefinedTaxCodeId = scriptObj.getParameter({name: 'custscript_ygst_undef_taxcode_id'});		
				var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});		

				//------------------------------------------ End - Get Parameters values ---------------------------------------//

				var recObject	= scriptContext.newRecord;

				var tranSubsidiary	= recObject.getValue({fieldId: 'subsidiary'});
				log.debug("afterSubmit-tranSubsidiary: ", tranSubsidiary);

				//------------------------------ Start - Condition for to compare multi India Subsidiary--------------------------------------------------//
				var indiaSubObj	= false;
				var splitSub	= getAccountSubsidiary.split(",");
				var subLength	= splitSub.length;
				for(var i=0; i<subLength; i++) {
					if(Number(splitSub[i]) == Number(tranSubsidiary)) {
						indiaSubObj	= true;
					}
				}
				log.debug({title: "afterSubmit: indiaSubObj", details: indiaSubObj});
				//------------------------------ End - Condition for to compare multi India Subsidiary--------------------------------------------------//

				if (tranSubsidiary != null && tranSubsidiary != "" && indiaSubObj) {

					var recId		= recObject.id;
					var recType		= recObject.type;			

					var billObject	= record.load({type: recType, id: recId, isDynamic: true});

					var gstType = billObject.getValue({fieldId: 'custbody_gst_gsttype'});
					var lineItemCount = billObject.getLineCount({sublistId: 'item'});

					//Get details of GST TaxCode Matrix records
					_getGstPayableItem();

					//Get details of GST TaxCode records
					getTaxCodeDetails()

					//Get details of Account records
					getAccontDetails();

					if (lineItemCount > 0 && _dataValidation(lineItemCount))
					{					
						for (var i = 0; i < lineItemCount; i++)
						{
							var expeAccObj	= billObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_yil_gst_expense_acc',line: i});
							var expeOutCB 	= billObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_yil_gst_expense_out',line: i});							
							var getTaxAmt	= billObject.getSublistValue({sublistId: 'item',fieldId: 'tax1amt',line: i});							
							var getTaxCode	= billObject.getSublistValue({sublistId: 'item',fieldId: 'taxcode',line: i});							
							var expAcc	= billObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_yil_gst_expense_acc',line: i});							
							var getTaxCode_str	= billObject.getSublistText({sublistId: 'item',fieldId: 'taxcode',line: i});							
							var f_line_added = billObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_yil_gst_expense_pro',line: i});							
							var rcmApplyCB	= billObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_gst_reversal_line',line: i});							
							var departObj	= billObject.getSublistValue({sublistId: 'item',fieldId: 'department',line: i});
							var classObj	= billObject.getSublistValue({sublistId: 'item',fieldId: 'class',line: i});
							var locatObj	= billObject.getSublistValue({sublistId: 'item',fieldId: 'location',line: i});
							var scheduleID	= billObject.getSublistValue({sublistId: 'item',fieldId: 'custcol_gst_itemschedule',line: i});
							
							//----------------------------- Start - Expense Out+RCM Scenario ---------------------------------------------//
							if(expeOutCB && rcmApplyCB ){
								var getAmount	= billObject.getSublistValue({sublistId: 'item',fieldId: 'amount',line: i});
								log.debug("afterSubmit: getAmount**: ", getAmount);

								var cgstRate="";
								var sgstRate=""; 
								var igstRate="";
								var getIntraTaxAmt =0.00;

								if(GST_TAXCODE_MATRIX_ARR[gstType+scheduleID]){

									var TotalTaxRate = GST_TAXCODE_MATRIX_ARR[ gstType+scheduleID].GstRate
									var checkGstType = GST_TAXCODE_MATRIX_ARR[ gstType+scheduleID].GetGstTypeStr
									if(checkGstType == 'Inter')
									{
										igstRate = Number(TotalTaxRate);                                        
										getTaxAmt = getAmount * (igstRate / 100);	
									}
									else if(checkGstType == 'Intra')
									{
										getTaxAmt = getAmount * (TotalTaxRate / 100);												
										cgstRate = Number(TotalTaxRate)/2;
										getIntraTaxAmt = getAmount * (cgstRate / 100);										
									}
								}
							}
							//----------------------------- End - Expense Out+RCM Scenario ---------------------------------------------//

							var getTaxCode_str_split = "";
							var tax_type_str = "";
							if(getTaxCode_str!=null && getTaxCode_str!="" && getTaxCode_str!=undefined)
							{
								getTaxCode_str_split = getTaxCode_str.toString().split(":");
								tax_type_str = getTaxCode_str_split[0];
							}						
							if((expeOutCB == true) && (f_line_added !=true))
							{
								if(_dataValidation(expAcc))
								{
									billObject.selectNewLine({sublistId:"expense"});
									billObject.setCurrentSublistValue({sublistId: 'expense', fieldId: 'account', value: expAcc});
									billObject.setCurrentSublistValue({sublistId: 'expense', fieldId: 'amount', value: getTaxAmt});	
									billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_expense_line',value: true});
									billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: departObj});
									billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: classObj});
									billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: locatObj});
									billObject.commitLine({sublistId:"expense"});									
								}						

								var arrLength = 0 ;
								try
								{							
									if(GST_TAXCODE_MATRIX_ARR[gstType+scheduleID]){
										var account_id_sgst = GST_TAXCODE_MATRIX_ARR[gstType+scheduleID].SgstPayableItem
										var account_id_cgst = GST_TAXCODE_MATRIX_ARR[gstType+scheduleID].CgstPayableItem
										var account_id_igst = GST_TAXCODE_MATRIX_ARR[gstType+scheduleID].IgstPayableItem
									}

									if(account_id_sgst!=null && account_id_sgst!='' && account_id_sgst!=undefined){
										arrLength++;  
									}
									if(account_id_cgst!=null && account_id_cgst!='' && account_id_cgst!=undefined){
										arrLength++; 
									}
									if(account_id_igst!=null && account_id_igst!='' && account_id_igst!=undefined)	{
										arrLength++;  
									}

									getTaxAmt			= getTaxAmt/arrLength;

									if(account_id_sgst!=null && account_id_sgst!='' && account_id_sgst!=undefined)
									{
										//var account_id = get_account_id(getTaxCode,'SGST');

										var account_id ="";

										if(TAXCODE_DETAILS[getTaxCode+'SGST']){
											var accountDescription = TAXCODE_DETAILS[getTaxCode+'SGST'].GetPrchaseTaxAcc	

											if(ACCOUNT_ID[accountDescription]){
												account_id = ACCOUNT_ID[accountDescription].GetAccontId;
											}
										}

										billObject.selectNewLine({sublistId:"expense"});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: account_id});
										//billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getTaxAmt});
										if(expeOutCB && !rcmApplyCB ){
											billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getTaxAmt});
										}
										else if(expeOutCB && rcmApplyCB ){
											billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getIntraTaxAmt});
										}
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_expense_line',value: true});											
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: undefinedTaxCodeId});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_hsnsaccode',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: departObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: classObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: locatObj});
										billObject.commitLine({sublistId:"expense"});

									}										
									if(account_id_cgst!=null && account_id_cgst!='' && account_id_cgst!=undefined)
									{
										//var account_id = get_account_id(getTaxCode,'CGST');	

										var account_id ="";

										if(TAXCODE_DETAILS[getTaxCode+'CGST']){
											var accountDescription = TAXCODE_DETAILS[getTaxCode+'CGST'].GetPrchaseTaxAcc	

											if(ACCOUNT_ID[accountDescription]){
												account_id = ACCOUNT_ID[accountDescription].GetAccontId;
											}
										}

										billObject.selectNewLine({sublistId:"expense"});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: account_id});
										//billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getTaxAmt});
										if(expeOutCB && !rcmApplyCB ){
											billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getTaxAmt});
										}
										else if(expeOutCB && rcmApplyCB ){
											billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getIntraTaxAmt});
										}
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_expense_line',value: true});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: undefinedTaxCodeId});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_hsnsaccode',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: departObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: classObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: locatObj});
										billObject.commitLine({sublistId:"expense"});	

									}
									if(account_id_igst!=null && account_id_igst!='' && account_id_igst!=undefined)
									{
										//var account_id = get_account_id(getTaxCode,'IGST');	

										var account_id ="";

										//log.debug('TAXCODE_DETAILS[getTaxCode+IGST]==',JSON.stringify(TAXCODE_DETAILS[getTaxCode+'IGST']));
										if(TAXCODE_DETAILS[getTaxCode+'IGST']){
											var accountDescription = TAXCODE_DETAILS[getTaxCode+'IGST'].GetPrchaseTaxAcc	

											if(ACCOUNT_ID[accountDescription]){
												account_id = ACCOUNT_ID[accountDescription].GetAccontId;
											}
										}

										billObject.selectNewLine({sublistId:"expense"});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: account_id});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getTaxAmt});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_expense_line',value: true});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: undefinedTaxCodeId});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_hsnsaccode',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: departObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: classObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: locatObj});
										billObject.commitLine({sublistId:"expense"});
									}		
								}
								catch(excd)
								{
									log.error('account', 'excd -->'+excd);									
								}										

								billObject.selectLine({sublistId:"item" , line : i});
								billObject.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_yil_gst_expense_pro', value: true});
								billObject.commitLine({sublistId:"item"});								
							}	
						}
					}
					var lineExpenseCount = billObject.getLineCount({sublistId: 'expense'});
					log.debug({title: "lineExpenseCount --", details:lineExpenseCount});

					if (lineExpenseCount > 0 && _dataValidation(lineExpenseCount))
					{										
						for (var e = 0; e < lineExpenseCount; e++)
						{							
							var expeAccObj	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'custcol_yil_gst_expense_acc',line: e});
							var expeOutCB 	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'custcol_yil_gst_expense_out',line: e});							
							var getTaxAmt	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'tax1amt',line: e});							
							var getTaxCode	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'taxcode',line: e});							
							var expAcc	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'custcol_yil_gst_expense_acc',line: e});							
							var getTaxCode_str	= billObject.getSublistText({sublistId: 'expense',fieldId: 'taxcode',line: e});							
							var f_line_added = billObject.getSublistValue({sublistId: 'expense',fieldId: 'custcol_yil_gst_expense_pro',line: e});							
							var rcmApplyCB	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_reversal_line',line: e});							
							var departObj	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'department',line: e});
							var classObj	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'class',line: e});
							var locatObj	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'location',line: e});
							var scheduleID	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',line: e});
							
							//----------------------------- Start - Expense Out+RCM Scenario ---------------------------------------------//

							if(expeOutCB && rcmApplyCB ){
								var getAmount	= billObject.getSublistValue({sublistId: 'expense',fieldId: 'amount',line: e});

								var cgstRate="";
								var sgstRate=""; 
								var igstRate="";
								var getIntraTaxAmt =0.00;

								if(GST_TAXCODE_MATRIX_ARR[gstType+scheduleID]){

									var TotalTaxRate = GST_TAXCODE_MATRIX_ARR[ gstType+scheduleID].GstRate
									var checkGstType = GST_TAXCODE_MATRIX_ARR[ gstType+scheduleID].GetGstTypeStr
									if(checkGstType == 'Inter')
									{
										igstRate = Number(TotalTaxRate);                                        
										getTaxAmt = getAmount * (igstRate / 100);	
									}
									else if(checkGstType == 'Intra')
									{
										getTaxAmt = getAmount * (TotalTaxRate / 100);										
										cgstRate = Number(TotalTaxRate)/2;
										getIntraTaxAmt = getAmount * (cgstRate / 100);									
									}
								}
							}
							//----------------------------- End - Expense Out+RCM Scenario ---------------------------------------------//

							var getTaxCode_str_split = "";
							var tax_type_str = "";

							if(getTaxCode_str!=null && getTaxCode_str!="" && getTaxCode_str!=undefined)
							{
								getTaxCode_str_split = getTaxCode_str.toString().split(":");
								tax_type_str = getTaxCode_str_split[0];
							}

							if((expeOutCB == true) && (f_line_added !=true))
							{
								if(_dataValidation(expAcc))
								{
									billObject.selectNewLine({sublistId:"expense"});
									billObject.setCurrentSublistValue({sublistId: 'expense', fieldId: 'account', value: expAcc});
									billObject.setCurrentSublistValue({sublistId: 'expense', fieldId: 'amount', value: getTaxAmt});	
									billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_expense_line',value: true});
									billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: departObj});
									billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: locatObj});
									billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: classObj});
									billObject.commitLine({sublistId:"expense"});									
								}															

								var arrLength = 0 ;
								try
								{
									if(GST_TAXCODE_MATRIX_ARR[gstType+scheduleID]){
										var account_id_sgst = GST_TAXCODE_MATRIX_ARR[gstType+scheduleID].SgstPayableItem
										var account_id_cgst = GST_TAXCODE_MATRIX_ARR[gstType+scheduleID].CgstPayableItem
										var account_id_igst = GST_TAXCODE_MATRIX_ARR[gstType+scheduleID].IgstPayableItem
									}

									if(account_id_sgst!=null && account_id_sgst!='' && account_id_sgst!=undefined)
									{
										arrLength++;  
									}
									if(account_id_cgst!=null && account_id_cgst!='' && account_id_cgst!=undefined)
									{
										arrLength++; 
									}
									if(account_id_igst!=null && account_id_igst!='' && account_id_igst!=undefined)
									{
										arrLength++;  
									}

									getTaxAmt			= getTaxAmt/arrLength;

									if(account_id_sgst!=null && account_id_sgst!='' && account_id_sgst!=undefined)
									{
										//var account_id = get_account_id(getTaxCode,'SGST');	
										var account_id ="";

										if(TAXCODE_DETAILS[getTaxCode+'SGST']){
											var accountDescription = TAXCODE_DETAILS[getTaxCode+'SGST'].GetPrchaseTaxAcc	

											if(ACCOUNT_ID[accountDescription]){
												account_id = ACCOUNT_ID[accountDescription].GetAccontId;
											}
										}

										billObject.selectNewLine({sublistId:"expense"});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: account_id});
										//billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getTaxAmt});
										if(expeOutCB && !rcmApplyCB ){
											billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getTaxAmt});
										}
										else if(expeOutCB && rcmApplyCB ){
											billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getIntraTaxAmt});
										}
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_expense_line',value: true});											
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: undefinedTaxCodeId});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_hsnsaccode',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: departObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: locatObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: classObj});
										billObject.commitLine({sublistId:"expense"});

									}										
									if(account_id_cgst!=null && account_id_cgst!='' && account_id_cgst!=undefined)
									{
										//var account_id = get_account_id(getTaxCode,'CGST');	
										var account_id ="";

										if(TAXCODE_DETAILS[getTaxCode+'CGST']){
											var accountDescription = TAXCODE_DETAILS[getTaxCode+'CGST'].GetPrchaseTaxAcc	

											if(ACCOUNT_ID[accountDescription]){
												account_id = ACCOUNT_ID[accountDescription].GetAccontId;
											}
										}

										billObject.selectNewLine({sublistId:"expense"});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: account_id});
										//billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getTaxAmt});
										if(expeOutCB && !rcmApplyCB ){
											billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getTaxAmt});
										}
										else if(expeOutCB && rcmApplyCB ){
											billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getIntraTaxAmt});
										}
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_expense_line',value: true});											
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: undefinedTaxCodeId});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_hsnsaccode',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: departObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: classObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: locatObj});
										billObject.commitLine({sublistId:"expense"});	

									}
									if(account_id_igst!=null && account_id_igst!='' && account_id_igst!=undefined)
									{
										//var account_id = get_account_id(getTaxCode,'IGST');	
										var account_id ="";

										if(TAXCODE_DETAILS[getTaxCode+'IGST']){
											var accountDescription = TAXCODE_DETAILS[getTaxCode+'IGST'].GetPrchaseTaxAcc	

											if(ACCOUNT_ID[accountDescription]){
												account_id = ACCOUNT_ID[accountDescription].GetAccontId;
											}
										}

										billObject.selectNewLine({sublistId:"expense"});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'account',value: account_id});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'amount',value: -getTaxAmt});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_expense_line',value: true});											
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'taxcode',value: undefinedTaxCodeId});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_itemschedule',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'custcol_gst_hsnsaccode',value: ''});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'department',value: departObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'class',value: classObj});
										billObject.setCurrentSublistValue({sublistId: 'expense',fieldId: 'location',value: locatObj});
										billObject.commitLine({sublistId:"expense"});

									}		
								}
								catch(excd)
								{
									log.debug('Expense account', 'excd -->'+excd);									
								}										

								billObject.selectLine({sublistId:"expense" , line : e});
								billObject.setCurrentSublistValue({sublistId: 'expense', fieldId: 'custcol_yil_gst_expense_pro', value: true});
								billObject.commitLine({sublistId:"expense"});								
							}	
						}
					}
					billObject.save({enableSourcing: true,ignoreMandatoryFields: true});
				}
			}		
		}
		catch(exp) {
			log.error({title: "afterSubmit:Exception Message", details: exp});
		}
	}
	//--------------------------------------------------- Start - Custom Functions -------------------------------------------------------//
	function get_account_id(getTaxCode ,tax_type_str )
	{
		var account_id = "";	

		if(_dataValidation(getTaxCode))
		{
			try
			{
				var rec_tax_group = record.load({type: 'taxgroup', id: getTaxCode, isDynamic: true});
				var tax_group_line_count = rec_tax_group.getLineCount({sublistId: 'taxitem'});
				var account_id=0;

				for(var p = 0; p < tax_group_line_count; p++){
					var taxItem = rec_tax_group.getSublistValue({sublistId: 'taxitem', fieldId: 'taxname', line: p});					
					var tax_type = rec_tax_group.getSublistValue({sublistId: 'taxitem', fieldId: 'taxtype', line: p});

					if(tax_type_str == tax_type)
					{						                     //Load Tax Code
						var rec_tax_code = record.load({type: 'salestaxitem', id: taxItem, isDynamic: true});
						var tax_code_acc = rec_tax_code.getValue({fieldId: 'acct1'});				

						//create account search
						var accountSearchObj = search.create({type: "account",
							filters:
								[
									//["name","is",tax_code_acc]
									//["acctname","is",tax_code_acc]
									["description","is",tax_code_acc]
									],
									columns:
										[
											search.createColumn({name: 'internalid'})
											]
						});
						var searchResultCount = accountSearchObj.runPaged().count;						
						accountSearchObj.run().each(function(result){
							account_id = result.getValue({name: 'internalid'});							
							// .run().each has a limit of 4,000 results
							return true;
						});
					}
				}
			}	
			catch(err)
			{
				log.debug({title: "get_account_id-Exception Message", details: err});  
			}  
		}
		return account_id ;	
	}

	//----------------------------------------------------- Start - Get Tax Code Matrix Details ----------------------------------------------//
	//function _getGstPayableItem(gstType, scheduleID)
	function _getGstPayableItem()
	{
		var gstTaxPayableItems	= {};
		var sgstPayableItem	= '';
		var cgstPayableItem	= '';
		var igstPayableItem	= '';
		var getGstType="";
		var getGstSchedule="";
		var getGstTypeStr ="";
		var gstRate ="";
		try{

			var filterTaxCodeMatrix = [];
			var columnTaxCodeMatrix = [];

			filterTaxCodeMatrix.push(search.createFilter({name: 'isinactive',operator: search.Operator.IS,values: false}));
			//filterTaxCodeMatrix.push(search.createFilter({name: 'custrecord_gst_type',operator: search.Operator.IS,values: gstType}));
			//filterTaxCodeMatrix.push(search.createFilter({name: 'custrecord_gst_item_schedule',operator: search.Operator.IS,values: scheduleID}));

			columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_sgst_revpay_item'}));
			columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_cgst_revpay_item'}));
			columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_igst_revpay_item'}));
			columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_gst_type'}));
			columnTaxCodeMatrix.push(search.createColumn({name: 'custrecord_gst_item_schedule'}));
			columnTaxCodeMatrix.push(search.createColumn({ name: "rate", join: "CUSTRECORD_GST_TAX_CODE", label: "Rate" }));

			var searchTaxCodeMatrix	 = search.create({type: "customrecord_gst_tax_code_matrix", filters: filterTaxCodeMatrix, columns: columnTaxCodeMatrix});

			var searchResultCount	 = searchTaxCodeMatrix.runPaged().count;

			if(searchResultCount && searchResultCount>0){
				searchTaxCodeMatrix.run().each(function(result){
					sgstPayableItem	= result.getValue({name: "custrecord_sgst_revpay_item"});
					cgstPayableItem	= result.getValue({name: "custrecord_cgst_revpay_item"});
					igstPayableItem	= result.getValue({name: "custrecord_igst_revpay_item"});
					getGstType = result.getValue({name: "custrecord_gst_type"});
					getGstTypeStr = result.getText({name: "custrecord_gst_type"});
					getGstSchedule = result.getValue({name: "custrecord_gst_item_schedule"});
					gstRate = result.getValue({name: "rate", join: "CUSTRECORD_GST_TAX_CODE", label: "Rate"});

					GST_TAXCODE_MATRIX_ARR[getGstType+getGstSchedule] = {"SgstPayableItem":sgstPayableItem,"CgstPayableItem":cgstPayableItem,"IgstPayableItem":igstPayableItem,"GetGstTypeStr":getGstTypeStr,"GetGstType" :getGstType,"getGstSchedule":getGstSchedule,"GstRate":gstRate};
					return true;
				});
			}

			//gstTaxPayableItems[0] = {'sgst':sgstPayableItem , 'cgst': cgstPayableItem, 'igst': igstPayableItem};	
			log.debug("_getGstPayableItem","GST_TAXCODE_MATRIX_ARR"+JSON.stringify(GST_TAXCODE_MATRIX_ARR));
		}	
		catch(e)
		{
			log.error({title: "_getGstPayableItem-Exception Message", details: e});  
		}  
	}
	//----------------------------------------------------- End - Get Tax Code Matrix Details ----------------------------------------------//
	//----------------------------------------------------- Start - Get Tax Code Details ----------------------------------------------//
	function getTaxCodeDetails(){

		var getTaxGroupId = "";
		var getTaxType="";
		var getTaxRate="";
		var getPrchaseTaxAcc="";
		try{
			var salestaxitemSearchObj = search.create({type: "salestaxitem",
				filters:
					[
						["isinactive","is","F"], "AND", ["country","anyof","IN"]
						],
						columns:
							[										      
								search.createColumn({name: "taxtype", label: "Tax Type"}),
								search.createColumn({name: "taxgroup", label: "Tax Group"}),
								//search.createColumn({name: "acct1", label: "PURCHASE TAX ACCOUNT"})
								search.createColumn({name: "purchaseaccount", label: "Purchase Account"})
								]
			});
			var searchResultCount = salestaxitemSearchObj.runPaged().count;
			log.debug("salestaxitemSearchObj result count",searchResultCount);
			salestaxitemSearchObj.run().each(function(result){
				// .run().each has a limit of 4,000 results

				getTaxGroupId = result.getValue({name: "taxgroup", label: "Tax Group"});
				getTaxType = result.getText({name: "taxtype", label: "Tax Type"});
				//getPrchaseTaxAcc = result.getValue({name: "acct1", label: "PURCHASE TAX ACCOUNT"});
				getPrchaseTaxAcc = result.getText({name: "purchaseaccount", label: "Purchase Account"});

				TAXCODE_DETAILS[getTaxGroupId+getTaxType] = {"GetPrchaseTaxAcc":getPrchaseTaxAcc};			

				return true;
			});
			log.debug("TAXCODE_DETAILS:- ", JSON.stringify(TAXCODE_DETAILS));
		}	
		catch(e)
		{
			log.error({title: "getTaxCodeDetails-Exception Message", details: e});  
		}  
	}
	//----------------------------------------------------- End - Get Tax Code Details ----------------------------------------------//
	//----------------------------------------------------- Start - Get Chart of Accounts --------------------------------------------//
	function getAccontDetails()
	{
		var getAccontId="";
		var getAccontDescription="";

		try{
			//create account search
			var accountSearchObj = search.create({type: "account",
				filters:
					[				
						["isinactive","is","F"]
						],
						columns:
							[
								search.createColumn({name: 'internalid'}),
								search.createColumn({name: 'description'}),
								]
			});
			var searchResultCount = accountSearchObj.runPaged().count;
			log.debug("accountSearchObj result count",searchResultCount);
			if(searchResultCount && searchResultCount>0)
				accountSearchObj.run().each(function(result){
					// .run().each has a limit of 4,000 results

					getAccontId = result.getValue({name: 'internalid'});
					getAccontDescription = result.getValue({name: 'description'});

					ACCOUNT_ID[getAccontDescription]={"GetAccontId":getAccontId};

					return true;
				});
			log.debug('ACCOUNT_ID: ', JSON.stringify(ACCOUNT_ID));
		}	
		catch(e)
		{
			log.error({title: "getAccontDetails-Exception Message", details: e});  
		}  
	}
//	----------------------------------------------------- End - Get Chart of Accounts --------------------------------------------//

	function _dataValidation(value) 
	{
		if(value !='null' && value != null && value != '' && value != undefined && value != 'undefined' && value != 'NaN' && value != NaN)	{
			return true;
		}
		else	{ 
			return false;
		}
	}
//	--------------------------------------------------- End - Custom Functions -------------------------------------------------------//
	return {
		afterSubmit : afterSubmit
	}
});
