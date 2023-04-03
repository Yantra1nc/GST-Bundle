/**
 *@NApiVersion 2.0
 *@NScriptType SuiteLet
 *@NModuleScope SameAccount
 **/

/*************************************************************
 * File Header
 * Script Type: SuiteLet
 * Script Name: GST_ST_GSTR1
 * File Name  : GST_ST_GSTR1.js
 * Created On : 12/11/2019
 * Modified On: 13/08/2020
 * Created By : Siddhant (Yantra Inc.)
 * Modified By: Siddhant (Yantra Inc.)
 * Description: This scripts shows GSTR-1 reports.
 ************************************************************/

define(['N/record','N/ui/serverWidget', 'N/file', 'N/render', 'N/encode', 'N/redirect', 'N/https', 'N/url', 'N/search', 'N/format', 'N/config', 'N/runtime'], function(record, serverWidget, file, render, encode, redirect, https, url, search, format, config, runtime) {
	function onRequest(context) 
	{
		var configRecObj	= config.load({type: config.Type.USER_PREFERENCES});
		var dateFormatValue	= configRecObj.getValue({fieldId: 'DATEFORMAT'});
		var companyRecObj	= config.load({type: config.Type.COMPANY_PREFERENCES});
		var secAccBook	    = companyRecObj.getValue({fieldId: 'custscript_ygst_accounting_book'});
		//log.debug("secAccBook",secAccBook);
		var sub_id			= _getSubsidiary();
		log.debug({title: "Just Created sub_id", details:sub_id});
		var reqObj				= context.request;
		var reportgstr1_b2cl	= "B2CL";
		if(reqObj.method == 'GET') {
			try{
			//var monthObj 		= context.request.parameters.monthId;
			var postingPeriodId = context.request.parameters.postingPeriodId;
			var monthId 		= context.request.parameters.monthId;
			log.debug({title: " monthId : ", details: monthId});		
			var yearId 			= context.request.parameters.yearId;
			log.debug({title: " yearId : ", details: yearId});
			var custObj			= context.request.parameters.custId;
			var locationObj		= context.request.parameters.locationId;
			var gstTypeObj		= context.request.parameters.gstTypeId;
			var subsidiaryObj   = context.request.parameters.subsidiaryId;
			var gstIn           = reqObj.parameters.cust_gstin;
			//log.debug({title: " gstIn : ", details: gstIn});

			if(subsidiaryObj){
				log.debug({title: " subsidiaryObj : ", details: subsidiaryObj});
				sub_id = context.request.parameters.subsidiaryId;
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
				//var formateddate	= format.parse({value: monthObj, type: format.Type.DATE});
				//var formateddate	= format.format({value: monthObj, type: format.Type.DATE});
				//log.debug({title: "formateddate", details:formateddate });
				//var months 			= formateddate.getMonth()+1;
				//var years			= formateddate.getFullYear();
				//log.debug({title: "months", details:months });
				//log.debug({title: "months", details:months});
				//log.debug({title: "years", details:years });
				var firstDateObj	= new Date(years, months, 1); 
				var firstDay		= firstDateObj.getDate();
				var lastDateObj		= new Date(years, months, 0); 
				var lastDay			= lastDateObj.getDate();

				var monsText		= m[months-1];
				var monthsText		= mm[months-1];
				log.debug({title: "Months In Text ", details: m[months-1]});
				log.debug({title: "dateFormatValue", details: dateFormatValue});

				//_returnCorrectDate(dateObj, dateFormatValue);

				if(dateFormatValue == "M/D/YYYY" || dateFormatValue == "MM/DD/YYYY") {
					var fromDate	= months+"/"+firstDay+"/"+years;
					var toDate		= months+"/"+lastDay+"/"+years;
					log.debug({title: "fromDate", details: fromDate});
					log.debug({title: "toDate", details: toDate});
				}
				else if(dateFormatValue == "D/M/YYYY") {
					var fromDate	= firstDay+"/"+months+"/"+years;
					var toDate		= lastDay+"/"+months+"/"+years;
					log.debug({title: "fromDate", details: fromDate});
					log.debug({title: "toDate", details: toDate});
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

			if(reqObj.parameters.keyword == 'B2CL') {
				log.debug({title: "b2cl function: ", details: "Entered"});
				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];

				invoiceFilter.push([
					["shipping","is","F"], 
					"AND", 
					["mainline","is","F"], 
					"AND", 
					["taxline","is","F"], 
					"AND", 
					["custbody_gst_org_inv_date","isempty",""], 
					"AND", 
					["custbody_gst_org_inv_num","anyof","@NONE@"], 
					"AND", 
					["custbody_gst_customerregno","isempty",""],
					"AND", 
					["custbody_gst_gsttype","anyof","2"], 					
					"AND", 
					["totalamount","greaterthan","250000.00"],
					"AND", 
					["cogs","is","F"],
					"AND", 
					["item.type","noneof","Discount"], 
					"AND", 
					["item.name","doesnotcontain","Rounding Off"],
					"AND",
					["item.name","doesnotcontain","Round Off"],
					"AND",
					["item.name","doesnotcontain","Round"],
					//"AND",
					//["subsidiary.internalidnumber","equalto",sub_id],
					"AND", 
					["status","anyof","CustInvc:A","CustInvc:B"],
					"AND",
					["custbody_gst_inv_type","anyof","1"]
					//["formulanumeric: CASE WHEN  {custbody_gst_place_of_supply.custrecord_gst_state_abbreviation} != {location.state} THEN 1 ELSE 0 END","equalto","1"]
					]);

				if(sub_id) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["subsidiary.internalidnumber","equalto", sub_id]);
				}
				
				if(secAccBook) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}
				
				if(custObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["entity", "is", custObj]);
				}

				if(locationObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}
				if(postingPeriodId) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				else if(!postingPeriodId){
					if(months && years) {
						log.debug({title: "Inside selected date filter ", details: "SELECTET DATE"});
						invoiceFilter.push("AND");
						invoiceFilter.push(["trandate", "within", fromDate, toDate]);
					}
					else {
						log.debug({title: "Inside selected date filter ", details: "CURRENT DATE"});
						invoiceFilter.push("AND"); 
						invoiceFilter.push(["trandate", "within", currFromDate, currToDate]);
					}
				}
				if(gstIn)
				{
					invoiceFilter.push("AND");
					invoiceFilter.push(["custbody_gst_locationregno","is",gstIn]);
				}

				invoiceColumn.push(search.createColumn({name: "trandate",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "amount", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "total", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "tranid",summary: "GROUP"}));
				// invoiceColumn.push(search.createColumn({name: "rate",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_inv_type",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_destinationstate", summary: "GROUP"}));
				//Changed Filter on 11th June 2020 and added summary in all columns
				if(!secAccBook) {
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{fxamount}"}));//Taxable Value 
				}
				if(secAccBook) {
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
					invoiceColumn.push(search.createColumn({ name: "formulacurrency02",summary: "SUM",formula: "((({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount}) - ({accountingtransaction.exchangerate}*{fxamount}))",label: "Formula (Currency)"}));//Tax Amount
				}
				invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				searchObj		= search.create({type: "invoice", filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
				log.debug({title: "searchObj B2CL", details:searchObj});
				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For b2cl searchCount", details: searchCount});

				htmlObj1 +="<table class='minimalistBlack' style='border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;'>";
				htmlObj1 +="<thead style ='background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;'>";
				htmlObj1 +="<tr>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Invoice Number</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Invoice date</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Invoice Value</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Place Of Supply</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Applicable % of Tax Rate</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Rate</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Taxable Value</th>";
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Cess Amount</th>";
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>E-Commerce GSTIN</th>";
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
								var date		= searchResultSN[s].getValue({name: "trandate",summary: "GROUP"});
								var id			= searchResultSN[s].getValue({name: "tranid",summary: "GROUP"});
								//var taxAmt		= searchResultSN[s].getValue({name: "amount", summary: "SUM"});
								var amount_total		= searchResultSN[s].getValue({name: "total", summary: "GROUP"});
								if(!secAccBook) {
									 var amount		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"});
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{fxamount}"}); 
								}
								if(secAccBook) {
									var amount		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}
								//var rate		= searchResultSN[s].getValue('custbody_gst_tax_rate');
								var pos			= searchResultSN[s].getText({name: "custbody_gst_place_of_supply",summary: "GROUP"});
								var appTax		= searchResultSN[s].getValue({name: "custbody_gst_tax_rate",summary: "GROUP"});
								var invType		= searchResultSN[s].getText({name: "custbody_gst_inv_type",summary: "GROUP"});
								var gstIn		= searchResultSN[s].getValue({name: "custbody_gst_commerce_gstin",summary: "GROUP"});
								var perTaxRate	= searchResultSN[s].getValue({name: "rate", join: "taxItem",summary: "GROUP"});
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
								var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
								var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
								var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
								var statecode= searchResultSN[s].getValue({name: "custbody_gst_destinationstate", summary: "GROUP"});
								if(!amount) {
									amount	= '';
								}
								if(!taxAmt) {
									taxAmt	= '';
								}
								if(pos == "- None -") {
									pos	= '';
								}
								if(!appTax) {
									appTax	= '';
								}
								if(invType == "- None -") {
									invType	= '';
								}
								if(gstIn == "- None -") {
									gstIn	= '';
								}
								pos =statecode+"-"+pos;

								htmlObj1 +="<tr>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+id+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+date+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+amount_total+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+pos+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+appTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+perTaxRate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+Number(taxAmt).toFixed(2)+"</td>";
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmt+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+gstIn+"</td>";
								htmlObj1 +="</tr>";

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+id+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+date+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+amount_total+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+pos+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+gstIn+'</Data></Cell></Row>';

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
			else if(reqObj.parameters.keyword == "B2CSA") {
				log.debug({title: "Inside b2csa Report", details: "Entered"});
				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];

				invoiceFilter.push([
					["shipping","is","F"], 
					"AND", 
					["mainline","is","F"], 
					"AND", 
					["taxline","is","F"], 
					"AND", 
					["custbody_gst_org_inv_date","isnotempty",""], 
					"AND", 
					["custbody_gst_org_inv_num","noneof","@NONE@"], 
					"AND", 
					["custbody_gst_customerregno","isempty",""], 
					"AND", 
					[[["custbody_gst_gsttype","anyof","1"]],
						"OR",
						[["custbody_gst_gsttype","anyof","2"],
							"AND",
							["totalamount","lessthanorequalto","250000.00"]]],
							"AND", 
							["item.type","noneof","Discount"], 
							"AND", 
							["item.name","doesnotcontain","Rounding Off"],
							"AND",
							["item.name","doesnotcontain","Round Off"],
							"AND",
							["item.name","doesnotcontain","Round"],
							//"AND",
							//["subsidiary.internalidnumber","equalto",sub_id],
							"AND", 
							["status","anyof","CustInvc:A","CustInvc:B"],
							"AND",
							["custbody_gst_inv_type","anyof","1"]
					//[[["formulanumeric: CASE WHEN  {custbody_gst_place_of_supply.custrecord_gst_state_abbreviation} != {location.state} THEN 1 ELSE 0 END","equalto","1"],"AND",["amount","lessthanorequalto","250000.00"]],"OR",["formulanumeric: CASE WHEN  {custbody_gst_place_of_supply.custrecord_gst_state_abbreviation} = {location.state} THEN 1 ELSE 0 END","equalto","1"]]
					]);
					
				if(sub_id) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["subsidiary.internalidnumber","equalto", sub_id]);
				}
				
				if(secAccBook) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}
				
				if(custObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["entity", "is", custObj]);
					//invoiceFilter.push(search.createFilter("entityid","customermain","is",custObj));
				}

				if(locationObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}
				if(postingPeriodId) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				if(months && years) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["trandate", "within", fromDate, toDate]);
				}
				else {
					invoiceFilter.push("AND");
					invoiceFilter.push(["trandate", "within", currFromDate, currToDate]);

				}
				if(gstIn)
				{
					invoiceFilter.push("AND");
					invoiceFilter.push(["custbody_gst_locationregno","is",gstIn]);
				}
				
				invoiceColumn.push(search.createColumn({name: "taxamount", function: "absoluteValue", summary: "SUM"}));
				//invoiceColumn.push(search.createColumn({name: "total", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "postingperiod", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "rate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_destinationstate", summary: "GROUP"}));

				//Changed Filter 11th June 2020 and added summary in all columns
				if(!secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{fxamount}"}));//Taxable Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value 
				}
				if(secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"}));//Taxable Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02",summary: "SUM",
					formula: "((({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount}) - ({accountingtransaction.exchangerate}*{fxamount}))",
					label: "Formula (Currency)"}));
				}
				
				invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				searchObj		= search.create({type: "invoice", filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
				log.debug({title: "searchObj B2CSA", details:searchObj});
				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For b2csa searchCount", details: searchCount});

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Financial Year</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Original Month</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Place Of Supply</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">E-Commerce GSTIN</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';


				if(searchCount != 0) {
					do	{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						//log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0){
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN) {

								//var taxAmt		= searchResultSN[s].getValue({name: "taxamount", function: "absoluteValue", summary: "SUM"});
								if(!secAccBook){
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{fxamount}"});
									var amount		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"});
								}
								
								var typeId		= searchResultSN[s].getText({name: "type", summary: "GROUP"});
								var date		= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
								var toGetMon	= format.parse({value: date, type: format.Type.DATE});
								var months 		= toGetMon.getMonth();
								var actMonthObj	= mm[months];
								var finYear		= searchResultSN[s].getText({name: "postingperiod", summary: "GROUP"});
								//var amount		= searchResultSN[s].getValue({name: "amount", summary: "GROUP"});
								
								if(secAccBook){
									var amount		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
								}
								
								//var rate		= searchResultSN[s].getValue({name: "custbody_gst_tax_rate"});
								var pos			= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var appTax		= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
								var invType		= searchResultSN[s].getText({name: "custbody_gst_inv_type", summary: "GROUP"});
								var gstIn		= searchResultSN[s].getValue({name: "custbody_gst_commerce_gstin", summary: "GROUP"});
								var perTaxRate	= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
								var taxAmount  	= searchResultSN[s].getValue({name: "formulacurrency02",summary: "SUM",
								formula: "((({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount}) - ({accountingtransaction.exchangerate}*{fxamount}))",label: "Formula (Currency)"});
								var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
							var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
								var statecode= searchResultSN[s].getValue({name: "custbody_gst_destinationstate", summary: "GROUP"});
								
								if(!amount) {
									amount	= '';
								}
								if(!taxAmt) {
									taxAmt	= '';
								}
								if(pos == "- None -") {
									pos	= '';
								}
								if(!appTax) {
									appTax	= '';
								}
								if(invType == "- None -") {
									invType	= '';
								}
								if(gstIn == "- None -") {
									gstIn	= '';
								}
								pos =statecode+"-"+pos;

								htmlObj1 +="<tr>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+finYear+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+actMonthObj+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+pos+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+typeId+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+appTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+perTaxRate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+Number(taxAmt).toFixed(2)+"</td>";
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmt+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+gstIn+"</td>";
								htmlObj1 +="</tr>";

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+finYear+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+actMonthObj+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+pos+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+typeId+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+gstIn+'</Data></Cell></Row>';
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
			else if(reqObj.parameters.keyword == "EXP") {
				log.debug({title: "Inside exp Report", details: "Entered"});
				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];
				
				if(secAccBook) {
					invoiceFilter.push(search.createFilter({name: "accountingbook",join:"accountingtransaction", operator: search.Operator.ANYOF, values: secAccBook}));
				}
				if(custObj) {
					invoiceFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}
				if(locationObj){
					invoiceFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}
				if(gstTypeObj) {	
					invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}
				if(postingPeriodId) {	
					invoiceFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}
				if(months && years) {	
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));	
				}
				else {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
				}
				
				if(gstIn)
				{
					invoiceFilter.push(search.createFilter({name: "custbody_gst_locationregno", operator: search.Operator.IS, values: gstIn}));
				}

				invoiceFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_customerregno",operator: search.Operator.ISEMPTY}));
				//invoiceFilter.push(search.createFilter({name: "shipcountry", operator: search.Operator.NONEOF, values: 'India'}));
				invoiceFilter.push(search.createFilter({name: "cogs", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_inv_type", operator: search.Operator.ANYOF, values: ["3"]})); //["2","3"] changed on 11th Nov 2021
				invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_num", operator: search.Operator.ANYOF, values: "@NONE@"}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_date", operator: search.Operator.ISEMPTY, values: ""}));
				invoiceFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
				//invoiceFilter.push(search.createFilter({name: "item", operator: search.Operator.NONEOF, values: '416'}));
				if(sub_id){
					invoiceFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: sub_id}));
				}
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round"}));
				//	invoiceFilter.push(search.createFilter({name: "approvalstatus", operator: search.Operator.NONEOF, values: [1,3]}));

				invoiceColumn.push(search.createColumn({name: "taxamount", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "total", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
				//Below line is commented on 20may2022
				//invoiceColumn.push(search.createColumn({name: "rate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "shipcountrycode", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_exprt_typ", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_port_code", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_ship_bil_bo", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_ship_bil_dt", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "exchangerate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "internalid", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));

				//Changed Filter 11th June 2020 and added summary in all columns
				//invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
				//invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value
				if(!secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",  summary: "SUM", formula: "({amount}*{taxitem.rate}/100)+{amount}", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{amount}", label: "Taxable Value"}));//Taxable Value
				}
				if(secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
				}

				invoiceSetting.push(search.createSetting({name: 'consolidationtype',value:'NONE'}));

				searchObj		= search.create({type: "invoice", filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
				log.debug({title: "searchObj EXP", details:searchObj});
				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For EXP searchCount", details: searchCount});

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Export Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Port Code</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Shipping Bill Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Shipping Bill Date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';

				if(searchCount != 0) {
					do	{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0){
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN) {
								//var exportType	= searchResultSN[s].getValue({name: "exporttype"});
								//var taxAmt		= searchResultSN[s].getValue({name: "taxamount", summary: "SUM"});
								//var amt		= searchResultSN[s].getValue({name: "subtotal", summary: "SUM"});
								if(!secAccBook){
									var amount		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({amount}*{taxitem.rate}/100)+{amount}", label: "Invoice Value"});
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{amount}", label: "Taxable Value"}); 
								}
								if(secAccBook){
									var amount		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
								}
								
								//Added on 20 May 2022 for invoice value issue.
								var internalId		= searchResultSN[s].getValue({name: "internalid", summary: "GROUP"});
								//var subvalue          =searchResultSN[s].getValue({name: "total", summary: "GROUP"});
								 var rec = record.load({
									type:record.Type.INVOICE,
									id:internalId
								});	
								var subvalue = rec.getValue("total");
								var currency = rec.getText("currencysymbol");
								var exchangerate = rec.getValue("exchangerate");
							
								log.debug({title: "Inside EXP subvalue", details:subvalue});
								var date		= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
								var id			= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
								//var rate		= searchResultSN[s].getValue({name: "rate"});
								var pos			= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var appTax		= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
								var invType		= searchResultSN[s].getText({name: "custbody_gst_inv_type", summary: "GROUP"});
								var gstIn		= searchResultSN[s].getValue({name: "custbody_gst_commerce_gstin", summary: "GROUP"});
								var perTaxRate	= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});
								var expType		= searchResultSN[s].getText({name: "custbody_gst_exprt_typ", summary: "GROUP"});
								var portNo		= searchResultSN[s].getValue({name: "custbody_gst_port_code", summary: "GROUP"});
								var shipBillNo	= searchResultSN[s].getValue({name: "custbody_gst_ship_bil_bo", summary: "GROUP"});
								var shipBillDate= searchResultSN[s].getValue({name: "custbody_gst_ship_bil_dt", summary: "GROUP"});
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
								var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
							var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
							if(currency != "INR"){
									log.debug({title: "Inside EXP currency", details:currency});
									subvalue = subvalue*exchangerate;
									cgst = cgst*exchangerate;
									sgst = sgst*exchangerate;
									igst = igst*exchangerate;
								}

								if(!amount) {
									amount	= '';
								}
								if(!taxAmt) {
									taxAmt	= '';
								}
								if(pos == "- None -") {
									pos	= '';
								}
								if(!appTax) {
									appTax	= '';
								}
								if(invType == "- None -") {
									invType	= '';
								}
								if(gstIn == "- None -") {
									gstIn	= '';
								}
								if(portNo == "- None -") {
									portNo	= '';
								}
								if(shipBillNo == "- None -") {
									shipBillNo	= '';
								}

								htmlObj1 +="<tr>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+expType+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+id+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+date+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+Number(subvalue).toFixed(2)+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+portNo+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+shipBillNo+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+shipBillDate+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+appTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+perTaxRate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+Number(taxAmt).toFixed(2)+"</td>";
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(cgst).toFixed(2)+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(sgst).toFixed(2)+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(igst).toFixed(2)+'</td>';

								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmt+"</td>";
								htmlObj1 +="</tr>";

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+expType+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+id+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+date+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+Number(subvalue).toFixed(2)+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+portNo+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+shipBillNo+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+shipBillDate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>'+
                                  '<Cell><Data ss:Type="String">'+Number(cgst).toFixed(2)+'</Data></Cell>'+
                                  '<Cell><Data ss:Type="String">'+Number(sgst).toFixed(2)+'</Data></Cell>'+
                                  '<Cell><Data ss:Type="String">'+Number(igst).toFixed(2)+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>'+'</Row>';

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
			else if(reqObj.parameters.keyword == "EXPA") {
				log.debug({title: "Inside expa Report", details: "Entered"});
				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];
				
				if(secAccBook) {
					invoiceFilter.push(search.createFilter({name: "accountingbook",join:"accountingtransaction", operator: search.Operator.ANYOF, values: secAccBook}));
				}

				if(custObj) {
					invoiceFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}

				if(locationObj) {
					invoiceFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}

				if(gstTypeObj) {
					invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}
				if(postingPeriodId) {
					invoiceFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}
				if(months && years) {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
				}
				else {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
				}
				if(gstIn)
				{
					invoiceFilter.push(search.createFilter({name: "custbody_gst_locationregno", operator: search.Operator.IS, values:gstIn}));
				}

				invoiceFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_num", operator: search.Operator.NONEOF, values: '@NONE@'}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_date", operator: search.Operator.ISNOTEMPTY}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_customerregno",operator: search.Operator.ISEMPTY}));
				//invoiceFilter.push(search.createFilter({name: "shipcountry", operator: search.Operator.NONEOF, values: "India"}));
				invoiceFilter.push(search.createFilter({name: "cogs", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_inv_type", operator: search.Operator.ANYOF, values: ["2","3"]}));
				invoiceFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
				if(sub_id){
					invoiceFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: sub_id}));
				}
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round"}));
				//invoiceFilter.push(search.createFilter({name: "approvalstatus", operator: search.Operator.NONEOF, values: [1,3]}));

				invoiceColumn.push(search.createColumn({name: "taxamount", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "total", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
				//invoiceColumn.push(search.createColumn({name: "rate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_customerregno", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_exprt_typ", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_port_code", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_ship_bil_bo", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_ship_bil_dt", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_org_inv_num", summary: "MIN"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_org_inv_date", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
				//Changed Filter 11th June 2020 and added summary in all columns
				//invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
				//invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value
				if(!secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({amount}*{taxitem.rate}/100)+{amount}", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{amount}", label: "Taxable Value"}));//Taxable Value 
				}
				if(secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
				}
				invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				searchObj		= search.create({type: "invoice", filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For EXPA searchCount", details: searchCount});

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Export Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Original Invoice Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Original Invoice date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Revised Invoice Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Revised Invoice date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Port Code</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Shipping Bill Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Shipping Bill Date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';


				if(searchCount != 0) {
					do	{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0){
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN) {
								//	var exportType	= searchResultSN[s].getValue({name: "exporttype"});
								//var taxAmt		= searchResultSN[s].getValue({name: "taxamount", summary: "SUM"});
								var amount_total		= searchResultSN[s].getValue({name: "total", summary: "GROUP"});
								if(!secAccBook){
									var amount		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({amount}*{taxitem.rate}/100)+{amount}", label: "Invoice Value"});
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{amount}", label: "Taxable Value"});
								}
								if(secAccBook){
									var amount		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
								}
								var date		= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
								var id			= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
								//var rate		= searchResultSN[s].getValue({name: "rate"});
								var pos			= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var appTax		= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
								var invType		= searchResultSN[s].getText({name: "custbody_gst_inv_type", summary: "GROUP"});
								var oriInvNo	= searchResultSN[s].getValue({name: "custbody_gst_org_inv_num", summary: "MIN"});
								var oriInvDate  = searchResultSN[s].getValue({name: "custbody_gst_org_inv_date", summary: "GROUP"});
								var perTaxRate	= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});	
								var expType		= searchResultSN[s].getText({name: "custbody_gst_exprt_typ", summary: "GROUP"});
								var portNo		= searchResultSN[s].getValue({name: "custbody_gst_port_code", summary: "GROUP"});
								var shipBillNo	= searchResultSN[s].getValue({name: "custbody_gst_ship_bil_bo", summary: "GROUP"});
								var shipBillDate= searchResultSN[s].getValue({name: "custbody_gst_ship_bil_dt", summary: "GROUP"});
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
								var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
							var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});

							
								if(!gstNo) {
									gstNo	= '';
								}
								if(!oriInvNo) {
									oriInvNo	= id;
								}
								if(!oriInvDate) {
									oriInvDate	= date;
								}
								if(!amount) {
									amount	= '';
								}
								if(!taxAmt) {
									taxAmt	= '';
								}
								if(pos == "- None -") {
									pos	= '';
								}
								if(!appTax) {
									appTax	= '';
								}
								if(invType == "- None -") {
									invType	= '';
								}
								if(portNo == "- None -") {
									portNo	= '';
								}
								if(shipBillNo == "- None -") {
									shipBillNo	= '';
								}

								htmlObj1 +="<tr>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+expType+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+oriInvNo+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+oriInvDate+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+id+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+date+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+amount_total+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+portNo+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+shipBillNo+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+shipBillDate+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+appTax+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+perTaxRate+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+Number(taxAmt).toFixed(2)+"</td>";
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmt+"</td>";
								htmlObj1 +="</tr>";

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+expType+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+oriInvNo+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+oriInvDate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+id+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+date+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+Number(amount).toFixed(2)+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+portNo+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+shipBillNo+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+shipBillDate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>'+'</Row>';
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
			else if(reqObj.parameters.keyword == "HSN") {

				log.debug({title: "Inside hsn Report", details: "Entered"});
				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];

				invoiceFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "cogs", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
				if(sub_id){
					invoiceFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: sub_id}));
				}
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round"}));
				//invoiceFilter.push(search.createFilter({name: "approvalstatus", operator: search.Operator.NONEOF, values: [1,3]}));
				
				if(secAccBook) {	
					invoiceFilter.push(search.createFilter({name: "accountingbook",join:"accountingtransaction", operator: search.Operator.ANYOF, values: secAccBook}));	
				}

				if(custObj) {
					invoiceFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}

				if(locationObj) {
					invoiceFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}

				if(gstTypeObj) {
					invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}
				if(postingPeriodId) {
					invoiceFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}
				if(months && years && fromDate && toDate ) {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
				}
				else if(currFromDate && currToDate) {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
				}
				if(gstIn)
				{
					invoiceFilter.push(search.createFilter({name: "custbody_gst_locationregno", operator: search.Operator.IS, values: gstIn}));
				
				}
			

				invoiceColumn.push(search.createColumn({name: "custcol_gst_hsnsaccode", summary: "GROUP"}));
				//invoiceColumn.push(search.createColumn({ name: "memo", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name : "custcol_gst_uqc", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "quantity", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({ name: "taxamount", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "total", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
				//Changed Filter 11th June 2020 and added summary in all columns
				
				if(!secAccBook){	
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({amount}*{taxitem.rate}/100) + {amount}", label: "Invoice Value"}));//Inv Value	
						
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{amount}", label: "Taxable Value"}));//Taxable Value	
				}	
				if(secAccBook){	
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value	
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value	
					invoiceColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",	
					formula: "((({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount}) - ({accountingtransaction.exchangerate}*{fxamount}))",	
					label: "Formula (Currency)"}));	
				}	
				invoiceColumn.push(search.createColumn({name: "currency", summary: "GROUP"}));
				/* invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
				
				invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value */

				invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				searchObj		= search.create({type: "invoice", filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For HSN searchCount", details: searchCount});

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">HSN</th>';
				//htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Description</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">UQC</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Total Quantity</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Total Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Integrated Tax Amount</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Central Tax Amount</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">State/UT Tax Amount</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';

				if(searchCount != 0) {
					do	{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0){
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN) {
								var hasCode		= searchResultSN[s].getValue({name: "custcol_gst_hsnsaccode", summary: "GROUP"});
								//var description	= searchResultSN[s].getValue({name: "memo", summary: "GROUP"});
								var totalQuant	= searchResultSN[s].getValue({name: "quantity", summary: "SUM"});
								//var totalAmt		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"});
									
								if(!secAccBook){	
									var totalAmt		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({amount}*{taxitem.rate}/100) + {amount}", label: "Invoice Value"});	
									//var taxAmt	= searchResultSN[s].getValue({name: "taxamount", summary: "SUM"});	
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{amount}", label: "Taxable Value"});	
								}
								
								//var taxAmt	= searchResultSN[s].getValue({name: "taxamount", summary: "SUM"});
								if(secAccBook){	
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});	
									var totalAmt	= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});	
								}
								//var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"});
								//var totalAmt	= searchResultSN[s].getValue({name: "total", summary: "SUM"});
								var uqc			= searchResultSN[s].getText({name : "custcol_gst_uqc", summary: "GROUP"});
								var igstAmt		= searchResultSN[s].getValue({name: "custcol_gst_igstamount", summary: "SUM"});
								var cgstAmt		= searchResultSN[s].getValue({name: "custcol_gst_cgstamount", summary: "SUM"});
								var sgstAmt		= searchResultSN[s].getValue({name: "custcol_gst_sgstamount", summary: "SUM"});
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});		
								if(!hasCode) {
									hasCode	= '';
								}
 								/*if(!description) {
									description	= '';
								} */
								if(!totalQuant) {
									totalQuant	= '';
								}
								if(!taxAmt) {
									taxAmt	= '';
								}
								if(!totalAmt) {
									totalAmt	= '';
								}
								if(!uqc) {
									uqc	= '';
								}
								if(!igstAmt) {
									igstAmt	= '';
								}
								if(!cgstAmt) {
									cgstAmt	= '';
								}
								if(!sgstAmt) {
									sgstAmt	= '';
								}


								htmlObj1 +="<tr>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+hasCode+"</td>";
								//htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+description+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+uqc+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+totalQuant+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+Number(totalAmt).toFixed(2)+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+Number(taxAmt).toFixed(2)+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+igstAmt+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cgstAmt+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+sgstAmt+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmt+"</td>";
								htmlObj1 +="</tr>";

								excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+hasCode+'</Data></Cell>'+
								//'<Cell><Data ss:Type="String">'+description+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+uqc+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+totalQuant+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+Number(totalAmt).toFixed(2)+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+igstAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cgstAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+sgstAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>'+'</Row>';
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
			//Added By Nikita on 21st Oct 2021
			else if(reqObj.parameters.keyword == "EXEMPTED") {

				log.debug({title: "Inside exempted Report", details: "Entered"});
				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];
				invoiceFilter.push([
				  ["type","anyof","CustInvc"], 
				  "AND", 
				  ["billingaddress.custrecord_gst_registration_type","anyof","3"], 
				  "AND", 
				  ["mainline","is","F"], 
				  "AND", 
				  ["taxline","is","F"], 
				  "AND", 
				  ["shipping","is","F"], 
				  "AND", 
				  ["cogs","is","F"], 
				  "AND", 
				  ["item.custitem_gst_item_applicable_type","anyof","2"], 
				  "AND", 
				  ["item.name","doesnotcontain","Rounding Off"], 
				  "AND", 
				  ["item.name","doesnotcontain","Round Off"], 
				  "AND", 
				  ["item.name","doesnotcontain","Round"], 
				  "AND", 
				  ["custbody_gst_customerregno","isnotempty",""]
				]);
				
				if(sub_id) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["subsidiary.internalidnumber","equalto", sub_id]);
				}
				
				if(secAccBook) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}
				
				if(custObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["entity", "is", custObj]);
				}

				if(locationObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}
				if(postingPeriodId) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				else if(!postingPeriodId){
					if(months && years) {
						log.debug({title: "Inside selected date filter ", details: "SELECTET DATE"});
						invoiceFilter.push("AND");
						invoiceFilter.push(["trandate", "within", fromDate, toDate]);
					}
					else {
						log.debug({title: "Inside selected date filter ", details: "CURRENT DATE"});
						invoiceFilter.push("AND"); 
						invoiceFilter.push(["trandate", "within", currFromDate, currToDate]);
					}
				}
				if(gstIn)
				{
					invoiceFilter.push("AND");
					invoiceFilter.push(["custbody_gst_locationregno","is",gstIn]);
				}
				
				
				invoiceColumn.push(search.createColumn({name: "custbody_gst_gsttype",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custitem_gst_item_applicable_type",join: "item",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "trandate",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({ name: "rate",join: "taxItem",summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));

				//Changed Filter 11th June 2020 and added summary in all columns
				if(!secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
					
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value
				}
				if(secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
				}
				
				invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				searchObj		= search.create({type: "invoice", filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
				searchCount		= searchObj.runPaged().count;
				log.debug({title: "For Exempted searchCount", details: searchCount});

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">GST Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">GST Applicable Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Date </th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Total Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Integrated Tax Amount</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Central Tax Amount</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">State/UT Tax Amount</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';

				if(searchCount != 0) {
					do	{
						var searchResultSN = searchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
						log.debug("searchResultSN ", searchResultSN.length);
						if(searchResultSN.length > 0){
							htmlObj1 +='<tbody>';
							for(var s in searchResultSN) {
								
								var gstType		= searchResultSN[s].getText({name: "custbody_gst_gsttype",summary: "GROUP"});
								var gstAppliType = searchResultSN[s].getText({name: "custitem_gst_item_applicable_type",join: "item",summary: "GROUP"});
								var docNo		= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
								var docDt		= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
								if(!secAccBook){
									var totalAmt	= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"});
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}); 
								}
								if(secAccBook){
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
									var totalAmt	= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
								}
								
							    var igstAmt		= searchResultSN[s].getValue({name: "custcol_gst_igstamount", summary: "SUM"});
								var cgstAmt		= searchResultSN[s].getValue({name: "custcol_gst_cgstamount", summary: "SUM"});
								var sgstAmt		= searchResultSN[s].getValue({name: "custcol_gst_sgstamount", summary: "SUM"});
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});		

								if(!taxAmt) {
									taxAmt	= '';
								}
								if(!totalAmt) {
									totalAmt	= '';
								}
								if(!docNo) {
									docNo	= '';
								}
								if(!igstAmt) {
									igstAmt	= '';
								}
								if(!cgstAmt) {
									cgstAmt	= '';
								}
								if(!sgstAmt) {
									sgstAmt	= '';
								}
								if(!cessAmt) {
									cessAmt	= '';
								}
								if(!gstType) {
									gstType	= '';
								}
								if(!gstAppliType) {
									gstAppliType	= '';
								}
								if(!docDt) {
									docDt	= '';
								}


								htmlObj1 +="<tr>";
								htmlObj1 +="<td align='left' style='border: 1px solid #000000; padding: 5px 4px;'>"+gstType+"</td>";
								htmlObj1 +="<td align='left' style='border: 1px solid #000000; padding: 5px 4px;'>"+gstAppliType+"</td>";
								htmlObj1 +="<td align='left' style='border: 1px solid #000000; padding: 5px 4px;'>"+docNo+"</td>";
								htmlObj1 +="<td align='left' style='border: 1px solid #000000; padding: 5px 4px;'>"+docDt+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+totalAmt+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+taxAmt+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+igstAmt+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+cgstAmt+"</td>";
								htmlObj1 +="<td align='right' style='border: 1px solid #000000; padding: 5px 4px;'>"+sgstAmt+"</td>";
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+cessAmt+"</td>";
								htmlObj1 +="</tr>";

								excelObj += '<Row>'+
								'<Cell><Data ss:Type="String">'+gstType+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+gstAppliType+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+docNo+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+docDt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+totalAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+taxAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+igstAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cgstAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+sgstAmt+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>'+'</Row>';
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
			else if(reqObj.parameters.keyword == "B2BA") {   
				log.debug({title: "Inside b2ba Report", details: "Entered"});
				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];
				
				if(secAccBook) {
					invoiceFilter.push(search.createFilter({name: "accountingbook",join:"accountingtransaction", operator: search.Operator.ANYOF, values: secAccBook}));
				}
				if(custObj) {
					invoiceFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}
				if(locationObj) {
					invoiceFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}
				if(gstTypeObj) {
					invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}
				if(postingPeriodId) {
					invoiceFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}
				if(months && years) {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
				}
				else {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
				}
				if(gstIn)
				{
					invoiceFilter.push(search.createFilter({name: "custbody_gst_locationregno", operator: search.Operator.IS, values: gstIn}));
				}


				invoiceFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_num", operator: search.Operator.NONEOF, values: '@NONE@'}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_date", operator: search.Operator.ISNOTEMPTY}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_customerregno",operator: search.Operator.ISNOTEMPTY}));
				invoiceFilter.push(search.createFilter({name: "cogs",operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
				if(sub_id){
					invoiceFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: sub_id}));
				}
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round"}));
				invoiceFilter.push(search.createFilter({name: "status", operator: search.Operator.ANYOF, values: ["CustInvc:A","CustInvc:B"]}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_inv_type", operator: search.Operator.ANYOF, values: "1"}));

				//invoiceColumn.push(search.createColumn({name: "entity", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_reversal_line", summary: "GROUP"}));
				//invoiceColumn.push(search.createColumn({name: "taxamount", summary: "SUM"}));
				//invoiceColumn.push(search.createColumn({name: "rate", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "total", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_customerregno", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
				//invoiceColumn.push(search.createColumn({name: "type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_org_inv_num", summary: "MIN"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_org_inv_date", summary: "GROUP"}));
				
				invoiceColumn.push(search.createColumn({name: "custbody_gst_destinationstate", summary: "GROUP"}));
				//Changed Filter 11th June 2020 and added summary in all columns
				if(!secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value 
				}
				if(secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
				}
				//Added On 20thjuly 2020 for customer name(Individual or company)
				invoiceColumn.push(search.createColumn({name: "isperson", join: "customer", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "companyname", join: "customer", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "salutation", join: "customer", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "firstname", join: "customer", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "middlename", join: "customer", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "lastname", join: "customer", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_exprt_typ", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
				invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				var searchObj = search.create({type:"invoice",filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
				var searchCount = searchObj.runPaged().count;
				log.debug({title: "Search count For b2ba", details: searchCount});
				var htmlObj1  ='';
				var htmlStr   ='';
				var excelObj  ='';

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">GSTIN/UIN of Recipient</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Receiver Name</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Original Invoice Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Original Invoice date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Revised Invoice Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Revised Invoice date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Place Of Supply</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Reverse Charge</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Type</th>';
				htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Export Type</th>";
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">ECommerce GSTIN</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
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
								var amount_value          = searchResultSN[s].getValue({name: "total", summary: "SUM"});
								//var taxAmt			= searchResultSN[s].getValue({name: "taxamount", summary: "SUM"});
								if(!secAccBook){
									var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"});
									var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"});
								}
								if(secAccBook){
									var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
								}
								//var rate			= searchResultSN[s].getValue('rate');
								var pos				= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var appTax			= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
								var invType			= searchResultSN[s].getText({name: "custbody_gst_inv_type", summary: "GROUP"});
								var gstIn			= searchResultSN[s].getValue({name: "custbody_gst_commerce_gstin", summary: "GROUP"});
								var oriInvNo		= searchResultSN[s].getValue({name: "custbody_gst_org_inv_num", summary: "MIN"});
								var oriInvDate  	= searchResultSN[s].getValue({name: "custbody_gst_org_inv_date", summary: "GROUP"});
								var gstNo			= searchResultSN[s].getValue({name: "custbody_gst_customerregno", summary: "GROUP"});
								//var repType			= searchResultSN[s].getText({name: "type", summary: "GROUP"});
								var docId			= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
								var date			= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
								var reverseApp		= searchResultSN[s].getText({name: "custcol_gst_reversal_line", summary: "GROUP"});
								var perTaxRate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
								//for customer name
								var custNm			= "";
								var isIndivCB		= searchResultSN[s].getValue({name: "isperson", join: "customer", summary: "GROUP"});
								var compaName		= searchResultSN[s].getValue({name: "companyname", join: "customer", summary: "GROUP"});
								var salutation		= searchResultSN[s].getValue({name: "salutation", join: "customer", summary: "GROUP"});
								var firstNm			= searchResultSN[s].getValue({name: "firstname", join: "customer", summary: "GROUP"});
								var middleNm		= searchResultSN[s].getValue({name: "middlename", join: "customer", summary: "GROUP"});
								var lastNm			= searchResultSN[s].getValue({name: "lastname", join: "customer", summary: "GROUP"});
								var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
								var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
								var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
								var statecode= searchResultSN[s].getValue({name: "custbody_gst_destinationstate", summary: "GROUP"});
								log.debug({title: "Inside B2BA isIndivCB", details: isIndivCB});
								log.debug({title: "Inside B2BA compaName", details: compaName});
								log.debug({title: "Inside B2BA salutation", details: salutation});
								log.debug({title: "Inside B2BA firstNm", details: firstNm});
								log.debug({title: "Inside B2BA lastNm", details: lastNm});
								var expType	= searchResultSN[s].getText({name: "custbody_gst_exprt_typ", summary: "GROUP"});

								if(!expType) {
									expType	= '';
								}

								if(compaName == "- None -") {
									compaName	= '';
								}
								if(salutation == "- None -") {
									salutation	= '';
								}
								if(firstNm == "- None -") {
									firstNm	= '';
								}
								if(middleNm == "- None -") {
									middleNm	= '';
								}
								if(lastNm == "- None -") {
									lastNm	= '';
								}

								if(!isIndivCB) {
									custNm			= compaName;
								}
								else {
									custNm			= salutation+" "+firstNm+" "+middleNm+" "+lastNm;
								}
								log.debug({title: "Inside B2BA custNm", details: custNm});

								if(!amount) {
									amount	= '';
								}
								if(!taxAmt) {
									taxAmt	= '';
								}
								/* if(!rate) {
									rate	= '';
								} */
								if(pos == "- None -") {
									pos	= '';
								}
								if(!appTax) {
									appTax	= '';
								}
								if(invType == "- None -") {
									invType	= '';
								}
								if(gstIn == "- None -") {
									gstIn	= '';
								}
								if(!oriInvNo) {
									oriInvNo	= docId;
								}
								if(!oriInvDate) {
									oriInvDate	= date;
								}
								if(!gstNo) {
									gstNo	= '';
								}
								if(!custNm) {
									custNm	= '';
								}
								/* if(!repType) {
									repType	= '';
								} */
								if(!docId) {
									docId	= '';
								}
								if(!date) {
									date	= '';
								}
								if(!reverseApp) {
									reverseApp	= '';
								}
								pos =statecode+"-"+pos;
								htmlObj1 +='<tr>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+gstNo+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+custNm+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+oriInvNo+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+oriInvDate+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+docId+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+date+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+amount_value+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+pos+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+reverseApp+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+appTax+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+invType+'</td>';
								htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+expType+"</td>";
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+gstIn+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+perTaxRate+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(taxAmt).toFixed(2)+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
								htmlObj1 +='</tr>';

								excelObj +='<Row>' +
								'<Cell><Data ss:Type="String">'+gstNo+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+custNm+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+oriInvNo+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+oriInvDate+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+docId+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+date+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+amount_value+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+pos+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+reverseApp+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+invType+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+expType+'</Data></Cell>'+
								'<Cell><Data ss:Type="String">'+gstIn+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>' +
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
			else if(reqObj.parameters.keyword == "B2CS") {
				log.debug({title: "Inside b2cs Report", details: "Entered"});
				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];
				//Commented by Nikita as functional search result is mismatched
				/*invoiceFilter.push([
					["shipping","is","F"], 
					"AND", 
					["mainline","is","F"], 
					"AND", 
					["taxline","is","F"], 
					"AND", 
					["cogs","is","F"], 
					"AND",
					["custbody_gst_inv_type","anyof","1"], 
					"AND",
					["custbody_gst_org_inv_date","isempty",""], 
					"AND", 
					["custbody_gst_org_inv_num","anyof","@NONE@"], 
					"AND", 
					["custbody_gst_customerregno","isempty",""], 
					"AND", 
					[[["custbody_gst_gsttype","anyof","1"]],
						"OR",
						[["custbody_gst_gsttype","anyof","2"],
							"AND",
							["totalamount","lessthanorequalto","250000.00"]]],
							"AND", 
							["item.type","noneof","Discount"],
							"AND", 
							["item.name","doesnotcontain","Rounding Off"],
							"AND",
							["item.name","doesnotcontain","Round Off"],
							"AND",
							["item.name","doesnotcontain","Round"],
							//"AND",						
							//["subsidiary.internalidnumber","equalto",sub_id],
							"AND", 
							["status","anyof","CustInvc:A","CustInvc:B"]
					//"AND",
					//[[["formulanumeric: CASE WHEN  {custbody_gst_place_of_supply.custrecord_gst_state_abbreviation} != {location.state} THEN 1 ELSE 0 END","equalto","1"],
					//"AND",["amount","lessthanorequalto","250000.00"]],"OR",["formulanumeric: CASE WHEN  {custbody_gst_place_of_supply.custrecord_gst_state_abbreviation} = {location.state} THEN 1 ELSE 0 END","equalto","1"]]
					]);*/
					
				invoiceFilter.push([
				  ["type","anyof","CustInvc"], 
				  "AND", 
				  ["mainline","is","F"], 
				  "AND", 
				  ["shipping","is","F"], 
				  "AND", 
				  ["taxline","is","F"], 
				  "AND", 
				  ["custbody_gst_org_inv_num","anyof","@NONE@"], 
				  "AND", 
				  ["custbody_gst_org_inv_date","isempty",""], 
				  "AND", 
				  ["cogs","is","F"], 
				  "AND", 
				  ["custbody_gst_inv_type","anyof","1"], 
				  "AND", 
				  ["item.type","noneof","Discount"], 
				  "AND", 
				  ["item.name","doesnotcontain","Rounding Off"], 
				  "AND", 
				  ["item.name","doesnotcontain","Round Off"], 
				  "AND", 
				  ["item.name","doesnotcontain","Round"], 
				  "AND", 
				  ["status","anyof","CustInvc:B","CustInvc:A"], 
				  "AND", 
				  ["custbody_gst_customerregno","isempty",""], 
				  "AND", 
//[[["custbody_gst_gsttype","anyof","1"]],"OR",[["custbody_gst_gsttype","anyof","2"],"AND",["totalamount","greaterthan","250000.00"]]]
//Added change as told by Ashish on 19th dec 2022
 [[["custbody_gst_gsttype","anyof","1"]],"OR",[["custbody_gst_gsttype","anyof","2"],"AND",["totalamount","lessthanorequalto","250000.00"]]]
			  
				]);
				
				//log.debug("sub_id B2CS",sub_id);
				if(sub_id) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["subsidiary.internalidnumber","equalto", sub_id]);
				}
				
				if(custObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["entity", "is", custObj]);
					//invoiceFilter.push(search.createFilter("entityid","customermain","is",custObj));
				}
				
				if(secAccBook) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
				}

				if(locationObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["location", "anyof", locationObj]);
				}

				if(gstTypeObj) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["custbody_gst_gsttype", "anyof", gstTypeObj]);
				}
				if(postingPeriodId) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["postingperiod", "anyof", postingPeriodId]);
				}
				if(months && years) {
					invoiceFilter.push("AND");
					invoiceFilter.push(["trandate", "within", fromDate, toDate]);
				}
				else {
					invoiceFilter.push("AND"); 
					invoiceFilter.push(["trandate", "within", currFromDate, currToDate]);

				}
				if(gstIn){
					invoiceFilter.push("AND");
					invoiceFilter.push(["custbody_gst_locationregno","is",gstIn]);
				}
				//invoiceColumn.push(search.createColumn({name: "internalid"}));
				//invoiceColumn.push(search.createColumn({name: "trandate"}));
				invoiceColumn.push(search.createColumn({name: "type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_destinationstate", summary: "GROUP"}));
				//Changed Filter 11th June 2020 and added summary in all columns
				if(!secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value
				}
				if(secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
					invoiceColumn.push(search.createColumn({name: "currency", summary: "GROUP"}));
					invoiceColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",
					formula: "((({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount}) - ({accountingtransaction.exchangerate}*{fxamount}))",label: "Formula (Currency)"}));
				}
				invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				var searchObj = search.create({type:"invoice",filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
				var searchCount = searchObj.runPaged().count;
				log.debug({title: "Search count For b2cs", details: searchCount});
				var htmlObj1	='';
				var excelObj	='';

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Place Of Supply</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">E-Commerce GSTIN</th>';
				htmlObj1 +='</tr>';
				htmlObj1 +='</thead>';
				if(searchCount != 0)
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
								if(!secAccBook){
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"});
								}
								if(secAccBook){
									var taxAmt		= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
								}
								var typeId		= searchResultSN[s].getText({name: "type", summary: "GROUP"});
								var pos			= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var appTax		= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
								var gstIn		= searchResultSN[s].getValue({name: "custbody_gst_commerce_gstin", summary: "GROUP"});
								var perTaxRate	= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});	
								var cessAmt		= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
								//var internalId	= searchResultSN[s].getValue({name: "internalid"});
								var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
							var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
								var statecode= searchResultSN[s].getValue({name: "custbody_gst_destinationstate", summary: "GROUP"});
								//log.debug("internalId",internalId);
								/* var rec = record.load({
								type:record.Type.INVOICE,
								id:internalId
								});									
								var statecode = rec.getValue("custbody_gst_destinationstate"); */
								if(!taxAmt) {
									taxAmt	= '';
								}
								if(pos == "- None -") {
									pos	= '';
								}
								if(!appTax) {
									appTax	= '';
								}
								if(gstIn == "- None -") {
									gstIn	= '';
								}
								pos =statecode+"-"+pos;

								htmlObj1 +='<tr>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+typeId+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+pos+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+appTax+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+perTaxRate+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(taxAmt).toFixed(2)+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+gstIn+'</td>';
								htmlObj1 +='</tr>';

								excelObj +='<Row>' +
								'<Cell><Data ss:Type="String">'+typeId+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+pos+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+gstIn+'</Data></Cell>' +
								'</Row>';
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
			else if(reqObj.parameters.keyword=="CDNUR") {
				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];
				
				if(secAccBook) {
					invoiceFilter.push(search.createFilter({name: "accountingbook",join:"accountingtransaction", operator: search.Operator.ANYOF, values: secAccBook}));
				}
				
				if(custObj) {
					invoiceFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}

				if(locationObj) {
					invoiceFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}

				if(gstTypeObj) {
					invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}
				if(postingPeriodId) {
					invoiceFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}
				if(months && years) {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
				}
				else {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
				}
				
				if(gstIn){
					invoiceFilter.push(search.createFilter({name: "custbody_gst_locationregno", operator: search.Operator.IS, values:gstIn}));
				}

				invoiceFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "cogs", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_customerregno",operator: search.Operator.ISEMPTY}));
				invoiceFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
				if(sub_id){
					invoiceFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: sub_id}));
				}
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round"}));
				//invoiceFilter.push(search.createFilter({name: "approvalstatus", operator: search.Operator.NONEOF, values: [1,3]}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_inv_type", operator: search.Operator.ANYOF, values: ["1","2","3"]}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_onfv_num", operator: search.Operator.ANYOF, values: '@NONE@'}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_onfv_dt", operator: search.Operator.ISEMPTY}));
				//invoice TYpe All
				//ori note refund vouchar date isEmpty
				//number anyof none

				invoiceColumn.push(search.createColumn({name: "total", function: "absoluteValue", summary: "GROUP"}));	
				invoiceColumn.push(search.createColumn({name: "custbody_gst_doc_num", summary: "GROUP"}));	
				invoiceColumn.push(search.createColumn({name: "rate", summary: "GROUP"}));
				//invoiceColumn.push(search.createColumn({name: "taxamount", function: "absoluteValue", summary: "SUM"}));
				//invoiceColumn.push(search.createColumn({name: "amount", function: "absoluteValue", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_ur_type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_pre_gst", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "createdfrom", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "trandate", join: "createdFrom", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_destinationstate", summary: "GROUP"}));

				//Changed Filter 11th June 2020 and added summary in all columns
				if(!secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value 
				}
				if(secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
					invoiceColumn.push(search.createColumn({name: "currency", summary: "GROUP"}));
					invoiceColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",
					formula: "((({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount}) - ({accountingtransaction.exchangerate}*{fxamount}))",
					 label: "Formula (Currency)"}));
				}
				invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				var searchObjCrdMemo = search.create({type:"creditmemo",filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
				var searchCount = searchObjCrdMemo.runPaged().count;
				log.debug('searchCountCDNUR',searchCount);

				var htmlObj1  ='';
				var excelObj  ='';
				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">UR Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Note Refund Voucher Number </th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Note Refund Voucher date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Document Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Advance Receipt Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Advance Receipt date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Place Of Supply</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Note Refund Voucher Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Pre GST</th>';
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
								//var amount          = searchResultSN[s].getValue({name: "amount", function: "absoluteValue", summary: "SUM"});
								//var taxAmt			= searchResultSN[s].getValue({name: "taxamount", function: "absoluteValue", summary: "SUM"});
								if(!secAccBook){
									var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue", summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"});
									var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"});
								}
								if(secAccBook){
									var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue", summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
									var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
								}
								
								var typeId			= searchResultSN[s].getText({name: "custbody_gst_doc_num", summary: "GROUP"});
								//var rate         	=searchResultSN[s].getValue('rate');
								var pos				= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
								var appTax			= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
								var invType			= searchResultSN[s].getText({name: "custbody_gst_inv_type", summary: "GROUP"});
								var gstIn			= searchResultSN[s].getValue({name: "custbody_gst_commerce_gstin", summary: "GROUP"});
								var perTaxRate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});	
								var urType			= searchResultSN[s].getText({name: "custbody_gst_ur_type", summary: "GROUP"});	
								var preGst			= searchResultSN[s].getText({name: "custbody_gst_pre_gst", summary: "GROUP"});	
								var totalAmt		= searchResultSN[s].getValue({name: "total", function: "absoluteValue", summary: "GROUP"});
								var tranDate		= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
								var tranId			= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
								var creFromNo		= searchResultSN[s].getText({name: "createdfrom", summary: "GROUP"});
								var creFromDt		= searchResultSN[s].getValue({name: "trandate", join: "createdFrom", summary: "GROUP"}); 
								var cessAmt			= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
								var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
							var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
								var statecode= searchResultSN[s].getValue({name: "custbody_gst_destinationstate", summary: "GROUP"});
								if(!amount) {
									amount	= '';
								}
								if(!taxAmt) {
									taxAmt	= '';
								}
								if(!creFromDt) {
									creFromDt	= '';
								}
								if(!tranDate) {
									tranDate	= '';
								}
								if(pos == "- None -") {
									pos	= '';
								}
								if(!appTax) {
									appTax	= '';
								}
								if(invType == "- None -") {
									invType	= '';
								}
								if(gstIn == "- None -") {
									gstIn	= '';
								}
								if(creFromNo == "- None -") {
									creFromNo	= '';
								}
								if(preGst == "- None -") {
									preGst	= '';
								}
								if(urType == "- None -") {
									urType	= '';
								}
								if(typeId == "- None -") {
									typeId	= '';
								}
								pos =statecode+"-"+pos;

								htmlObj1 +='<tr>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+urType+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+tranId+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+tranDate+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+typeId+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+creFromNo+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+creFromDt+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+pos+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(totalAmt).toFixed(2)+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+appTax+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+perTaxRate+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(taxAmt).toFixed(2)+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+preGst+'</td>';
								htmlObj1 +='</tr>';

								excelObj +='<Row>' +
								'<Cell><Data ss:Type="String">'+urType+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+tranId+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+tranDate+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+typeId+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+creFromNo+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+creFromDt+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+pos+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+Number(totalAmt).toFixed(2)+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>' +                         
								'<Cell><Data ss:Type="String">'+preGst+'</Data></Cell>' +'</Row>';

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
			else if(reqObj.parameters.keyword=="CDNURA") {
				log.debug({title: "Inside cdnura Report", details: "Entered"});
				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];
				
				if(secAccBook) {
					invoiceFilter.push(search.createFilter({name: "accountingbook",join:"accountingtransaction", operator: search.Operator.ANYOF, values: secAccBook}));
				}
				
				if(custObj) {
					invoiceFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}

				if(locationObj) {
					invoiceFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}

				if(gstTypeObj) {
					invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}
				if(postingPeriodId) {
					invoiceFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}
				if(months && years) {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));	
				}
				else {
					invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));	
				}
				if(gstIn){
					invoiceFilter.push(search.createFilter({name: "custbody_gst_locationregno", operator: search.Operator.IS, values: gstIn}));	
			
				}
				
				invoiceFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
				invoiceFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
				//invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_num", operator: search.Operator.NONEOF, values: '@NONE@'}));
				//invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_date", operator: search.Operator.ISNOTEMPTY}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_customerregno",operator: search.Operator.ISEMPTY}));
				invoiceFilter.push(search.createFilter({name: "mainline", join: "custbody_gst_org_inv_num",operator: search.Operator.IS, values: true}));
				invoiceFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
				if(sub_id){
					invoiceFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: sub_id}));
				}
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));
				invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round"}));
				//invoiceFilter.push(search.createFilter({name: "approvalstatus", operator: search.Operator.NONEOF, values: [1,3]}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_inv_type", operator: search.Operator.ANYOF, values: ["1","2","3"]}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_onfv_num", operator: search.Operator.NONEOF, values: '@NONE@'}));
				invoiceFilter.push(search.createFilter({name: "custbody_gst_onfv_dt", operator: search.Operator.ISNOTEMPTY}));

				//invoiceColumn.push(search.createColumn({name: "taxamount", function: "absoluteValue", summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_gsttype", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_ur_type", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_pre_gst", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_onfv_num", summary: "MIN"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_onfv_dt", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "total", function: "absoluteValue", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "createdfrom", join: "custbody_gst_org_inv_num", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "trandate",join: "custbody_gst_org_inv_num", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "custbody_gst_doc_num", summary: "GROUP"}));	
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
				invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
				//Changed Filter 11th June 2020 and added summary in all columns
				if(!secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
					
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value 
				}
				if(secAccBook){
					invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
					
					invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
					invoiceColumn.push(search.createColumn({name: "currency", summary: "GROUP"}));
					invoiceColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",
					formula: "((({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount}) - ({accountingtransaction.exchangerate}*{fxamount}))",
					label: "Formula (Currency)"}));
				}
				invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

				var searchObjCrdMemo = search.create({type:"creditmemo",filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
				var searchCount = searchObjCrdMemo.runPaged().count;
				log.debug('searchCountCDNURA',searchObjCrdMemo.runPaged().count);

				var htmlObj1  ='';
				var excelObj ='';

				htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
				htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
				htmlObj1 +='<tr>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">UR Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Original Note Refund Voucher Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Original Note Refund Voucher date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Original Invoice Advance Receipt Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Original Invoice Advance Receipt date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Revised Note Refund Voucher Number</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Revised Note Refund Voucher date</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Document Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Supply Type</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Note Refund Voucher Value</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
				htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
				htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;">Pre GST</th>';
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
								var typeId			= searchResultSN[s].getText({name: "custbody_gst_doc_num", summary: "GROUP"});
								var appTax			= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
								//var taxAmt			= searchResultSN[s].getValue({name: "taxamount", function: "absoluteValue", summary: "SUM"});
								if(!secAccBook){
									var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}); 
									var totalAmt		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue", summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"});
								}
								if(secAccBook){
									var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
									var totalAmt		= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue", summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
								
								}
								var perTaxRate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});	
								var urType			= searchResultSN[s].getText({name: "custbody_gst_ur_type", summary: "GROUP"});	
								var preGst			= searchResultSN[s].getText({name: "custbody_gst_pre_gst", summary: "GROUP"});	
								var oriNRVNo		= searchResultSN[s].getValue({name: "custbody_gst_onfv_num", summary: "MIN"});	
								var oriNRVDt		= searchResultSN[s].getValue({name: "custbody_gst_onfv_dt", summary: "GROUP"});	
								var amount_value		= searchResultSN[s].getValue({name: "total", function: "absoluteValue", summary: "GROUP"});
								
								
								var tranDate		= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
								var internalId		= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
								var creFromNo		= searchResultSN[s].getText({name: "createdfrom", join: "custbody_gst_org_inv_num", summary: "GROUP"});
								var creFromDt		= searchResultSN[s].getValue({name: "trandate",join: "custbody_gst_org_inv_num", summary: "GROUP"}); 
								var supplyType		= searchResultSN[s].getText({name: "custbody_gst_gsttype", summary: "GROUP"});
								var cessAmt			= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
								var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
							var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
								if(creFromNo == "- None -") {
									creFromNo	= '';
								}
								if(preGst == "- None -") {
									preGst	= '';
								}
								if(!creFromDt) {
									creFromDt	= '';
								}
								if(!tranDate) {
									tranDate	= '';
								}

								htmlObj1 +='<tr>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+urType+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+oriNRVNo+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+oriNRVDt+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+creFromNo+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+creFromDt+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+internalId+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+tranDate+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+typeId+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+supplyType+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+amount_value+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+appTax+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+perTaxRate+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(taxAmt).toFixed(2)+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
								htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
								htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+preGst+'</td>';
								htmlObj1 +='</tr>';     

								excelObj +='<Row>' +
								'<Cell><Data ss:Type="String">'+urType+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+oriNRVNo+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+oriNRVDt+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+creFromNo+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+creFromDt+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+internalId+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+tranDate+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+typeId+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+supplyType+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+amount_value+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>' +  
								'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>' +
								'<Cell><Data ss:Type="String">'+cessAmt+'</Data>"+cessAmt+"</Cell>' +     
								'<Cell><Data ss:Type="String">'+preGst+'</Data></Cell>' +'</Row>';

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
			else if(reqObj.parameters.keyword == "B2B") {

				var invoiceFilter	= [];
				var invoiceColumn	= [];
				var invoiceSetting	= [];
				
				if(secAccBook) {
					invoiceFilter.push(search.createFilter({name: "accountingbook",join:"accountingtransaction", operator: search.Operator.ANYOF, values: secAccBook}));
				}

				if(custObj) {
					invoiceFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
				}

				if(locationObj) {
					invoiceFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
				}

				if(gstTypeObj) {
					invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
				}

				if(postingPeriodId) {
					invoiceFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
				}

				else if (!postingPeriodId){
					if(months && years) {
						invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
					}
					else if(currFromDate && currToDate){
						invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
					}
				}
				if(gstIn){
					invoiceFilter.push(search.createFilter({name: "custbody_gst_locationregno", operator: search.Operator.IS, values:gstIn}));
				
				}
				
				
			invoiceFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "cogs", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_customerregno",operator: search.Operator.ISNOTEMPTY, values: ""}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_num", operator: search.Operator.ANYOF, values: '@NONE@'}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_date", operator: search.Operator.ISEMPTY, values: ""}));
			//invoiceFilter.push(search.createFilter({name: "item", operator: search.Operator.NONEOF, values: '416'}));
			invoiceFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
			if(sub_id){
				invoiceFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: sub_id}));
			}
			//Start Of :Commented on 12th Nov 2021 Instructed By Sumit
			//invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
			//invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));
			//invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round"}));
			//End Of :Commented on 12th Nov 2021 Instructed By Sumit
			//invoiceFilter.push(search.createFilter({name: "approvalstatus", operator: search.Operator.NONEOF, values: [1,3]}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_inv_type", operator: search.Operator.ANYOF, values: ["1","2"]}));
			invoiceFilter.push(search.createFilter({name: "status", operator: search.Operator.ANYOF, values: ["CustInvc:A","CustInvc:B"]}));
			//Added on 20th Dec 2022 instructed by Aashish
			invoiceFilter.push(search.createFilter({name: "custitem_gst_item_applicable_type", join: "item", operator: search.Operator.ANYOF, values: "1"})); 
			

			invoiceColumn.push(search.createColumn({name: "custbody_gst_customerregno", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_reversal_line", summary: "GROUP"}));
			//Below line is commented on 20 May 2022 
			//invoiceColumn.push(search.createColumn({name: "rate", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "amount", summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "total", summary: "GROUP"}));
			//invoiceColumn.push(search.createColumn({name: "subtotal"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
			//invoiceColumn.push(search.createColumn({name: "amount", join: "taxItem", summary: "GROUP"}));
			//invoiceColumn.push(search.createColumn({name: "taxamount", function: "absoluteValue", summary: "SUM"}));
			//Added On 20thjuly 2020 for customer name(Individual or company)
			invoiceColumn.push(search.createColumn({name: "isperson", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "companyname", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "salutation", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "firstname", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "middlename", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "lastname", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "internalid", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_destinationstate", summary: "GROUP"}));
			
			//Changed Filter 11th June 2020 and added summary in all columns
			if(!secAccBook){
				invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
				invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value
				invoiceColumn.push(search.createColumn({name: "custbody_gst_exprt_typ", summary: "GROUP"})); 
			}
			if(secAccBook){
				invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
				invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
			}
			
			invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

			var searchObj = search.create({type:"invoice",filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
			var searchCount = searchObj.runPaged().count;
			log.debug('CountB2B',searchCount);
			//var searchRange =search_result.run().getRange({start:0,end:1000});	
			var htmlObj1  ='';
			var excelObj ='';
			htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
			htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
			htmlObj1 +='<tr>';
			htmlObj1 +='<th style="border:1px solid#000000;padding:5px 4px;">GSTIN/UIN of Recipient</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Receiver Name</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Number</th>';//Document No.
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice date</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Value</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Place Of Supply</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Reverse Charge</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Type</th>';
			htmlObj1 +="<th style='border: 1px solid #000000; padding: 5px 4px;'>Export Type</th>";
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">E-Commerce GSTIN</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
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
							var custRegNo		= searchResultSN[s].getValue({name: "custbody_gst_customerregno", summary: "GROUP"});
							var date			= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
							
							//var amt          = searchResultSN[s].getValue({name: "amount", summary: "SUM"});
							//subtotal_value = parseFloat(subtotal_value) + parseFloat(amt);
							//var taxAmt			= searchResultSN[s].getValue({name: "taxamount", function: "absoluteValue", summary: "SUM"});
							if(!secAccBook){
								var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"});
								var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"});
							}
							if(secAccBook){
								var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
								var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
							}
							//var total			= searchResultSN[s].getValue({name: "total", summary: "SUM"});
							//var rate			= searchResultSN[s].getValue('rate');
							var internalId	= searchResultSN[s].getValue({name: "internalid", summary: "GROUP"});
								log.debug("internalId",internalId);
							var pos				= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
							var appTax			= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
							var invType			= searchResultSN[s].getText({name: "custbody_gst_inv_type", summary: "GROUP"});
							var gstIn			= searchResultSN[s].getValue({name: "custbody_gst_commerce_gstin", summary: "GROUP"});
							var perTaxRate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});
							var docNo			= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
							var reverseApp		= searchResultSN[s].getText({name: "custcol_gst_reversal_line", summary: "GROUP"});
							var cessAmt			= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
							//for customer name
							var custNm			= "";
							var isIndivCB		= searchResultSN[s].getValue({name: "isperson", join: "customer", summary: "GROUP"});
							var compaName		= searchResultSN[s].getValue({name: "companyname", join: "customer", summary: "GROUP"});
							var salutation		= searchResultSN[s].getValue({name: "salutation", join: "customer", summary: "GROUP"});
							var firstNm			= searchResultSN[s].getValue({name: "firstname", join: "customer", summary: "GROUP"});
							var middleNm		= searchResultSN[s].getValue({name: "middlename", join: "customer", summary: "GROUP"});
							var lastNm			= searchResultSN[s].getValue({name: "lastname", join: "customer", summary: "GROUP"});
							var expType	= searchResultSN[s].getText({name: "custbody_gst_exprt_typ", summary: "GROUP"});
							var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
							var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
							var statecode= searchResultSN[s].getValue({name: "custbody_gst_destinationstate", summary: "GROUP"});
							var subvalue          =searchResultSN[s].getValue({name: "total", summary: "GROUP"});
							/* var rec = record.load({
							type:record.Type.INVOICE,
							id:internalId
							});	
							var subvalue = rec.getValue("total"); */
							//var statecode = rec.getValue("custbody_gst_destinationstate");
							
							log.debug({title: "Inside B2B statecode", details:statecode});
							
							if(!expType) {
								expType	= '';
							}
							log.debug({title: "Inside B2B isIndivCB", details: isIndivCB});
							log.debug({title: "Inside B2B compaName", details: compaName});
							log.debug({title: "Inside B2B salutation", details: salutation});
							log.debug({title: "Inside B2B firstNm", details: firstNm});
							log.debug({title: "Inside B2B lastNm", details: lastNm});
							
							if(compaName == "- None -") {
								compaName	= '';
							}
							if(salutation == "- None -") {
								salutation	= '';
							}
							if(firstNm == "- None -") {
								firstNm	= '';
							}
							if(middleNm == "- None -") {
								middleNm	= '';
							}
							if(lastNm == "- None -") {
								lastNm	= '';
							}

							if(!isIndivCB) {
								custNm			= compaName;
							}
							else {
								custNm			= salutation+" "+firstNm+" "+middleNm+" "+lastNm;
							}
							log.debug({title: "Inside B2B custNm", details: custNm});

							if(!custRegNo) {
								custRegNo	= '';
							}
							if(!reverseApp) {
								reverseApp	= '';
							}
							if(!amount) {
								amount	= '';
							}
							if(!taxAmt) {
								taxAmt	= '';
							}
							if(pos == "- None -") {
								pos	= '';
							}
							if(!appTax) {
								appTax	= '';
							}
							if(invType == "- None -") {
								invType	= '';
							}
							if(gstIn == "- None -") {
								gstIn	= '';
							}
							if(docNo == "- None -") {
								docNo	= '';
							}
							pos = statecode +"-"+pos;
							log.debug({title: "Inside B2B pos", details: pos});

							htmlObj1 +='<tr>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+custRegNo+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+custNm+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+docNo+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+date+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+subvalue+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+pos+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+reverseApp+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+appTax+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+invType+'</td>';
							htmlObj1 +="<td style='border: 1px solid #000000; padding: 5px 4px;'>"+expType+"</td>";
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+gstIn+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+perTaxRate+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(taxAmt).toFixed(2)+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
							htmlObj1 +='</tr>';

							excelObj +='<Row>'+'<Cell><Data ss:Type="String">'+custRegNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+custNm+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+docNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+date+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+subvalue+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+pos+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+reverseApp+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+invType+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+expType+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+gstIn+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell></Row>';
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
		else if(reqObj.parameters.keyword == "B2CLA") {

			var invoiceFilter	= [];
			var invoiceColumn	= [];
			var invoiceSetting	= [];

			if(secAccBook) {
				invoiceFilter.push(search.createFilter({name: "accountingbook",join:"accountingtransaction", operator: search.Operator.ANYOF, values: secAccBook}));
			}
			
			if(custObj) {
				invoiceFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
			}

			if(locationObj) {
				invoiceFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
			}

			if(gstTypeObj) {
				invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
			}
			if(postingPeriodId) {
				invoiceFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
			}
			if(months && years) {
				invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
			}
			else {
				invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
			}
			if(gstIn){
				invoiceFilter.push(search.createFilter({name: "custbody_gst_locationregno", operator: search.Operator.IS, values:gstIn}));
			
			}

			invoiceFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "cogs", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_num", operator: search.Operator.NONEOF, values: '@NONE@'}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_date", operator: search.Operator.ISNOTEMPTY}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_customerregno",operator: search.Operator.ISEMPTY}));
			invoiceFilter.push(search.createFilter({name: "totalamount", operator: search.Operator.GREATERTHAN, values: "250000.00"}));
			invoiceFilter.push(search.createFilter({name: "mainline", join: "custbody_gst_org_inv_num",operator: search.Operator.IS, values: true}));
			invoiceFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
			if(sub_id){
				invoiceFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: sub_id}));
			}
			invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
			invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));
			invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round"}));
			//invoiceFilter.push(search.createFilter({name: "approvalstatus", operator: search.Operator.NONEOF, values: [1,3]}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_inv_type", operator: search.Operator.ANYOF, values: "1"}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: "2"}));
			invoiceFilter.push(search.createFilter({name: "status", operator: search.Operator.ANYOF, values: ["CustInvc:A","CustInvc:B"]}));

			//invoiceColumn.push(search.createColumn({name: "taxamount", summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
			//invoiceColumn.push(search.createColumn({name: "rate", summary: "SUM"}));
			//invoiceColumn.push(search.createColumn({name: "amount", summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "total", summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "type", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_org_inv_num", summary: "MIN"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_org_inv_date", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", join: "custbody_gst_org_inv_num", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_destinationstate", summary: "GROUP"}));
			//Changed Filter 11th June 2020 and added summary in all columns
			if(!secAccBook){
				invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
				invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value
			}
			if(secAccBook){
				invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
				invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
			}

			invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

			var searchObj = search.create({type:"invoice",filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
			var searchCount = searchObj.runPaged().count;
			log.debug('CountB2CLA',searchCount);
			//var searchRange =search_result.run().getRange({start:0,end:1000});	
			var htmlObj1  ='';
			var excelObj ='';
			htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
			htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
			htmlObj1 +='<tr>';
			htmlObj1 +='<th style="border:1px solid#000000;padding:5px 4px;">Original Invoice Number</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Original Invoice date</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Original Place Of Supply</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Revised Invoice Number</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Revised Invoice date</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice Value</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">E-Commerce GSTIN</th>';
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
							var amount_value          =searchResultSN[s].getValue({name: "total", summary: "SUM"});
							//var taxAmt			= searchResultSN[s].getValue({name: "taxamount", summary: "SUM"});
							if(!secAccBook){
								var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}); 
								var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}); 
							}
							if(secAccBook){
								var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
								var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
							}

							var docNumber		=searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
							var date			=searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
							//var rate			=searchResultSN[s].getValue({name: "rate", summary: "GROUP"});
							var pos				= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
							var oriPos			= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", join: "custbody_gst_org_inv_num", summary: "GROUP"});
							var appTax			= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
							var invType			= searchResultSN[s].getText({name: "custbody_gst_inv_type", summary: "GROUP"});
							var gstIn			= searchResultSN[s].getValue({name: "custbody_gst_commerce_gstin", summary: "GROUP"});
							var oriInvNo		= searchResultSN[s].getValue({name: "custbody_gst_org_inv_num", summary: "MIN"});
							var oriInvDate  	= searchResultSN[s].getValue({name: "custbody_gst_org_inv_date", summary: "GROUP"});
							var perTaxRate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});	
							var cessAmt			= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
							var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
							var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
							var statecode= searchResultSN[s].getValue({name: "custbody_gst_destinationstate", summary: "GROUP"});

							if(!oriInvNo) {
								oriInvNo	= docNumber;
							}
							if(!oriInvDate) {
								oriInvDate	= date;
							}
							if(!oriPos) {
								oriPos	= pos;
							}
							if(!amount) {
								amount	= '';
							}
							if(!taxAmt) {
								taxAmt	= '';
							}
							if(pos == "- None -") {
								pos	= '';
							}
							if(!appTax) {
								appTax	= '';
							}
							if(invType == "- None -") {
								invType	= '';
							}
							if(gstIn == "- None -") {
								gstIn	= '';
							}
							oriPos =statecode+"-"+oriPos;

							htmlObj1 +='<tr>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+oriInvNo+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+oriInvDate+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+oriPos+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+docNumber+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+date+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+amount_value+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+appTax+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+perTaxRate+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(taxAmt).toFixed(2)+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+gstIn+'</td>';
							htmlObj1 +='</tr>';

							excelObj += '<Row>'+'<Cell><Data ss:Type="String">'+oriInvNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+oriInvDate+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+oriPos+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+docNumber+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+date+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+amount_value+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+gstIn+'</Data></Cell></Row>';

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
		else if(reqObj.parameters.keyword=="CDNR") {
			var invoiceFilter	= [];
			var invoiceColumn	= [];
			var invoiceSetting	= [];
			
			if(secAccBook) {
				invoiceFilter.push(search.createFilter({name: "accountingbook",join:"accountingtransaction", operator: search.Operator.ANYOF, values: secAccBook}));
			}

			if(custObj) {
				invoiceFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
			}

			if(locationObj) {
				invoiceFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
			}

			if(gstTypeObj) {
				invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
			}
			if(postingPeriodId) {
				invoiceFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
			}
			if(months && years) {
				invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
			}
			else {
				invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
			}
			if(gstIn){
				invoiceFilter.push(search.createFilter({name: "custbody_gst_locationregno", operator: search.Operator.IS, values:gstIn}));
			
			}

			invoiceFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "cogs", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_customerregno",operator: search.Operator.ISNOTEMPTY}));
			invoiceFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
			if(sub_id){
				invoiceFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: sub_id}));
			}
			invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
			invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));
			invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round"}));
			//invoiceFilter.push(search.createFilter({name: "approvalstatus", operator: search.Operator.NONEOF, values: [1,3]}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_inv_type",operator: search.Operator.ANYOF, values: "1"}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_onfv_dt",operator: search.Operator.ISEMPTY}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_onfv_num",operator: search.Operator.ANYOF, values: "@NONE@"}));
			//original Note/refund vaochur date isempty
			// number anyof none
			//invoice Type Regular

			invoiceColumn.push(search.createColumn({name: "createdfrom", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_customerregno", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "tranid", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "total", summary: "GROUP"}));
			//invoiceColumn.push(search.createColumn({name: "taxamount", function: "absoluteValue", summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "entity", summary: "GROUP"}));
			//This below line commented on 20 May 2022 for CDNR duplicate record issue.
			//invoiceColumn.push(search.createColumn({name: "rate", summary: "GROUP"}));
			//invoiceColumn.push(search.createColumn({name: "amount", summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "type", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_pre_gst", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "trandate", join: "createdFrom", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_doc_num", summary: "GROUP"}));	
			//Added On 12th August 2020 for customer name(Individual or company)
			invoiceColumn.push(search.createColumn({name: "isperson", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "companyname", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "salutation", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "firstname", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "middlename", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "lastname", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_destinationstate", summary: "GROUP"}));
			//Changed Filter 11th June 2020 and added summary in all columns
			if(!secAccBook){
				invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
				invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value 
			}
			if(secAccBook){
				invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
				invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
			}
			invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

			var searchObjCrdMemo = search.create({type:"creditmemo",filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
			var searchCount = searchObjCrdMemo.runPaged().count;
			log.debug('searchCountCDNR',searchObjCrdMemo.runPaged().count);

			var htmlObj1  ='';
			var excelObj ='';
			htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
			htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
			htmlObj1 +='<tr>';
			htmlObj1 +='<th  style="border:1px solid#000000;padding:5px 4px;">GSTIN/UIN of Recipient</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Receiver Name</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice/Advance Receipt Number</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Invoice/Advance Receipt date</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Note/Refund Voucher Number</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Note/Refund Voucher date</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Document Type</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Place Of Supply</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Note/Refund Voucher Value</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Pre GST</th>';
			htmlObj1 += '</tr>';
			htmlObj1 += '</thead>';
			htmlObj1 += '<tbody>';

			if(searchCount != 0)
			{
				do
				{
					var searchResultSN = searchObjCrdMemo.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
					if(searchResultSN.length > 0)
					{
						for(var s in searchResultSN )
						{
							//var amount          = searchResultSN[s].getValue({name: "amount", summary: "SUM"});
							//var taxAmt			= searchResultSN[s].getValue({name: "taxamount", function: "absoluteValue", summary: "SUM"});
							if(!secAccBook){
								var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"});
								var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}); 
							}
							if(secAccBook){
								var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
								var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
							}
							//var rate			= searchResultSN[s].getValue({name: "rate", summary: "GROUP"});
							var pos				= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
							var appTax			= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
							var invType			= searchResultSN[s].getText({name: "custbody_gst_inv_type", summary: "GROUP"});
							var gstIn			= searchResultSN[s].getValue({name: "custbody_gst_commerce_gstin", summary: "GROUP"});
							var gstNo			= searchResultSN[s].getValue({name: "custbody_gst_customerregno", summary: "GROUP"});
							//var custNm			= searchResultSN[s].getText({name: "entity", summary: "GROUP"});
							var docNo			= searchResultSN[s].getText({name: "custbody_gst_doc_num", summary: "GROUP"});
							var perTaxRate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});	
							var totalAmt		= searchResultSN[s].getValue({ name: "total",summary: "GROUP"});
							var tranDate		= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
							var tranId			= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
							var preGst			= searchResultSN[s].getText({name: "custbody_gst_pre_gst", summary: "GROUP"});	
							var creFromNo		= searchResultSN[s].getText({name: "createdfrom", summary: "GROUP"});
							var creFromDt		= searchResultSN[s].getValue({name: "trandate", join: "createdFrom", summary: "GROUP"}); 
							var cessAmt			= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
							//for customer name
							var custNm			= "";
							var isIndivCB		= searchResultSN[s].getValue({name: "isperson", join: "customer", summary: "GROUP"});
							var compaName		= searchResultSN[s].getValue({name: "companyname", join: "customer", summary: "GROUP"});
							var salutation		= searchResultSN[s].getValue({name: "salutation", join: "customer", summary: "GROUP"});
							var firstNm			= searchResultSN[s].getValue({name: "firstname", join: "customer", summary: "GROUP"});
							var middleNm		= searchResultSN[s].getValue({name: "middlename", join: "customer", summary: "GROUP"});
							var lastNm			= searchResultSN[s].getValue({name: "lastname", join: "customer", summary: "GROUP"});
							var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
							var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
							var statecode= searchResultSN[s].getValue({name: "custbody_gst_destinationstate", summary: "GROUP"});
							log.debug({title: "Inside CDNR isIndivCB", details: isIndivCB});
							log.debug({title: "Inside CDNR compaName", details: compaName});
							log.debug({title: "Inside CDNR salutation", details: salutation});
							log.debug({title: "Inside CDNR firstNm", details: firstNm});
							log.debug({title: "Inside CDNR lastNm", details: lastNm});

							if(!isIndivCB) {
								custNm			= compaName;
							}
							else {
								custNm			= salutation+" "+firstNm+" "+middleNm+" "+lastNm;
							}
							log.debug({title: "Inside CDNR custNm", details: custNm});

							if(!amount) {
								amount	= '';
							}
							if(!taxAmt) {
								taxAmt	= '';
							}
							if(!creFromDt) {
								creFromDt	= '';
							}
							if(!tranDate) {
								tranDate	= '';
							}
							if(pos == "- None -") {
								pos	= '';
							}
							if(!appTax) {
								appTax	= '';
							}
							if(invType == "- None -") {
								invType	= '';
							}
							if(gstIn == "- None -") {
								gstIn	= '';
							}
							if(docNo == "- None -") {
								docNo	= '';
							}
							if(preGst == "- None -") {
								preGst	= '';
							}
							pos =statecode+"-"+pos;

							htmlObj1 +='<tr>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+gstNo+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+custNm+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+creFromNo+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+creFromDt+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+tranId+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+tranDate+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+docNo+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+pos+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Math.abs(totalAmt)+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+appTax+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+perTaxRate+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(taxAmt).toFixed(2)+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+preGst+'</td>';
							htmlObj1 +='</tr>';

							excelObj +=  '<Row>'+
							'<Cell><Data ss:Type="String">'+gstNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+custNm+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+creFromNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+creFromDt+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+tranId+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+tranDate+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+docNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+pos+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+Math.abs(totalAmt)+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+preGst+'</Data></Cell></Row>';
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
			htmlObj1 +='</table>';	
			var finalString  = htmlObj1 + ":||:" + excelObj;
			context.response.write({output: finalString });

		}
		else if(reqObj.parameters.keyword=="CDNRA") {
			var invoiceFilter	= [];
			var invoiceColumn	= [];
			var invoiceSetting	= [];
			
			if(secAccBook) {
				invoiceFilter.push(search.createFilter({name: "accountingbook",join:"accountingtransaction", operator: search.Operator.ANYOF, values: secAccBook}));
			}

			if(custObj) {
				invoiceFilter.push(search.createFilter({name: "entity", operator: search.Operator.IS, values: custObj}));
			}

			if(locationObj) {
				invoiceFilter.push(search.createFilter({name: "location", operator: search.Operator.ANYOF, values: locationObj}));
			}

			if(gstTypeObj) {
				invoiceFilter.push(search.createFilter({name: "custbody_gst_gsttype", operator: search.Operator.ANYOF, values: gstTypeObj}));
			}
			if(postingPeriodId) {
				invoiceFilter.push(search.createFilter({name: "postingperiod", operator: search.Operator.ANYOF, values: postingPeriodId}));
			}
			if(months && years) {
				invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [fromDate, toDate]}));
			}
			else {
				invoiceFilter.push(search.createFilter({name: "trandate", operator: search.Operator.WITHIN, values: [currFromDate, currToDate]}));
			}
			if(gstIn){
				invoiceFilter.push(search.createFilter({name: "custbody_gst_locationregno", operator: search.Operator.IS, values:gstIn}));
			
			}

			invoiceFilter.push(search.createFilter({name: "mainline", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "shipping", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "taxline", operator: search.Operator.IS, values: false}));
			invoiceFilter.push(search.createFilter({name: "cogs", operator: search.Operator.IS, values: false}));
			//invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_num", operator: search.Operator.NONEOF, values: '@NONE@'}));
			//invoiceFilter.push(search.createFilter({name: "custbody_gst_org_inv_date", operator: search.Operator.ISNOTEMPTY}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_customerregno",operator: search.Operator.ISNOTEMPTY}));
			invoiceFilter.push(search.createFilter({name: "type", join:"item", operator: search.Operator.NONEOF, values: 'Discount'}));
			if(sub_id){
				invoiceFilter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF, values: sub_id}));
			}
			invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Rounding Off"}));
			invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round Off"}));
			invoiceFilter.push(search.createFilter({name: "name", join: "item", operator: search.Operator.DOESNOTCONTAIN, values: "Round"}));
			//invoiceFilter.push(search.createFilter({name: "approvalstatus", operator: search.Operator.NONEOF, values: [1,3]}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_inv_type",operator: search.Operator.ANYOF, values: "1"}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_onfv_dt",operator: search.Operator.ISNOTEMPTY}));
			invoiceFilter.push(search.createFilter({name: "custbody_gst_onfv_num",operator: search.Operator.NONEOF, values: "@NONE@"}));
			//original Note/refund vaochur date isnotempty
			// number noneof none
			//invoiceColumn.push(search.createColumn({name: "taxamount", function: "absoluteValue", summary: "SUM"}));			
			invoiceColumn.push(search.createColumn({name: "custbody_gst_gsttype", summary: "GROUP"}));			
			invoiceColumn.push(search.createColumn({name: "custbody_gst_customerregno", summary: "GROUP"}));			
			invoiceColumn.push(search.createColumn({name: "transactionnumber", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "trandate", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "entity", summary: "GROUP"}));
			//invoiceColumn.push(search.createColumn({name: "amount", summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "type", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "rate", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_place_of_supply", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_tax_rate", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_inv_type", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_commerce_gstin", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "rate", join: "taxItem", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_onfv_num", summary: "MIN"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_onfv_dt", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_pre_gst", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "total", summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "createdfrom", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "trandate", join: "createdFrom", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custbody_gst_doc_num", summary: "GROUP"}));	
			//Added On 12th August 2020 for customer name(Individual or company)
			invoiceColumn.push(search.createColumn({name: "isperson", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "companyname", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "salutation", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "firstname", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "middlename", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "lastname", join: "customer", summary: "GROUP"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_cess_amount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_cgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_sgstamount",summary: "SUM"}));
			invoiceColumn.push(search.createColumn({name: "custcol_gst_igstamount",summary: "SUM"}));

			//Changed Filter 11th June 2020 and added summary in all columns
			if(!secAccBook){
				invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"}));//Inv Value
				invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"}));//Taxable Value 
			}
			if(secAccBook){
				invoiceColumn.push(search.createColumn({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"}));//Inv Value
				invoiceColumn.push(search.createColumn({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"}));//Taxable Value
				invoiceColumn.push(search.createColumn({name: "currency", summary: "GROUP"}));
				invoiceColumn.push(search.createColumn({name: "formulacurrency",summary: "SUM",
				formula: "((({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount}) - ({accountingtransaction.exchangerate}*{fxamount}))",
				label: "Formula (Currency)"}));
			}
			invoiceSetting.push(search.createSetting({name: 'consolidationtype',value: 'NONE'}));

			var searchObjCrdMemo = search.create({type:"creditmemo",filters: invoiceFilter, columns: invoiceColumn, settings: invoiceSetting});
			var searchCount = searchObjCrdMemo.runPaged().count;
			log.debug('Now searchCountCDNUR ',searchObjCrdMemo.runPaged().count);

			var htmlObj1  ='';
			var excelObj ='';

			htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
			htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
			htmlObj1 +='<tr>';
			htmlObj1 +='<th  style="border:1px solid#000000;padding:5px 4px;">GSTIN/UIN of Recipient</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Receiver Name</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Original Note/Refund Voucher Number</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Original Note/Refund Voucher date</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Original Invoice/Advance Receipt Number</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Original Invoice/Advance Receipt date</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Revised Note/Refund Voucher Number</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Revised Note/Refund Voucher date</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Document Type</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Supply Type</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Note/Refund Voucher Value</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Applicable % of Tax Rate</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Rate</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Taxable Value</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">CGST</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">SGST</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">IGST</th>';

			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Cess Amount</th>';
			htmlObj1 += '<th style="border: 1px solid #000000; padding: 5px 4px;">Pre GST</th>';
			htmlObj1 += '</tr>';
			htmlObj1 += '</thead>';
			if(searchCount != 0)
			{
				do
				{
					var searchResultSN = searchObjCrdMemo.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
					if(searchResultSN.length > 0)
					{
						for(var s in searchResultSN )
						{
							//var amount          = searchResultSN[s].getValue({name: "amount", summary: "SUM"});
							//var taxAmt			= searchResultSN[s].getValue({name: "taxamount", function: "absoluteValue", summary: "SUM"});
							if(!secAccBook){
								var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"({fxamount}*{taxitem.rate}/100) + {fxamount}", label: "Invoice Value"});
								var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{fxamount}", label: "Taxable Value"});
							}
							if(secAccBook){
								var amount			= searchResultSN[s].getValue({name: "formulacurrency01", function: "absoluteValue",summary: "SUM",formula:"(({accountingtransaction.exchangerate}*{fxamount})*{taxitem.rate}/100) + ({accountingtransaction.exchangerate}*{fxamount})", label: "Invoice Value"});
								var taxAmt			= searchResultSN[s].getValue({name: "formulacurrency02", function: "absoluteValue", summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}", label: "Taxable Value"});
							}
							var rate 			= searchResultSN[s].getValue({name: "rate", summary: "GROUP"});//make changes on rate
							//var taxAmt			= searchResultSN[s].getValue({name: "taxamount", function: "absoluteValue", summary: "SUM"});
							var docNo			= searchResultSN[s].getText({name: "custbody_gst_doc_num", summary: "GROUP"});
							var custName        = searchResultSN[s].getValue({name: "entity", summary: "GROUP"});
							var pos				= searchResultSN[s].getText({name: "custbody_gst_place_of_supply", summary: "GROUP"});
							var tranDate		= searchResultSN[s].getValue({name: "trandate", summary: "GROUP"});
							var tranId			= searchResultSN[s].getValue({name: "tranid", summary: "GROUP"});
							var appTax			= searchResultSN[s].getValue({name: "custbody_gst_tax_rate", summary: "GROUP"});
							var invType			= searchResultSN[s].getText({name: "custbody_gst_inv_type", summary: "GROUP"});
							var gstIn			= searchResultSN[s].getValue({name: "custbody_gst_commerce_gstin", summary: "GROUP"});
							var gstNo			= searchResultSN[s].getValue({name: "custbody_gst_customerregno", summary: "GROUP"});
							//var custNm			= searchResultSN[s].getText({name: "entity", summary: "GROUP"});
							var perTaxRate		= searchResultSN[s].getValue({name: "rate", join: "taxItem", summary: "GROUP"});	
							var oriNRVNo		= searchResultSN[s].getValue({name: "custbody_gst_onfv_num", summary: "MIN"});	
							var oriNRVDt		= searchResultSN[s].getValue({name: "custbody_gst_onfv_dt", summary: "GROUP"});	
							var preGst			= searchResultSN[s].getText({name: "custbody_gst_pre_gst", summary: "GROUP"});	
							var creFromNo		= searchResultSN[s].getText({name: "createdfrom", summary: "GROUP"});
							var creFromDt		= searchResultSN[s].getValue({name: "trandate", join: "createdFrom", summary: "GROUP"}); 
							var totalAmt		= searchResultSN[s].getValue({name: "total", summary: "SUM"});
							var supplyType		= searchResultSN[s].getText({name: "custbody_gst_gsttype", summary: "GROUP"});
							var cessAmt			= searchResultSN[s].getValue({name: "custcol_gst_cess_amount", summary: "SUM"});
							//for customer name
							var custNm			= "";
							var isIndivCB		= searchResultSN[s].getValue({name: "isperson", join: "customer", summary: "GROUP"});
							var compaName		= searchResultSN[s].getValue({name: "companyname", join: "customer", summary: "GROUP"});
							var salutation		= searchResultSN[s].getValue({name: "salutation", join: "customer", summary: "GROUP"});
							var firstNm			= searchResultSN[s].getValue({name: "firstname", join: "customer", summary: "GROUP"});
							var middleNm		= searchResultSN[s].getValue({name: "middlename", join: "customer", summary: "GROUP"});
							var lastNm			= searchResultSN[s].getValue({name: "lastname", join: "customer", summary: "GROUP"});
							var cgst			= searchResultSN[s].getValue({name: "custcol_gst_cgstamount",summary: "SUM"});
							var sgst			= searchResultSN[s].getValue({name: "custcol_gst_sgstamount",summary: "SUM"});
							var igst			= searchResultSN[s].getValue({name: "custcol_gst_igstamount",summary: "SUM"});
							log.debug({title: "Inside CDNRA isIndivCB", details: isIndivCB});
							log.debug({title: "Inside CDNRA compaName", details: compaName});
							log.debug({title: "Inside CDNRA salutation", details: salutation});
							log.debug({title: "Inside CDNRA firstNm", details: firstNm});
							log.debug({title: "Inside CDNRA lastNm", details: lastNm});

							if(!isIndivCB) {
								custNm			= compaName;
							}
							else {
								custNm			= salutation+" "+firstNm+" "+middleNm+" "+lastNm;
							}
							log.debug({title: "Inside CDNRA custNm", details: custNm});

							if(!amount) {
								amount	= '';
							}
							if(!taxAmt) {
								taxAmt	= '';
							}
							if(!creFromDt) {
								creFromDt	= '';
							}
							if(!tranId) {
								tranId	= '';
							}
							if(!tranDate) {
								tranDate	= '';
							}
							if(pos == "- None -") {
								pos	= '';
							}
							if(!appTax) {
								appTax	= '';
							}
							if(invType == "- None -") {
								invType	= '';
							}
							if(gstIn == "- None -") {
								gstIn	= '';
							}
							if(docNo == "- None -") {
								docNo	= '';
							}
							if(preGst == "- None -") {
								preGst	= '';
							}

							htmlObj1 +='<tr>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+gstNo+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+custNm+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+oriNRVNo+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+oriNRVDt+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+creFromNo+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+creFromDt+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+tranId+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+tranDate+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+docNo+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+supplyType+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(totalAmt).toFixed(2)+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+appTax+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+perTaxRate+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+Number(taxAmt).toFixed(2)+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cgst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+sgst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+igst+'</td>';
							htmlObj1 +='<td align="right" style="border: 1px solid #000000; padding: 5px 4px;">'+cessAmt+'</td>';
							htmlObj1 +='<td style="border: 1px solid #000000; padding: 5px 4px;">'+preGst+'</td>';
							htmlObj1 +='</tr>';

							excelObj +='<Row>'+	'<Cell><Data ss:Type="String">'+gstNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+custNm+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+oriNRVNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+oriNRVDt+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+creFromNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+creFromDt+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+tranId+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+tranDate+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+docNo+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+supplyType+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+Number(totalAmt).toFixed(2)+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+appTax+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+perTaxRate+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+Number(taxAmt).toFixed(2)+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+cessAmt+'</Data></Cell>'+
							'<Cell><Data ss:Type="String">'+preGst+'</Data></Cell></Row>';

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
		else {
			var form       				= serverWidget.createForm({title : 'GSTR -1'});
			var scriptObj 				= runtime.getCurrentScript();
			var clientScriptPath		= scriptObj.getParameter({name: 'custscript_yantragst_cli_script_path_r1'});
			log.debug({title: "clientScriptPath", details:clientScriptPath});
			var isPostingPeriod = scriptObj.getParameter({name: 'custscript_ygst_posting_period'});
			log.debug({title: "isPostingPeriod==", details:isPostingPeriod});
			form.clientScriptModulePath = ''+clientScriptPath+'';//'/SuiteScripts/GSTR1_Report_Cli.js';
			
			var locationSearchObj = search.create({
			   type: "location",
			   filters:
			   [
				  ["country","anyof","IN"]
			   ],
			   columns:
			   [
				  search.createColumn({name: "internalid", label: "Internal ID"}),
				  search.createColumn({name: "country", label: "Country"})
			   ]
			});
		

			var postingperiodId 	= reqObj.parameters.postingperionID;
			log.debug({title: " postingperiodId : ", details: postingperiodId});
			var monthId 	= reqObj.parameters.monthID;
			log.debug({title: " monthId : ", details: monthId});		
			var yearId 		= reqObj.parameters.yearID;
			log.debug({title: " yearId inside get: ", details: yearId});
			//var monthId 	= context.request.parameters.monthID;
			var custId		= context.request.parameters.custID;
			var locationId	= context.request.parameters.locationId;
			var gstTypeId	= context.request.parameters.gstType;
			var subsidiaryId	= context.request.parameters.subsidiaryID;
			var gstIn         = reqObj.parameters.cust_gstin;
			//log.debug({title: " gstIn : ", details: gstIn});	
			//Body Level Fields
			var configRecObj = config.load({type: config.Type.FEATURES});
			var ebaFeatLocId = configRecObj.getValue({fieldId: "locations"});
			log.debug({title: "ebaFeatLocId", details: ebaFeatLocId});

			var exportButton		= form.addSubmitButton({id: 'custpage_export', label: "Export"});
			//var monthRange			= form.addField({id: 'custpage_month_range', label: "Month Range", type: serverWidget.FieldType.DATE});
			var customerField		= form.addField({id: 'custpage_customer', label: "Customer", type: serverWidget.FieldType.SELECT, source: 'customer'});
			if(ebaFeatLocId) {
				var locatonField	= form.addField({id: 'custpage_location', label: "Location", type: serverWidget.FieldType.SELECT});
				locatonField.addSelectOption({ value: '', text: '' });
			}
			var locationSearchObj = search.create({
			   type: "location",
			   filters:
			   [
				  ["country","anyof","IN"]
			   ],
			   columns:
			   [
				  search.createColumn({name: "internalid", label: "Internal ID"}),
				  search.createColumn({name: "country", label: "Country"}),
					search.createColumn({
					 name: "name",
					 sort: search.Sort.ASC,
					 label: "Name"
				  })
			   ]
			});
			do{
				var searchResultSN = locationSearchObj.run().getRange({start: resultIndexSN, end: resultIndexSN + resultStepSN});
				//log.debug("searchResultSN ", searchResultSN.length);
			
				if(searchResultSN.length > 0){
					for(var s in searchResultSN) {
						var locId			= searchResultSN[s].getValue({name: "internalid"});
						var locTxt			= searchResultSN[s].getValue({name: "name"});
						if(locId){
							locatonField.addSelectOption({ value: locId, text: locTxt });
						}
					}
					// increase pointer
					resultIndexSN = resultIndexSN + resultStepSN;
				}
			} while (searchResultSN.length > 0); 
			

			var gstin               = form.addField({id: 'custpage_gstin', label: "GSTIN", type: serverWidget.FieldType.SELECT});
			gstin.addSelectOption({ value: '', text: '' });
			
			var gstType				= form.addField({id: 'custpage_gat_type', label: 'GST Type', type: serverWidget.FieldType.SELECT, source: 'customlist_gst_type'});
			var subsidiaryField		= form.addField({id: 'custpage_subsidiary', label: "Subsidiary", type: serverWidget.FieldType.SELECT});
			
			var locationSearchObj1 = search.create({
			   type: "location",
			   filters:
			   [
				  ["country","anyof","IN"]
			   ],
			   columns:
			   [
				  search.createColumn({name: "internalid", label: "Internal ID"}),
				  search.createColumn({
					 name: "custrecord_gst_nocustomeraddr",
					 join: "address",
					 label: "GST Number"
				  })
			   ]
			});
			
			var searchResultSN1 = locationSearchObj1.runPaged().count;
			if(searchResultSN1 > 0){
				locationSearchObj1.run().each(function(result){
				   gstId	= result.getValue({name: "custrecord_gst_nocustomeraddr",join: "address"});
				   if(gstId){
						gstin.addSelectOption({ value: gstId, text: gstId});
				   }
				   return true;
				});
			}
		
			var subsidiarySearchObj = search.create({
			   type: "subsidiary",
			   filters:
			   [
				  ["country","anyof","IN"]
			   ],
			   columns:
			   [
				  search.createColumn({name: "internalid", label: "Internal ID"}),
				  search.createColumn({
					 name: "name",
					 sort: search.Sort.ASC,
					 label: "Name"
				  }),
				  search.createColumn({name: "country", label: "Country"})
			   ]
			});

			var searchResultSN = subsidiarySearchObj.runPaged().count;
			if(searchResultSN > 0){
				subsidiarySearchObj.run().each(function(result){
				   SubId	= result.getValue({name: "internalid"});
				   SubName	= result.getValue({name: "name"});
				   if(SubId){
						subsidiaryField.addSelectOption({ value: SubId, text: SubName });
					}
				   return true;
				});
			}
			
		
			if(isPostingPeriod==true || isPostingPeriod=='true'){					

				//var postingPeriodField		= form.addField({id: 'custpage_posting_period', label: "Posting Period", type: serverWidget.FieldType.SELECT, source: 'accountingperiod'});
				var postingPeriodField		= form.addField({id: 'custpage_posting_period', label: "Posting Period", type: serverWidget.FieldType.SELECT});
				postingPeriodField.addSelectOption({value: '',text: ''}); 
				//var periodSearch = search.load({id: 'customsearch_ygst_posting_period'});

				var periodSearch = search.create({ type: "accountingperiod",
					filters:
						[
							["isquarter","is","F"],"AND", ["isyear","is","F"], "AND", ["isinactive","is","F"]/*, "AND", ["startdate","on",currFirstDay], "AND",["enddate","on",currLastDay]*/
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
			//var oriInvoiceDate		= form.addField({id: 'custpage_ori_invoice_date', label: 'Original Invoice Date', type: serverWidget.FieldType.DATE});
			//var statusField			= form.addField({id: 'custpage_status', label: "Status", type: serverWidget.FieldType.SELECT, source: 'customlist_gst_report_invoice_status'});
			var searchButton		= form.addButton({id: 'custpage_search', label: "Search", functionName: "fieldData()"});

			var currentDateObj		= new Date();
			var month 				= currentDateObj.getMonth();
			var year				= currentDateObj.getFullYear();
			var currFirstDateObj	= new Date(year, month, 1); 
			//monthRange.defaultValue	= currFirstDateObj;

			//if(monthId) {
			//	monthRange.defaultValue		= monthId;
			//}

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
			log.audit("subsidiaryId",subsidiaryId);
			if(subsidiaryId) {
				subsidiaryField.defaultValue		= subsidiaryId;
			}
			if(gstIn) {
				gstin.defaultValue = gstIn;
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
			if(gstIn)
			{
				params.cust_gstin = gstIn;
			}
			if(subsidiaryId) {
				params.subsidiaryId = subsidiaryId;
			}
			if(isPostingPeriod==true || isPostingPeriod=='true'){
				postingPeriodField.defaultValue	= postingperiodId;
			}
			else{
				monthRange.defaultValue = monthId;
				yearRange.defaultValue 	= yearId;
			}
			var scriptObj = runtime.getCurrentScript(); //scriptObj is a runtime.Script object
			var scriptId = scriptObj.id;
			var deploymentId = scriptObj.deploymentId;
			log.debug('Script ID: ' + scriptObj.id);
			log.debug("Deployment Id: " + scriptObj.deploymentId);
			var suiteletURL = url.resolveScript({scriptId:scriptId,deploymentId: deploymentId, params:params });

			var b2b         		= form.addSubtab({id: 'custpage_b2b_sublist', label: "B2B" });
			var requestDataField10	= form.addField({id: 'custpage_req_ajax_date_r10', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_b2b_sublist'});
			var htmlFileR10 		= form.addField({id: 'custpage_html_r10',      type: serverWidget.FieldType.INLINEHTML,   label: 'Export HTML' ,container:'custpage_b2b_sublist'});            
			var excelFileR10  		= form.addField({id: 'custpage_excel_r10',   type: serverWidget.FieldType.LONGTEXT,   label: 'Print', container: 'custpage_b2b_sublist'});

			//b2ba Report
			var b2ba       			= form.addSubtab({id: 'custpage_b2ba_siblist', label: "B2BA" });
			var requestDataField6	= form.addField({id: 'custpage_req_ajax_date_r6', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_b2ba_siblist'});
			var htmlFileR6			= form.addField({ id: 'custpage_html_r6', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_b2ba_siblist'});
			var excelFileR6  		= form.addField({id: 'custpage_excel_r6', type: serverWidget.FieldType.LONGTEXT,label: 'Print', container: 'custpage_b2ba_siblist'});

			//b2cl Report
			var report1B2CL			= form.addSubtab({id: 'custpage_b2cl_sublist', label: 'B2CL'});
			var requestDataField1	= form.addField({id: 'custpage_req_ajax_date_r1', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_b2cl_sublist'});
			var htmlFileR1			= form.addField({id: 'custpage_html_r1', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_b2cl_sublist'});
			var excelFileR1			= form.addField({id: 'custpage_excel_r1', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_b2cl_sublist'});

			var b2cla       		= form.addSubtab({id: 'custpage_b2cla_sublist', label: "B2CLA" });
			var requestDataField11	= form.addField({id: 'custpage_req_ajax_date_r11', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_b2cla_sublist'});
			var htmlFileR11 		= form.addField({id: 'custpage_html_r11',      type: serverWidget.FieldType.INLINEHTML,   label: 'Export HTML' ,container:'custpage_b2cla_sublist'});            
			var excelFileR11  		= form.addField({id: 'custpage_excel_r11',   type: serverWidget.FieldType.LONGTEXT,   label: 'Print',       container: 'custpage_b2cla_sublist'});

			//b2cs Report
			var b2cs      			= form.addSubtab({id: 'custpage_b2cs_sublist', label: "B2CS" });
			var requestDataField7	= form.addField({id: 'custpage_req_ajax_date_r7', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_b2cs_sublist'});
			var htmlFileR7 			= form.addField({id: 'custpage_html_r7', type: serverWidget.FieldType.INLINEHTML,  label: 'Export HTML' ,container:'custpage_b2cs_sublist'});
			var excelFileR7			= form.addField({id: 'custpage_excel_r7', type: serverWidget.FieldType.LONGTEXT,   label: 'Print',      container: 'custpage_b2cs_sublist'});

			//b2csa Report
			var report1B2CSA		= form.addSubtab({id: 'custpage_b2csa_sublist', label: 'B2CSA'});
			var requestDataField2	= form.addField({id: 'custpage_req_ajax_date_r2', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_b2csa_sublist'});
			var htmlFileR2			= form.addField({id: 'custpage_html_r2', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_b2csa_sublist'});
			var excelFileR2			= form.addField({id: 'custpage_excel_r2', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_b2csa_sublist'});

			var cdnr        		= form.addSubtab({id: 'custpage_cdnr_sublist', label: "CDNR" });
			var requestDataField12	= form.addField({id: 'custpage_req_ajax_date_r12', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_cdnr_sublist'});
			var htmlFileR12 		= form.addField({ id: 'custpage_html_r12',      type: serverWidget.FieldType.INLINEHTML,   label: 'Export HTML' ,container:'custpage_cdnr_sublist'});            
			var excelFileR12   		= form.addField({id: 'custpage_excel_r12',   type: serverWidget.FieldType.LONGTEXT,   label: 'Print',       container: 'custpage_cdnr_sublist'});

			var cdnra       		= form.addSubtab({id: 'custpage_cdnra_sublist', label: "CDNRA" });
			var requestDataField13	= form.addField({id: 'custpage_req_ajax_date_r13', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_cdnra_sublist'});
			var htmlFileR13 		= form.addField({ id: 'custpage_html_r13',      type: serverWidget.FieldType.INLINEHTML,   label: 'Export HTML' ,container:'custpage_cdnra_sublist'});            
			var excelFileR13   		= form.addField({id: 'custpage_excel_r13',   type: serverWidget.FieldType.LONGTEXT,   label: 'Print', container: 'custpage_cdnra_sublist'});

			var cdnur     			= form.addSubtab({id: 'custpage_cdnur_sublist', label: "CDNUR" });
			var requestDataField8	= form.addField({id: 'custpage_req_ajax_date_r8', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_cdnur_sublist'});
			var htmlFileR8 			= form.addField({id: 'custpage_html_r8',       type: serverWidget.FieldType.INLINEHTML,      label: 'Export HTML' ,container:'custpage_cdnur_sublist'});
			var excelFileR8			= form.addField({id: 'custpage_excel_r8',      type: serverWidget.FieldType.LONGTEXT,      label: 'Print', container: 'custpage_cdnur_sublist'});

			var cdnura    			= form.addSubtab({id: 'custpage_cdnura_sublist', label: "CDNURA" });
			var requestDataField9	= form.addField({id: 'custpage_req_ajax_date_r9', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_cdnura_sublist'});
			var htmlFileR9 			= form.addField({id: 'custpage_html_r9',    type: serverWidget.FieldType.INLINEHTML,   label: 'Export HTML' ,container:'custpage_cdnura_sublist'});            
			var excelFileR9			= form.addField({id: 'custpage_excel_r9',type: serverWidget.FieldType.LONGTEXT,   label: 'Print', container: 'custpage_cdnura_sublist'});

			//exp Report	
			var report1EXP			= form.addSubtab({id: 'custpage_exp_sublist', label: 'EXP'});
			var requestDataField3	= form.addField({id: 'custpage_req_ajax_date_r3', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_exp_sublist'});
			var htmlFileR3			= form.addField({id: 'custpage_html_r3', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_exp_sublist'});
			var excelFileR3			= form.addField({id: 'custpage_excel_r3', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_exp_sublist'});

			//expa Report
			var report1EXPA			= form.addSubtab({id: 'custpage_expa_sublist', label: 'EXPA'});
			var requestDataField4	= form.addField({id: 'custpage_req_ajax_date_r4', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_expa_sublist'});
			var htmlFileR4			= form.addField({id: 'custpage_html_r4', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_expa_sublist'});
			var excelFileR4			= form.addField({id: 'custpage_excel_r4', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_expa_sublist'});

			//hsn Report
			var report1HSN			= form.addSubtab({id: 'custpage_esn_sublist', label: 'HSN'});
			var requestDataField5	= form.addField({id: 'custpage_req_ajax_date_r5', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_esn_sublist'});
			var htmlFileR5			= form.addField({id: 'custpage_html_r5', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_esn_sublist'});
			var excelFileR5			= form.addField({id: 'custpage_excel_r5', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_esn_sublist'});
			
			//Exempted Report
			var report1Exempt		= form.addSubtab({id: 'custpage_emempted_sublist', label: 'EXEMPTED'});
			var requestDataField14	= form.addField({id: 'custpage_req_ajax_date_r14', type: serverWidget.FieldType.INLINEHTML,label: 'Export HTML' ,container:'custpage_emempted_sublist'});
			var htmlFileR14		    = form.addField({id: 'custpage_html_r14', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_emempted_sublist'});
			var excelFileR14		= form.addField({id: 'custpage_excel_r14', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_emempted_sublist'});


			htmlFileR1.defaultValue = '<h1>B2CL</h1>';
			excelFileR1.defaultValue = '<h1>Excel Data</h1>';
			requestDataField1.defaultValue ='<script>var keyword_B2CL  ="B2CL"; const redirectURL_B2CL  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_B2CL,  method  :"GET", data:{keyword:keyword_B2CL},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r1_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r1\').innerHTML = response[1];document.getElementById(\'custpage_excel_r1\').style.display = "none";document.getElementById(\'custpage_excel_r1_fs_lbl\').style.display = "none";} });</script>';

			htmlFileR2.defaultValue = '<h1>B2CSA</h1>';
			excelFileR2.defaultValue = '<h1>Excel Data</h1>';
			requestDataField2.defaultValue ='<script>var keyword_B2CSA  ="B2CSA"; const redirectURL_B2CSA  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_B2CSA,  method  :"GET", data:{keyword:keyword_B2CSA},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r2_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r2\').innerHTML = response[1];document.getElementById(\'custpage_excel_r2\').style.display = "none";document.getElementById(\'custpage_excel_r2_fs_lbl\').style.display = "none";} });</script>';

			htmlFileR3.defaultValue = '<h1>EXP</h1>';
			excelFileR3.defaultValue = '<h1></h1>';
			requestDataField3.defaultValue ='<script>var keyword_EXP  ="EXP"; const redirectURL_EXP  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_EXP,  method  :"GET", data:{keyword:keyword_EXP},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r3_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r3\').innerHTML = response[1];document.getElementById(\'custpage_excel_r3\').style.display = "none";document.getElementById(\'custpage_excel_r3_fs_lbl\').style.display = "none";} });	</script>';

			htmlFileR4.defaultValue = '<h1>EXPA</h1>';
			excelFileR4.defaultValue = '<h1></h1>';
			requestDataField4.defaultValue ='<script>var keyword_EXPA  ="EXPA"; const redirectURL_EXPA  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_EXPA,  method  :"GET", data:{keyword:keyword_EXPA},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r4_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r4\').innerHTML = response[1];document.getElementById(\'custpage_excel_r4\').style.display = "none";document.getElementById(\'custpage_excel_r4_fs_lbl\').style.display = "none";} });	</script>';

			htmlFileR5.defaultValue = '<h1>HSN</h1>';
			excelFileR5.defaultValue = '<h1></h1>';
			requestDataField5.defaultValue ='<script>var keyword_HSN  ="HSN"; const redirectURL_HSN  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_HSN,  method  :"GET", data:{keyword:keyword_HSN},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r5_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r5\').innerHTML = response[1];document.getElementById(\'custpage_excel_r5\').style.display = "none";document.getElementById(\'custpage_excel_r5_fs_lbl\').style.display = "none";} });	</script>';

			htmlFileR6.defaultValue = '<h1>B2BA</h1>';
			excelFileR6.defaultValue = '<h1></h1>';
			requestDataField6.defaultValue ='<script>var keyword_B2BA  ="B2BA"; const redirectURL_B2BA  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_B2BA,  method  :"GET", data:{keyword:keyword_B2BA},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r6_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r6\').innerHTML = response[1];document.getElementById(\'custpage_excel_r6\').style.display = "none";document.getElementById(\'custpage_excel_r6_fs_lbl\').style.display = "none";} });	</script>';

			htmlFileR7.defaultValue = '<h1>B2CS</h1>';
			excelFileR7.defaultValue = '<h1></h1>';
			requestDataField7.defaultValue ='<script>var keyword_B2CS  ="B2CS"; const redirectURL_B2CS  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_B2CS,  method  :"GET", data:{keyword:keyword_B2CS},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r7_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r7\').innerHTML = response[1];document.getElementById(\'custpage_excel_r7\').style.display = "none";document.getElementById(\'custpage_excel_r7_fs_lbl\').style.display = "none";} });	</script>';

			htmlFileR8.defaultValue = '<h1>CDNUR</h1>';
			excelFileR8.defaultValue = '<h1></h1>';
			requestDataField8.defaultValue ='<script>var keyword_CDNUR  ="CDNUR"; const redirectURL_CDNUR  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_CDNUR,  method  :"GET", data:{keyword:keyword_CDNUR},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r8_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r8\').innerHTML = response[1];document.getElementById(\'custpage_excel_r8\').style.display = "none";document.getElementById(\'custpage_excel_r8_fs_lbl\').style.display = "none";} });	</script>';

			htmlFileR9.defaultValue = '<h1>CDNURA</h1>';
			excelFileR9.defaultValue = '<h1></h1>';
			requestDataField9.defaultValue ='<script>var keyword_CDNURA  ="CDNURA"; const redirectURL_CDNURA  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_CDNURA,  method  :"GET", data:{keyword:keyword_CDNURA},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r9_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r9\').innerHTML = response[1];document.getElementById(\'custpage_excel_r9\').style.display = "none";document.getElementById(\'custpage_excel_r9_fs_lbl\').style.display = "none";} });	</script>';

			htmlFileR10.defaultValue = '<h1>B2B</h1>';
			excelFileR10.defaultValue = '<h1></h1>';
			requestDataField10.defaultValue ='<script>var keyword_B2B  ="B2B"; const redirectURL_B2B  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_B2B,  method  :"GET", data:{keyword:keyword_B2B},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r10_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r10\').innerHTML = response[1];document.getElementById(\'custpage_excel_r10\').style.display = "none";document.getElementById(\'custpage_excel_r10_fs_lbl\').style.display = "none";} });	</script>';

			htmlFileR11.defaultValue = '<h1>B2CLA</h1>';
			excelFileR11.defaultValue = '<h1></h1>';
			requestDataField11.defaultValue ='<script>var keyword_B2CLA  ="B2CLA"; const redirectURL_B2CLA  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_B2CLA,  method  :"GET", data:{keyword:keyword_B2CLA},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r11_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r11\').innerHTML = response[1];document.getElementById(\'custpage_excel_r11\').style.display = "none";document.getElementById(\'custpage_excel_r11_fs_lbl\').style.display = "none";} });	</script>';

			htmlFileR12.defaultValue = '<h1>CDNR</h1>';
			excelFileR12.defaultValue = '<h1></h1>';
			requestDataField12.defaultValue ='<script>var keyword_CDNR  ="CDNR"; const redirectURL_CDNR ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_CDNR,  method  :"GET", data:{keyword:keyword_CDNR},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r12_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r12\').innerHTML = response[1];document.getElementById(\'custpage_excel_r12\').style.display = "none";document.getElementById(\'custpage_excel_r12_fs_lbl\').style.display = "none";} });	</script>';

			htmlFileR13.defaultValue = '<h1>CDNRA</h1>';
			excelFileR13.defaultValue = '<h1></h1>';
			requestDataField13.defaultValue ='<script>var keyword_CDNRA ="CDNRA"; const redirectURL_CDNRA  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_CDNRA,  method  :"GET", data:{keyword:keyword_CDNRA},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r13_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r13\').innerHTML = response[1];document.getElementById(\'custpage_excel_r13\').style.display = "none";document.getElementById(\'custpage_excel_r13_fs_lbl\').style.display = "none";} });	</script>';
			
			htmlFileR14.defaultValue = '<h1>EXEMPTED</h1>';
			excelFileR14.defaultValue = '<h1></h1>';
			requestDataField14.defaultValue ='<script>var keyword_EXEMPTED ="EXEMPTED"; const redirectURL_EXEMPTED  ="'+suiteletURL+'"; jQuery.ajax({url :redirectURL_EXEMPTED,  method  :"GET", data:{keyword:keyword_EXEMPTED},  success:function(response){response=response.split(":||:");document.getElementById(\'custpage_html_r14_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r14\').innerHTML = response[1];document.getElementById(\'custpage_excel_r14\').style.display = "none";document.getElementById(\'custpage_excel_r14_fs_lbl\').style.display = "none";} });	</script>';

			context.response.writePage({pageObject: form});
		}
		}catch(e){log.debug("Error In If",e);}
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
		var excelFileR12	= reqObj.parameters['custpage_excel_r12'];
		var excelFileR13	= reqObj.parameters['custpage_excel_r13'];
		var excelFileR14	= reqObj.parameters['custpage_excel_r14'];

		log.debug({title: "inside POST excelFileR9", details: excelFileR9});
		log.debug({title: "inside POST excelFileR11", details: excelFileR11});

		var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
		xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
		xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
		xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
		xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
		xmlStr += 'xmlns:htmlObj1="http://www.w3.org/TR/REC-html40">';

		xmlStr += '<Worksheet ss:Name="b2cl">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Invoice Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Place Of Supply</Data></Cell>'+
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">E-Commerce GSTIN </Data></Cell></Row>';	
		xmlStr += excelFileR1;

		xmlStr += '</Table></Worksheet>';

		xmlStr += '<Worksheet ss:Name="b2csa">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Financial Year</Data></Cell>'+
		'<Cell><Data ss:Type="String">Original Month</Data></Cell>'+
		'<Cell><Data ss:Type="String">Place Of Supply</Data></Cell>'+
		'<Cell><Data ss:Type="String">Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">E-Commerce GSTIN </Data></Cell></Row>';

		xmlStr += excelFileR2;
		xmlStr += '</Table></Worksheet>';

		xmlStr += '<Worksheet ss:Name="exp">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Export Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Port Code</Data></Cell>'+
		'<Cell><Data ss:Type="String">Shipping Bill Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Shipping Bill Date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>'+'</Row>';
		xmlStr += excelFileR3;
		xmlStr += '</Table></Worksheet>';


		xmlStr += '<Worksheet ss:Name="expa">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Export Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">Original Invoice Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Original Invoice date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Revised Invoice Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Revised Invoice date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Port Code</Data></Cell>'+
		'<Cell><Data ss:Type="String">Shipping Bill Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Shipping Bill Date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+'</Row>';
		xmlStr += excelFileR4;
		xmlStr += '</Table></Worksheet>';

		xmlStr += '<Worksheet ss:Name="hsn">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">HSN</Data></Cell>'+
		//'<Cell><Data ss:Type="String">Description</Data></Cell>'+
		'<Cell><Data ss:Type="String">UQC</Data></Cell>'+
		'<Cell><Data ss:Type="String">Total Quantity</Data></Cell>'+
		'<Cell><Data ss:Type="String">Total Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Integrated Tax Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">Central Tax Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">State/UT Tax Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>'+'</Row>';

		xmlStr += excelFileR5;

		xmlStr += '</Table></Worksheet>';

		xmlStr += '<Worksheet ss:Name="b2ba">';
		xmlStr += '<Table>' + '<Row>' +
		'<Cell><Data ss:Type="String">Receiver Name </Data></Cell>' +
		'<Cell><Data ss:Type="String">Original Invoice Number </Data></Cell>' +
		'<Cell><Data ss:Type="String">Original Invoice date </Data></Cell>' +
		'<Cell><Data ss:Type="String">Revised Invoice Number </Data></Cell>' +
		'<Cell><Data ss:Type="String">Revised Invoice date </Data></Cell>' +
		'<Cell><Data ss:Type="String">Invoice Value</Data></Cell>' +
		'<Cell><Data ss:Type="String">Place Of Supply </Data></Cell>' +
		'<Cell><Data ss:Type="String">Reverse Charge</Data></Cell>' +
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>' +
		'<Cell><Data ss:Type="String">Invoice Type</Data></Cell>' +
		'<Cell><Data ss:Type="String">Export Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">ECommerce GSTIN</Data></Cell>' +
		'<Cell><Data ss:Type="String">Rate/DATA </Data></Cell>' +
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>' +
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>' +
		'</Row>';

		xmlStr += excelFileR6;
		xmlStr += '</Table></Worksheet>';

		xmlStr += '<Worksheet ss:Name="b2cs">';
		xmlStr += '<Table>'+'<Row>'+
		'<Cell><Data ss:Type="String">Type</Data></Cell>' +
		'<Cell><Data ss:Type="String"> Place Of Supply </Data></Cell>' +
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate </Data></Cell>' +
		'<Cell><Data ss:Type="String">Rate </Data></Cell>' +
		'<Cell><Data ss:Type="String">Taxable Value </Data></Cell>' +
		'<Cell><Data ss:Type="String">Cess Amount </Data></Cell>' +
		'<Cell><Data ss:Type="String">E-Commerce GSTIN</Data></Cell>' +
		'</Row>';
		xmlStr += excelFileR7;
		xmlStr += '</Table></Worksheet>';	

		xmlStr += '<Worksheet ss:Name="cdnur">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">UR Type</Data></Cell>' +
		'<Cell><Data ss:Type="String">Note Refund Voucher Number </Data></Cell>' +
		'<Cell><Data ss:Type="String">Note Refund Voucher date </Data></Cell>' +
		'<Cell><Data ss:Type="String">Document Type</Data></Cell>' +
		'<Cell><Data ss:Type="String">Invoice Advance Receipt Number</Data></Cell>' +
		'<Cell><Data ss:Type="String">Invoice Advance Receipt date </Data></Cell>' +
		'<Cell><Data ss:Type="String">Place Of Supply</Data></Cell>' +
		'<Cell><Data ss:Type="String">Note Refund Voucher Value </Data></Cell>' +
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>' +
		'<Cell><Data ss:Type="String">Rate </Data></Cell>' +
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>' +
		'<Cell><Data ss:Type="String">Cess Amount </Data></Cell>' +                         
		'<Cell><Data ss:Type="String">Pre GST </Data></Cell>' +'</Row>';		
		xmlStr += excelFileR8;
		xmlStr += '</Table></Worksheet>';		

		xmlStr += '<Worksheet ss:Name="cdnura">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">UR Type</Data></Cell>' +
		'<Cell><Data ss:Type="String"> Original Note Refund Voucher Number </Data></Cell>' +
		'<Cell><Data ss:Type="String">Original Note Refund Voucher date </Data></Cell>' +
		'<Cell><Data ss:Type="String">Original Invoice Advance Receipt Number</Data></Cell>' +
		'<Cell><Data ss:Type="String">Original Invoice Advance Receipt date</Data></Cell>' +
		'<Cell><Data ss:Type="String">Revised Note Refund Voucher Number </Data></Cell>' +
		'<Cell><Data ss:Type="String">Revised Note Refund Voucher date</Data></Cell>' +
		'<Cell><Data ss:Type="String">Document Type </Data></Cell>' +
		'<Cell><Data ss:Type="String">Supply Type</Data></Cell>' +
		'<Cell><Data ss:Type="String">Note Refund Voucher Value </Data></Cell>' +
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>' +
		'<Cell><Data ss:Type="String">Rate</Data></Cell>' +  
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>' +
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>' +     
		'<Cell><Data ss:Type="String">Pre GST </Data></Cell>' +'</Row>';
		xmlStr += excelFileR9;
		xmlStr += '</Table></Worksheet>';		

		xmlStr += '<Worksheet ss:Name="b2b">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">GSTIN/UIN of Recipient</Data></Cell>'+
		'<Cell><Data ss:Type="String">Receiver Name</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Place Of Supply</Data></Cell>'+
		'<Cell><Data ss:Type="String">Reverse Charge</Data></Cell>'+
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">Export Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">E-Commerce GSTIN</Data></Cell>'+
		'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Taxabale Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell></Row>';	

		xmlStr +=excelFileR10;
		xmlStr += '</Table></Worksheet>';	

		xmlStr += '<Worksheet ss:Name="b2cla">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Original Invoice Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Original Invoice date	</Data></Cell>'+
		'<Cell><Data ss:Type="String">Original Place Of Supply</Data></Cell>'+
		'<Cell><Data ss:Type="String">Revised Invoice Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Revised Invoice date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">E-Commerce GSTIN</Data></Cell></Row>';	

		xmlStr += excelFileR11;
		xmlStr += '</Table></Worksheet>';									

		xmlStr += '<Worksheet ss:Name="cdnr">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">GSTIN/UIN of Recipient</Data></Cell>'+
		'<Cell><Data ss:Type="String">Receiver Name</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice/Advance Receipt Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice/Advance Receipt date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Note/Refund Voucher Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Note/Refund Voucher date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Document Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">Place Of Supply</Data></Cell>'+
		'<Cell><Data ss:Type="String">Note/Refund Voucher Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">Pre GST</Data></Cell></Row>';

		xmlStr += excelFileR12;
		xmlStr += '</Table></Worksheet>';


		xmlStr += '<Worksheet ss:Name="cdnra">';
		xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">GSTIN/UIN of Recipient</Data></Cell>'+
		'<Cell><Data ss:Type="String">Receiver Name</Data></Cell>'+
		'<Cell><Data ss:Type="String">Original Note/Refund Voucher Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Original Note/Refund Voucher date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Original Invoice/Advance Receipt Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Original Invoice/Advance Receipt date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Revised Note/Refund Voucher Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Revised Note/Refund Voucher date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Document Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">Supply Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">Note/Refund Voucher Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">Pre GST</Data></Cell></Row>';	

		xmlStr += excelFileR13;
		xmlStr += '</Table></Worksheet>'; 
		
		
		xmlStr += '<Worksheet ss:Name="report1Exempt">';
		xmlStr += '<Table>'+'<Row>'+
		'<Cell><Data ss:Type="String">GST Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">GST Applicable Type</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Number</Data></Cell>'+
		'<Cell><Data ss:Type="String">Invoice Date</Data></Cell>'+
		'<Cell><Data ss:Type="String">Total Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
		'<Cell><Data ss:Type="String">Integrated Tax Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">Central Tax Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">State/UT Tax Amount</Data></Cell>'+
		'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>+</Row>';	
	
		xmlStr += excelFileR14;
		xmlStr += '</Table></Worksheet>'; 

		xmlStr += '</Workbook>';
		var fileName	= "GST_Report_1_"+new Date()+".xls";

		var encodedString	= encode.convert({string: xmlStr, inputEncoding: encode.Encoding.UTF_8, outputEncoding: encode.Encoding.BASE_64});
		var fileObj			= file.create({name: fileName, fileType: file.Type.EXCEL, contents: encodedString});
		context.response.writeFile({file: fileObj});
	}catch(e){log.debug("Error In Else",e);}
	}
	//	}


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
/*xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Original Invoice Number</Data></Cell>'+
				'<Cell><Data ss:Type="String">Original Invoice date	</Data></Cell>'+
				'<Cell><Data ss:Type="String">Original Place Of Supply</Data></Cell>'+
				'<Cell><Data ss:Type="String">Revised Invoice Number</Data></Cell>'+
				'<Cell><Data ss:Type="String">Revised Invoice date</Data></Cell>'+
				'<Cell><Data ss:Type="String">Invoice Value</Data></Cell>'+
				'<Cell><Data ss:Type="String">Applicable % of Tax Rate</Data></Cell>'+
				'<Cell><Data ss:Type="String">Rate</Data></Cell>'+
				'<Cell><Data ss:Type="String">Taxable Value</Data></Cell>'+
				'<Cell><Data ss:Type="String">Cess Amount</Data></Cell>'+
				'<Cell><Data ss:Type="String">E-Commerce GSTIN</Data></Cell></Row>';	
 */
