/******************************************************
*File Name: 		CT_SUT_Vendor_Statement_template
*Company : 		Yantra Inc.
*Date Created: 	27/11/2020
*Created By:      Kunal Mahajan
*Description: 		This script is used to Generate Print Vendor Statement template.
*
* *		Date			Author				Requirement By				Comments
 *  27 Nov 2020		Kunal Mahajan			Shweta						Script Created.
 *  11 Dec 2020		Kunal Mahajan			Neha						Aging results are fetching from Search
*******************************************************/


/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
var UIMODULE,RUNTIME,RECORD,REDIRECT,SEARCH,XML,CONFIG,RENDER,FORMAT;
define(['N/ui/serverWidget','N/runtime','N/record','N/redirect','N/search','N/xml','N/config','N/render','N/format'],

function(obj_ui,obj_runtime,obj_record,obj_redirect,obj_search,obj_xml,obj_config,obj_render,obj_format) 
{
   
	UIMODULE = obj_ui;
	RUNTIME = obj_runtime;
	RECORD = obj_record;
	REDIRECT = obj_redirect;
	SEARCH = obj_search;
	XML = obj_xml;
	CONFIG = obj_config;
	RENDER = obj_render;
	FORMAT = obj_format;
	
    function onRequest(context) 
    {
    	var request  = context.request;
		var response = context.response;
		
		if(request.method == 'GET')
    	{
    		try
    		{
    			
    			//Parameters 
    			var i_vendorId = context.request.parameters.vendorname;
    			var d_from_date = context.request.parameters.startdate;
    			var d_to_date = context.request.parameters.enddate;
    			log.debug('Parameters - '+i_vendorId+'# '+d_from_date+'#'+d_to_date);    	
    			
    			var startdate = FORMAT.format({value:d_from_date,type:FORMAT.Type.DATE});
    			var enddate = FORMAT.format({value:d_to_date,type:FORMAT.Type.DATE});
    			log.debug('Converted Date - '+startdate+'#enddate- '+enddate);    
    			
    			var configRecObj = CONFIG.load({type: CONFIG.Type.COMPANY_INFORMATION});
    			var companyName = configRecObj.getValue({fieldId: 'companyname'});
    			companyName = XML.escape({xmlText :companyName})
//    			log.debug('onRequest','companyName :'+companyName);
    			
    			var scriptObj 				= RUNTIME.getCurrentScript();
    			var companyLogoURL		= scriptObj.getParameter({name: 'custscript_ygst_company_logo_url'});
    			log.debug('onRequest:Get()','companyLogoURL =='+ companyLogoURL);    
    			
    			//var companyLogo = 'https://5950164-sb1.app.netsuite.com/core/media/media.nl?id=360&amp;c=5950164_SB1&amp;h=336ade4e252f4bc6791d';    			
    			companyLogoURL = XML.escape({xmlText :companyLogoURL})
    			var companyLogo = companyLogoURL;
    			var image_tag = '<img src="'+companyLogo+'"/>';
    			    			
    			var companySite = configRecObj.getValue({fieldId: 'url'});
    			log.debug('onRequest','companySite :'+companySite);
    			
    			var today = new Date();
    			var d_today =  formatDate(today);
    			
    			
    		  	var o_vendor =RECORD.load({type: 'vendor',id: i_vendorId, isDynamic: true});
				var s_vendor_name = o_vendor.getValue({fieldId : 'entityid'});
				var s_vendor_address = o_vendor.getValue({fieldId : 'defaultaddress'});
				var s_vendor_subsidiary = o_vendor.getText({fieldId : 'subsidiary'});
				var i_vendor_subsidiary = o_vendor.getValue({fieldId : 'subsidiary'});
				var custCreatedDate = o_vendor.getValue({fieldId : 'datecreated'});
				
				//log.debug('custCreatedDate0- '+custCreatedDate);
				custCreatedDate = FORMAT.format({value:custCreatedDate,type:FORMAT.Type.DATE});
				log.debug('custCreatedDate1- '+custCreatedDate);
				
				var o_subsidiary =RECORD.load({type: 'subsidiary',id: i_vendor_subsidiary, isDynamic: true});
				var s_currency = o_subsidiary.getText({fieldId : 'currency'});
				log.debug('s_vendor_name'+s_vendor_name+'#'+s_vendor_address);
				
				// Statement Details 
				/*var opBalanceEndDatems = new Date(startdate.getTime());
				log.debug( 'searchVendorTransactions', 'opBalanceEndDatems = '+opBalanceEndDatems);
				
				opBalanceEndDatems = opBalanceEndDatems - 86400000;
				log.debug('searchVendorTransactions', 'opBalanceEndDatems = '+opBalanceEndDatems);
				
				var opBalanceEndDate = new Date(opBalanceEndDatems);
				log.debug( 'searchVendorTransactions', 'opBalanceEndDate = '+opBalanceEndDate);*/
				
				var openingBalanceDate = startdate;
				var openingBalance = getOpeningBalance(i_vendorId, startdate);////custCreatedDate
				
				
    			var xmlBody ="";
    			xmlBody += "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdf>";
    			// HEADER Details
    			xmlBody += "<head><style>";
        		xmlBody += "td p {align:left}";
        		xmlBody += "table {";
        		xmlBody += "   font-family: Times New Roman, Georgia, Serif;";//font-weight: bold;
        		xmlBody += "}";
        		xmlBody += "<\/style>" ;
        		
        		xmlBody += "  <macrolist>";
        	    xmlBody += "    <macro id=\"smallheader\">"; 
        	    xmlBody += "<table width=\"100%\" align=\"right\">";
    	    	xmlBody += " <tr>";
    	    	xmlBody += " <td  style=\"width: 35%;\">"+image_tag+"<\/td>"; // border-right:none; border-bottom:none;
    	    	xmlBody += " <td  style=\"width: 30%;\"></td>";// border-left:none; border-right:none; border-bottom:none;
    	    	xmlBody += " <td  style=\"width: 35%;\" align=\"right\" valign=\"bottom\"><h2 style=\"font-size:25px;text-align:right\"><b>Vendor Statement</b></h2><\/td>";
    	    	xmlBody += " <\/tr>";
        		xmlBody += "<\/table>";
        	    xmlBody += "    <\/macro>";
        		xmlBody += "  <\/macrolist>";		
        	    xmlBody += "		<\/head>";
        	    
        	    xmlBody += "<body font-size=\"10\" header=\"smallheader\" header-height=\"37mm\">";
    			
    			xmlBody += "<table width=\"100%\" style=\"table-layout: fixed\">";// style=\"border-top-style:none;border-bottom-style:none;border-right-style:none;border-left-style:none\"
    			xmlBody += "	<tr>";
    			xmlBody += "		<td align=\"left\" width=\"30\"  style=\"font-size: 11pt;\"><b>"+s_vendor_name+"</b><br />"+s_vendor_address+"<\/td>";// style=\"font-size: 12pt;\"
    			xmlBody += "		<td align=\"center\" width=\"30\"  style=\"font-size: 12pt;\"><\/td>";
    			xmlBody += "		<td align=\"center\" valign=\"bottom\" width=\"30\"  style=\"font-size: 11pt;\"><b>Date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: </b>"+d_today+" <br /> <b>Amount Due&nbsp;&nbsp; : </b><br /><b> Currency &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: </b>"+s_currency+"<br /> <b>Subsidiary &nbsp;&nbsp;&nbsp;&nbsp; : </b>"+s_vendor_subsidiary+"<\/td>";
    			xmlBody += "	<\/tr>";
    			xmlBody += "	<tr>";
    			xmlBody += "		<td align=\"left\" width=\"30\" style=\"font-size: 11pt;\"><b>Bill To: </b><\/td>";// style=\"font-size: 12pt;\"
    			xmlBody += "		<td align=\"center\" width=\"20\"  style=\"font-size: 12pt;\"><\/td>";
    			xmlBody += "		<td align=\"left\" valign=\"bottom\" width=\"30\" style=\"font-size: 11pt;\"><br/><b>From Date:  </b>"+startdate+"<br/><b>To Date:  </b>"+enddate+"<\/td>";
    			xmlBody += "	<\/tr>";
    			xmlBody += "<\/table>";
    			xmlBody += "<br/><br/>";
    			
    			xmlBody += "<table align=\"center\" width=\"100%\"  border=\"0.1\" style=\"table-layout: fixed\">";// style=\"border-top-style:none;border-bottom-style:none;border-right-style:none;border-left-style:none\"
    			xmlBody += "<tr>";
    			xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"center\" colspan=\"1\" >Date</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >Transaction</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >Reference No.</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\" >Memo</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >Debit</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >Credit</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"14%\" align=\"center\" colspan=\"1\" >Balance<BR/></td>";
    			xmlBody += "</tr>";
    			
    			var blank = '-';
    			var description = 'Opening Balance';
    			xmlBody += "<tr>";
    			xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"left\" colspan=\"1\" >"+ openingBalanceDate+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"justified\" colspan=\"1\" >"+ XML.escape({xmlText :description})+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"14%\" align=\"right\" colspan=\"1\" >"+ openingBalance+"</td>";
    			xmlBody += "</tr>";
    			
    			var balance = 0;
    			var lastInternalID = 0;
    			var totalAmount = 0;
    			totalAmount = parseFloat(totalAmount);
    			var debitTotal = 0;
    			debitTotal = parseFloat(debitTotal);
    			var creditTotal = 0;
    			creditTotal = parseFloat(creditTotal);
    			var recordCount = 0;
    			log.debug('lastInternalID - '+lastInternalID+'#i_vendorId- '+i_vendorId+'#s date- '+startdate+'#e date- '+enddate);
    			
    			//var search_vs = SEARCH.load({ id: 'customsearch_vendor_statement'});
    			var search_vs = SEARCH.load({ id: 'customsearch_ygst_vendor_statement'});
    	    	//if(search_vendorStatement)
    			{
    	    		//Add Filter to search 
    	        	 search_vs.filters.push(SEARCH.createFilter({ name: 'internalidnumber', operator: SEARCH.Operator.GREATERTHAN, values: lastInternalID}));
    	        	 search_vs.filters.push(SEARCH.createFilter({ name: 'name', operator: SEARCH.Operator.ANYOF, values: i_vendorId}));
    	        	 search_vs.filters.push(SEARCH.createFilter({ name: 'trandate', operator: SEARCH.Operator.ONORAFTER, values: startdate}));//ONORBEFORE//startdate
    	        	 search_vs.filters.push(SEARCH.createFilter({ name: 'trandate', operator: SEARCH.Operator.ONORBEFORE, values: enddate}));//ONORAFTER//enddate
	        		 
    	        	var search_vendorStatement= search_vs.run().getRange({start: 0,end: 1000});
    	        	log.debug('#search_vendorStatement - '+search_vendorStatement+'#length- '+search_vendorStatement.length);
    	        	
    	        	var breakFlag = 0;
    	        	if(search_vendorStatement != null || search_vendorStatement != '')
    	        	{
    	        		var length = search_vendorStatement.length;
    	        		log.debug('Search result length0 = ' +length);
    					
    					for (var counter = 0; counter < length; counter++)
    					{
    						//recordCount = recordCount + 1;

    						//var result = search_vendorStatement;
    						   						
    						var internalID = '';
    						var amount = '';
    						var type = '';
    						var date = '';
    						var number = '';
    						var typenumber = '';
    						var memo = '';
    						var previousInternalID = '';
    						
    						internalID = search_vendorStatement[counter].getValue({name: "internalid"});
    						if(internalID)
    						{
    							previousInternalID = lastInternalID;
    						}
    						amount = search_vendorStatement[counter].getValue({name: "amount"});
    						if(amount)
    						{
    							amount = parseFloat(amount);
    							amount = Math.round(amount*100)/100;
    						}
    						date = search_vendorStatement[counter].getValue({name: "trandate"});
    						memo = search_vendorStatement[counter].getValue({name: "memomain"});
    						if(memo)
    						{
    							memo = XML.escape({xmlText :memo});
    						}
    						type = search_vendorStatement[counter].getValue({name: "type"});
    						number = search_vendorStatement[counter].getValue({name: "tranid"});
    						if(number != '' || number != null || number != undefined)
    						{
    							typenumber = type + ' ' + number;
    						}
    						var tran_number = search_vendorStatement[counter].getValue({name: "transactionnumber"});
    						log.debug('Search Data11','tran_number->'+tran_number+'#ID- '+internalID+'#amount- '+amount +'#date- '+date+'#Type-> '+type+'#number- '+number+'#typenumber- '+typenumber);
    						
    						if(counter >= 900)
    						{
    							if(previousInternalID != internalID)
    							{
    								breakFlag = 1;
    							} // END if(previousInternalID != internalID)
    							
    						} // END if(counter >= 900)
    						
    						if(breakFlag == 1)
    						{
    							break;
    						} // END if(breakFlag == 1)
    						
    						totalAmount = parseFloat(totalAmount) - parseFloat(amount);
    						totalAmount = Math.round(totalAmount*100)/100;
    						log.debug('Search Data','totalAmount1- '+totalAmount);
    						
    						var blank = '-';
    						xmlBody += "<tr>";
    		    			xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"left\" colspan=\"1\" >"+ date+"</td>";
    		    			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"justified\" colspan=\"1\" >"+ XML.escape({xmlText :type})+"</td>";
    		    			if(number == '' || number == null)
    		    			{
    		    				xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    		    			}
    		    			else
		    				{
    		    				xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >"+ number+"</td>";
		    				}
    		    			if(memo == '' || memo == null)
    		    			{
    		    				xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    		    			}
    		    			else
    		    			{
    		    				xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :memo})+"</td>";
    		    			}
    		    			if((type == 'VendPymt'  || type == 'VendCred')|| (type == 'Journal' && parseFloat(amount) <= parseFloat(0) ))
    		    			{
    		    				xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ (-(amount))+"</td>";
    		    				xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    		    				debitTotal = parseFloat(debitTotal) - parseFloat(amount);
    							debitTotal = Math.round(debitTotal*100)/100;
    		    			}
    		    			if((type == 'VendBill')|| (type == 'Journal' && parseFloat(amount) > parseFloat(0)))
    		    			{
    		    				xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    		    				xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ amount+"</td>";
    		    				creditTotal = parseFloat(creditTotal) + parseFloat(amount);
    							creditTotal = Math.round(creditTotal*100)/100;
    		    			}
    		    			
    		    			if(counter == 0 && lastInternalID == 0)
    						{
    		    				log.debug( 'ScheduleTest', 'first time');
    							log.debug( 'ScheduleTest', 'openingBalance = ' +openingBalance);
    							balance = parseFloat(openingBalance) - parseFloat(amount);
    							balance = Math.round(balance*100)/100;
    							log.debug( 'ScheduleTest', 'balance = ' +balance);
    						} // END if(counter == 0 && lastInternalID == 0)
    						else
    						{
    							log.debug( 'ScheduleTest', 'not first time');
    							balance = parseFloat(balance) - parseFloat(amount);
    							balance = Math.round(balance*100)/100;
    							log.debug( 'ScheduleTest', 'balance = ' +balance);
    						} // END else
    		    			
    		    			xmlBody += "<td border-width=\"0.1\" width=\"14%\" align=\"right\" colspan=\"1\" >"+ balance+"</td>";
    		    			xmlBody += "</tr>";
    						
    						
    					}//for (var counter = 0; counter < searchResults.length; counter++)
    					
    	        	}//if(search_vendorStatement != null || search_vendorStatement != '')
    			}//if(search_vendorStatement)
    	    	
    	    	totalAmount = parseFloat(totalAmount);
    			totalAmount = Math.round(totalAmount*100)/100;
    			log.debug(  'totalAmount = ' +totalAmount);
    			log.debug( 'counter = ' +counter);

    			var currentBalance = parseFloat(openingBalance) + parseFloat(totalAmount);
    			currentBalance = Math.round(currentBalance*100)/100;
    			log.debug( 'currentBalance = ' +currentBalance);
    			
    			var blank = '-';
    			var endDescription = 'Total';
    			xmlBody += "<tr>";
    			xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"left\" colspan=\"1\" >"+ XML.escape({xmlText :d_to_date})+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"justified\" colspan=\"1\" >"+ XML.escape({xmlText :endDescription})+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ debitTotal+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ + creditTotal+"</td>";
    			xmlBody += "<td border-width=\"0.1\" width=\"14%\" align=\"right\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			xmlBody += "</tr>";
    			
    			// var blank = '-';
    			// var endDescription = 'Credit Total';
    			// xmlBody += "<tr>";
    			// xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"left\" colspan=\"1\" >"+ XML.escape({xmlText :d_to_date})+"</td>";
    			// xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"justified\" colspan=\"1\" >"+ XML.escape({xmlText :endDescription})+"</td>";
    			// xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			// xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			// xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			// xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ creditTotal+"</td>";
    			// xmlBody += "<td border-width=\"0.1\" width=\"14%\" align=\"right\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    			// xmlBody += "</tr>";   			
    			
    			if(currentBalance < 0)
    			{
    				var blank = '-';
    				var endDescription = 'Closing Balance';
    				var newbalance = (-(currentBalance));
    				xmlBody += "<tr>";
    				xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"left\" colspan=\"1\" >"+ XML.escape({xmlText :d_to_date})+"</td>";
        			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"justified\" colspan=\"1\" >"+ XML.escape({xmlText :endDescription})+"</td>";
        			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
        			xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
        			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ newbalance+"</td>";
        			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
        			xmlBody += "<td border-width=\"0.1\" width=\"14%\" align=\"right\" colspan=\"1\" >"+ XML.escape({xmlText :blank})+"</td>";
    				xmlBody += "</tr>";
    			} // END if(currentBalance < 0)
    			else if(currentBalance > 0)
    			{
    				var blank = '-';
    				var endDescription = 'Closing Balance';
    				xmlBody += "<tr>";
    				xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"left\" colspan=\"1\">"+XML.escape({xmlText :d_to_date})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"justified\" colspan=\"1\">"+XML.escape({xmlText :endDescription})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\">"+XML.escape({xmlText :blank})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\">"+XML.escape({xmlText :blank})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\">"+XML.escape({xmlText :blank})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\">"+currentBalance+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"14%\" align=\"right\" colspan=\"1\">"+XML.escape({xmlText :blank})+"</td>";
    				xmlBody += "</tr>";
    			} // END else if(currentBalance > 0)
    			else
    			{
    				var blank = '-';
    				var endDescription = 'Closing Balance';
    				xmlBody += "<tr>";
    				xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"left\" colspan=\"1\">"+XML.escape({xmlText :d_to_date})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"justified\" colspan=\"1\">"+XML.escape({xmlText :endDescription})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\">"+XML.escape({xmlText :blank})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\">"+XML.escape({xmlText :blank})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\">"+XML.escape({xmlText :blank})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\">"+XML.escape({xmlText :blank})+"</td>";
    				xmlBody += "<td border-width=\"0.1\" width=\"14%\" align=\"right\" colspan=\"1\">"+currentBalance+"</td>";
    				xmlBody += "</tr>";
    			} // END else
    			
    			xmlBody += "<\/table>";
				/*
    			xmlBody += "<br/><br/>";
    			xmlBody += "<table align=\"center\" width=\"100%\"  border=\"0.1\" style=\"table-layout: fixed\">";
      			xmlBody += "<tr>";
      			xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"center\" colspan=\"1\" >1-30</td>";
      			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >31-60</td>";
      			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >61-90</td>";
      			xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\" >Over 91</td>";
      			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >Total Outstanding</td>";
      			xmlBody += "</tr>";
      			
    			//========Aging Table========//
    			//var search_rep = SEARCH.load({ id: 'customsearch_ap_aging_report'});
    			
    			///search
    			var search_rep = SEARCH.create({
    				   type: "transaction",
    				   filters:
    				   [
    					   ["accounttype","anyof","AcctPay"], "AND", ["status","noneof","VendBill:B"], "AND", ["posting","is","T"],"AND", ["name","anyof",i_vendorId]  
    				   ],
    				   columns:
    				   [
    					   SEARCH.createColumn({ name: "entity", summary: "GROUP", label: "Name" }), 
    					   SEARCH.createColumn({ name: "formulacurrency", summary: "SUM", formula: "case when ({enddate})-{duedate} between 1 and 30 then {amountremaining} end ", label: "Formula (Currency)" }), //today
    					   SEARCH.createColumn({ name: "formulacurrency", summary: "SUM", formula: "case when ({enddate})-{duedate} between 31 and 60 then {amountremaining} end", label: "Formula (Currency)" }), 
    					   SEARCH.createColumn({ name: "formulacurrency", summary: "SUM", formula: "case when ({enddate})-{duedate} between 61 and 90 then {amountremaining} end", label: "Formula (Currency)" }), 
    					   SEARCH.createColumn({ name: "formulacurrency", summary: "SUM", formula: "case when ({enddate})-{duedate} > 90 then {amountremaining} end", label: "Formula (Currency)" }), 
    					   SEARCH.createColumn({ name: "formulacurrency", summary: "SUM", formula: "NVL (case when trunc({enddate})-{duedate} between 1 and 30 then {amountremaining} end, 0) + NVL (case when trunc({enddate})-{duedate} between 31 and 60 then {amountremaining} end, 0) + NVL (case when trunc({enddate})-{duedate} between 61 and 90 then {amountremaining} end, 0) + NVL (case when trunc({enddate})-{duedate} >90 then {amountremaining} end, 0)", label: "Formula (Currency)" }) 
    				   ]
    				});
    				
    			
    			// end search
    	    	//if(search_agingData)
    			{
    				//Add Filter to search 
    	        	// var filter = new Array();
    	        	// filter = SEARCH.createFilter({ name: 'name', operator: SEARCH.Operator.ANYOF, values: i_vendorId});
    	        	// search_rep.filters.push(filter);
    	        	var search_agingData = search_rep.run().getRange({start: 0,end: 1000});
    	    		
    	        	log.debug('result','search_agingData - '+search_agingData+'#length- '+search_agingData.length);
    	        	if(search_agingData != null || search_agingData != '' || search_agingData != undefined)
    	        	{
    	        		log.debug('In IF Aging Details search_agingData - '+search_agingData.length);
    	        		//if(search_agingData.length >= 0)
    	        		{
    	        			log.debug('In IF search_agingData length');
    	        			for(var j=0; j < search_agingData.length; j++)
		                    {                     
		                        var mResult = search_agingData[j];
		                        log.debug('Aging Details mResult - '+j+'#'+mResult+'#'+search_agingData[j]);
		                        var i_entityName = mResult.getValue(search_rep.columns[0]);
		                        var i_oneToThirty = mResult.getValue(search_rep.columns[1]);
		                        var i_thirtyToSixty = mResult.getValue(search_rep.columns[2]);
		                        var i_sixtyToNinty = mResult.getValue(search_rep.columns[3]);
		                        var i_overNinty = mResult.getValue(search_rep.columns[4]);
		                        var i_totalOutstanding = mResult.getValue(search_rep.columns[5]);
		                        log.debug('Aging Details - '+i_entityName+'#1_30 => '+i_oneToThirty+'#30_60 => '+i_thirtyToSixty+'#60_90 => '+i_sixtyToNinty+'#90 => '+i_overNinty+'#Outstanding => '+i_totalOutstanding);
		                    
		                      
		            			xmlBody += "<tr>";
		            			xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"center\" colspan=\"1\" >"+ i_oneToThirty+"</td>";
		            			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >"+ i_thirtyToSixty+"</td>";
		            			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >"+ i_sixtyToNinty+"</td>";
		            			xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\" >"+ i_overNinty+"</td>";
		            			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >"+ i_totalOutstanding+"</td>";
		            			xmlBody += "</tr>";
		                    }
    	        		}
    	        		
	    	        		
    	        	}//if(search_agingData != null || search_agingData != '')
    	        	else
	        		{
	        			xmlBody += "<tr>";
	        			xmlBody += "<td border-width=\"0.1\" width=\"10%\" align=\"center\" colspan=\"1\" >-</td>";
	        			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >-</td>";
	        			xmlBody += "<td border-width=\"0.1\" width=\"15%\" align=\"center\" colspan=\"1\" >-</td>";
	        			xmlBody += "<td border-width=\"0.1\" width=\"20%\" align=\"center\" colspan=\"1\" >-</td>";
	        			xmlBody += "<td border-width=\"0.1\" width=\"13%\" align=\"center\" colspan=\"1\" >-</td>";
	        			xmlBody += "</tr>";
	        		}
        			
    			}//if(search_agingData)

    			xmlBody += "<\/table>";*/
    			
    			 xmlBody += "</body>";
                 xmlBody += "</pdf>";
    			
    			//var xmlValue = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n<pdf><body font-size=\"10\">"+xmlBody+"</body></pdf> ";
    			
                 var o_file = RENDER.xmlToPdf({xmlString:xmlBody});		   
     			response.writeFile({file: o_file,isInline: true});
    		}//try
    		catch(error)
    		{
    			log.debug('Inside Catch','Catch error = '+error);
    		}
    	}//end if(request.method == 'GET')
    }
    
    function formatDate(today)
    {
    	log.debug('today: '+today);
    	var responseDate=FORMAT.format({value:today,type:FORMAT.Type.DATE});
    	log.debug('responseDate: '+responseDate);
    	return responseDate;
    }
    
	function getOpeningBalance(i_vendorId, startdate)
	{
		var opeBalance			= ""; 
		var transactionSearchObj= obj_search.create({
			type: "transaction",
			filters:
			[
				["type","anyof","VendBill","VendCred","VendPymt"], 
				"AND", 
				["mainline","is","T"], 
				"AND", 
				["trandate","onorbefore",startdate], 
				"AND", 
				["name","anyof",i_vendorId]
			],
			columns:
			[
				obj_search.createColumn({name: "amount", label: "Amount", summary: "SUM"})
			]
		});
		var searchResultCount = transactionSearchObj.runPaged().count;
		log.debug("transactionSearchObj result count",searchResultCount);
		transactionSearchObj.run().each(function(result){
		   opeBalance		= result.getValue({name: "amount", label: "Amount", summary: "SUM"});
		   //return true;
		});
		log.debug({title: "opeBalance", details: opeBalance});
		return opeBalance;
	}
	
   /* function getOpeningBalance(i_vendorId, startdate)////custCreatedDate
    {
    	log.debug('Inside getOpeningBalance','=========');
    	var lastInternalID = 0;
    	var totalAmount = 0;
    	totalAmount = parseFloat(totalAmount);
    	
    	var search_vs = SEARCH.load({ id: 'customsearch_vendor_statement'});
    	//if(search_vendorStatement)
		{
    		//Add Filter to search 
        	var filter = new Array();
        	var filter1 = SEARCH.createFilter({ name: 'internalidnumber', operator: SEARCH.Operator.GREATERTHAN, values: lastInternalID});
        	search_vs.filters.push(filter1);
        	var filter2 = SEARCH.createFilter({ name: 'name', operator: SEARCH.Operator.IS, values: i_vendorId});
        	search_vs.filters.push(filter2);
        	var filter3 = SEARCH.createFilter({ name: 'trandate', operator: SEARCH.Operator.ONORBEFORE, values: startdate});//
        	search_vs.filters.push(filter3);
        	var filter4 = SEARCH.createFilter({ name: 'approvalstatus', operator: SEARCH.Operator.ANYOF, values: parseInt(2)});
        	search_vs.filters.push(filter4);
        	
        	var search_vendorStatement= search_vs.run().getRange({start: 0,end: 1000});
        	log.debug('search_vendorStatement - '+search_vendorStatement+'#length- '+search_vendorStatement.length);
        	var breakFlag = 0;
        	if(search_vendorStatement != null || search_vendorStatement != '')
        	{
        		var length = search_vendorStatement.length;
        		log.debug('Search result length1 = ' +length);
				
				for (var counter = 0; counter < length; counter++)
				{
					var result = search_vendorStatement;
				
					var internalID = '';
					var amount = '';
					var type = '';
					var previousInternalID = '';
					
					internalID = result[counter].getValue({name: "internalid"});
					if(internalID)
					{
						previousInternalID = lastInternalID;
					}
					amount = result[counter].getValue({name: "amount"});
					if(amount)
					{
						amount = parseFloat(amount);
						log.debug('Search Data0','amount1- '+amount+'#counter- '+counter);
						amount = Math.round(amount*100)/100;
						log.debug('Search Data0','amount2- '+amount);
					}
					
					type = result[counter].getValue({name: "type"});
					
					log.debug('Search Data0','ID- '+internalID+'#amount- '+amount +'#Type-> '+type);
					
					if(counter >= 900)
					{
						if(previousInternalID != internalID)
						{
							breakFlag = 1;
						} // END if(previousInternalID != internalID)
						
					} // END if(counter >= 900)
					
					if(breakFlag == 1)
					{
						break;
					} 
					lastInternalID = internalID;
					
					totalAmount = parseFloat(totalAmount) - parseFloat(amount);
					totalAmount = Math.round(totalAmount*100)/100;
					log.debug('Search Data','totalAmount1- '+totalAmount);
        	}//	for (var counter = 0; counter < search_vendorStatement.length; counter++)
		}//if(search_vendorStatement != null || search_vendorStatement != '')
    	totalAmount = parseFloat(totalAmount);
    	totalAmount = Math.round(totalAmount*100)/100;
    	var getOpeningBalancefunction = parseFloat(totalAmount);
    	log.debug('End getOpeningBalance','========='+getOpeningBalancefunction);
    	return getOpeningBalancefunction;
    	}
    }*/

    return {
        onRequest: onRequest
    };
    
});
