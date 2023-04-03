/**
 *@NApiVersion 2.0
 *@NScriptType Suitelet
 **/
define(['N/ui/serverWidget', 'N/runtime', 'N/search', 'N/encode', 'N/file', 'N/record', 'N/format', 'N/config', 'N/url', 'N/https', 'N/http'], function(serverWidget, runtime, search, encode, file, record, format, config, url, https, http) {
	function onRequest(context)
	{
		var reqObj	= context.request;
		try {
			if(reqObj.method == "GET") {
				var panObj				= context.request.parameters.panNo;
				var vendorNmObj			= context.request.parameters.vendorNm;
				var fromDateObj			= context.request.parameters.fromDate;
				var toDateObj			= context.request.parameters.toDate;
				var tdsSecObj			= context.request.parameters.tdsSection;
				var monRangeObj			= context.request.parameters.monthRange;
				var tdsDetObj			= context.request.parameters.tdsPayDet;
				var panNoObj			= context.request.parameters.panNoFil;
				var adrFieldObj			= context.request.parameters.adrField;
				var postingperiodId     = context.request.parameters.postingperionID;
				var subsidiaryId	    = context.request.parameters.subsidiaryID;
				log.debug("subsidiaryId",subsidiaryId);
				//log.debug("postingperiodId",postingperiodId);
				
				var form				= serverWidget.createForm({title: "TDS Report"});
				var scriptObj 			= runtime.getCurrentScript();
				var clientScriptPath	= scriptObj.getParameter({name: 'custscript_ygst_tds_report_module_path'});
				//log.debug({title: "clientScriptPath", details:clientScriptPath});
				form.clientScriptModulePath = ""+clientScriptPath+"";
				
				var isPostingPeriod = scriptObj.getParameter({name: 'custscript_ygst_posting_period'});
				//log.debug({title: "isPostingPeriod==", details:isPostingPeriod});
				
				var searchButton		= form.addButton({id: 'custpage_search', label: "Search", functionName: "fieldData()"});
				var panNo				= form.addField({id: "custpage_pan_no", label: "PAN NO", type: serverWidget.FieldType.SELECT});
				var vendorNm			= form.addField({id: "custpage_vendor_nm", label: "Vendor Name", type: serverWidget.FieldType.SELECT, source: "vendor"});
				var tdsSectionField		= form.addField({id: "custpage_tds_section", label: "TDS Section", type: serverWidget.FieldType.SELECT, source: "customlist_yantragst_tds_section"});
				//var tdsPaymentDetail	= form.addField({id: "custpage_tds_payment_detail", label: "TDS Payment Detail", type: serverWidget.FieldType.CHECKBOX});
				//var panNoFilter			= form.addField({id: "custpage_panno_filter", label: "Pan No.", type: serverWidget.FieldType.CHECKBOX});
				var addressField		= form.addField({id: "custpage_add_field", label: "Show Address Detail", type: serverWidget.FieldType.CHECKBOX});
				var subsidiaryField		= form.addField({id: 'custpage_subsidiary', label: "Subsidiary", type: serverWidget.FieldType.SELECT, source: 'subsidiary'});
				if(isPostingPeriod==true || isPostingPeriod=='true'){					
					var postingPeriodField		= form.addField({id: 'custpage_posting_period', label: "Posting Period", type: serverWidget.FieldType.SELECT});
					postingPeriodField.addSelectOption({value: '',text: ''}); 
					
					var periodSearch = search.create({ type: "accountingperiod",
						filters:
							[
								["isquarter","is","F"],"AND", ["isyear","is","F"], "AND", ["closed","is","F"], "AND",  ["isinactive","is","F"]/*, "AND", ["startdate","on",currFirstDay], "AND",["enddate","on",currLastDay]*/
								],
								columns:
									[
										search.createColumn({name: "internalid",sort: search.Sort.ASC,label: "Internal ID"}),
										search.createColumn({name: "periodname", label: "Name"})
										]
					});

					var periodSearchResultCount = periodSearch.runPaged().count;
					//log.debug("onRequest","periodSearchResultCount =="+periodSearchResultCount);

					if(periodSearchResultCount && periodSearchResultCount>0){
						periodSearch.run().each(function(result){
							// .run().each has a limit of 4,000 results
							var internalid = result.getValue({name: "internalid", sort: search.Sort.ASC,label: "Internal ID"});
							//log.debug("onRequest","internalid##"+internalid);

							var periodName = result.getValue({name: "periodname", label: "Name"});
							//log.debug("onRequest","periodName##"+periodName);

							postingPeriodField.addSelectOption({value: internalid,text: periodName}); 

							return true;
						});

					}
				}
				else{
					var fromDate			= form.addField({id: "custpage_from_date", label: "Start Date", type: serverWidget.FieldType.DATE});
					var toDate				= form.addField({id: "custpage_to_date", label: "End Date", type: serverWidget.FieldType.DATE});
					var monthRange			= form.addField({id: "custpage_month_range", label: "Month Range", type: serverWidget.FieldType.DATE});
				}
				
				var exportButton		= form.addSubmitButton({id: "custpage_sub_butt", label:"Export"});
				//var tdsSecwise	= form.addField({id: "custpage_sec_wise", label: "TDS Section Wise", type: serverWidget.Type.});
				
				var tdsReport			= form.addSubtab({id: 'custpage_tds_sublist', label: 'TDS REPORT'});
				var htmlFile			= form.addField({id: 'custpage_html', label: 'Export', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_tds_sublist'});
				var excelFile			= form.addField({id: 'custpage_excel', label: 'Print', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_tds_sublist'});
				
				//log.debug({title: "panObj", details:panObj});
/* 				if(!panObj) {
					panNo.addSelectOption({value : '1',text : ''});
					panNo.addSelectOption({value : '2',text : 'Available'});
					panNo.addSelectOption({value : '3',text : 'Not Available'});
				}
				else if(panObj == "Available") {
					//log.debug({title: "Inside Available",details:"Entered"});
					panNo.addSelectOption({value : '1',text : 'Available'});
					panNo.addSelectOption({value : '2',text : 'Not Available'});
				}
				else if(panObj == "Not Available") {
					//log.debug({title: "Inside Not Available",details:"Entered"});
					panNo.addSelectOption({value : '1',text : 'Not Available'});
					panNo.addSelectOption({value : '2',text : 'Available'});
				} */
				
				panNo.addSelectOption({value : '1',text : ''});
				panNo.addSelectOption({value : '2',text : 'Available'});
				panNo.addSelectOption({value : '3',text : 'Not Available'});
			
				if(postingperiodId){
					postingPeriodField.defaultValue	= postingperiodId;
				}
				if(vendorNmObj) {
					vendorNm.defaultValue= vendorNmObj;
				}
				if(fromDateObj) {
					fromDate.defaultValue= fromDateObj;
				}
				if(toDateObj) {
					toDate.defaultValue	= toDateObj;
				}
				if(tdsSecObj) {
					tdsSectionField.defaultValue	= tdsSecObj;
				}
				if(monRangeObj) {
					monthRange.defaultValue= monRangeObj;
				}
				if(tdsDetObj) {
					tdsPaymentDetail.defaultValue= 'T';
				}
				//if(panNoObj) {
				//	panNoFilter.defaultValue	= 'T';
				//}
				log.debug("panObj",panObj);
				if(panObj) {
					panNo.defaultValue	= panObj;
				}
				
				if(adrFieldObj) {
					addressField.defaultValue	= 'T';
				}
				if(subsidiaryId) {
					subsidiaryField.defaultValue		= subsidiaryId;
				}
				var tdsReportData	= tds_report_data(subsidiaryId,panObj, vendorNmObj, fromDateObj, toDateObj, tdsSecObj, monRangeObj, tdsDetObj, panNoObj, adrFieldObj,postingperiodId);
				if(tdsReportData)
				{
				var bothData		= tdsReportData.split(":||:");
				}
				var htmlData 		= bothData[0];
				var excelData 		= bothData[1];
				//log.debug({title: "htmlData", details: htmlData});
				//log.debug({title: "excelData", details: excelData});
				
				htmlFile.defaultValue = htmlData;
				excelFile.defaultValue= excelData;
				excelFile.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
				context.response.writePage({pageObject: form});
			}
			else {
				var excelFile	= reqObj.parameters['custpage_excel'];
				//log.debug({title: "excelFile", details: excelFile});
				var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
				xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
				xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
				xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
				xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
				xmlStr += 'xmlns:htmlObj1="http://www.w3.org/TR/REC-html40">';

				xmlStr += '<Worksheet ss:Name="TDS Report">';
				xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Transaction Type</Data></Cell>'+
				'<Cell><Data ss:Type="String">Vendor Name</Data></Cell>'+
				'<Cell><Data ss:Type="String">PAN NO</Data></Cell>'+
				'<Cell><Data ss:Type="String">Reference No or Bill No</Data></Cell>'+
				'<Cell><Data ss:Type="String">Document No</Data></Cell>'+
				'<Cell><Data ss:Type="String">Document Date</Data></Cell>'+
				'<Cell><Data ss:Type="String">TDS Section</Data></Cell>'+
				'<Cell><Data ss:Type="String">TDS Rate</Data></Cell>'+
				'<Cell><Data ss:Type="String">TDS Base Amount</Data></Cell>'+
				'<Cell><Data ss:Type="String">TDS Amount</Data></Cell>'+
				//TDS Details Fields
				//'<Cell><Data ss:Type="String">TDS Section</Data></Cell>'+
				'<Cell><Data ss:Type="String">Apply Lower TDS</Data></Cell>'+
				'<Cell><Data ss:Type="String">Exemption Certificate Number</Data></Cell>'+
				'<Cell><Data ss:Type="String">Threshold Limit</Data></Cell>'+
				'<Cell><Data ss:Type="String">Certificate Issue Date</Data></Cell>'+
				'<Cell><Data ss:Type="String">Certificate Expiry Date</Data></Cell>'+
				'<Cell><Data ss:Type="String">Rate for Lower TDS</Data></Cell>'+
				'<Cell><Data ss:Type="String">Tax code for Lower TDS</Data></Cell></Row>';	
				xmlStr += excelFile;

				xmlStr += '</Table></Worksheet>';
				xmlStr += '</Workbook>';
				var fileName		= "TDS_Report"+new Date()+".xls";

				var encodedString	= encode.convert({string: xmlStr, inputEncoding: encode.Encoding.UTF_8, outputEncoding: encode.Encoding.BASE_64});
				var fileObj			= file.create({name: fileName, fileType: file.Type.EXCEL, contents: encodedString});
				context.response.writeFile({file: fileObj});
			}
		}
		catch(exp) {
			log.debug({title:"Exception log", details: exp});
			log.debug({title:"Exception log", details: exp.message});
		}
		
	}
	
	function tds_report_data(subsidiaryId,panObj, vendorNmObj, fromDateObj, toDateObj, tdsSecObj, monRangeObj, tdsDetObj, panNoObj, adrFieldObj,postingperiodId) 
	{
		var htmlObj1		= "";
		var excelObj 		= "";
		var resultIndexSN	= 0; 
		var resultStepSN	= 1000;
		
		var billFilter		= [];
		var billColumn		= [];
		var billSetting		= [];
		
		var configRecObj	= config.load({type: config.Type.USER_PREFERENCES});
		var dateFormatValue	= configRecObj.getValue({fieldId: 'DATEFORMAT'});
		var m	 			= [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
		var mm 				= [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
			
		var scriptObj 		= runtime.getCurrentScript();
		var subsidiaryId1	= scriptObj.getParameter({name: "custscript_ygst_global_india_subsidiary"});//custscript_yantragst_india_sub
		log.debug({title: "subsidiaryId1", details: subsidiaryId1});
		if(subsidiaryId1){
			subsidiaryId1 = subsidiaryId1.split(",");
		}
		
		//Search On Vendor Bill
		//if(panObj == "Available") {
			//billFilter.push(search.createFilter({name: "custentity_gst_pan_number",join: "vendor", operator: search.Operator.ISNOTEMPTY}));
		//}	
		if(panObj == 2) {
			billFilter.push(search.createFilter({name: "custentity_gst_pan_number",join: "vendor", operator: search.Operator.ISNOTEMPTY}));
		}	
		if(panObj == 3) {
			billFilter.push(search.createFilter({name: "custentity_gst_pan_number",join: "vendor", operator: search.Operator.ISEMPTY}));
		}	
		if(vendorNmObj) {
			billFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: vendorNmObj}));
		}
		if(tdsSecObj) {
			billFilter.push(search.createFilter({name: "custcol_yantragst_tds_section", operator: search.Operator.ANYOF, values: tdsSecObj}));
		}
		if(fromDateObj && toDateObj) {
			billFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDateObj, toDateObj]}));
		}
		if(monRangeObj) {
			var formateddate	= format.parse({value: monRangeObj, type: format.Type.DATE});
			//var formateddate	= format.format({value: monthObj, type: format.Type.DATE});
			//log.debug({title: "formateddate", details:formateddate });
			var months 			= formateddate.getMonth()+1;
			var years			= formateddate.getFullYear();
			//log.debug({title: "months", details:months });
			//log.debug({title: "months", details:months});
			//log.debug({title: "years", details:years });
			var firstDateObj	= new Date(years, months, 1); 
			var firstDay		= firstDateObj.getDate();
			var lastDateObj		= new Date(years, months, 0); 
			var lastDay			= lastDateObj.getDate();
			
			var monsText		= m[months-1];
			var monthsText		= mm[months-1];
			//log.debug({title: "Months In Text ", details: m[months-1]});
			//log.debug({title: "dateFormatValue", details: dateFormatValue});
			
			//_returnCorrectDate(dateObj, dateFormatValue);
			
			if(dateFormatValue == "M/D/YYYY" || dateFormatValue == "MM/DD/YYYY") {
				var fromDate	= months+"/"+firstDay+"/"+years;
				var toDate		= months+"/"+lastDay+"/"+years;
				//log.debug({title: "fromDate", details: fromDate});
				//log.debug({title: "toDate", details: toDate});
			}
			else if(dateFormatValue == "D/M/YYYY") {
				var fromDate	= firstDay+"/"+months+"/"+years;
				var toDate		= lastDay+"/"+months+"/"+years;
			}
			else if(dateFormatValue == "D-Mon-YYYY") {
				var fromDate	= firstDay+"-"+monsText+"-"+years;
				var toDate		= lastDay+"-"+monsText+"-"+years;
			}
			else if(dateFormatValue == "D.M.YYYY") {
				var fromDate	= firstDay+"."+months+"."+years;
				var toDate		= lastDay+"."+months+"."+years;
			}
			else if(dateFormatValue == "D-MONTH-YYYY" || dateFormatValue == "DD-MONTH-YYYY") {
				var fromDate	= firstDay+"-"+monthsText+"-"+years;
				var toDate		= lastDay+"-"+monthsText+"-"+years;
			}
			else if(dateFormatValue == "D MONTH, YYYY" || dateFormatValue == "DD MONTH, YYYY") {
				var fromDate	= firstDay+" "+monthsText+", "+years;
				var toDate		= lastDay+" "+monthsText+", "+years;
			}
			else if(dateFormatValue == "YYYY/M/D" || dateFormatValue == "YYYY/MM/DD") {
				var fromDate	= years+"/"+months+"/"+firstDay;
				var toDate		= years+"/"+months+"/"+lastDay;
			}
			else if(dateFormatValue == "YYYY-M-D" || dateFormatValue == "YYYY-MM-DD") {
				var fromDate	= years+"-"+months+"-"+firstDay;
				var toDate		= years+"-"+months+"-"+lastDay;
			}
			else if(dateFormatValue == "DD/MM/YYYY") {
				var fromDate	= firstDay+"/"+months+"/"+years;
				var toDate		= lastDay+"/"+months+"/"+years;
			}
			else if(dateFormatValue == "DD-Mon-YYYY") {
				var fromDate	= firstDay+"-"+monsText+"-"+years;
				var toDate		= lastDay+"-"+monsText+"-"+years;
			}
			else if(dateFormatValue == "DD.MM.YYYY") {
				var fromDate	= firstDay+"."+months+"."+years;
				var toDate		= lastDay+"."+months+"."+years;
			}
			else if(dateFormatValue == "DD-MONTH-YYYY") {
				var fromDate	= firstDay+"."+months+"."+years;
				var toDate		= lastDay+"."+months+"."+years;
			}
		}
		if(fromDate && toDate) {
			billFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
		}
		if(postingperiodId) {
			billFilter.push(search.createFilter({name:"postingperiod", operator: search.Operator.ANYOF, values: postingperiodId}));
		}
		
		billFilter.push(search.createFilter({name: "custcol_4601_witaxapplies", operator: search.Operator.IS, values: true}));
		if(subsidiaryId){
			billFilter.push(search.createFilter({name: "internalid", join: "subsidiary",  operator: search.Operator.ANYOF, values: subsidiaryId}));
		}
		else{
			billFilter.push(search.createFilter({name: "internalid", join: "subsidiary",  operator: search.Operator.ANYOF, values: subsidiaryId1}));
		}
		billFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
		billFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
		billFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
		billFilter.push(search.createFilter({name: "cogs", operator: search.Operator.IS, values: false}));
		
		billColumn.push(search.createColumn({name: "type",summary: "GROUP",label: "Type"}));
		billColumn.push(search.createColumn({name: "mainname", summary: "GROUP",label: "Vendor Name"}));
		//billColumn.push(search.createColumn({name: "entity"}));
		billColumn.push(search.createColumn({name: "custentity_gst_pan_number",join: "vendor", summary: "GROUP",label: "PAN No"}));
		billColumn.push(search.createColumn({name: "transactionnumber",summary: "GROUP",label: "Transaction Number"}));
		billColumn.push(search.createColumn({name: "tranid",summary: "GROUP",label: "Reference No"}));
		billColumn.push(search.createColumn({name: "trandate", summary: "GROUP",sort: search.Sort.DESC,label: "Document Date"}));
		billColumn.push(search.createColumn({name: "custcol_yantragst_tds_section",summary: "GROUP",label: "TDS Section"}));
		billColumn.push(search.createColumn({name: "custcol_4601_witaxrate", summary: "GROUP",label: "TDS Rate"}));
		billColumn.push(search.createColumn({name: "custcol_4601_witaxbaseamount",summary: "SUM",label: "Withholding Tax Base Amount"}));
		billColumn.push(search.createColumn({name: "custcol_4601_witaxamount", function: 'absoluteValue', summary: "SUM",label: "Withholding Tax Amount"}));
		billColumn.push(search.createColumn({name: "billaddress", summary: "GROUP",label:"Address"}));
		
		
		
		billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));
		
		var searchObj = search.create({type:"vendorbill",filters: billFilter, columns: billColumn, settings: billSetting});
		var searchCount = searchObj.runPaged().count;
		log.debug('searchCount',searchCount);
		log.debug('searchObj',searchObj);
		
		//Getting all the Vendor Details Details in array to reduce usage
		var venTds_Arr		= [];
		var allDetails		= [];
		var vendorId		= "";
		var tdsSection		= "";
		var lTdsSection		= ""; 
		var applyLTds		= "";
		var excNo			= "";
		var threLimit		= "";
		var cerIssDate		= "";
		var cerExpDate		= "";
		var rateFLTds		= "";
		var taxCodeFLtds	= "";
		var customrecord_yantragst_vendor_tds_detailSearchObj = search.create({
			type: "customrecord_yantragst_vendor_tds_detail",
			filters:
			[
				["custrecord_yantragst_vendor","noneof","@NONE@"], 
				"AND", 
				["custrecord_yantragst_tds_section","noneof","@NONE@"]
			],
			columns:
			[
				search.createColumn({name: "custrecord_yantragst_vendor", label: "Vendor Name"}),
				search.createColumn({name: "custrecord_yantragst_taxcode", label: "Tax Code for TDS"}),
				search.createColumn({name: "custrecord_yantragst_tds_section", label: "TDS Section"}),
				search.createColumn({name: "custrecord_yantragst_apply_lower_tds", label: "Apply Lower TDS"}),
				search.createColumn({name: "custrecord_yantragst_ex_cert_no", label: "Exemption Certificate Number"}),
				search.createColumn({name: "custrecord_yantragst_threshold_limit", label: "Threshold Limit"}),
				search.createColumn({name: "custrecord_yantragst_cert_issue_date", label: "Certificate Issue Date"}),
				search.createColumn({name: "custrecord_yantragst_cert_exp_date", label: "Certificate Expiry Date"}),
				search.createColumn({name: "custrecord_yantragst_rate_lower_tds", label: "Rate for Lower TDS"}),
				search.createColumn({name: "custrecord_yantragst_taxcode_tds", label: "Tax code for Lower TDS"})
			]
		});
		var searchResultCount = customrecord_yantragst_vendor_tds_detailSearchObj.runPaged().count;
		//log.debug("customrecord_yantragst_vendor_tds_detailSearchObj result count",searchResultCount);
		customrecord_yantragst_vendor_tds_detailSearchObj.run().each(function(result){
			vendorId	= result.getValue({name: "custrecord_yantragst_vendor"});
			tdsSection	= result.getValue({name: "custrecord_yantragst_tds_section"});
			var mergeVT	= vendorId+"_"+tdsSection;
			venTds_Arr.push(mergeVT);
			lTdsSection	= result.getText({name: "custrecord_yantragst_tds_section"});
			applyLTds	= result.getValue({name: "custrecord_yantragst_apply_lower_tds"});
			excNo		= result.getValue({name: "custrecord_yantragst_ex_cert_no"});
			threLimit	= result.getValue({name: "custrecord_yantragst_threshold_limit"});
			cerIssDate	= result.getValue({name: "custrecord_yantragst_cert_issue_date"});
			cerExpDate	= result.getValue({name: "custrecord_yantragst_cert_exp_date"});
			rateFLTds	= result.getValue({name: "custrecord_yantragst_rate_lower_tds"});
			taxCodeFLtds= result.getText({name: "custrecord_yantragst_taxcode_tds"});
			var mergeDet= lTdsSection+"|::|"+applyLTds+"|::|"+excNo+"|::|"+threLimit+"|::|"+cerIssDate+"|::|"+cerExpDate+"|::|"+rateFLTds+"|::|"+taxCodeFLtds;
			allDetails.push(mergeDet);
			return true;
		});
		 log.debug({title: "venTds_Arr", details:venTds_Arr});
		log.debug({title: "allDetails", details:allDetails});
		 
		var n = 0;
		var htmlObj1  ='';
		var excelObj ='';
		htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
		htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
		htmlObj1 +='<tr>';
		htmlObj1 +='<th style="border:1px solid#000000;padding:5px 4px;">Transaction Type</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Vendor Name</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">PAN NO</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Reference No</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Document No</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Document Date</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">TDS Section</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">TDS Rate</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">TDS Base Amount</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">TDS Amount</th>';
		//TDS Details Fields
		//htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">TDS Section</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Apply Lower TDS</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Exemption Certificate Number</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Threshold Limit</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Certificate Issue Date</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Certificate Expiry Date</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Rate for Lower TDS</th>';
		htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Tax code for Lower TDS</th>';
		if(adrFieldObj) {
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Vendor Address</th>';
		}
		htmlObj1 += '</tr>';
		htmlObj1 += '</thead>';
		htmlObj1 += '<tbody>';
		if(searchCount != 0)
		{
			do
			{
				var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
				if(searchResultSN.length > 0)
				{
					for(var s in searchResultSN )
					{
						//Fields From Vendor Bill
						var vendorId	= searchResultSN[s].getValue({name: "mainname", summary: "GROUP",label: "Vendor Name"});
						var tdsSection_1= searchResultSN[s].getValue({name: "custcol_yantragst_tds_section",summary: "GROUP",label: "TDS Section"});
						var tdsSection_2= searchResultSN[s].getText({name: "custcol_yantragst_tds_section",summary: "GROUP",label: "TDS Section"});
						var tdsSection	= searchResultSN[s].getText({name: "custcol_yantragst_tds_section",summary: "GROUP",label: "TDS Section"});
						var type        = searchResultSN[s].getText({name: "type",summary: "GROUP",label: "Type"});
						var vendorNm	= searchResultSN[s].getText({name: "mainname", summary: "GROUP",label: "Vendor Name"});
						var panNo		= searchResultSN[s].getValue({name: "custentity_gst_pan_number",join: "vendor", summary: "GROUP",label: "PAN No"});
						var refNo		= searchResultSN[s].getValue({name: "tranid",summary: "GROUP",label: "Reference No"});
						var docNo		= searchResultSN[s].getValue({name: "transactionnumber",summary: "GROUP",label: "Transaction Number"});
						var tranDate	= searchResultSN[s].getValue({name: "trandate", summary: "GROUP",sort: search.Sort.DESC,label: "Document Date"});
						var tdsRate		= searchResultSN[s].getValue({name: "custcol_4601_witaxrate", summary: "GROUP",label: "TDS Rate"});
						var tdsBaseAmt	= searchResultSN[s].getValue({name: "custcol_4601_witaxbaseamount",summary: "SUM",label: "Withholding Tax Base Amount"});
						var tdsAmt		= searchResultSN[s].getValue({name: "custcol_4601_witaxamount", function: 'absoluteValue', summary: "SUM",label: "Withholding Tax Amount"});
						var vendorAdr	= searchResultSN[s].getValue({name: "billaddress", summary: "GROUP",label:"Address"});
						
						//var vendorTdsData	= vendorTDSDetails(vendorId, tdsSection_1, tranDate);
						//log.debug({title: "vendorTdsData function", details:vendorTdsData});
						if(_dataValidation(vendorId) && _dataValidation(tdsSection_1) && _dataValidation(tranDate)) {//venTds_Arr allDetails
							var findInArr	= vendorId+"_"+tdsSection_1;
							//log.debug({title: "findInArr", details:findInArr});
							var ven_pos		= venTds_Arr.indexOf(findInArr);
							//log.debug({title: "ven_pos", details:ven_pos});
							if(ven_pos != -1) {
							
							var splTdsDet	= allDetails[ven_pos].split("|::|");
							
							//log.debug({title: "splTdsDet", details:splTdsDet});
							//log.debug({title: "splTdsDet[0]", details:splTdsDet[0]});
							
							var lTdsSection_Re	= splTdsDet[0];
							var applyLTds_Re	= splTdsDet[1];
							var excNo_Re		= splTdsDet[2];
							var threLimit_Re	= splTdsDet[3];
							var cerIssDate_Re	= splTdsDet[4];
							var cerExpDate_Re	= splTdsDet[5];
							var rateFLTds_Re	= splTdsDet[6];
							var taxCodeFLtds_Re	= splTdsDet[7];
							
							
						/* 	log.debug({title :"tranDate", details: tranDate});
							log.debug({title :"cerIssDate_Re", details: cerIssDate_Re});
							 log.debug({title :"cerExpDate_Re", details: cerExpDate_Re});*/
							if(_dataValidation(tranDate) && _dataValidation(cerIssDate_Re) && _dataValidation(cerExpDate_Re)) {
								var forComDate	= format.parse({value: tranDate, type: format.Type.DATE});
								var forFromDate	= format.parse({value: cerIssDate_Re, type: format.Type.DATE});
								var forToDate	= format.parse({value: cerExpDate_Re, type: format.Type.DATE});
							}
							if(forComDate != null && forComDate != "") {
								var comDate		= forComDate.getTime();
							}
							if((forFromDate != null && forFromDate != "") && (forToDate != null && forToDate != "")) {
								var fromDate	= forFromDate.getTime();
								var toDate		= forToDate.getTime();
							}
					/* 		log.debug({title: "applyLTds_Re", details:applyLTds_Re});
							log.debug({title :'comDate', details:comDate});
							log.debug({title :'fromDate', details:fromDate});
							log.debug({title :'toDate', details:toDate}); */
							if(!applyLTds_Re) {
								log.debug({title :'Inside 1st Condition', details:applyLTds});
								var lTdsSection_Re	= "";
								var applyLTds_Re	= "";
								var excNo_Re		= "";
								var threLimit_Re	= "";
								var cerIssDate_Re	= "";
								var cerExpDate_Re	= "";
								var rateFLTds_Re	= "";
								var taxCodeFLtds_Re	= "";
								
							}
							else if((Number(comDate) < Number(fromDate))) {
								//log.debug({title :'Inside Second Condition', details:comDate });
								var lTdsSection_Re	= "";
								var applyLTds_Re	= "";
								var excNo_Re		= "";
								var threLimit_Re	= "";
								var cerIssDate_Re	= "";
								var cerExpDate_Re	= "";
								var rateFLTds_Re	= "";
								var taxCodeFLtds_Re	= "";
							}
							else if((Number(comDate) > Number(toDate))) {
								//log.debug({title :'Inside Third Condition', details:comDate });
								var lTdsSection_Re	= "";
								var applyLTds_Re	= "";
								var excNo_Re		= "";
								var threLimit_Re	= "";
								var cerIssDate_Re	= "";
								var cerExpDate_Re	= "";
								var rateFLTds_Re	= "";
								var taxCodeFLtds_Re	= "";
							}
						}
						else {
								//log.debug({title :'Inside Forth Condition', details:comDate });
								var lTdsSection_Re	= "";
								var applyLTds_Re	= "";
								var excNo_Re		= "";
								var threLimit_Re	= "";
								var cerIssDate_Re	= "";
								var cerExpDate_Re	= "";
								var rateFLTds_Re	= "";
								var taxCodeFLtds_Re	= "";
							}
						}
						
						/* if(!lTdsSection_Re || !applyLTds_Re	|| !excNo_Re || !threLimit_Re	|| !cerIssDate_Re ||!cerExpDate_Re	|| !rateFLTds_Re	|| !taxCodeFLtds_Re || panNo == ""){										
								var lTdsSection_Re	= "";
								var applyLTds_Re	= "";
								var excNo_Re		= "";
								var threLimit_Re	= "";
								var cerIssDate_Re	= "";
								var cerExpDate_Re	= "";
								var rateFLTds_Re	= "";
								var taxCodeFLtds_Re	= "";
								var panNo 			= "";
						} */
						
						htmlObj1 +='<tr>';
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+type+'</td>';
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+vendorNm+'</td>';
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+panNo+'</td>'						
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+refNo+'</td>';
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+docNo+'</td>';
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+tranDate+'</td>';
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+tdsSection+'</td>';
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+tdsRate+'</td>';
						htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+tdsBaseAmt+'</td>';
						htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+tdsAmt+'</td>';
						//TDS Details Field 
						
						//htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+lTdsSection_Re+'</td>';
						if(applyLTds_Re){
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+applyLTds_Re+'</td>';
						}else if(applyLTds_Re=="undefined" || !applyLTds_Re){
							applyLTds_Re=""
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+applyLTds_Re+'</td>';
						}
						if(excNo_Re){
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+excNo_Re+'</td>';
						}else if(excNo_Re=="undefined" || !excNo_Re){
							excNo_Re="";
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+excNo_Re+'</td>';	
						}
						if(threLimit_Re){
						htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+threLimit_Re+'</td>';
						}else if(threLimit_Re=="undefined" || !threLimit_Re){
							threLimit_Re="";
						htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+threLimit_Re+'</td>';
						}
						if(cerIssDate_Re){
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+cerIssDate_Re+'</td>';
						}else if(cerIssDate_Re=="undefined" || !cerIssDate_Re){
							cerIssDate_Re="";
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+cerIssDate_Re+'</td>';
						}
						if(cerExpDate_Re){
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+cerExpDate_Re+'</td>';
						}else if(cerExpDate_Re=="undefined" || !cerExpDate_Re){
							cerExpDate_Re="";
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+cerExpDate_Re+'</td>';
						}
						if(rateFLTds_Re){
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+rateFLTds_Re+'</td>';
						}else if(rateFLTds_Re=="undefined" || !rateFLTds_Re){
							rateFLTds_Re="";
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+cerExpDate_Re+'</td>';
						}
						if(taxCodeFLtds_Re){
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+taxCodeFLtds_Re+'</td>';
						}else if(taxCodeFLtds_Re=="undefined" || !taxCodeFLtds_Re){
							taxCodeFLtds_Re="";
						htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+taxCodeFLtds_Re+'</td>';
						}
						
						if(adrFieldObj) {
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+vendorAdr+'</td>';
						}
						
						htmlObj1 +='</tr>';
						
						excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+type+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+vendorNm+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+panNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+refNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+docNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+tranDate+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+tdsSection+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+tdsRate+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+tdsBaseAmt+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+tdsAmt+'</Data></Cell>'+
							//TDS Details Fields
							//'<Cell><Data ss:Type="String">'+lTdsSection_Re+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+applyLTds_Re+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+excNo_Re+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+threLimit_Re+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+cerIssDate_Re+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+cerExpDate_Re+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+rateFLTds_Re+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+taxCodeFLtds_Re+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+vendorAdr+'</Data></Cell></Row>';
							
					}	
				}	
				// increase pointer
					resultIndexSN = resultIndexSN + resultStepSN;
						
			}	while (searchResultSN.length > 0);
					
		}
		else {
			htmlObj1 +="<tr>";
			htmlObj1 +="<td colspan='15'>No records to show.</td>";
			htmlObj1 +="</tr>";
			
			excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
		}
		htmlObj1 +='</table>';
		//log.debug({title: "htmlObj1", details: htmlObj1});
		//log.debug({title: "excelObj", details: excelObj});
		var finalString  = htmlObj1 + ":||:" + excelObj;
		//log.debug({title: "finalString", details: finalString});
		return finalString;
		//context.response.write({output: finalString });

	}
	
	function vendorTDSDetails(vendorId, tdsSection_1, tranDate)
	{	
		var scriptObj = runtime.getCurrentScript();
		//log.debug('Remaining governance vendorTDSDetails 1: ' + scriptObj.getRemainingUsage());
		//if(scriptObj.getRemainingUsage() <= 900) 
		{
			var tdsDetailsFilter= [];
			var tdsDetailsColumn= [];
			var lTdsSection		= ""; 
			var applyLTds		= "";
			var excNo			= "";
			var threLimit		= "";
			var cerIssDate		= "";
			var cerExpDate		= "";
			var rateFLTds		= "";
			var taxCodeFLtds	= "";
			//Search For TDS Details
			if(vendorId != null && vendorId != "" && tdsSection_1 != null && tdsSection_1 != "") {// != null && vendorId != " ") {
				//log.debug({title: "Inside Condition vendorId", details: vendorId});
				tdsDetailsFilter.push({name: "custrecord_yantragst_vendor", operator: search.Operator.ANYOF, values: vendorId});
				//log.debug({title: "Inside Condition tdsSection_1", details: tdsSection_1}); 
				tdsDetailsFilter.push({name: "custrecord_yantragst_tds_section", operator: search.Operator.ANYOF, values: tdsSection_1});
			}
			
			tdsDetailsColumn.push(search.createColumn({name: "custrecord_yantragst_tds_section"}));
			tdsDetailsColumn.push(search.createColumn({name: "custrecord_yantragst_apply_lower_tds"}));
			tdsDetailsColumn.push(search.createColumn({name: "custrecord_yantragst_ex_cert_no"}));
			tdsDetailsColumn.push(search.createColumn({name: "custrecord_yantragst_threshold_limit"}));
			tdsDetailsColumn.push(search.createColumn({name: "custrecord_yantragst_cert_issue_date"}));
			tdsDetailsColumn.push(search.createColumn({name: "custrecord_yantragst_cert_exp_date"}));
			tdsDetailsColumn.push(search.createColumn({name: "custrecord_yantragst_rate_lower_tds"}));
			tdsDetailsColumn.push(search.createColumn({name: "custrecord_yantragst_taxcode_tds"}));
			
			var tdsSearchObj	= search.create({type: "customrecord_yantragst_vendor_tds_detail", filters: tdsDetailsFilter, columns: tdsDetailsColumn});
			var tdsSearchCount 	= tdsSearchObj.runPaged().count;
			//log.debug('tdsSearchCount',tdsSearchCount);
			tdsSearchObj.run().each(function(result) {
				lTdsSection	= result.getText({name: "custrecord_yantragst_tds_section"});
				applyLTds	= result.getValue({name: "custrecord_yantragst_apply_lower_tds"});
				excNo		= result.getValue({name: "custrecord_yantragst_ex_cert_no"});
				threLimit	= result.getValue({name: "custrecord_yantragst_threshold_limit"});
				cerIssDate	= result.getValue({name: "custrecord_yantragst_cert_issue_date"});
				cerExpDate	= result.getValue({name: "custrecord_yantragst_cert_exp_date"});
				rateFLTds	= result.getValue({name: "custrecord_yantragst_rate_lower_tds"});
				taxCodeFLtds= result.getText({name: "custrecord_yantragst_taxcode_tds"});
			});
			/* log.debug({title :"tranDate", details: tranDate});
			log.debug({title :"cerIssDate", details: cerIssDate});
			log.debug({title :"cerExpDate", details: cerExpDate}); */
			if((tranDate != null && tranDate != "") && (cerIssDate != null && cerIssDate != "") && (cerExpDate != null && cerExpDate != "")) {
				var forComDate	= format.parse({value: tranDate, type: format.Type.DATE});
				var forFromDate	= format.parse({value: cerIssDate, type: format.Type.DATE});
				var forToDate	= format.parse({value: cerExpDate, type: format.Type.DATE});
			}
			if(forComDate != null && forComDate != "") {
				var comDate		= forComDate.getTime();
			}
			if((forFromDate != null && forFromDate != "") && (forToDate != null && forToDate != "")) {
				var fromDate	= forFromDate.getTime();
				var toDate		= forToDate.getTime();
			}
/* 			log.debug({title: "applyLTds", details:applyLTds});
			log.debug({title :'comDate', details:comDate});
			log.debug({title :'fromDate', details:fromDate});
			log.debug({title :'toDate', details:toDate}); */
			if(!applyLTds) {
				log.debug({title :'Inside 1st Condition', details:applyLTds});
				lTdsSection	= "";
				applyLTds	= "";
				excNo		= "";
				threLimit	= "";
				cerIssDate	= "";
				cerExpDate	= "";
				rateFLTds	= "";
				taxCodeFLtds= "";
			}
			else if((Number(comDate) < Number(fromDate))) {
				//log.debug({title :'Inside Second Condition', details:comDate });
				lTdsSection	= "";
				applyLTds	= "";
				excNo		= "";
				threLimit	= "";
				cerIssDate	= "";
				cerExpDate	= "";
				rateFLTds	= "";
				taxCodeFLtds= "";
			}
			else if((Number(comDate) > Number(toDate))) {
				//log.debug({title :'Inside Third Condition', details:comDate });
				lTdsSection	= "";
				applyLTds	= "";
				excNo		= "";
				threLimit	= "";
				cerIssDate	= "";
				cerExpDate	= "";
				rateFLTds	= "";
				taxCodeFLtds= "";
			}
			//log.debug({title: "Inside Function", details:lTdsSection});
			var venTdsDetailObj = { lTdSecObj 	 : lTdsSection,
									applyObj	 : applyLTds,
									excNoObj	 : excNo,
									threLimObj	 : threLimit,
									cerIssDateObj: cerIssDate,
									cerExpDateObj: cerExpDate,
									rateLtdsObj  : rateFLTds,
									taxCodeObj   : taxCodeFLtds }
			return venTdsDetailObj;
		}
		// else { 
			// var params = {};
			// if(vendorId != null && vendorId != "") {
				// params.vendorId = vendorId;
			// }
			// if(tdsSection_1 != null && tdsSection_1 != "") {
				// params.tdsSection_1	= tdsSection_1;
			// }
            // if(tranDate != null && tranDate != "") {
				// params.tranDate = tranDate;
			// }
			// var suiteletURL = url.resolveScript({scriptId: "customscript_ygst_tds_backend_sl",
							// deploymentId: "customdeploy_ygst_tds_backend_sl", params:params });
			// log.debug({title: "suiteletURL" , details: suiteletURL});
			// var response	= https.get({url : suiteletURL});
			// var allData		= response.body;
			// log.debug({title: "allData" , details: allData});
			
		// }
	}
	function _getTdsVendorRecArray() {
		//log.debug({title: "_getTdsVendorRecArray()", details:"Entered"});
		
		
		if(searchResultCount > 0) {
			return venTds_Arr+":||:"+allDetails;
		}
		else {
			return "Empty"
		}
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
		onRequest : onRequest
	}
});
