/**
 *@NApiVersion 2.0
 *@NScriptType SuiteLet
 **/

define(['N/record','N/ui/serverWidget', 'N/file', 'N/render', 'N/encode', 'N/redirect', 'N/https', 'N/url', 'N/search', 'N/format', 'N/config', 'N/runtime'], function(record, serverWidget, file, render, encode, redirect, https, url, search, format, config, runtime) {
	function onRequest(context) 
	{
		var configRecObj		= config.load({type: config.Type.USER_PREFERENCES});
		var dateFormatValue		= configRecObj.getValue({fieldId: 'DATEFORMAT'});
		var companyRecObj	    = config.load({type: config.Type.COMPANY_PREFERENCES});
		var secAccBook	        = companyRecObj.getValue({fieldId: 'custscript_ygst_accounting_book'});
		log.debug("secAccBook",secAccBook);
		var subsidiaryId		= _getSubsidiary();
		log.debug({title: "Just Created subsidiaryId", details:subsidiaryId});
		var scriptObj 			= runtime.getCurrentScript();
		var dateIntId			= scriptObj.getParameter({name: 'custscript_ygst_purchase_date'});
		log.debug({title: "dateIntId", details:dateIntId});
		var reqObj				= context.request;
		var reportgstr1_b2cl	= "B2CL";

		if(reqObj.method == 'GET') {
			try{
			//var monthObj 		= context.request.parameters.monthId;
			var postingPeriodId = context.request.parameters.postingPeriodId;
			log.debug({title: " postingPeriodId : ", details: postingPeriodId});
			var monthId 		= context.request.parameters.monthId;
			log.debug({title: " monthId : ", details: monthId});		
			var yearId 			= context.request.parameters.yearId;
			log.debug({title: " yearId : ", details: yearId});
			var custObj			= context.request.parameters.custId;
			var locationObj		= context.request.parameters.locationId;
			var gstTypeObj		= context.request.parameters.gstTypeId;
			var subsidiaryObj		= context.request.parameters.subsidiaryId;
			log.debug({title: " subsidiaryObj : ", details: subsidiaryObj});

			if(subsidiaryObj){
				subsidiaryId = context.request.parameters.subsidiaryId
			}

			//log.debug({title: "monthObj", details: monthObj});
			log.debug({title: "custObj", details: custObj});
			log.debug({title: "locationObj", details: locationObj});
			log.debug({title: "gstTypeObj", details: gstTypeObj});

			var m	 			= [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
			var mm 				= [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

			var htmlObj1		= "";
			var excelObj 		= "";
			var resultIndexSN	= 0; 
			var resultStepSN	= 1000;
			var months			= monthId;
			var years			= yearId;
			months = Number(months)+Number(1);

			if(months && years) {
				var firstDateObj	= new Date(years, months, 1); 
				var firstDay		= firstDateObj.getDate();
				var lastDateObj		= new Date(years, months, 0); 
				var lastDay			= lastDateObj.getDate();

				var monsText		= m[months-1];
				var monthsText		= mm[months-1];

				//_returnCorrectDate(dateObj, dateFormatValue);

				if(dateFormatValue == "M/D/YYYY" || dateFormatValue == "MM/DD/YYYY") {
					var fromDate	= months+"/"+firstDay+"/"+years;
					var toDate		= months+"/"+lastDay+"/"+years;
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

				//return newDate;
			}
			//Current date month
			var currentDateObj	= new Date();
			var month 			= currentDateObj.getMonth()+1;
			var year			= currentDateObj.getFullYear();

			var currFirstDateObj= new Date(year, month, 1); 
			var currFirstDay	= currFirstDateObj.getDate();
			var currLastDateObj	= new Date(year, month, 0); 
			var currLastDay		= currLastDateObj.getDate();

			var monText			= m[month-1];
			var monthText		= mm[month-1];

			if(dateFormatValue == "M/D/YYYY" || dateFormatValue == "MM/DD/YYYY") {
				var currFromDate= month+"/"+currFirstDay+"/"+year;
				var currToDate  = month+"/"+currLastDay+"/"+year;
			}
			else if(dateFormatValue == "D/M/YYYY") {
				var currFromDate	= currFirstDay+"/"+month+"/"+year;
				var currToDate		= currLastDay+"/"+month+"/"+year;
			}
			else if(dateFormatValue == "D-Mon-YYYY") {
				var currFromDate	= currFirstDay+"-"+monText+"-"+year;
				var currToDate		= currLastDay+"-"+monText+"-"+year;
			}
			else if(dateFormatValue == "D.M.YYYY") {
				var currFromDate	= currFirstDay+"."+month+"."+year;
				var currToDate		= currLastDay+"."+month+"."+year;
			}
			else if(dateFormatValue == "D-MONTH-YYYY" || dateFormatValue == "DD-MONTH-YYYY") {
				var currFromDate	= currFirstDay+"-"+monthText+"-"+year;
				var currToDate		= currLastDay+"-"+monthText+"-"+year;
			}
			else if(dateFormatValue == "D MONTH, YYYY" || dateFormatValue == "DD MONTH, YYYY") {
				var currFromDate	= currFirstDay+" "+monthText+", "+year;
				var currToDate		= currLastDay+" "+monthText+", "+year;
			}
			else if(dateFormatValue == "YYYY/M/D" || dateFormatValue == "YYYY/MM/DD") {
				var currFromDate	= year+"/"+month+"/"+currFirstDay;
				var currToDate		= year+"/"+month+"/"+currLastDay;
			}
			else if(dateFormatValue == "YYYY-M-D" || dateFormatValue == "YYYY-MM-DD") {
				var currFromDate	= year+"-"+month+"-"+currFirstDay;
				var toDate		= year+"-"+month+"-"+currLastDay;
			}
			else if(dateFormatValue == "DD/MM/YYYY") {
				var currFromDate	= currFirstDay+"/"+month+"/"+year;
				var currToDate		= currLastDay+"/"+month+"/"+year;
			}
			else if(dateFormatValue == "DD-Mon-YYYY") {
				var currFromDate	= currFirstDay+"-"+monText+"-"+year;
				var currToDate		= currLastDay+"-"+monText+"-"+year;
			}
			else if(dateFormatValue == "DD.MM.YYYY") {
				var currFromDate	= currFirstDay+"."+month+"."+year;
				var currToDate		= currLastDay+"."+month+"."+year;
			}
			else if(dateFormatValue == "DD-MONTH-YYYY") {
				var currFromDate	= currFirstDay+"."+month+"."+year;
				var currToDate		= currLastDay+"."+month+"."+year;
			}

			if(reqObj.parameters.keyword == 'B2B') {
				log.debug({title: "b2b function: ", details: "Entered"});
				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];

				billFilter.push([
					["type","anyof","VendBill"], 
					"AND", 
					["mainline","is","F"], 
					"AND", 
					["taxline","is","F"], 
					"AND", 
					["shipping","is","F"], 
					"AND", 
					["cogs","is","F"], 
					"AND", 
					["custbody_gst_customerregno","isnotempty",""], 
					"AND",
					["custcol_gst_reversal_apply","is","F"],
					"AND",
					["status","noneof","VendBill:C","VendBill:D","VendBill:E"],
					"AND", 
					// ["taxitem","noneof","-Not Taxable-","UNDEF-SG","UNDEF-NL","UNDEF-IN","UNDEF-AE"],
					// "AND",
					["taxitem.name","doesnotcontain","-Not Taxable-"], 
					"AND", 
					["taxitem.name","doesnotcontain","UNDEF-SG"], 
					"AND", 
					["taxitem.name","doesnotcontain","UNDEF-NL"], 
					"AND", 
					["taxitem.name","doesnotcontain","UNDEF-IN"], 
					"AND", 
					["taxitem.name","doesnotcontain","UNDEF-AE"],
					"AND",
					["custbody_gst_inv_type","anyof","1"],
					"AND", 
					["item.name","doesnotcontain","Rounding Off"],
					"AND",
					["item.name","doesnotcontain","Round Off"],
					"AND",
					["item.name","doesnotcontain","Round"],
					//"AND", 
					//["subsidiary.internalidnumber","equalto",subsidiaryId]
					]);
				
				if(subsidiaryId) {
					billFilter.push("AND");
					billFilter.push(["subsidiary.internalidnumber","equalto", subsidiaryId]);
				}
				
				if(secAccBook) {
					billFilter.push("AND");
					billFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}

				if(custObj) {
					billFilter.push("AND");
					billFilter.push(["entity", "is", custObj]);
				}

				if(locationObj) {
					billFilter.push("AND");
					billFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					billFilter.push("AND");
					billFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}
				log.debug("B2B Tab","postingPeriodId=="+postingPeriodId);

				if(postingPeriodId) {
					billFilter.push("AND");
					billFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push("AND");
						billFilter.push([dateIntId, "within", fromDate, toDate]);
					}
					else {
						billFilter.push("AND"); 
						billFilter.push([dateIntId, "within", currFromDate, currToDate]);
					}
				}


				billColumn.push(search.createColumn({name: "custbody_gst_customerregno", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custcol_gst_reversal_line", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "amount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_cgstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_sgstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_yil_eligitc", summary: "GROUP"}));
				/* billColumn.push(search.createColumn({
					 name: "altname",
					 join: "vendor",
					 summary: "GROUP",
					 label: "Name"
				  })); */
				  
				//Added On 19 th September 2022 for vendor name(Individual or company)
				billColumn.push(search.createColumn({name: "isperson", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "companyname", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "salutation", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "firstname", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "middlename", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "lastname", join: "vendor", summary: "GROUP"}));

				
				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
				}

				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				searchObj		= search.create({type: "vendorbill", filters: billFilter, columns: billColumn, settings: billSetting});
				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For b2b searchCount", details: searchCount});

				htmlObj1 +="<table class='minimalistBlack' style='border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;'>";
				htmlObj1 +="<thead style ='background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;'>";
				htmlObj1 +="<tr>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>GSTIN of Supplier</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Supplier Name</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Bill Number</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Bill Date</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Bill Value</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Place Of Supply</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Reverse Charge</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Bill Type</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Rate</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Taxable Value</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Integrated Tax Paid</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Central Tax Paid</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>State/UT Tax Paid</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Cess Paid</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Eligibility For ITC</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Availed ITC Integrated Tax</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Availed ITC Central Tax</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Availed ITC State/UT Tax</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Availed ITC Cess</th>";
				htmlObj1 +="</tr>";
				htmlObj1 +="</thead>";


				if(searchCount != 0) {
					do	{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						log.debug("searchResultSN ", searchResultSN.length);
						//var htmlObj1	= "";

						if(searchResultSN.length > 0){
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN) {
								var gstId		= searchResultSN[s].getValue({name: "custbody_gst_customerregno", summary: "GROUP"});
								var billNo		= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
								var billDate	= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
								if(!secAccBook){
									var billValue	= searchResultSN[s].getValue({name: "total", function: "absoluteValue", summary: "SUM"}); 
								}
								if(secAccBook){
									var billValue		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
								}
								var plcOfSupply = searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var revApply	= searchResultSN[s].getValue({name: "custcol_gst_reversal_line", summary: "GROUP"});
								var billType	= searchResultSN[s].getText({name: "custbody_gst_inv_type", summary: "GROUP"});
								var rate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});
								var taxValue	= searchResultSN[s].getValue({name: "amount", function: "absoluteValue", summary: "SUM"});
								var inteTaxPaid	= searchResultSN[s].getValue({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"});
								var cetrTaxPaid	= searchResultSN[s].getValue({name: "custcol_gst_cgstamount", function: "absoluteValue", summary: "SUM"});
								var stateTaxPaid= searchResultSN[s].getValue({name: "custcol_gst_sgstamount", function: "absoluteValue", summary: "SUM"});
								var cessAmtTot	= searchResultSN[s].getValue({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"});
								var eligiForITC	= searchResultSN[s].getText({name: "custbody_yil_eligitc", summary: "GROUP"});
								/* var suppliername = searchResultSN[s].getValue({name: "altname",
								 join: "vendor",
								 summary: "GROUP",
								 label: "Name"});
								log.debug({title:"eligiForITC", details:eligiForITC}); */
								var suppliername			= "";
								
								var isIndivCB		= searchResultSN[s].getValue({name: "isperson", join: "vendor", summary: "GROUP"});
								var compaName		= searchResultSN[s].getValue({name: "companyname", join: "vendor", summary: "GROUP"});
								var salutation		= searchResultSN[s].getValue({name: "salutation", join: "vendor", summary: "GROUP"});
								var firstNm			= searchResultSN[s].getValue({name: "firstname", join: "vendor", summary: "GROUP"});
								var middleNm		= searchResultSN[s].getValue({name: "middlename", join: "vendor", summary: "GROUP"});
								var lastNm			= searchResultSN[s].getValue({name: "lastname", join: "vendor", summary: "GROUP"});
								
								if(compaName) {compaName=compaName}else {compaName	= '';}
								if(salutation) {salutation=salutation}else {salutation	= '';}
								if(firstNm) {firstNm=firstNm}else {firstNm	= '';}
								if(middleNm) {middleNm=middleNm}else {middleNm	= '';}
								if(lastNm) {lastNm=lastNm}else {lastNm	= '';}

								if(!isIndivCB) {suppliername= compaName;}
								else {
									suppliername= salutation+" "+firstNm+" "+middleNm+" "+lastNm;
								}
								log.debug({title: "Inside B2B suppliername", details: suppliername});
								if(eligiForITC == "Ineligible") {
									var availITCInteTax		= "0.00";
									var availITCCentralTax 	= "0.00";
									var availITCStateTax	= "0.00";
									var availITCCess 		= "0.00";
								}
								else {
									var availITCInteTax		= inteTaxPaid;
									var availITCCentralTax 	= cetrTaxPaid;
									var availITCStateTax	= stateTaxPaid;
									var availITCCess 		= cessAmtTot;
								}
								if(plcOfSupply == "- None -" || !plcOfSupply) {
									plcOfSupply	= '';
								}
								if(eligiForITC == "- None -" || !eligiForITC) {
									eligiForITC	= '';
								}
								if(revApply){
									revApply	= "Y";
								}
								else{
									revApply	= "N";
								}
								if(suppliername == "- None -" || !suppliername) {
									suppliername	= '';
								}

								htmlObj1 +="<tr>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+gstId+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+suppliername+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+billNo+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+billDate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+billValue+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+plcOfSupply+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+revApply+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+billType+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+rate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+taxValue+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+inteTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cetrTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+stateTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmtTot+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+eligiForITC+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCInteTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCCentralTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCStateTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCCess+"</td>";

								htmlObj1 +="</tr>";

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+gstId+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+suppliername+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billNo+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billDate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billValue+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+plcOfSupply+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+revApply+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billType+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+rate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+taxValue+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+inteTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cetrTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+stateTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmtTot+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+eligiForITC+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCInteTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCCentralTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCStateTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCCess+'</Data></Cell></Row>';

							}

						}

						// increase pointer
						resultIndexSN = resultIndexSN + resultStepSN;
					} while (searchResultSN.length > 0); 

				}
				else {
					htmlObj1 +="<tr>";
					htmlObj1 +="<td colspan='15'>No records to show.</td>";
					htmlObj1 +="</tr>";

					excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
				}
				htmlObj1 +='</tbody>';
				htmlObj1 +='</table>';
				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });

			}
			else if(reqObj.parameters.keyword == "B2BUR") {
				log.debug({title: "Inside b2bur Report", details: "Entered"});
				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];

				billFilter.push([
					["mainline","is","F"], 
					"AND", 
					["taxline","is","F"], 
					//"AND", 
					//["taxitem.subsidiary","anyof",subsidiaryId],
					//"AND", 
					//["taxitem","anyof","Inter_0%","Inter_12%","Inter_18%","Inter_28%","Inter_5%","Intra_0%","Intra_12%","Intra_18%","Intra_28%","Intra_5%"],
					"AND", 
					["shipping","is","F"], 
					"AND", 
					["cogs","is","F"], 
					"AND", 
					["custbody_gst_customerregno","isempty",""], 
					"AND", 
					["custcol_gst_reversal_apply","is","F"],
					//"AND", 
					//["subsidiary.internalidnumber","equalto",subsidiaryId],
					"AND",
					["custbody_gst_inv_type","anyof","1"], 
					"AND", 
					["item.name","doesnotcontain","Rounding Off"],
					"AND",
					["item.name","doesnotcontain","Round Off"],
					"AND",
					["item.name","doesnotcontain","Round"],
					"AND", 
					["status","noneof","VendPymt:A","VendPymt:D","VendBill:C"]
					]);
				
				if(subsidiaryId) {
					billFilter.push("AND");
					billFilter.push(["taxitem.subsidiary","anyof", subsidiaryId]);
				}
				if(subsidiaryId) {
					billFilter.push("AND");
					billFilter.push(["subsidiary.internalidnumber","equalto", subsidiaryId]);
				}
					
				if(secAccBook) {
					billFilter.push("AND");
					billFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}
				if(custObj) {
					billFilter.push("AND");
					billFilter.push(["entity", "is", custObj]);
					//billFilter.push(search.createFilter("entityid","customermain","is",custObj));
				}

				if(locationObj) {
					billFilter.push("AND");
					billFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					billFilter.push("AND");
					billFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}

				if(postingPeriodId) {
					billFilter.push("AND");
					billFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push("AND");
						billFilter.push([dateIntId, "within", fromDate, toDate]);
					}
					else {
						billFilter.push("AND"); 
						billFilter.push([dateIntId, "within", currFromDate, currToDate]);
					}
				}


				billColumn.push(search.createColumn({name: "mainname", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_gsttype", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "amount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_cgstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_sgstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_yil_eligitc", summary: "GROUP"}));
				//Added On 20thjuly 2020 for vendor name(Individual or company)
				billColumn.push(search.createColumn({name: "isperson", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "companyname", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "salutation", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "firstname", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "middlename", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "lastname", join: "vendor", summary: "GROUP"}));
				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
					billColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
				}

				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				searchObj		= search.create({type: "vendorbill", filters: billFilter, columns: billColumn, settings : billSetting});
				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For b2bur searchCount", details: searchCount});

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Supplier Name</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Place Of Supply</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Supply Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Integrated Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Central Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">State/UT Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Eligibility For ITC</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Integrated Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Central Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC State/UT Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Cess</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';


				if(searchCount != 0) {
					do	{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						//log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0){
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN) {
								//var suppName	= searchResultSN[s].getText({name: "mainname", summary: "GROUP"});
								var billNo		= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
								var billDate	= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
								if(!secAccBook){
									var billValue	= searchResultSN[s].getValue({name: "total", function: "absoluteValue", summary: "SUM"}); 
									var taxValue	= searchResultSN[s].getValue({name: "amount", function: "absoluteValue", summary: "SUM"}); 
								}
								var plcOfSupply = searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var suppType	= searchResultSN[s].getText({name: "custbody_gst_gsttype", summary: "GROUP"});
								var rate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});
								
								if(secAccBook){
									var billValue	= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxValue	= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}
								var inteTaxPaid	= searchResultSN[s].getValue({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"});
								var cetrTaxPaid	= searchResultSN[s].getValue({name: "custcol_gst_cgstamount", function: "absoluteValue", summary: "SUM"});
								var stateTaxPaid= searchResultSN[s].getValue({name: "custcol_gst_sgstamount", function: "absoluteValue", summary: "SUM"});
								var cessAmtTot	= searchResultSN[s].getValue({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"});
								var eligiForITC	= searchResultSN[s].getText({name: "custbody_yil_eligitc", summary: "GROUP"});
								//for customer name
								var suppName			= "";
								var isIndivCB		= searchResultSN[s].getValue({name: "isperson", join: "vendor", summary: "GROUP"});
								var compaName		= searchResultSN[s].getValue({name: "companyname", join: "vendor", summary: "GROUP"});
								var salutation		= searchResultSN[s].getValue({name: "salutation", join: "vendor", summary: "GROUP"});
								var firstNm			= searchResultSN[s].getValue({name: "firstname", join: "vendor", summary: "GROUP"});
								var middleNm		= searchResultSN[s].getValue({name: "middlename", join: "vendor", summary: "GROUP"});
								var lastNm			= searchResultSN[s].getValue({name: "lastname", join: "vendor", summary: "GROUP"});
								log.debug({title: "Inside B2BA isIndivCB", details: isIndivCB});
								log.debug({title: "Inside B2BA compaName", details: compaName});
								log.debug({title: "Inside B2BA salutation", details: salutation});
								log.debug({title: "Inside B2BA firstNm", details: firstNm});
								log.debug({title: "Inside B2BA lastNm", details: lastNm});
								if(compaName == "- None -" || !compaName) {
									compaName	= '';
								}
								if(salutation == "- None -" || !salutation) {
									salutation	= '';
								}
								if(firstNm == "- None -" || !firstNm) {
									firstNm	= '';
								}
								if(middleNm == "- None -" || !middleNm) {
									middleNm	= '';
								}
								if(lastNm == "- None -" || !lastNm) {
									lastNm	= '';
								}

								if(!isIndivCB) {
									suppName			= compaName;
								}
								else {
									suppName			= salutation+" "+firstNm+" "+middleNm+" "+lastNm;
								}
								log.debug({title: "Inside B2BA suppName", details: suppName});

								log.debug({title:"eligiForITC", details:eligiForITC});
								if(eligiForITC == "Ineligible") {
									var availITCInteTax		= "0.00";
									var availITCCentralTax 	= "0.00";
									var availITCStateTax	= "0.00";
									var availITCCess 		= "0.00";
								}
								else {
									var availITCInteTax		= inteTaxPaid;
									var availITCCentralTax 	= cetrTaxPaid;
									var availITCStateTax	= stateTaxPaid;
									var availITCCess 		= cessAmtTot;
								}
								if(plcOfSupply == "- None -" || !plcOfSupply) {
									plcOfSupply	= '';
								}
								if(eligiForITC == "- None -" || !eligiForITC) {
									eligiForITC	= '';
								}
								if(suppName == "- None -" || !suppName) {
									suppName	= '';
								}

								htmlObj1 +="<tr>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+suppName+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+billNo+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+billDate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+billValue+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+plcOfSupply+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+suppType+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+rate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+taxValue+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+inteTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cetrTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+stateTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmtTot+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+eligiForITC+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCInteTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCCentralTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCStateTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCCess+"</td>";
								htmlObj1 +="</tr>";

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+suppName+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billNo+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billDate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billValue+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+plcOfSupply+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+suppType+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+rate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+taxValue+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+inteTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cetrTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+stateTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmtTot+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+eligiForITC+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCInteTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCCentralTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCStateTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCCess+'</Data></Cell></Row>';
								log.debug({title: "Date for B2CSA excelObj", details: excelObj});
							}
						}
						// increase pointer
						resultIndexSN = resultIndexSN + resultStepSN;
					} while (searchResultSN.length > 0); 


				}

				else {
					htmlObj1 +="<tr>";
					htmlObj1 +="<td colspan='15'>No records to show.</recordstd>";
					htmlObj1 +="</tr>";

					excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
				}
				htmlObj1 +='</tbody>';
				htmlObj1 +='</table>';

				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });
			}
			else if(reqObj.parameters.keyword == "IMPS") {
				log.debug({title: "Inside imps Report", details: "Entered"});
				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];

				billFilter.push([
					["type","anyof","VendBill"], 
					"AND", 
					["mainline","is","F"], 
					"AND", 
					["shipping","is","F"], 
					"AND", 
					["taxline","is","F"], 
					"AND", 
					["cogs","is","F"], 
					//"AND", 
					//["subsidiary","anyof",subsidiaryId], 
					"AND", 
					["custbody_gst_inv_type","anyof","3"],
					"AND", 
					["status","noneof","VendBill:C","VendBill:D","VendBill:E"],
					"AND", 
					["item.name","doesnotcontain","Rounding Off"],
					"AND",
					["item.name","doesnotcontain","Round Off"],
					"AND",
					["item.name","doesnotcontain","Round"],					
					"AND", 
					["item.custitem_type_of_gos","anyof","2"]
					]);
				
				if(subsidiaryId) {
					billFilter.push("AND");
					billFilter.push(["subsidiary","anyof", subsidiaryId]);
				}
				if(secAccBook) {
					billFilter.push("AND");
					billFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}
				
				if(custObj) {
					billFilter.push("AND");
					billFilter.push(["entity", "is", custObj]);
					//billFilter.push(search.createFilter("entityid","customermain","is",custObj));
				}

				if(locationObj) {
					billFilter.push("AND");
					billFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					billFilter.push("AND");
					billFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}

				if(postingPeriodId) {
					billFilter.push("AND");
					billFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push("AND");
						billFilter.push([dateIntId, "within", fromDate, toDate]);
					}
					else {
						billFilter.push("AND"); 
						billFilter.push([dateIntId, "within", currFromDate, currToDate]);
					}
				}

				billColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "amount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_yil_eligitc", summary: "GROUP"}));
				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
					billColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
				}

				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				searchObj		= search.create({type: "vendorbill", filters: billFilter, columns: billColumn, settings: billSetting});
				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For IMPS searchCount", details: searchCount});

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill Number of Reg Recipient</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill Date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Place Of Supply</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Integrated Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Eligibility For ITC</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Integrated Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Cess</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';

				if(searchCount != 0) {
					do	{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0){
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN) {
								var billNo		= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
								var billDate	= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
								if(!secAccBook){
									var billValue	= searchResultSN[s].getValue({name: "total", function: "absoluteValue", summary: "SUM"});
									var taxValue	= searchResultSN[s].getValue({name: "amount", function: "absoluteValue", summary: "SUM"});
								}
								if(secAccBook){
									var billValue		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxValue		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}
								var plcOfSupply = searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var rate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});
								
								var inteTaxPaid	= searchResultSN[s].getValue({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"});
								var cessAmtTot	= searchResultSN[s].getValue({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"});
								var eligiForITC	= searchResultSN[s].getText({name: "custbody_yil_eligitc", summary: "GROUP"});
								log.debug({title:"eligiForITC", details:eligiForITC});
								if(eligiForITC == "Ineligible") {
									var availITCInteTax		= "0.00";
									var availITCCess 		= "0.00";
								}
								else {
									var availITCInteTax		= inteTaxPaid;
									var availITCCess 		= cessAmtTot;
								}
								if(plcOfSupply == "- None -" || !plcOfSupply) {
									plcOfSupply	= '';
								}
								if(eligiForITC == "- None -" || !eligiForITC) {
									eligiForITC	= '';
								}

								htmlObj1 +="<tr>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+billNo+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+billDate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+billValue+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+plcOfSupply+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+rate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+taxValue+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+inteTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmtTot+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+eligiForITC+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCInteTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCCess+"</td>";
								htmlObj1 +="</tr>";

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+billNo+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billDate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billValue+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+plcOfSupply+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+rate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+taxValue+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+inteTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmtTot+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+eligiForITC+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCInteTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCCess+'</Data></Cell>'+'</Row>';

							}
						}
						// increase pointer
						resultIndexSN = resultIndexSN + resultStepSN;
					} while (searchResultSN.length > 0); 

				}

				else {
					htmlObj1 +="<tr>";
					htmlObj1 +="<td colspan='15'>No records to show.</td>";
					htmlObj1 +="</tr>";

					excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
				}
				htmlObj1 +='</tbody>';
				htmlObj1 +='</table>';
				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });

			}
			else if(reqObj.parameters.keyword == "IMPG") {
				log.debug({title: "Inside impg Report", details: "Entered"});
				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];

				billFilter.push([
					["type","anyof","VendBill"], 
					"AND", 
					["mainline","is","F"], 
					"AND", 
					["shipping","is","F"], 
					"AND", 
					["taxline","is","F"], 
					"AND", 
					["cogs","is","F"], 
					"AND", 
					["custbody_gst_inv_type","anyof","2"], 
					"AND", 
					["item.custitem_type_of_gos","anyof","2"], 
					"AND", 
					["status","noneof","VendBill:C","VendBill:D","VendBill:E"], 
					"AND", 
					["item.name","doesnotcontain","Rounding Off"],
					"AND",
					["item.name","doesnotcontain","Round Off"],
					"AND",
					["item.name","doesnotcontain","Round"],
					//"AND", 
					//["subsidiary","anyof",subsidiaryId]
					]);
				
				if(subsidiaryId) {
					billFilter.push("AND");
					billFilter.push(["subsidiary","anyof", subsidiaryId]);
				}
				if(secAccBook) {
					billFilter.push("AND");
					billFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}
				if(custObj) {
					billFilter.push("AND");
					billFilter.push(["entity", "is", custObj]);
					//billFilter.push(search.createFilter("entityid","customermain","is",custObj));
				}

				if(locationObj) {
					billFilter.push("AND");
					billFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					billFilter.push("AND");
					billFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}

				if(postingPeriodId) {
					billFilter.push("AND");
					billFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push("AND");
						billFilter.push([dateIntId, "within", fromDate, toDate]);
					}
					else {
						billFilter.push("AND"); 
						billFilter.push([dateIntId, "within", currFromDate, currToDate]);
					}
				}

				billColumn.push(search.createColumn({name: "custbody_gst_port_code", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_yil_billonumber", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_yil_billondate", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_gst_doc_num", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "amount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_yil_eligitc", summary: "GROUP"}));
				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
					billColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
				}

				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				searchObj		= search.create({type: "vendorbill", filters: billFilter, columns: billColumn, settings: billSetting});
				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For IMPG searchCount", details: searchCount});

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Port Code</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill Of Entry Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill Of Entry Date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill Of Entry Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Document type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">GSTIN Of SEZ Supplier</th>';//Pending
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Integrated Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Eligibility For ITC</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Integrated Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Cess</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';


				if(searchCount != 0) {
					do	{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0){
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN) {
								var portCode	= searchResultSN[s].getValue({name: "custbody_gst_port_code", summary: "GROUP"});
								var billOfEntNum= searchResultSN[s].getValue({name: "custbody_yil_billonumber", summary: "GROUP"});
								var billOfEntDte= searchResultSN[s].getValue({name: "custbody_yil_billondate", summary: "GROUP"});
								var billOfEntVal= searchResultSN[s].getValue({name: "total", function: "absoluteValue", summary: "SUM"});
								var docType		= searchResultSN[s].getText({name: "custbody_gst_doc_num", summary: "GROUP"});
								var rate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});
								if(!secAccBook){
									var taxValue	= searchResultSN[s].getValue({name: "amount", function: "absoluteValue", summary: "SUM"}); 
								}
								if(secAccBook){
									var billValue		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxValue		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}
								var inteTaxPaid	= searchResultSN[s].getValue({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"});
								var cessAmtTot	= searchResultSN[s].getValue({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"});
								var eligiForITC	= searchResultSN[s].getText({name: "custbody_yil_eligitc", summary: "GROUP"});
								log.debug({title:"eligiForITC", details:eligiForITC});
								if(eligiForITC == "Ineligible") {
									var availITCInteTax		= "0.00";
									var availITCCess 		= "0.00";
								}
								else {
									var availITCInteTax		= inteTaxPaid;
									var availITCCess 		= cessAmtTot;
								}
								if(eligiForITC == "- None -" || !eligiForITC) {
									eligiForITC	= '';
								}
								if(portCode == "- None -"|| !portCode) {
									portCode	= '';
								}
								if(billOfEntDte == "- None -" || !billOfEntDte) {
									billOfEntDte	= '';
								}
								if(docType == "- None -" || !docType) {
									docType	= '';
								}

								htmlObj1 +="<tr>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+portCode+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+billOfEntNum+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+billOfEntDte+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+billOfEntVal+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+docType+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'></td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+rate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+taxValue+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+inteTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmtTot+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+eligiForITC+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCInteTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCCess+"</td>";
								htmlObj1 +="</tr>";

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+portCode+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billOfEntNum+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billOfEntDte+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+billOfEntVal+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+docType+'</Data></Cell>'+
								'<Cell><Data ss:Type="String"></Data></Cell>'+
								'<Cell><Data ss:Type="String">'+rate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+taxValue+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+inteTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmtTot+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+eligiForITC+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCInteTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCCess+'</Data></Cell>'+'</Row>';
							}
						}
						// increase pointer
						resultIndexSN = resultIndexSN + resultStepSN;
					} while (searchResultSN.length > 0); 
				}
				else {
					htmlObj1 +="<tr>";
					htmlObj1 +="<td colspan='15'>No records to show.</td>";
					htmlObj1 +="</tr>";

					excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
				}
				htmlObj1 +='</tbody>';
				htmlObj1 +='</table>';
				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });

			}
			else if(reqObj.parameters.keyword == "CDNR") {

				log.debug({title: "Inside cdnr Report", details: "Entered"});
				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];

				billFilter.push([
					["type","anyof","VendCred"], 
					"AND", 
					["mainline","is","F"], 
					"AND", 
					["taxline","is","F"], 
					"AND", 
					["cogs","is","F"], 
					"AND", 
					["shipping","is","F"], 
					"AND", 
					["custbody_gst_customerregno","isnotempty",""], 
					"AND", 
					["item.name","doesnotcontain","Rounding Off"],
					"AND",
					["item.name","doesnotcontain","Round Off"],
					"AND",
					["item.name","doesnotcontain","Round"], 
					//"AND", 
					//["subsidiary.internalidnumber","equalto",subsidiaryId],
					// "AND", 
					// ["status","noneof","VendBill:C","VendBill:D","VendBill:E"], 
					"AND", 
					["custbody_gst_inv_type","anyof","1"]
					]);
				
				if(subsidiaryId) {
					billFilter.push("AND");
					billFilter.push(["subsidiary.internalidnumber","equalto", subsidiaryId]);
				}
				if(secAccBook) {
					billFilter.push("AND");
					billFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}
				
				if(custObj) {
					billFilter.push("AND");
					billFilter.push(["entity", "is", custObj]);
					//billFilter.push(search.createFilter("entityid","customermain","is",custObj));
				}

				if(locationObj) {
					billFilter.push("AND");
					billFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					billFilter.push("AND");
					billFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}
				if(postingPeriodId) {
					billFilter.push("AND");
					billFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push("AND");
						billFilter.push([dateIntId, "within", fromDate, toDate]);
					}
					else {
						billFilter.push("AND"); 
						billFilter.push([dateIntId, "within", currFromDate, currToDate]);
					}
				}

				billColumn.push(search.createColumn({name: "custbody_gst_customerregno", summary: "GROUP", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_pre_gst", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_doc_num", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_gsttype", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "amount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_cgstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_sgstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_yil_eligitc", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_onfv_num", summary: "MIN"}));
				billColumn.push(search.createColumn({name: "custbody_gst_onfv_dt", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_nrv_value", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_yil_creditreason", summary: "GROUP"}));
				/* billColumn.push( search.createColumn({
					 name: "altname",
					 join: "vendor",
					 summary: "GROUP",
					 label: "Name"
				  })); */
				//Added On 19 th September 2022 for vendor name(Individual or company)
				billColumn.push(search.createColumn({name: "isperson", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "companyname", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "salutation", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "firstname", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "middlename", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "lastname", join: "vendor", summary: "GROUP"}));

				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
					billColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
				}

				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				searchObj		= search.create({type: "vendorcredit", filters: billFilter, columns: billColumn, settings: billSetting});

				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For CDNR searchCount", details: searchCount});

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">GSTIN of Supplier</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Supplier Name</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Note/Refund Voucher Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Note/Refund Voucher date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill/Advance Payment Voucher Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill/Advance Payment Voucher date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Pre GST</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Document Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Reason For Issuing document</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Supply Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Note/Refund Voucher Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Integrated Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Central Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">State/UT Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Eligibility For ITC</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Integrated Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Central Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC State/UT Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Cess</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';

				if(searchCount != 0) {
					do	{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0){
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN) {
								var gstId		= searchResultSN[s].getValue({name: "custbody_gst_customerregno", summary: "GROUP"});
								var preGST		= searchResultSN[s].getValue({name: "custbody_gst_pre_gst", summary: "GROUP"});
								var docType		= searchResultSN[s].getValue({name: "custbody_gst_doc_num", summary: "GROUP"});
								var suppType	= searchResultSN[s].getText({name: "custbody_gst_gsttype", summary: "GROUP"});
								var rate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});
								if(!secAccBook){
									var taxValue	= searchResultSN[s].getValue({name: "amount", function: "absoluteValue", summary: "SUM"}); 
								}
								if(secAccBook){
									var billValue		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxValue		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}
								var inteTaxPaid	= searchResultSN[s].getValue({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"});
								var cetrTaxPaid	= searchResultSN[s].getValue({name: "custcol_gst_cgstamount", function: "absoluteValue", summary: "SUM"});
								var stateTaxPaid= searchResultSN[s].getValue({name: "custcol_gst_sgstamount", function: "absoluteValue", summary: "SUM"});
								var noteRefNum  = searchResultSN[s].getValue({name: "custbody_gst_onfv_num", summary: "MIN"});
								var noteRefDate = searchResultSN[s].getValue({name: "custbody_gst_onfv_dt", summary: "GROUP"});
								var noteRefVal	= searchResultSN[s].getValue({name: "custbody_gst_nrv_value", summary: "GROUP"});
								var docReason	= searchResultSN[s].getValue({name: "custbody_yil_creditreason", summary: "GROUP"});
								var cessAmtTot	= searchResultSN[s].getValue({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"});
								var eligiForITC	= searchResultSN[s].getText({name: "custbody_yil_eligitc", summary: "GROUP"});
								/* var suppliername = searchResultSN[s].getValue({ name: "altname",
					 join: "vendor",
					 summary: "GROUP",
					 label: "Name"}); */
								var suppliername			= "";
								var isIndivCB		= searchResultSN[s].getValue({name: "isperson", join: "vendor", summary: "GROUP"});
								var compaName		= searchResultSN[s].getValue({name: "companyname", join: "vendor", summary: "GROUP"});
								var salutation		= searchResultSN[s].getValue({name: "salutation", join: "vendor", summary: "GROUP"});
								var firstNm			= searchResultSN[s].getValue({name: "firstname", join: "vendor", summary: "GROUP"});
								var middleNm		= searchResultSN[s].getValue({name: "middlename", join: "vendor", summary: "GROUP"});
								var lastNm			= searchResultSN[s].getValue({name: "lastname", join: "vendor", summary: "GROUP"});
								
								if(compaName) {compaName=compaName}else {compaName	= '';}
								if(salutation) {salutation=salutation}else {salutation	= '';}
								if(firstNm) {firstNm=firstNm}else {firstNm	= '';}
								if(middleNm) {middleNm=middleNm}else {middleNm	= '';}
								if(lastNm) {lastNm=lastNm}else {lastNm	= '';}

								if(!isIndivCB) {suppliername= compaName;}
								else {
									suppliername= salutation+" "+firstNm+" "+middleNm+" "+lastNm;
								}
								log.debug({title: "Inside B2B suppliername", details: suppliername});
								
					 
					 
								log.debug({title:"eligiForITC", details:eligiForITC});
								if(eligiForITC == "Ineligible") {
									var availITCInteTax		= "0.00";
									var availITCCentralTax 	= "0.00";
									var availITCStateTax	= "0.00";
									var availITCCess 		= "0.00";
								}
								else {
									var availITCInteTax		= inteTaxPaid;
									var availITCCentralTax 	= cetrTaxPaid;
									var availITCStateTax	= stateTaxPaid;
									var availITCCess 		= cessAmtTot;
								}
								if(eligiForITC == "- None -" || !eligiForITC) {
									eligiForITC	= '';
								}
								if(suppliername == "- None -" || !suppliername) {
									suppliername	= '';
								}

								htmlObj1 +="<tr>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+gstId+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+suppliername+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+noteRefNum+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+noteRefDate+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'></td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'></td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+preGST+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+docType+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+docReason+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+suppType+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+noteRefVal+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+rate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+taxValue+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+inteTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cetrTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+stateTaxPaid+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmtTot+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+eligiForITC+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCInteTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCCentralTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCStateTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCCess+"</td>";
								htmlObj1 +="</tr>";

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+gstId+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+suppliername+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+noteRefNum+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+noteRefDate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String"></Data></Cell>'+
								'<Cell><Data ss:Type="String"></Data></Cell>'+
								'<Cell><Data ss:Type="String">'+preGST+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+docType+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+docReason+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+suppType+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+noteRefVal+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+rate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+taxValue+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+inteTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cetrTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+stateTaxPaid+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmtTot+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+eligiForITC+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCInteTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCCentralTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCStateTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+availITCCess+'</Data></Cell>'+'</Row>';
							}
						}
						// increase pointer
						resultIndexSN = resultIndexSN + resultStepSN;
					} while (searchResultSN.length > 0);

				}

				else {
					htmlObj1 +="<tr>";
					htmlObj1 +="<td colspan='15'>No records to show.</td>";
					htmlObj1 +="</tr>";

					excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
				}
				htmlObj1 +='</tbody>';
				htmlObj1 +='</table>';
				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });

			}
			else if(reqObj.parameters.keyword == "CDNUR") {   
				log.debug({title: "Inside cdnur Report", details: "Entered"});
				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];

				billFilter.push([
					["type","anyof","VendCred"], 
					"AND", 
					["mainline","is","F"], 
					"AND", 
					["taxline","is","F"], 
					"AND", 
					["cogs","is","F"], 
					"AND", 
					["shipping","is","F"], 
					"AND", 
					["custbody_gst_customerregno","isempty",""], 
					"AND", 
					["item.name","doesnotcontain","Rounding Off"],
					"AND",
					["item.name","doesnotcontain","Round Off"],
					"AND",
					["item.name","doesnotcontain","Round"], 
					//"AND", 
					//["subsidiary.internalidnumber","equalto",subsidiaryId],
					// "AND", 
					// ["status","noneof","VendBill:C","VendBill:D","VendBill:E"], 
					"AND", 
					[[["custbody_gst_inv_type","anyof","1"],"AND",["custbody_gst_customerregno","isempty",""]],"OR",["custbody_gst_inv_type","anyof","2","3"]]
					]);

				if(subsidiaryId) {
					billFilter.push("AND");
					billFilter.push(["subsidiary.internalidnumber","equalto", subsidiaryId]);
				}
				if(secAccBook) {
					billFilter.push("AND");
					billFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}
				
				if(custObj) {
					billFilter.push("AND");
					billFilter.push(["entity", "is", custObj]);
					//billFilter.push(search.createFilter("entityid","customermain","is",custObj));
				}

				if(locationObj) {
					billFilter.push("AND");
					billFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					billFilter.push("AND");
					billFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}

				if(postingPeriodId) {
					billFilter.push("AND");
					billFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push("AND");
						billFilter.push([dateIntId, "within", fromDate, toDate]);
					}
					else {
						billFilter.push("AND"); 
						billFilter.push([dateIntId, "within", currFromDate, currToDate]);
					}
				}
				
				billColumn.push(search.createColumn({name: "custbody_gst_pre_gst", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_doc_num", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_gsttype", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "taxamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "amount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_cgstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_sgstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custbody_yil_eligitc", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_onfv_num", summary: "MIN"}));
				billColumn.push(search.createColumn({name: "custbody_gst_onfv_dt", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_nrv_value", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_yil_creditreason", summary: "GROUP"}));
				/* billColumn.push( search.createColumn({
					 name: "altname",
					 join: "vendor",
					 summary: "GROUP",
					 label: "Name"
				  })); */
				 //Added On 19 th September 2022 for vendor name(Individual or company)
				billColumn.push(search.createColumn({name: "isperson", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "companyname", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "salutation", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "firstname", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "middlename", join: "vendor", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "lastname", join: "vendor", summary: "GROUP"}));

				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
					billColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
				}

				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				var searchObj = search.create({type:"vendorcredit",filters: billFilter, columns: billColumn, settings: billSetting});
				var searchCount = searchObj.runPaged().count;
				log.debug({title: "Search count For CDNUR", details: searchCount});
				var htmlObj1  ='';
				var htmlStr   ='';
				var excelObj  ='';

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Supplier Name</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Note/Voucher Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Note/Voucher date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill/Advance Payment Voucher number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill/Advance Payment Voucher date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Pre GST</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Document Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Reason For Issuing document</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Supply Type</th>';
				//htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Bill Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Note/Voucher Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Integrated Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Central Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">State/UT Tax Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Eligibility For ITC</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Integrated Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Central Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC State/UT Tax</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Availed ITC Cess</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';

				if(searchCount != 0)
				{
					do {
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0)
						{
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN )
							{
								var preGST		= searchResultSN[s].getValue({name: "custbody_gst_pre_gst", summary: "GROUP"});
								var docType		= searchResultSN[s].getValue({name: "custbody_gst_doc_num", summary: "GROUP"});
								var suppType	= searchResultSN[s].getText({name: "custbody_gst_gsttype", summary: "GROUP"});
								var billType	= searchResultSN[s].getValue({name: "custbody_gst_inv_type", summary: "GROUP"});
								var rate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});
								if(!secAccBook){
								//	var taxValue	= searchResultSN[s].getValue({name: "taxamount", function: "absoluteValue", summary: "SUM"});
									var taxValue	= searchResultSN[s].getValue({name: "amount", function: "absoluteValue", summary: "SUM"});
								}
								if(secAccBook){								
									var billValue		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxValue		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula:"{accountingtransaction.exchangerate}*{fxamount}"});
								}
								var inteTaxPaid	= searchResultSN[s].getValue({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"});
								var cetrTaxPaid	= searchResultSN[s].getValue({name: "custcol_gst_cgstamount", function: "absoluteValue", summary: "SUM"});
								var stateTaxPaid= searchResultSN[s].getValue({name: "custcol_gst_sgstamount", function: "absoluteValue", summary: "SUM"});
								var noteRefNum  = searchResultSN[s].getValue({name: "custbody_gst_onfv_num", summary: "MIN"});
								var noteRefDate = searchResultSN[s].getValue({name: "custbody_gst_onfv_dt", summary: "GROUP"});
								var noteRefVal	= searchResultSN[s].getValue({name: "custbody_gst_nrv_value", summary: "GROUP"});
								var docReason	= searchResultSN[s].getValue({name: "custbody_yil_creditreason", summary: "GROUP"});
								var cessAmtTot	= searchResultSN[s].getValue({name: "custbody_gst_cess_amount_total", function: "absoluteValue", summary: "SUM"});
								var eligiForITC	= searchResultSN[s].getText({name: "custbody_yil_eligitc", summary: "GROUP"});
								//add on 30 june 2022 by Shivani to add vendor name column
								/* var suppliername=searchResultSN[s].getValue({ name: "altname",
								 join: "vendor",
								 summary: "GROUP",
								 label: "Name"});
								log.debug({title:"eligiForITC", details:eligiForITC}); */
								
								var suppliername	= "";
								var isIndivCB		= searchResultSN[s].getValue({name: "isperson", join: "vendor", summary: "GROUP"});
								var compaName		= searchResultSN[s].getValue({name: "companyname", join: "vendor", summary: "GROUP"});
								var salutation		= searchResultSN[s].getValue({name: "salutation", join: "vendor", summary: "GROUP"});
								var firstNm			= searchResultSN[s].getValue({name: "firstname", join: "vendor", summary: "GROUP"});
								var middleNm		= searchResultSN[s].getValue({name: "middlename", join: "vendor", summary: "GROUP"});
								var lastNm			= searchResultSN[s].getValue({name: "lastname", join: "vendor", summary: "GROUP"});
								
								if(compaName) {compaName=compaName}else {compaName	= '';}
								if(salutation) {salutation=salutation}else {salutation	= '';}
								if(firstNm) {firstNm=firstNm}else {firstNm	= '';}
								if(middleNm) {middleNm=middleNm}else {middleNm	= '';}
								if(lastNm) {lastNm=lastNm}else {lastNm	= '';}

								if(!isIndivCB) {suppliername= compaName;}
								else {
									suppliername= salutation+" "+firstNm+" "+middleNm+" "+lastNm;
								}
								log.debug({title: "Inside B2B suppliername", details: suppliername});
								
								
								if(eligiForITC == "Ineligible") {
									var availITCInteTax		= "0.00";
									var availITCCentralTax 	= "0.00";
									var availITCStateTax	= "0.00";
									var availITCCess 		= "0.00";
								}
								else {
									var availITCInteTax		= inteTaxPaid;
									var availITCCentralTax 	= cetrTaxPaid;
									var availITCStateTax	= stateTaxPaid;
									var availITCCess 		= cessAmtTot;
								}
								if(eligiForITC == "- None -" || !eligiForITC) {
									eligiForITC	= '';
								}
								if(suppliername == "- None -" ||!suppliername) {
									suppliername	= '';
								}
								htmlObj1 +='<tr>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+suppliername+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+noteRefNum+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+noteRefDate+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;"></td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;"></td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+preGST+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+docType+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+docReason+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+suppType+'</td>';
								//htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+billType+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+noteRefVal+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+rate+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+taxValue+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+inteTaxPaid+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cetrTaxPaid+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+stateTaxPaid+'</td>';
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmtTot+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+eligiForITC+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCInteTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCCentralTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCStateTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+availITCCess+"</td>";
								htmlObj1 +='</tr>';

								excelObj +='<Row>' +
								'<Cell><Data ss:Type="String">'+suppliername+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+noteRefNum+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+noteRefDate+'</Data></Cell>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'<Cell><Data ss:Type="String">'+preGST+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+docType+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+docReason+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+suppType+'</Data></Cell>' +
								//'<Cell><Data ss:Type="String">'+billType+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+noteRefVal+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+rate+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+taxValue+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+inteTaxPaid+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+cetrTaxPaid+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+stateTaxPaid+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+cessAmtTot+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+eligiForITC+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+availITCInteTax+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+availITCCentralTax+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+availITCStateTax+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+availITCCess+'</Data></Cell>' +
								'</Row>';

							}
						}
						// increase pointer
						resultIndexSN = resultIndexSN + resultStepSN;
					}while (searchResultSN.length > 0);

				}
				else {
					htmlObj1 +="<tr>";
					htmlObj1 +="<td colspan='15'>No records to show.</td>";
					htmlObj1 +="</tr>";

					excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
				}
				htmlObj1 +='<tbody>';
				htmlObj1 +='</table>';
				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });

			}
			else if(reqObj.parameters.keyword == "AT") {
				log.debug({title: "Inside at Report", details: "Entered"});
				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];

				billFilter.push([
					["shipping","is","F"], 
					"AND", 
					["mainline","is","F"], 
					"AND", 
					["taxline","is","F"], 
					//"AND", 
					//["subsidiary.internalidnumber","equalto",subsidiaryId],
					"AND", 
					["item.name","doesnotcontain","Rounding Off"],
					"AND",
					["item.name","doesnotcontain","Round Off"],
					"AND",
					["item.name","doesnotcontain","Round"], 
					"AND", 
					["status","noneof","VendPymt:A","VendPymt:D","VendBill:C"]
					]);
				
				if(subsidiaryId) {
					billFilter.push("AND");
					billFilter.push(["subsidiary.internalidnumber","equalto", subsidiaryId]);
				}
				if(secAccBook) {
					billFilter.push("AND");
					billFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}
				
				if(custObj) {
					billFilter.push("AND");
					billFilter.push(["entity", "is", custObj]);
					//billFilter.push(search.createFilter("entityid","customermain","is",custObj));
				}

				if(locationObj) {
					billFilter.push("AND");
					billFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					billFilter.push("AND");
					billFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}
				if(postingPeriodId) {
					billFilter.push("AND");
					billFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push("AND");
						billFilter.push([dateIntId, "within", fromDate, toDate]);
					}
					else {
						billFilter.push("AND"); 
						billFilter.push([dateIntId, "within", currFromDate, currToDate]);
					}
				}

				billColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custbody_gst_gsttype", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custcol_gst_cess_amount", function: "absoluteValue", summary: "SUM"}));
				
				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
					billColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
				}

				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				var searchObj = search.create({type:"vendorbill",filters: billFilter, columns: billColumn, settings: billSetting});

				var searchCount = searchObj.runPaged().count;
				log.debug({title: "Search count For AT", details: searchCount});
				var htmlObj1	='';
				var excelObj	='';

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Place Of Supply</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Supply Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Gross Advance Paid</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';
				//No need of this report as we are not using advance adju. in netsuite
				if(false)//searchCount != 0
				{
					do
					{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0)
							htmlObj1 +='<tbody>';
						{
							for(var s in searchResultSN )
							{
								if(secAccBook){
									var billValue		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxValue		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}
								var plcOfSupply = searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var suppType	= searchResultSN[s].getText({name: "custbody_gst_gsttype", summary: "GROUP"});
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", function: "absoluteValue", summary: "SUM"});
								
								if(plcOfSupply == "- None -" || !plcOfSupply) {
									plcOfSupply	= '';
								}
								if(suppType == "- None -" || !suppType) {
									suppType	= '';
								}

								htmlObj1 +='<tr>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+plcOfSupply+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+suppType+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;"></td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
								htmlObj1 +='</tr>';

								excelObj +='<Row>' +
								'<Cell><Data ss:Type="String">'+plcOfSupply+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+suppType+'</Data></Cell>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>' +'</Row>';
							}
						}
						// increase pointer
						resultIndexSN = resultIndexSN + resultStepSN;

					}       while (searchResultSN.length > 0);

				}
				else {
					htmlObj1 +="<tr>";
					htmlObj1 +="<td colspan='15'>No records to show.</td>";
					htmlObj1 +="</tr>";

					excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
				}
				htmlObj1 +='</tbody>';
				htmlObj1 +='</table>';
				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });

			}
			else if(reqObj.parameters.keyword=="ATADJ") {
				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];
				
				if(secAccBook) {
					billFilter.push(search.createFilter({name: "accountingtransaction.accountingbook", operator: search.Operator.ANYOF, values: secAccBook}));
				}
				
				if(custObj) {
					billFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}

				if(locationObj) {
					billFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}

				if(gstTypeObj) {
					billFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}
				if(postingPeriodId) {
					billFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push(search.createFilter({name: dateIntId, operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
					}
					else {
						billFilter.push(search.createFilter({name: dateIntId, operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
					}
				}

				billFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
				billFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
				billFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
				//billFilter.push(search.createFilter({name: "internalid", join: "subsidiary",  operator: search.Operator.IS, values: subsidiaryId}));
				if(subsidiaryId){
					billFilter.push(search.createFilter({name: "internalid", join: "subsidiary",  operator: search.Operator.IS, values: subsidiaryId}));
				}
				billColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));	
				billColumn.push(search.createColumn({name: "custbody_gst_gsttype", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "custcol_gst_cess_amount", function: "absoluteValue", summary: "SUM"}));
				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
					billColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
				}

				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				var searchObjCrdMemo = search.create({type:"vendorbill",filters: billFilter, columns: billColumn, settings: billSetting});
				var searchCount = searchObjCrdMemo.runPaged().count;
				log.debug('searchCountCDNUR ATADJ',searchCount);

				var htmlObj1  ='';
				var excelObj  ='';
				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Place Of Supply</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Supply Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Gross Advance Paid to be Adjusted</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Adjusted</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';
				//No need of this report as we are not using advance adju. in netsuite
				if(false)//searchCount != 0
				{
					do
					{
						var searchResultSN = searchObjCrdMemo.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						if(searchResultSN.length > 0)
						{
							for(var s in searchResultSN )
							{
								if(secAccBook){
									var billValue		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxValue		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}
								var plcOfSupply = searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var suppType	= searchResultSN[s].getText({name: "custbody_gst_gsttype", summary: "GROUP"});
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", function: "absoluteValue", summary: "SUM"});
								
								if(plcOfSupply == "- None -" || !plcOfSupply) {
									plcOfSupply	= '';
								}
								if(suppType == "- None -" || !suppType) {
									suppType	= '';
								}
								

								htmlObj1 +='<tr>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+plcOfSupply+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+suppType+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;"></td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
								htmlObj1 +='</tr>';

								excelObj +='<Row>' +
								'<Cell><Data ss:Type="String">'+plcOfSupply+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+suppType+'</Data></Cell>' +
								'<Cell><Data ss:Type="String"></Data></Cell>' +                         
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>' +'</Row>';

							}
						}
						// increase pointer
						resultIndexSN = resultIndexSN + resultStepSN;
					}     while (searchResultSN.length > 0);

				}
				else {
					htmlObj1 +="<tr>";
					htmlObj1 +="<td colspan='15'>No records to show.</td>";
					htmlObj1 +="</tr>";

					excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
				}
				htmlObj1 +='</table>';	
				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });
			}
			else if(reqObj.parameters.keyword=="EXEMPT") {
				log.debug({title: "Inside exempt Report", details: "Entered"});
				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];
				
				if(secAccBook) {
					billFilter.push(search.createFilter({name: "accountingtransaction.accountingbook", operator: search.Operator.ANYOF, values: secAccBook}));
				}

				if(custObj) {
					billFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}

				if(locationObj) {
					billFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}

				if(gstTypeObj) {
					billFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}
				if(postingPeriodId) {
					billFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push(search.createFilter({name: dateIntId, operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
					}
					else {
						billFilter.push(search.createFilter({name: dateIntId, operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
					}
				}

				billFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
				billFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
				billFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
				if(subsidiaryId){
					billFilter.push(search.createFilter({name: "internalid", join: "subsidiary",  operator: search.Operator.IS, values: subsidiaryId}));
			    }
				
				//Commented by Nikita S on 12th Dec 2022 filter parameter seems wrong
				//billFilter.push(search.createFilter({name: "custitem_gst_item_applicable_type", join: "item",  operator: search.Operator.IS, values: subsidiaryId}));
			

				billColumn.push(search.createColumn({name: "custbody_gst_gsttype",summary: "GROUP",label: "Description"}));	
				billColumn.push(search.createColumn({name: "formulanumeric",summary: "SUM",formula: "CASE WHEN {shippingaddress.custrecord_gst_registration_type} = 'GST Composition Taxable' THEN {amount} END",label: "Formula (Numeric)"}));	
				billColumn.push(search.createColumn({name: "formulanumeric",summary: "SUM",formula: "CASE WHEN {item.custitem_gst_item_applicable_type} = ' Nil Rated' THEN {amount} END",label: "Formula (Numeric)"}));	
				billColumn.push(search.createColumn({name: "formulanumeric",summary: "SUM",formula: "CASE WHEN {item.custitem_gst_item_applicable_type} = ' GST Exempted' THEN {amount} END",label: "Formula (Numeric)"}));	
				billColumn.push(search.createColumn({name: "formulanumeric",summary: "SUM",formula: "CASE WHEN {item.custitem_gst_item_applicable_type} = '  Non-GST' THEN {amount} END",label: "Formula (Numeric)"}));	
				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
					billColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
				}

				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				var searchObjCrdMemo = search.create({type:"vendorbill",filters: billFilter, columns: billColumn, settings: billSetting});
				var searchCount = searchObjCrdMemo.runPaged().count;
				log.debug('searchCountCDNURA EXEMPT',searchObjCrdMemo.runPaged().count);

				var htmlObj1  ='';
				var excelObj ='';

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Description</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Composition taxable person</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Nil Rated Supplies</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Exempted (other than nil rated/non GST supply )</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Non-GST supplies</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';
				if(searchCount != 0)
				{
					do
					{
						var searchResultSN = searchObjCrdMemo.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						if(searchResultSN.length > 0)
						{
							for(var s in searchResultSN )
							{
								if(secAccBook){
									var billValue		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxValue		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}
								var description		= searchResultSN[s].getText({name: "custbody_gst_gsttype",summary: "GROUP",label: "Description"});
								var compTaxPer		= searchResultSN[s].getText({name: "formulanumeric",summary: "SUM",formula: "CASE WHEN {shippingaddress.custrecord_gst_registration_type} = 'GST Composition Taxable' THEN {amount} END",label: "Formula (Numeric)"});
								var nilRatedSupp	= searchResultSN[s].getText({name: "formulanumeric",summary: "SUM",formula: "CASE WHEN {item.custitem_gst_item_applicable_type} = ' Nil Rated' THEN {amount} END",label: "Formula (Numeric)"});
								var exempted		= searchResultSN[s].getText({name: "formulanumeric",summary: "SUM",formula: "CASE WHEN {item.custitem_gst_item_applicable_type} = ' GST Exempted' THEN {amount} END",label: "Formula (Numeric)"});
								var nonGstSupp		= searchResultSN[s].getText({name: "formulanumeric",summary: "SUM",formula: "CASE WHEN {item.custitem_gst_item_applicable_type} = '  Non-GST' THEN {amount} END",label: "Formula (Numeric)"});
								
								log.debug("compTaxPer =========",compTaxPer);
								
								//Added by Nikita S on 23rd Dec 2022
								if(description == "- None -" || !description ) {
									description	= '';
								}
								if(compTaxPer == "- None -"||!compTaxPer) {
									compTaxPer	= '';
								}
								if(nilRatedSupp == "- None -" || !nilRatedSupp) {
									nilRatedSupp	= '';
								}
								if(exempted == "- None -" || !exempted) {
									exempted	= '';
								}
								if(nonGstSupp == "- None -" || !nonGstSupp) {
									nonGstSupp	= '';
								}

								htmlObj1 +='<tr>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+description+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+compTaxPer+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+nilRatedSupp+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+exempted+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+nonGstSupp+'</td>';
								htmlObj1 +='</tr>';     

								excelObj +='<Row>' +
								'<Cell><Data ss:Type="String">'+description+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+compTaxPer+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+nilRatedSupp+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+exempted+'</Data></Cell>' +     
								'<Cell><Data ss:Type="String">'+nonGstSupp+'</Data></Cell>' +'</Row>';

							}
						}
						// increase pointer
						resultIndexSN = resultIndexSN + resultStepSN;
					}while (searchResultSN.length > 0);

				}
				else {
					htmlObj1 +="<tr>";
					htmlObj1 +="<td colspan='15'>No records to show.</td>";
					htmlObj1 +="</tr>";

					excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
				}
				htmlObj1 +='</table>';
				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });
			} 
			else if(reqObj.parameters.keyword == "ITCR") {

				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];
                
				if(secAccBook) {
					billFilter.push(search.createFilter({name: "accountingtransaction.accountingbook", operator: search.Operator.ANYOF, values: secAccBook}));
				}
				
				if(custObj) {
					billFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}

				if(locationObj) {
					billFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}

				if(gstTypeObj) {
					billFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}
				
				if(postingPeriodId) {
					billFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push(search.createFilter({name: dateIntId, operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
					}
					else {
						billFilter.push(search.createFilter({name: dateIntId, operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
					}
				}

				billFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
				billFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
				billFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
				if(subsidiaryId){
					billFilter.push(search.createFilter({name: "internalid", join: "subsidiary",  operator: search.Operator.IS, values: subsidiaryId}));
				}
				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
					billColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
				}

				/*billColumn.push(search.createColumn({name: "custbody_gst_customerregno"}));
				billColumn.push(search.createColumn({name: "trandate"}));
				billColumn.push(search.createColumn({name: "tranid"}));
				billColumn.push(search.createColumn({name: "custcol_gst_reversal_line"}));
				billColumn.push(search.createColumn({name: "entity"}));
				billColumn.push(search.createColumn({name: "rate"}));
				billColumn.push(search.createColumn({name: "amount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "type"}));
				billColumn.push(search.createColumn({name: "custbody_gst_place_of_supply"}));
				billColumn.push(search.createColumn({name: "custbody_gst_tax_rate"}));
				billColumn.push(search.createColumn({name: "custbody_gst_inv_type"}));
				billColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin"}));
				billColumn.push(search.createColumn({name: "rate", join: "taxItem"}));
				billColumn.push(search.createColumn({name: "taxamount", function: "absoluteValue", summary: "SUM"}));
				 */
				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				var searchObj = search.create({type:"vendorbill",filters: billFilter, columns: billColumn, settings: billSetting});
				var searchCount = 0;//searchObj.runPaged().count;
				log.debug('searchCount ITCS',searchCount);
				//var searchRange =search_result.run().getRange({start:0,end:1000});	
				var htmlObj1  ='';
				var excelObj ='';
				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Description for reversal of ITC</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">To be added or reduced from output liability</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">ITC Integrated Tax Amount</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">ITC Central Tax Amount</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">ITC State/UT Tax Amount</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">ITC Cess Amount</th>';
				htmlObj1 += '</tr>';
				htmlObj1 += '</thead>';
				htmlObj1 += '<tbody>';
				if(false)//searchCount != 0
				{
					do
					{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						if(searchResultSN.length > 0)
						{
							for(var s in searchResultSN )
							{
								if(secAccBook){
									var billValue		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxValue		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}

								htmlObj1 +='<tr>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;"></td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;"></td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;"></td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;"></td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;"></td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">0.00</td>';
								htmlObj1 +='</tr>';

								excelObj +='<Row>'+'<Cell><Data ss:Type="String"></Data></Cell>'+
								'<Cell><Data ss:Type="String"></Data></Cell>'+
								'<Cell><Data ss:Type="String"></Data></Cell>'+
								'<Cell><Data ss:Type="String"></Data></Cell>'+
								'<Cell><Data ss:Type="String"></Data></Cell>'+
								'<Cell><Data ss:Type="String">0.00</Data></Cell></Row>';
							}	
						}	
						// increase pointer
						resultIndexSN = resultIndexSN + resultStepSN;

					}  
					while (searchResultSN.length > 0);


				}
				else {
					htmlObj1 +="<tr>";
					htmlObj1 +="<td colspan='15'>No records to show.</td>";
					htmlObj1 +="</tr>";

					excelObj += '<Row>'+'<Cell><Data ss:Type="String">No records to show.</Data></Cell></Row>';
				}
				htmlObj1 +='</table>';
				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });
			}
			else if(reqObj.parameters.keyword == "HSNSUM") {

				var billFilter	= [];
				var billColumn	= [];
				var billSetting	= [];
                
				if(secAccBook) {
					billFilter.push(search.createFilter({name: "accountingtransaction.accountingbook", operator: search.Operator.ANYOF, values: secAccBook}));
				}
				
				if(custObj) {
					billFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}

				if(locationObj) {
					billFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}

				if(gstTypeObj) {
					billFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}

                if(postingPeriodId) {
					billFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}
				else if(!postingPeriodId){
					if(months && years) {
						billFilter.push(search.createFilter({name: dateIntId, operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
					}
					else {
						billFilter.push(search.createFilter({name: dateIntId, operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
					}
				}

				billFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
				billFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
				billFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
				billFilter.push(search.createFilter({name: "cogs", operator: search.Operator.IS, values: false}));
				billFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
				if(subsidiaryId){
					billFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: subsidiaryId}));
				}
				billFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
				billFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));

				billColumn.push(search.createColumn({name: "custcol_gst_hsnsaccode", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "memo", summary: "GROUP"}));
				billColumn.push(search.createColumn({name : "custcol_gst_uqc", summary: "GROUP"}));
				billColumn.push(search.createColumn({name: "quantity", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "total", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "taxamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_cgstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_sgstamount", function: "absoluteValue", summary: "SUM"}));
				billColumn.push(search.createColumn({name: "custcol_gst_cess_amount", function: "absoluteValue", summary: "SUM"}));
				if(secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Bill Value"}));
					billColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
				}
				if(!secAccBook){
					billColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value 
				}

				billSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				var searchObj = search.create({type:"vendorbill",filters: billFilter, columns: billColumn, settings: billSetting});
				var searchCount = searchObj.runPaged().count;
				log.debug('searchCount HSNSUM',searchCount);
				//var searchRange =search_result.run().getRange({start:0,end:1000});	
				var htmlObj1  ='';
				var excelObj ='';
				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">HSN</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Description</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">UQC</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Total Quantity</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Total Value</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Integrated Tax Amount</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Central Tax Amount</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">State/UT Tax Amount</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
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
								var hasCode		= searchResultSN[s].getValue({name: "custcol_gst_hsnsaccode", summary: "GROUP"});
								var description	= searchResultSN[s].getValue({name: "memo", summary: "GROUP"});
								var uqc			= searchResultSN[s].getText({name : "custcol_gst_uqc", summary: "GROUP"});
								var totalQuant	= searchResultSN[s].getValue({name: "quantity", function: "absoluteValue", summary: "SUM"});
								if(!secAccBook){
									var totalAmt	= searchResultSN[s].getValue({name: "total", function: "absoluteValue", summary: "SUM"});
									//var taxAmt		= searchResultSN[s].getValue({name: "taxamount", function: "absoluteValue", summary: "SUM"});
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}); 
								}
								if(secAccBook){
									var totalAmt		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}
								var igstAmt		= searchResultSN[s].getValue({name: "custcol_gst_igstamount", function: "absoluteValue", summary: "SUM"});
								var cgstAmt		= searchResultSN[s].getValue({name: "custcol_gst_cgstamount", function: "absoluteValue", summary: "SUM"});
								var sgstAmt		= searchResultSN[s].getValue({name: "custcol_gst_sgstamount", function: "absoluteValue", summary: "SUM"});
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", function: "absoluteValue", summary: "SUM"});
								
								if(uqc == "- None -") {
									uqc	= '';
								}
								

								htmlObj1 +='<tr>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+hasCode+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+description+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+uqc+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+totalQuant+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+totalAmt+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+taxAmt+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igstAmt+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgstAmt+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgstAmt+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
								htmlObj1 +='</tr>';

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+hasCode+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+description+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+uqc+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+totalQuant+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+totalAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+taxAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+igstAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cgstAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+sgstAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell></Row>';

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
				var finalString  = htmlObj1 + ":||:" + excelObj;
				context.response.write({output: finalString });
			}

			else {
				var form       				= serverWidget.createForm({title : 'GSTR - 2'});
				var scriptObj 				= runtime.getCurrentScript();
				var clientScriptPath		= scriptObj.getParameter({name: 'custscript_ygst_cli_script_path_r2'});
				log.debug({title: "clientScriptPath", details:clientScriptPath});
				form.clientScriptModulePath = ''+clientScriptPath+'';//'/SuiteScripts/GST Report Files/GSTR_2_Report_CLI.js';
				var isPostingPeriod = scriptObj.getParameter({name: 'custscript_ygst_posting_period'});
				log.debug({title: "isPostingPeriod==", details:isPostingPeriod});

				var postingperiodId 	= reqObj.parameters.postingperionID;
				log.debug({title: " from client script postingperiodId : ", details: postingperiodId});
				var monthId 	= reqObj.parameters.monthID;
				log.debug({title: " monthId : ", details: monthId});		
				var yearId 		= reqObj.parameters.yearID;
				log.debug({title: " yearId inside get: ", details: yearId});
				//var monthId 	= context.request.parameters.monthID;
				var custId		= context.request.parameters.custID;
				var locationId	= context.request.parameters.locationId;
				var gstTypeId	= context.request.parameters.gstType;
				var subsidiaryId	= context.request.parameters.subsidiaryID;

				//Body Level Fields
				var configRecObj = config.load({type: config.Type.FEATURES});
				var ebaFeatLocId = configRecObj.getValue({fieldId: "locations"});
				log.debug({title: "ebaFeatLocId", details: ebaFeatLocId});

				var exportButton		= form.addSubmitButton({id: 'custpage_export', label: "Export"});
				//var monthRange			= form.addField({id: 'custpage_month_range', label: "Month Range", type: serverWidget.FieldType.DATE});
				var customerField		= form.addField({id: 'custpage_customer', label: "Vendor", type: serverWidget.FieldType.SELECT, source: 'vendor'});
				if(ebaFeatLocId) {
					var locatonField	= form.addField({id: 'custpage_location', label: "Location", type: serverWidget.FieldType.SELECT, source: 'location'});
				}
				var gstType				= form.addField({id: 'custpage_gat_type', label: 'GST Type', type: serverWidget.FieldType.SELECT, source: 'customlist_gst_type'});
				var subsidiaryField		= form.addField({id: 'custpage_subsidiary', label: "Subsidiary", type: serverWidget.FieldType.SELECT, source: 'subsidiary'});
				if(isPostingPeriod==true || isPostingPeriod=='true'){					

					//var postingPeriodField		= form.addField({id: 'custpage_posting_period', label: "Posting Period", type: serverWidget.FieldType.SELECT, source: 'accountingperiod'});
					var postingPeriodField		= form.addField({id: 'custpage_posting_period', label: "Posting Period", type: serverWidget.FieldType.SELECT});
					postingPeriodField.addSelectOption({value: '',text: ''}); 
					//var periodSearch = search.load({id: 'customsearch_ygst_posting_period'});

					var periodSearch = search.create({ type: "accountingperiod",
						filters:
							[
								["isquarter","is","F"],"AND", ["isyear","is","F"], "AND",  ["isinactive","is","F"]/*, "AND", ["startdate","on",currFirstDay], "AND",["enddate","on",currLastDay]*/
								],
								columns:
									[
										search.createColumn({name: "internalid",sort: search.Sort.ASC,label: "Internal ID"}),
										search.createColumn({name: "periodname", label: "Name"})
										]
					});

					var periodSearchResultCount = periodSearch.runPaged().count;
					log.debug("onRequest","periodSearchResultCount =="+periodSearchResultCount);

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
					var monthRange 			= form.addField({id: 'custpage_month_range', label: "Month", type: serverWidget.FieldType.SELECT});
					var yearRange 			= form.addField({id: 'custpage_year_range', label: "Year", type: serverWidget.FieldType.SELECT});
					setMonthYearData(monthRange,yearRange);
				}
				var searchButton		= form.addButton({id: 'custpage_search', label: "Search", functionName: "fieldData()"});

				var currentDateObj		= new Date();
				var month 				= currentDateObj.getMonth();
				var year				= currentDateObj.getFullYear();
				var currFirstDateObj	= new Date(year, month, 1); 
				//monthRange.defaultValue	= currFirstDateObj;

				if(postingperiodId){
					postingPeriodField.defaultValue	= postingperiodId;
				}
				if(monthId) {
					monthRange.defaultValue	= monthId;
				}
				if(yearId) {
					yearRange.defaultValue	= yearId;
				}
				if(custId) {
					customerField.defaultValue	= custId;
				}
				if(locationId) {
					locatonField.defaultValue	= locationId;
				}
				if(gstTypeId) {
					gstType.defaultValue		= gstTypeId;
				}
				if(subsidiaryId) {
					subsidiaryField.defaultValue		= subsidiaryId;
				}

				var params = {};
				if(postingperiodId){
					params.postingPeriodId = postingperiodId;
				}
				if(monthId) {
					params.monthId = monthId;
				}
				if(yearId) {
					params.yearId	= yearId;
				}
				if(custId) {
					params.custId = custId;
				}
				if(locationId) {
					params.locationId = locationId;
				}
				if(gstTypeId) {
					params.gstTypeId = gstTypeId;
				}
				if(subsidiaryId) {
					params.subsidiaryId = subsidiaryId;
				}

				var scriptObj = runtime.getCurrentScript(); //scriptObj is a runtime.Script object
				var scriptId = scriptObj.id;
				var deploymentId = scriptObj.deploymentId;
				log.debug('Script ID: ' + scriptObj.id);
				log.debug("Deployment Id: " + scriptObj.deploymentId);
				var suiteletURL = url.resolveScript({scriptId:scriptId,deploymentId: deploymentId, params:params });

				var report1B2B			= form.addSubtab({id: 'custpage_b2b_sublist', label: 'B2B'});
				var requestDataField1	= form.addField({id: 'custpage_req_ajax_date_r1', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_b2b_sublist'});
				var htmlFileR1			= form.addField({id: 'custpage_html_r1', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_b2b_sublist'});
				var excelFileR1			= form.addField({id: 'custpage_excel_r1', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_b2b_sublist'});

				var report1B2BUR		= form.addSubtab({id: 'custpage_b2bur_sublist', label: 'B2BUR'});
				var requestDataField2	= form.addField({id: 'custpage_req_ajax_date_r2', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_b2bur_sublist'});
				var htmlFileR2			= form.addField({id: 'custpage_html_r2', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_b2bur_sublist'});
				var excelFileR2			= form.addField({id: 'custpage_excel_r2', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_b2bur_sublist'});

				var report1IMPS			= form.addSubtab({id: 'custpage_imps_sublist', label: 'IMPS'});
				var requestDataField3	= form.addField({id: 'custpage_req_ajax_date_r3', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_imps_sublist'});
				var htmlFileR3			= form.addField({id: 'custpage_html_r3', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_imps_sublist'});
				var excelFileR3			= form.addField({id: 'custpage_excel_r3', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_imps_sublist'});

				var report1IMPG			= form.addSubtab({id: 'custpage_impg_sublist', label: 'IMPG'});
				var requestDataField4	= form.addField({id: 'custpage_req_ajax_date_r4', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_impg_sublist'});
				var htmlFileR4			= form.addField({id: 'custpage_html_r4', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_impg_sublist'});
				var excelFileR4			= form.addField({id: 'custpage_excel_r4', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_impg_sublist'});

				var report1CDNR			= form.addSubtab({id: 'custpage_cdnr_sublist', label: 'CDNR'});
				var requestDataField5	= form.addField({id: 'custpage_req_ajax_date_r5', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_cdnr_sublist'});
				var htmlFileR5			= form.addField({id: 'custpage_html_r5', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_cdnr_sublist'});
				var excelFileR5			= form.addField({id: 'custpage_excel_r5', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_cdnr_sublist'});

				var report1CDNUR		= form.addSubtab({id: 'custpage_cdnur_siblist', label: "CDNUR" });
				var requestDataField6	= form.addField({id: 'custpage_req_ajax_date_r6', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_cdnur_siblist'});
				var htmlFileR6			= form.addField({ id: 'custpage_html_r6', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_cdnur_siblist'});
				var excelFileR6  		= form.addField({id: 'custpage_excel_r6', type: serverWidget.FieldType.LONGTEXT,label: 'Print', container: 'custpage_cdnur_siblist'});

				var report1AT			= form.addSubtab({id: 'custpage_at_sublist', label: "AT" });
				var requestDataField7	= form.addField({id: 'custpage_req_ajax_date_r7', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_at_sublist'});
				var htmlFileR7 			= form.addField({id: 'custpage_html_r7', type: serverWidget.FieldType.INLINEHTML,  label: 'Export HTML' ,container:'custpage_at_sublist'});
				var excelFileR7			= form.addField({id: 'custpage_excel_r7', type: serverWidget.FieldType.LONGTEXT,   label: 'Print',      container: 'custpage_at_sublist'});

				var report1ATADJ		= form.addSubtab({id: 'custpage_atadj_sublist', label: "ATADJ" });
				var requestDataField8	= form.addField({id: 'custpage_req_ajax_date_r8', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_atadj_sublist'});
				var htmlFileR8 			= form.addField({id: 'custpage_html_r8', type: serverWidget.FieldType.INLINEHTML,  label: 'Export HTML' ,container:'custpage_atadj_sublist'});
				var excelFileR8			= form.addField({id: 'custpage_excel_r8', type: serverWidget.FieldType.LONGTEXT,   label: 'Print',      container: 'custpage_atadj_sublist'});

				var report1EXEMPT		= form.addSubtab({id: 'custpage_exempt_sublist', label: "EXEMPT"});
				var requestDataField9	= form.addField({id: 'custpage_req_ajax_date_r9', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_exempt_sublist'});
				var htmlFileR9 			= form.addField({id: 'custpage_html_r9',    type: serverWidget.FieldType.INLINEHTML,   label: 'Export HTML' ,container:'custpage_exempt_sublist'});            
				var excelFileR9			= form.addField({id: 'custpage_excel_r9',type: serverWidget.FieldType.LONGTEXT,   label: 'Print', container: 'custpage_exempt_sublist'});

				var report1ITCR    		= form.addSubtab({id: 'custpage_itcr_sublist', label: "ITCR" });
				var requestDataField10	= form.addField({id: 'custpage_req_ajax_date_r10', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_itcr_sublist'});
				var htmlFileR10 		= form.addField({id: 'custpage_html_r10',      type: serverWidget.FieldType.INLINEHTML,   label: 'Export HTML' ,container:'custpage_itcr_sublist'});            
				var excelFileR10  		= form.addField({id: 'custpage_excel_r10',   type: serverWidget.FieldType.LONGTEXT,   label: 'Print', container: 'custpage_itcr_sublist'});

				var report1HSNSUM  		= form.addSubtab({id: 'custpage_hsnsum_sublist', label: "HSNSUM" });
				var requestDataField11	= form.addField({id: 'custpage_req_ajax_date_r11', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_hsnsum_sublist'});
				var htmlFileR11 		= form.addField({id: 'custpage_html_r11',      type: serverWidget.FieldType.INLINEHTML,   label: 'Export HTML' ,container:'custpage_hsnsum_sublist'});            
				var excelFileR11  		= form.addField({id: 'custpage_excel_r11',   type: serverWidget.FieldType.LONGTEXT,   label: 'Print',       container: 'custpage_hsnsum_sublist'});

				htmlFileR1.defaultValue = '<h1>B2B</h1>';
				excelFileR1.defaultValue = '<h1>Excel Data</h1>';
				requestDataField1.defaultValue ='<script>var keyword_B2B  ="B2B"; const redirectURL_B2B  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_B2B,  method  :"GET", data:{keyword:keyword_B2B},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r1_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r1\').innerHTML = response[1];document.getElementById(\'custpage_excel_r1\').style.display = "none";document.getElementById(\'custpage_excel_r1_fs_lbl\').style.display = "none";} });</script>';

				htmlFileR2.defaultValue = '<h1>B2BUR</h1>';
				excelFileR2.defaultValue = '<h1>Excel Data</h1>';
				requestDataField2.defaultValue ='<script>var keyword_B2BUR  ="B2BUR"; const redirectURL_B2BUR  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_B2BUR,  method  :"GET", data:{keyword:keyword_B2BUR},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r2_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r2\').innerHTML = response[1];document.getElementById(\'custpage_excel_r2\').style.display = "none";document.getElementById(\'custpage_excel_r2_fs_lbl\').style.display = "none";} });</script>';

				htmlFileR3.defaultValue = '<h1>IMPS</h1>';
				excelFileR3.defaultValue = '<h1></h1>';
				requestDataField3.defaultValue ='<script>var keyword_IMPS  ="IMPS"; const redirectURL_IMPS  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_IMPS,  method  :"GET", data:{keyword:keyword_IMPS},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r3_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r3\').innerHTML = response[1];document.getElementById(\'custpage_excel_r3\').style.display = "none";document.getElementById(\'custpage_excel_r3_fs_lbl\').style.display = "none";} });	</script>';

				htmlFileR4.defaultValue = '<h1>IMPG</h1>';
				excelFileR4.defaultValue = '<h1></h1>';
				requestDataField4.defaultValue ='<script>var keyword_IMPG  ="IMPG"; const redirectURL_IMPG ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_IMPG,  method  :"GET", data:{keyword:keyword_IMPG},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r4_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r4\').innerHTML = response[1];document.getElementById(\'custpage_excel_r4\').style.display = "none";document.getElementById(\'custpage_excel_r4_fs_lbl\').style.display = "none";} });	</script>';

				htmlFileR5.defaultValue = '<h1>CDNR</h1>';
				excelFileR5.defaultValue = '<h1></h1>';
				requestDataField5.defaultValue ='<script>var keyword_CDNR ="CDNR"; const redirectURL_CDNR ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_CDNR,  method  :"GET", data:{keyword:keyword_CDNR},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r5_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r5\').innerHTML = response[1];document.getElementById(\'custpage_excel_r5\').style.display = "none";document.getElementById(\'custpage_excel_r5_fs_lbl\').style.display = "none";} });	</script>';

				htmlFileR6.defaultValue = '<h1>CDNUR</h1>';
				excelFileR6.defaultValue = '<h1></h1>';
				requestDataField6.defaultValue ='<script>var keyword_CDNUR ="CDNUR"; const redirectURL_CDNUR ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_CDNUR,  method  :"GET", data:{keyword:keyword_CDNUR},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r6_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r6\').innerHTML = response[1];document.getElementById(\'custpage_excel_r6\').style.display = "none";document.getElementById(\'custpage_excel_r6_fs_lbl\').style.display = "none";} });	</script>';

				htmlFileR7.defaultValue = '<h1>AT</h1>';
				excelFileR7.defaultValue = '<h1></h1>';
				requestDataField7.defaultValue ='<script>var keyword_AT ="AT"; const redirectURL_AT ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_AT,  method  :"GET", data:{keyword:keyword_AT},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r7_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r7\').innerHTML = response[1];document.getElementById(\'custpage_excel_r7\').style.display = "none";document.getElementById(\'custpage_excel_r7_fs_lbl\').style.display = "none";} });	</script>';

				htmlFileR8.defaultValue = '<h1>ATADJ</h1>';
				excelFileR8.defaultValue = '<h1></h1>';
				requestDataField8.defaultValue ='<script>var keyword_ATADJ ="ATADJ"; const redirectURL_ATADJ ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_ATADJ, method  :"GET", data:{keyword:keyword_ATADJ},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r8_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r8\').innerHTML = response[1];document.getElementById(\'custpage_excel_r8\').style.display = "none";document.getElementById(\'custpage_excel_r8_fs_lbl\').style.display = "none";} });	</script>';

				htmlFileR9.defaultValue = '<h1>EXEMPT</h1>';
				excelFileR9.defaultValue = '<h1></h1>';
				requestDataField9.defaultValue ='<script>var keyword_EXEMPT ="EXEMPT"; const redirectURL_EXEMPT ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_EXEMPT,  method  :"GET", data:{keyword:keyword_EXEMPT},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r9_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r9\').innerHTML = response[1];document.getElementById(\'custpage_excel_r9\').style.display = "none";document.getElementById(\'custpage_excel_r9_fs_lbl\').style.display = "none";} });	</script>';

				htmlFileR10.defaultValue = '<h1>ITCR</h1>';
				excelFileR10.defaultValue = '<h1></h1>';
				requestDataField10.defaultValue ='<script>var keyword_ITCR ="ITCR"; const redirectURL_ITCR ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_ITCR, method  :"GET", data:{keyword:keyword_ITCR}, success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r10_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r10\').innerHTML = response[1];document.getElementById(\'custpage_excel_r10\').style.display = "none";document.getElementById(\'custpage_excel_r10_fs_lbl\').style.display = "none";} });	</script>';

				htmlFileR11.defaultValue = '<h1>HSNSUM</h1>';
				excelFileR11.defaultValue = '<h1></h1>';
				requestDataField11.defaultValue ='<script>var keyword_HSNSUM ="HSNSUM"; const redirectURL_HSNSUM ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_HSNSUM, method  :"GET", data:{keyword:keyword_HSNSUM}, success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r11_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r11\').innerHTML = response[1];document.getElementById(\'custpage_excel_r11\').style.display = "none";document.getElementById(\'custpage_excel_r11_fs_lbl\').style.display = "none";} });	</script>';

				context.response.writePage({pageObject: form});
			}
			}catch(e){log.debug("Error In If", e);}
		}
		else {
			try{
			var xmlStr 			= '';
			var excelFileR1		= reqObj.parameters['custpage_excel_r1'];
			var excelFileR2		= reqObj.parameters['custpage_excel_r2'];
			var excelFileR3		= reqObj.parameters['custpage_excel_r3'];
			var excelFileR4		= reqObj.parameters['custpage_excel_r4'];
			var excelFileR5		= reqObj.parameters['custpage_excel_r5'];
			var excelFileR6		= reqObj.parameters['custpage_excel_r6'];
			var excelFileR7		= reqObj.parameters['custpage_excel_r7'];
			var excelFileR8		= reqObj.parameters['custpage_excel_r8'];
			var excelFileR9		= reqObj.parameters['custpage_excel_r9'];
			var excelFileR10	= reqObj.parameters['custpage_excel_r10'];
			var excelFileR11	= reqObj.parameters['custpage_excel_r11'];

			log.debug({title: "inside POST excelFileR9", details: excelFileR9});
			log.debug({title: "inside POST excelFileR11", details: excelFileR11});

			var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
			xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
			xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
			xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
			xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
			xmlStr += 'xmlns:htmlObj1="http://www.w3.org/TR/REC-html40">';

			xmlStr += '<Worksheet ss:Name="b2b">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">GSTIN of Supplier</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice Number</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice date</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Place Of Supply</Data></Cell>'+
			'<Cell><Data ss:Type="String">Reverse Charge</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice Type</Data></Cell>'+
			'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
			'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Integrated Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Central Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">State/UT Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Cess Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Eligibility For ITC</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Integrated Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Central Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC State/UT Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Cess</Data></Cell></Row>';	
			xmlStr += excelFileR1;

			xmlStr += '</Table></Worksheet>';

			xmlStr += '<Worksheet ss:Name="b2bur">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Supplier Name</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice Number</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice date</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Place Of Supply</Data></Cell>'+
			'<Cell><Data ss:Type="String">Supply Type</Data></Cell>'+
			'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
			'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Integrated Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Central Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">State/UT Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Cess Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Eligibility For ITC</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Integrated Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Central Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC State/UT Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Cess</Data></Cell></Row>';

			xmlStr += excelFileR2;
			xmlStr += '</Table></Worksheet>';

			xmlStr += '<Worksheet ss:Name="imps">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Invoice Number of Reg Recipient</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice Date</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Place Of Supply</Data></Cell>'+
			'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
			'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Integrated Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Cess Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Eligibility For ITC</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Integrated Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Cess</Data></Cell>'+'</Row>';
			xmlStr += excelFileR3;
			xmlStr += '</Table></Worksheet>';


			xmlStr += '<Worksheet ss:Name="impg">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Port Code</Data></Cell>'+
			'<Cell><Data ss:Type="String">Bill Of Entry Number</Data></Cell>'+
			'<Cell><Data ss:Type="String">Bill Of Entry Date</Data></Cell>'+
			'<Cell><Data ss:Type="String">Bill Of Entry Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Document type</Data></Cell>'+
			'<Cell><Data ss:Type="String">GSTIN Of SEZ Supplier</Data></Cell>'+
			'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
			'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Integrated Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Cess Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Eligibility For ITC</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Integrated Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Cess</Data></Cell>'+'</Row>';
			xmlStr += excelFileR4;
			xmlStr += '</Table></Worksheet>';

			xmlStr += '<Worksheet ss:Name="cdnr">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">GSTIN of Supplier</Data></Cell>'+
			'<Cell><Data ss:Type="String">Note/Refund Voucher Number</Data></Cell>'+
			'<Cell><Data ss:Type="String">Note/Refund Voucher date</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice/Advance Payment Voucher Number</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice/Advance Payment Voucher date</Data></Cell>'+
			'<Cell><Data ss:Type="String">Pre GST</Data></Cell>'+
			'<Cell><Data ss:Type="String">Document Type</Data></Cell>'+
			'<Cell><Data ss:Type="String">Reason For Issuing document</Data></Cell>'+
			'<Cell><Data ss:Type="String">Supply Type</Data></Cell>'+
			'<Cell><Data ss:Type="String">Note/Refund Voucher Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
			'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Integrated Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Central Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">State/UT Tax Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Cess Paid</Data></Cell>'+
			'<Cell><Data ss:Type="String">Eligibility For ITC</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Integrated Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Central Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC State/UT Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed ITC Cess</Data></Cell>'+'</Row>';

			xmlStr += excelFileR5;

			xmlStr += '</Table></Worksheet>';

			xmlStr += '<Worksheet ss:Name="cdnur">';
			xmlStr += '<Table>' + '<Row>' +
			'<Cell><Data ss:Type="String">Note/Voucher Number</Data></Cell>' +
			'<Cell><Data ss:Type="String">Note/Voucher date</Data></Cell>' +
			'<Cell><Data ss:Type="String">Invoice/Advance Payment Voucher number</Data></Cell>' +
			'<Cell><Data ss:Type="String">Invoice/Advance Payment Voucher date</Data></Cell>' +
			'<Cell><Data ss:Type="String">Pre GST</Data></Cell>' +
			'<Cell><Data ss:Type="String">Document Type</Data></Cell>' +
			'<Cell><Data ss:Type="String">Reason For Issuing document</Data></Cell>' +
			'<Cell><Data ss:Type="String">Supply Type</Data></Cell>' +
			'<Cell><Data ss:Type="String">Invoice Type</Data></Cell>' +
			'<Cell><Data ss:Type="String">Note/Voucher Value</Data></Cell>' +
			'<Cell><Data ss:Type="String">Rate</Data></Cell>' +
			'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>' +
			'<Cell><Data ss:Type="String">Integrated Tax Paid</Data></Cell>' +
			'<Cell><Data ss:Type="String">Central Tax Paid</Data></Cell>' +
			'<Cell><Data ss:Type="String">State/UT Tax Paid</Data></Cell>' +
			'<Cell><Data ss:Type="String">Cess Paid</Data></Cell>' +
			'<Cell><Data ss:Type="String">Eligibility For ITC</Data></Cell>' +
			'<Cell><Data ss:Type="String">Availed ITC Integrated Tax</Data></Cell>' +
			'<Cell><Data ss:Type="String">Availed ITC Central Tax</Data></Cell>' +
			'<Cell><Data ss:Type="String">Availed ITC State/UT Tax</Data></Cell>' +
			'<Cell><Data ss:Type="String">Availed ITC Cess</Data></Cell>' +
			'</Row>';

			xmlStr += excelFileR6;
			xmlStr += '</Table></Worksheet>';

			xmlStr += '<Worksheet ss:Name="at">';
			xmlStr += '<Table>'+'<Row>'+
			'<Cell><Data ss:Type="String">Place Of Supply</Data></Cell>' +
			'<Cell><Data ss:Type="String">Supply Type</Data></Cell>' +
			'<Cell><Data ss:Type="String">Gross Advance Paid</Data></Cell>' +
			'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>' +
			'</Row>';
			xmlStr += excelFileR7;
			xmlStr += '</Table></Worksheet>';	

			xmlStr += '<Worksheet ss:Name="atadj">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Place Of Supply</Data></Cell>' +
			'<Cell><Data ss:Type="String">Supply Type</Data></Cell>' +
			'<Cell><Data ss:Type="String">Gross Advance Paid to be Adjusted</Data></Cell>' +
			'<Cell><Data ss:Type="String">Cess Adjusted</Data></Cell>' +'</Row>';		
			xmlStr += excelFileR8;
			xmlStr += '</Table></Worksheet>';		

			xmlStr += '<Worksheet ss:Name="exempt">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Description</Data></Cell>' +
			'<Cell><Data ss:Type="String">Composition taxable person</Data></Cell>' +
			'<Cell><Data ss:Type="String">Nil Rated Supplies</Data></Cell>' +
			'<Cell><Data ss:Type="String">Exempted (other than nil rated/non GST supply )</Data></Cell>' +     
			'<Cell><Data ss:Type="String">Non-GST supplies</Data></Cell>' +'</Row>';
			xmlStr += excelFileR9;
			xmlStr += '</Table></Worksheet>';		

			xmlStr += '<Worksheet ss:Name="itcr">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Description for reversal of ITC</Data></Cell>'+
			'<Cell><Data ss:Type="String">To be added or reduced from output liability</Data></Cell>'+
			'<Cell><Data ss:Type="String">ITC Integrated Tax Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">ITC Central Tax Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">ITC State/UT Tax Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">ITC Cess Amount</Data></Cell></Row>';	

			xmlStr +=excelFileR10;
			xmlStr += '</Table></Worksheet>';	

			xmlStr += '<Worksheet ss:Name="hsnsum">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">HSN</Data></Cell>'+
			'<Cell><Data ss:Type="String">Description</Data></Cell>'+
			'<Cell><Data ss:Type="String">UQC</Data></Cell>'+
			'<Cell><Data ss:Type="String">Total Quantity</Data></Cell>'+
			'<Cell><Data ss:Type="String">Total Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Integrated Tax Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">Central Tax Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">State/UT Tax Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">Cess Amount</Data></Cell></Row>';	

			xmlStr += excelFileR11;
			xmlStr += '</Table></Worksheet>';									

			xmlStr += '</Workbook>';
			var fileName	= "GST_Report_2_"+new Date()+".xls";

			var encodedString	= encode.convert({string: xmlStr, inputEncoding: encode.Encoding.UTF_8, outputEncoding: encode.Encoding.BASE_64});
			var fileObj			= file.create({name: fileName, fileType: file.Type.EXCEL, contents: encodedString});
			context.response.writeFile({file: fileObj});
			}catch(e){log.debug("Error In else", e);}
		}
		//	}


	}

	function searchOnVendor(vendorId)
	{
		var gstRegType		= "";
		var vendorSearchObj = search.create({
			type: "vendor",
			filters:
				[
					["internalidnumber","equalto","1658"]
					],
					columns:
						[
							search.createColumn({name: "custrecord_gst_registration_type", join: "Address"}),
							search.createColumn({name: "firstname", label: "First Name"})
							]
		});
		var searchResultCount = vendorSearchObj.runPaged().count;
		log.debug("vendorSearchObj result count",searchResultCount);
		vendorSearchObj.run().each(function(result){
			gstRegType	= result.getText({name: "custrecord_gst_registration_type", join: "Address"});
			return true;
		});
		return gstRegType;
	}

	function _getSubsidiary()
	{
		var sub_Obj	= '';
		var customrecord_gst_setupSearchObj = search.create({
			type: "customrecord_gst_setup",
			filters:
				[
					["custrecord_gst_setup_subsidiary","noneof","@NONE@"]
					],
					columns:
						[
							search.createColumn({name: "custrecord_gst_setup_subsidiary", label: "Subsidiary"})
							]
		});
		var searchResultCount = customrecord_gst_setupSearchObj.runPaged().count;
		log.debug("customrecord_gst_setupSearchObj result count",searchResultCount);
		customrecord_gst_setupSearchObj.run().each(function(result){
			sub_Obj	= result.getValue({name: "custrecord_gst_setup_subsidiary", label: "Subsidiary"});
			return true;
		});
		return sub_Obj;
	}

	function setMonthYearData(monthRange,yearRange)
	{		
		var month;
		var currentDate = new Date();
		var monthNum = currentDate.getMonth();
		var yearText = currentDate.getFullYear();
		var previousYear = yearText-1;

		for(var i=0;i<12;i++) 
		{	
			switch(i) 
			{
			case 0: month = 'Jan';break;
			case 1: month = 'Feb';break;
			case 2: month = 'Mar';break;
			case 3: month = 'Apr';break;
			case 4: month = 'May';break;
			case 5: month = 'June';break;
			case 6: month = 'July';break;
			case 7: month = 'Aug';break;
			case 8: month = 'Sep';break;
			case 9: month = 'Oct';break;			
			case 10: month = 'Nov';break;
			case 11: month = 'Dec'

			}
			if(monthNum == i)
			{
				monthRange.addSelectOption({
					value : i,
					text : month,
					isSelected : true
				});
			}
			else
			{
				monthRange.addSelectOption({
					value : i,
					text : month
					//isSelected : true
				});
			}

		}//end for(var i=0;i<12;i++) 
		for(var k = 0;k<3;k++)
		{				
			yearRange.addSelectOption({
				value : Number(yearText - k),
				text : (yearText - k),
				//isSelected : true
			});	
		}

	}

	return {
		onRequest : onRequest
	}
});
