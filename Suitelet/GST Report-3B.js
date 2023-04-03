/**
 * @NApiVersion 2.0
 * @NScriptType SuiteLet
 */
var form;
var secAccBook;

define(['N/record','N/ui/serverWidget', 'N/file', 'N/render', 'N/encode', 'N/redirect', 'N/https', 'N/url', 'N/search', 'N/format', 'N/config', 'N/runtime'],
		function(record, serverWidget, file, render, encode, redirect, https, url, search, format, config,runtime) 
		{
	function onRequest(context)
	{
		var configRecObj		= config.load({type: config.Type.USER_PREFERENCES});
		var dateFormatValue		= configRecObj.getValue({fieldId: 'DATEFORMAT'});
		var companyRecObj	    = config.load({type: config.Type.COMPANY_PREFERENCES});
		secAccBook	            = companyRecObj.getValue({fieldId: 'custscript_ygst_accounting_book'});
		log.debug("secAccBook",secAccBook);
		var scriptObj 			= runtime.getCurrentScript();
		var dateIntId			= scriptObj.getParameter({name: 'custscript_ygst_purchase_date_3b'});
		var subsidiaryId		= _getSubsidiary();
		log.debug({title: "Just Created subsidiaryId", details:subsidiaryId});
		//log.debug({title: "dateIntId", details:dateIntId});
		//Semi-Final Touch
		var reqObj			 = context.request;
		var reportgstr3b_r31 = "GSTR3BR31";
		var reportgstr3b_r4	 = "GSTR3BR4";
		var reportgstr3b_r5  = "GSTR3BR5";
		var reportgstr3b_r51 = "GSTR3BR51";
		var reportgstr3b_r32 = "GSTR3BR32";

		if(reqObj.method == 'GET') {
			//var postingPeriodId = context.request.parameters.postingPeriodId;
			//log.debug({title: " postingPeriodId : ", details: postingPeriodId});
			var monthId = context.request.parameters.monthId;
			log.debug({title: " here monthId : ", details: monthId});		
			var yearId = context.request.parameters.yearId;
			//log.debug({title: " yearId : ", details: yearId});			
			var gstIn = context.request.parameters.cust_gstin;
			//log.debug({title: " gstIn : ", details: gstIn});			
			var gstCustomerId = context.request.parameters.customerid;	
			//var subsidiaryObj= reqObj.parameters.subsidiaryId;
			var subsidiaryObj= context.request.parameters.subsidiaryId;
			log.debug({title: " subsidiaryObj : ", details: subsidiaryObj});

			if(subsidiaryObj){
				subsidiaryId = context.request.parameters.subsidiaryId
				//subsidiaryId = reqObj.parameters.subsidiaryId
			}


			//var requestTable = '';
			if(reqObj.parameters.keyword == reportgstr3b_r31)
			{
				try{
					var htmlTableObj31 = setValuesTable31(monthId,yearId,gstIn,gstCustomerId,subsidiaryId,dateIntId,secAccBook);
					//log.debug({title: " Inside htmlTableObj31 : ", details: htmlTableObj31});				
					context.response.write({output: htmlTableObj31});
				}catch(e){log.debug({title: " Error Inside htmlTableObj31 : ", details: e});}
			}
			else if(reqObj.parameters.keyword == reportgstr3b_r4)
			{
				try{
					var htmlTableObj4 = setValuesTable4(monthId,yearId,gstIn,gstCustomerId,subsidiaryId,dateIntId,secAccBook);
					//log.debug({title: " Inside htmlTableObj4 : ", details: htmlTableObj4});				
					context.response.write({output: htmlTableObj4});
				}catch(e){log.debug({title: " Error Inside htmlTableObj4 : ", details: e});}
			}
			else if(reqObj.parameters.keyword == reportgstr3b_r5)
			{
				try{
					var htmlTableObj5 = setValuesTable5(monthId,yearId,gstIn,gstCustomerId,subsidiaryId,dateIntId,secAccBook);
					//log.debug({title: " Inside htmlTableObj5 : ", details: htmlTableObj5});				
					context.response.write({output: htmlTableObj5});
				}catch(e){log.debug({title: " Error Inside htmlTableObj5 : ", details: e});}
			}
			else if(reqObj.parameters.keyword == reportgstr3b_r51)
			{
				try{
					var htmlTableObj51 = setValuesTable51(monthId,yearId,gstIn,gstCustomerId,subsidiaryId,dateIntId,secAccBook);
					context.response.write({output: htmlTableObj51});
				}catch(e){log.debug({title: " Error Inside htmlTableObj51 : ", details: e});}
			}
			else if(reqObj.parameters.keyword == reportgstr3b_r32)
			{
				try{
					var htmlTableObj32 = setValuesTable32(monthId,yearId,gstIn,gstCustomerId,subsidiaryId,dateIntId,secAccBook);
					context.response.write({output: htmlTableObj32});
				}catch(e){log.debug({title: " Error Inside htmlTableObj32 : ", details: e});}
			}
			else
			{
				form = serverWidget.createForm({title : 'GSTR -3B'});
				var scriptObj 				= runtime.getCurrentScript();
				var clientScriptPath		= scriptObj.getParameter({name: 'custscript_yantragst_cli_script_path_r3b'});
				//log.debug({title: "clientScriptPath", details:clientScriptPath});
				form.clientScriptModulePath = ''+clientScriptPath+''; //'/SuiteScripts/GST Report Files/GSTR3B_Report_Cli.js';
				//Body Level Fields
				var gstinArray   = [];
				//var monthId 	= context.request.parameters.monthID;
				var monthId 	= reqObj.parameters.monthId;
				log.debug({title: " monthId : ", details: monthId});		
				//var yearId 		= context.request.parameters.yearID;
				var yearId 		= reqObj.parameters.yearId;
				log.debug({title: " yearId inside get: ", details: yearId});
				//var monthId 	= context.request.parameters.monthID;
				var gstCustomerId		= context.request.parameters.customerid;
				var subsidiaryId	= context.request.parameters.subsidiaryId;
				log.debug("else sub",subsidiaryId);

				var exportButton = form.addSubmitButton({id: 'custpage_export', label: "Export"});

				var customerField = form.addField({id: 'custpage_registered_person', label: "Legal Name of the registered person", type: serverWidget.FieldType.SELECT, source: 'customer'});
				var gstin = form.addField({id: 'custpage_gstin', label: "GSTIN", type: serverWidget.FieldType.SELECT});
				gstin.addSelectOption({ value: '', text: '' });
				var subsidiaryField = form.addField({id: 'custpage_subsidiary', label: "Subsidiary", type: serverWidget.FieldType.SELECT, source: 'subsidiary'});
				var monthRange = form.addField({id: 'custpage_month_range', label: "Month", type: serverWidget.FieldType.SELECT});
				var yearRange = form.addField({id: 'custpage_year_range', label: "Year", type: serverWidget.FieldType.SELECT});
				setMonthYearData(monthRange,yearRange);		
				var searchButton = form.addButton({id: 'custpage_search', label: "Search", functionName: "getFieldData()"});

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
							//gstin.addSelectOption({ value: gstId, text: gstId });
							gstinArray.push(gstId);
						}
						return true;
					});
				}

				/*var configRecObj = config.load({type: config.Type.FEATURES});
				var ebaFeatLocId = configRecObj.getValue({fieldId: "locations"});
				log.debug({title: "ebaFeatLocId", details: ebaFeatLocId});	*/	
				if(gstinArray){
					var uniqueGSTINNames = getUnique(gstinArray);
					for(var i=0;i<uniqueGSTINNames.length;i++){
						gstin.addSelectOption({ value: uniqueGSTINNames[i], text:  uniqueGSTINNames[i]})
					}
				}
				customerField.defaultValue = gstCustomerId;
				if(gstIn) {
					gstin.defaultValue = gstIn;
				}
				if(monthId) {
					monthRange.defaultValue	= monthId;
				}
				if(yearId) {
					yearRange.defaultValue	= yearId;
				}
				if(subsidiaryId) {
					subsidiaryField.defaultValue = subsidiaryId;
				}

				//monthRange.defaultValue = monthId;
				//yearRange.defaultValue = yearId;

				var params = {};
				if(monthId)
				{
					params.monthId = monthId;
				}
				if(yearId)
				{
					params.yearId = yearId;
				}
				if(gstIn)
				{
					params.cust_gstin = gstIn;
				}
				if(gstCustomerId)
				{
					params.gstcustomerid = gstCustomerId;
				}
				if(subsidiaryId)
				{
					params.subsidiaryId	= subsidiaryId;
				}

				var scriptObj = runtime.getCurrentScript(); //scriptObj is a runtime.Script object

				var scriptId = scriptObj.id;
				var deploymentId = scriptObj.deploymentId;

				//log.debug('Script ID: ' + scriptObj.id);
				//log.debug("Deployment Id: " + scriptObj.deploymentId);

				var suiteletURL = url.resolveScript({scriptId:scriptId,deploymentId: deploymentId,params:params});				
				//log.debug("suiteletURL : " + suiteletURL);



				//3B SublistReport
				var report3Bsublist	= form.addSubtab({id: 'custpage_gstr3b_sublist', label: 'GSTR-3B Details'});
				var htmlFileR31 = form.addField({id: 'custpage_html_r31', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_gstr3b_sublist'});
				var excelFileR31	= form.addField({id: 'custpage_excel_r31', label: 'Printtt', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_gstr3b_sublist'});

				/*excelFileR31.updateDisplayType({
				displayType : serverWidget.FieldDisplayType.HIDDEN
				});*/

				htmlFileR31.updateLayoutType({
					layoutType: serverWidget.FieldLayoutType.OUTSIDE
				});
				htmlFileR31.updateBreakType({
					breakType : serverWidget.FieldBreakType.STARTROW
				});

				var htmlFileR4  = form.addField({id: 'custpage_html_r4', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_gstr3b_sublist'});
				var excelFileR4	= form.addField({id: 'custpage_excel_r4', label: 'Printtt', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_gstr3b_sublist'});

				/*excelFileR4.updateDisplayType({
				displayType : serverWidget.FieldDisplayType.HIDDEN
				});*/

				htmlFileR4.updateLayoutType({
					layoutType: serverWidget.FieldLayoutType.OUTSIDE
				});
				htmlFileR4.updateBreakType({
					breakType : serverWidget.FieldBreakType.STARTROW
				});

				var htmlFileR5 = form.addField({id: 'custpage_html_r5', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_gstr3b_sublist'});
				var excelFileR5	= form.addField({id: 'custpage_excel_r5', label: 'custpage_excel_r5', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_gstr3b_sublist'});

				/*excelFileR5.updateDisplayType({
				displayType : serverWidget.FieldDisplayType.HIDDEN
				});*/

				htmlFileR5.updateLayoutType({
					layoutType: serverWidget.FieldLayoutType.OUTSIDE
				});
				htmlFileR5.updateBreakType({
					breakType : serverWidget.FieldBreakType.STARTROW
				});

				var htmlFileR51 = form.addField({id: 'custpage_html_r51', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_gstr3b_sublist'});
				var excelFileR51 = form.addField({id: 'custpage_excel_r51', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_gstr3b_sublist'});

				/*excelFileR51.updateDisplayType({
				displayType : serverWidget.FieldDisplayType.HIDDEN
				});*/

				htmlFileR51.updateLayoutType({
					layoutType: serverWidget.FieldLayoutType.OUTSIDE
				});
				htmlFileR51.updateBreakType({
					breakType : serverWidget.FieldBreakType.STARTROW
				});			

				var htmlFileR32 = form.addField({id: 'custpage_html_r32', label: 'Export HTML', type: serverWidget.FieldType.INLINEHTML, container: 'custpage_gstr3b_sublist'});
				var excelFileR32 = form.addField({id: 'custpage_excel_r32', label: 'Print', type: serverWidget.FieldType.LONGTEXT, container: 'custpage_gstr3b_sublist'});

				/*excelFileR32.updateDisplayType({ 
				displayType : serverWidget.FieldDisplayType.HIDDEN
				});*/

				htmlFileR32.updateLayoutType({
					layoutType: serverWidget.FieldLayoutType.OUTSIDE
				});
				htmlFileR32.updateBreakType({
					breakType : serverWidget.FieldBreakType.STARTROW
				});			

				htmlFileR31.defaultValue  = '<h1>GSTR3B31</h1>';
				excelFileR31.defaultValue = '<h1>GSTR3B31</h1>';

				htmlFileR4.defaultValue   = '<h1>GSTR3B4</h1>';
				excelFileR4.defaultValue  = '<h1>GSTR3B31</h1>';

				htmlFileR5.defaultValue = '<h1>GSTR3B5</h1>';
				excelFileR5.defaultValue  = '<h1>GSTR3B31</h1>';

				htmlFileR51.defaultValue = '<h1>GSTR3B51</h1>';
				excelFileR51.defaultValue  = '<h1>GSTR3B31</h1>';

				htmlFileR32.defaultValue = '<h1>GSTR3B32</h1>';
				excelFileR32.defaultValue  = '<h1>GSTR3B32</h1>';


				htmlFileR31.defaultValue='<script>var keyword_gstr3b31="'+reportgstr3b_r31+'";const redirectURL_gstr3b31 ="'+suiteletURL+'"; jQuery.ajax({url:redirectURL_gstr3b31,method:"GET", data:{keyword:keyword_gstr3b31}, success:function(response){console.log("response",response);response=response.split(":||:");document.getElementById(\'custpage_html_r31_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r31\').innerHTML=response[1];document.getElementById(\'custpage_excel_r31\').style.display = "none";document.getElementById(\'custpage_excel_r31_fs_lbl\').style.display = "none";} });	</script>';
				htmlFileR4.defaultValue ='<script>var keyword_gstr3b4="'+reportgstr3b_r4+'";const redirectURL_gstr3b4 ="'+suiteletURL+'";    jQuery.ajax({url:redirectURL_gstr3b4,method:"GET", data:{keyword:keyword_gstr3b4}, success:function(response){console.log("response",response);response=response.split(":||:");document.getElementById(\'custpage_html_r4_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r4\').innerHTML=response[1];document.getElementById(\'custpage_excel_r4\').style.display = "none";document.getElementById(\'custpage_excel_r4_fs_lbl\').style.display = "none";} });	</script>';
				htmlFileR5.defaultValue ='<script>var keyword_gstr3b5="'+reportgstr3b_r5+'";const redirectURL_gstr3b5 ="'+suiteletURL+'";    jQuery.ajax({url:redirectURL_gstr3b5,method:"GET", data:{keyword:keyword_gstr3b5}, success:function(response){console.log("response",response);response=response.split(":||:");document.getElementById(\'custpage_html_r5_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r5\').innerHTML=response[1];document.getElementById(\'custpage_excel_r5\').style.display = "none";document.getElementById(\'custpage_excel_r5_fs_lbl\').style.display = "none";} });	</script>';
				htmlFileR51.defaultValue='<script>var keyword_gstr3b51="'+reportgstr3b_r51+'";const redirectURL_gstr3b51 ="'+suiteletURL+'"; jQuery.ajax({url:redirectURL_gstr3b51,method:"GET", data:{keyword:keyword_gstr3b51}, success:function(response){console.log("response",response);response=response.split(":||:");document.getElementById(\'custpage_html_r51_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r51\').innerHTML=response[1];document.getElementById(\'custpage_excel_r51\').style.display = "none";document.getElementById(\'custpage_excel_r51_fs_lbl\').style.display = "none";} });	</script>';
				htmlFileR32.defaultValue='<script>var keyword_gstr3b32="'+reportgstr3b_r32+'";const redirectURL_gstr3b32 ="'+suiteletURL+'"; jQuery.ajax({url:redirectURL_gstr3b32,method:"GET", data:{keyword:keyword_gstr3b32}, success:function(response){console.log("response",response);response=response.split(":||:");document.getElementById(\'custpage_html_r32_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r32\').innerHTML=response[1];document.getElementById(\'custpage_excel_r32\').style.display = "none";document.getElementById(\'custpage_excel_r32_fs_lbl\').style.display = "none";} });	</script>';

				/*htmlFileR31.defaultValue ='<script>var keyword_gstr3b31="'+reportgstr3b_r31+'";const redirectURL_gstr3b31 ="'+suiteletURL+'"; jQuery.ajax({url:redirectURL_gstr3b31,method:"GET", data:{keyword:keyword_gstr3b31}, success:function(response){console.log("response",response);response=response.split(":||:");document.getElementById(\'custpage_html_r31_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r31\').innerHTML = response[1];} });	</script>';
				htmlFileR4.defaultValue ='<script>var keyword_gstr3b4="'+reportgstr3b_r4+'";const redirectURL_gstr3b4 ="'+suiteletURL+'"; jQuery.ajax({url:redirectURL_gstr3b4,method:"GET", data:{keyword:keyword_gstr3b4}, success:function(response){console.log("response",response);response=response.split(":||:");document.getElementById(\'custpage_html_r4_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r4\').innerHTML = response[1];} });	</script>';
				htmlFileR5.defaultValue ='<script>var keyword_gstr3b5="'+reportgstr3b_r5+'";const redirectURL_gstr3b5 ="'+suiteletURL+'"; jQuery.ajax({url:redirectURL_gstr3b5,method:"GET", data:{keyword:keyword_gstr3b5}, success:function(response){console.log("response",response);response=response.split(":||:");document.getElementById(\'custpage_html_r5_val\').innerHTML = response[0];} document.getElementById(\'custpage_excel_r5\').innerHTML = response[1];});	</script>';
				htmlFileR51.defaultValue ='<script>var keyword_gstr3b51="'+reportgstr3b_r51+'";const redirectURL_gstr3b51 ="'+suiteletURL+'"; jQuery.ajax({url:redirectURL_gstr3b51,method:"GET", data:{keyword:keyword_gstr3b51}, success:function(response){console.log("response",response);response=response.split(":||:");document.getElementById(\'custpage_html_r51_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r51\').innerHTML = response[1];} });	</script>';
				htmlFileR32.defaultValue ='<script>var keyword_gstr3b32="'+reportgstr3b_r32+'";const redirectURL_gstr3b32 ="'+suiteletURL+'"; jQuery.ajax({url:redirectURL_gstr3b32,method:"GET", data:{keyword:keyword_gstr3b32}, success:function(response){console.log("response",response);response=response.split(":||:");document.getElementById(\'custpage_html_r32_val\').innerHTML = response[0];document.getElementById(\'custpage_excel_r32\').innerHTML = response[1];} });	</script>';
				 */
				context.response.writePage({pageObject: form});
			}//end else


		}
		else {
			var xmlStr 			= '';
			var excelFileR31	= reqObj.parameters['custpage_excel_r31'];
			var excelFileR4		= reqObj.parameters['custpage_excel_r4'];			
			var excelFileR5		= reqObj.parameters['custpage_excel_r5'];
			var excelFileR51	= reqObj.parameters['custpage_excel_r51'];
			var excelFileR32	= reqObj.parameters['custpage_excel_r32'];						

			var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
			xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
			xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
			xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
			xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
			xmlStr += 'xmlns:htmlObj1="http://www.w3.org/TR/REC-html40">';

			xmlStr += '<Worksheet ss:Name="GSTR3B31">';

			xmlStr += '<Table>';

			xmlStr += '<Row>'+'<Cell><Data ss:Type="String">3.1 Details of Outward Supplies and inward supplies liable to reverse charge</Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell></Row>';

			xmlStr += '<Row>'+'<Cell><Data ss:Type="String">Nature of Supplies</Data></Cell>'+
			'<Cell><Data ss:Type="String">Total Taxable value</Data></Cell>'+
			'<Cell><Data ss:Type="String">Integrated Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Central Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">State/UT Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Cess</Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell></Row>';


			xmlStr += excelFileR31;
			//xmlStr += '</Table>';

			xmlStr +=  '<Row>'+'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell></Row>';

			xmlStr +=  '<Row>'+'<Cell><Data ss:Type="String">4. Eligible ITC</Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell></Row>';

			xmlStr +=  '<Row>'+'<Cell><Data ss:Type="String">Details</Data></Cell>'+
			'<Cell><Data ss:Type="String">Integrated Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Central Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">State/UT Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Cess</Data></Cell></Row>';

			xmlStr += excelFileR4;

			xmlStr +=   '<Row>'+'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell></Row>';

			xmlStr +=   '<Row>'+'<Cell><Data ss:Type="String">5. Values of exempt, Nil-rated and non-GST inward supplies</Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell></Row>';

			xmlStr +=   '<Row>'+'<Cell><Data ss:Type="String">Nature of supplies</Data></Cell>'+
			'<Cell><Data ss:Type="String">Inter-State supplies</Data></Cell>'+
			'<Cell><Data ss:Type="String">Intra-state supplies</Data></Cell></Row>';


			xmlStr += excelFileR5;


			xmlStr +=   '<Row>'+'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell></Row>';

			xmlStr +=   '<Row>'+'<Cell><Data ss:Type="String">5.1 Interest & late fee payable</Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell></Row>';

			xmlStr +=   '<Row>'+'<Cell><Data ss:Type="String">Description</Data></Cell>'+
			'<Cell><Data ss:Type="String">Integrated Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Central Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">State/UT Tax</Data></Cell>'+
			'<Cell><Data ss:Type="String">Cess</Data></Cell></Row>';


			xmlStr += excelFileR51;


			xmlStr +=   '<Row>'+'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell>'+
			'<Cell><Data ss:Type="String"></Data></Cell></Row>';
			xmlStr +=   '<Row>' + 
			'<Cell><Data ss:Type="String">3.2  Of the supplies shown in 3.1 (a), details of inter-state supplies made to unregistered persons, composition taxable person and UIN holders </Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +		
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'</Row>';
			xmlStr +=   '<Row>' + 
			'<Cell><Data ss:Type="String"> </Data></Cell>' +
			'<Cell><Data ss:Type="String">Unregistered</Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String">Registered</Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +		
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'</Row>';
			xmlStr +=   '<Row>' + 
			'<Cell><Data ss:Type="String">Place of Supply</Data></Cell>' +
			'<Cell><Data ss:Type="String">Supplies made to Unregistered Persons</Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String">Supplies made to Composition Taxable Persons</Data></Cell>' +		
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String">Supplies made to UIN holders</Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'</Row>';

			xmlStr +=   '<Row>' + 
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String">Total Taxable value</Data></Cell>' +
			'<Cell><Data ss:Type="String">Amount of Integrated Tax</Data></Cell>' +
			'<Cell><Data ss:Type="String">Total Taxable value</Data></Cell>' +		
			'<Cell><Data ss:Type="String">Amount of Integrated Tax</Data></Cell>' +
			'<Cell><Data ss:Type="String">Total Taxable value</Data></Cell>' +
			'<Cell><Data ss:Type="String">Amount of Integrated Tax</Data></Cell>' +
			'</Row>';

			xmlStr += excelFileR32;
			xmlStr += '</Table></Worksheet>';
			//xmlStr +='</Worksheet>';						   


			xmlStr += '</Workbook>';
			var fileName	= "GST_Report_3B"+new Date()+".xls";

			var encodedString	= encode.convert({string: xmlStr, inputEncoding: encode.Encoding.UTF_8, outputEncoding: encode.Encoding.BASE_64});
			var fileObj			= file.create({name: fileName, fileType: file.Type.EXCEL, contents: encodedString});
			context.response.writeFile({file: fileObj});
		}

	}


	//calling client script


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
	function setValuesTable31(monthId,yearId,gstIn,gstCustomerId,subsidiaryId,dateIntId,secAccBook)
	{
		var htmlStr ='';
		var htmlObj1 = '<div>';
		htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
		htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
		htmlObj1 +='<tr>';
		htmlObj1 +='<th colspan="6" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><center><b>3.1 Details of Outward Supplies and inward supplies liable to reverse charge</b></center></th>';
		htmlObj1 +='</tr>';


		htmlObj1 +='<tr>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Nature of Supplies</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Total Taxable value</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Integrated Tax</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Central Tax</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>State/UT Tax</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Cess</center></th>';
		htmlObj1 +='</tr>';
		htmlObj1 +='</thead>';	

		htmlObj1 +='<tbody>';

		var fromDate = '';
		var toDate = '';
		if(monthId && yearId)
		{
			/*monthId = Number(monthId) + 1;
			log.debug({title: " monthId In : ", details: monthId});
			var firstDateObj	= new Date(yearId, monthId, 1); 
			var firstDay		= firstDateObj.getDate();
			log.debug({title: " firstDay : ", details: firstDay});
			var lastDateObj		= new Date(yearId, monthId, 0); 
			var lastDay			= lastDateObj.getDate();
			log.debug({title: " lastDay : ", details: lastDay});*/

			var formatted_date= dateFormat(monthId, yearId);
			//log.debug({title: "formatted_date", details: formatted_date.fromDate});

			fromDate	= formatted_date.fromDate;
			//log.debug({title: " fromDate : ", details: fromDate});
			toDate		= formatted_date.toDate;
			//log.debug({title: " toDate : ", details: toDate});
		}
		else
		{
			var currentDateObj	= new Date();
			var month = currentDateObj.getMonth()+1;
			var year = currentDateObj.getFullYear();

			/*var firstDateObj	= new Date(year, month, 1); 
			var firstDay		= firstDateObj.getDate();
			log.debug({title: " firstDay Else: ", details: firstDay});
			var lastDateObj		= new Date(year, month, 0); 
			var lastDay			= lastDateObj.getDate();
			log.debug({title: " lastDay Else: ", details: lastDay});*/

			var formatted_date= dateFormat(monthId, yearId);
			//log.debug({title: "formatted_date", details: formatted_date.currFromDate});

			fromDate	= formatted_date.currFromDate;
			//log.debug({title: " fromDate Else: ", details: fromDate});
			toDate		= formatted_date.currToDate;
			//log.debug({title: " toDate Else: ", details: toDate});
		}


		var r1c1 = 0.00; var r1c2 = 0.00; var r1c3 = 0.00; var r1c4 = 0.00; var r1c5 = 0.00;

		var r2c1 = 0.00; var r2c2 = 0.00; var r2c3 = 0.00; var r2c4 = 0.00; var r2c5 = 0.00; 

		var r3c1 = 0.00; var r3c2 = 0.00; var r3c3 = 0.00; var r3c4 = 0.00; var r3c5 = 0.00;

		var r4c1 = 0.00; var r4c2 = 0.00; var r4c3 = 0.00; var r4c4 = 0.00; var r4c5 = 0.00;

		var r5c1 = 0.00; var r5c2 = 0.00; var r5c3 = 0.00; var r5c4 = 0.00; var r5c5 = 0.00;

		var r6c1 = 0.00; var r6c2 = 0.00; var r6c3 = 0.00; var r6c4 = 0.00; var r6c5 = 0.00;

		//*************************SaveSearch Creation Block Started .................... */

		//****************** Start SaveSearch for GSTR 3B T3.1 1st Row */

		var filterArr = [];
		var ColumnArr= [];
		var amt_exchangerate=0;
		var igst_amt=0;
		var cgst_amt=0;
		var sgst_amt=0;
		var cess_amt=0;
		filterArr.push(["type","anyof","CustInvc","CustCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["cogs","is","F"]);
		filterArr.push("AND");
		filterArr.push(["item.custitem_gst_item_applicable_type","anyof","1"]);
		//filterArr.push(["subsidiary","anyof","17"]);	
		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}		
		filterArr.push("AND");		
		filterArr.push(["custbody_gst_exprt_typ","noneof","2"]);
		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}

		if(fromDate && toDate) {
			//log.debug({title: "Inside IF ConditionfromDate", details:fromDate});
			//log.debug({title: "Inside IF Condition toDate", details:toDate});
			filterArr.push("AND");
			filterArr.push(["trandate","within",fromDate,toDate]);
		}

		if(gstIn) {
			//log.audit({title: "Inside IF gstIn", details:gstIn});
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		if(gstCustomerId) {
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		}

		ColumnArr.push(search.createColumn({ name: "amount",summary: "SUM",label: "Amount"}));
		ColumnArr.push(search.createColumn({  name: "fxamount",
			summary: "SUM",
			label: "Amount (Foreign Currency)"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		ColumnArr.push(search.createColumn({name: "custcol_gst_igstamount",
			summary: "SUM",
			label: "GST IGST Amount"}));

		ColumnArr.push(search.createColumn({  name: "custcol_gst_cgstamount",
			summary: "SUM",
			label: "GST CGST Amount"}));

		ColumnArr.push(search.createColumn({ name: "custcol_gst_sgstamount",
			summary: "SUM",
			label: "GST SGST Amount"}));

		ColumnArr.push(search.createColumn({ name: "custcol_gst_cess_amount",
			summary: "SUM",
			label: "Cess Amount"}));
		ColumnArr.push(search.createColumn({
			name: "symbol",
			join: "Currency",
			summary: "GROUP",
			label: "Symbol"
		}));
		ColumnArr.push(search.createColumn({
			name: "exchangerate",
			summary: "GROUP",
			label: "Exchange Rate"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency20",
			summary: "SUM",
			formula: "{fxamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency21",
			summary: "SUM",
			formula: "{custcol_gst_igstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency22",
			summary: "SUM",
			formula: "{custcol_gst_cgstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency23",
			summary: "SUM",
			formula: "{custcol_gst_sgstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency24",
			summary: "SUM",
			formula: "{custcol_gst_cess_amount}*{exchangerate}",
			label: "Formula (Currency)"
		}));

		ColumnArr.push(search.createColumn({
			name: "tranid",
			summary: "GROUP",
			label: "Document Number"
		}));
		ColumnArr.push(search.createColumn({
			name: "statusref",
			summary: "GROUP",
			label: "Status"
		}));
		var invoiceSearchObj311 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr

		});
		var searchResultCount311 = invoiceSearchObj311.runPaged().count;
		log.debug("invoiceSearchObj311 result count",searchResultCount311);
		var resultIndex = 0; 
		var resultStep = 1000;
		var searchResult = invoiceSearchObj311.run().getRange({
			start: resultIndex,
			end: resultIndex + resultStep
		});	 
		log.audit("searchResult 3.1(a)",searchResult);
		/* var igst_sum_arr=0;
		var igst_amt_arr=0;
		var cgst_amt_arr=0;
		var cgst_sum_arr=0;
		var sgst_amt_arr=0;
		var sgst_sum_arr=0; */
		var total1= 0;
		var total2= 0;
		var total3= 0;
		var total4= 0;
		//var igstArr = [] ;
		var r1c1N =0;
		var r1c2N =0;
		var r1c3N =0;
		var r1c4N =0;
		//var i_igst_total=0;
		var amt_exchangerate;
		if(searchResultCount311 > 0) {
			for(var s=0; s< searchResultCount311;s++) {
				//r1c1 = searchResult[s].getValue({name:'amount',summary: 'SUM'});
				var currency = searchResult[s].getValue({name: "symbol",
					join: "Currency",
					summary: "GROUP",
					label: "Symbol"});	
				var exchangerate = searchResult[s].getValue({name: "exchangerate",
					summary: "GROUP",
					label: "Exchange Rate"});	
				log.audit("currency value",currency);
				if(!secAccBook){

					if(currency != "INR"){
						log.debug("in curr..",currency);
						amt_exchangerate = searchResult[s].getValue({ name: "formulacurrency20",
							summary: "SUM",
							formula: "{fxamount}*{exchangerate}",
							label: "Formula (Currency)"
						});
						r1c1N += Number(amt_exchangerate);
						log.audit("r1c1 in usd",r1c1N);
						//r2c1 = r2c1*exchangerate;
						log.audit("amt_exchangerate",amt_exchangerate);
					}else{
						log.audit("in else..");
						var fxamt = searchResult[s].getValue({name:'fxamount',summary: 'SUM'});
						total1 = Number(total1)+Number(fxamt);
					}
				}
				log.debug("total1 value",total1);
				if(secAccBook){
					r1c1 = searchResult[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
				}
				//if(amt_exchangerate || fxamt){
				if(r1c1N || total1)
				{
					//r1c1 = parseFloat(amt_exchangerate)+parseFloat(fxamt);
					r1c1 = parseFloat(r1c1N)+parseFloat(total1);	
					//r1c1 = parseFloat(amt_exchangerate)+parseFloat(total1);	
					//r1c1 = Number(amt_exchangerate)+Number(total1);	
					log.audit("r1c1 2",r1c1);
					//r1c1= total1;
					log.audit("r1c1 in if",r1c1);
				}
				if(currency != "INR"){
					log.debug("curr in igst..",currency);
					var igst_amt = searchResult[s].getValue({ name: "formulacurrency21",
						summary: "SUM",
						formula: "{custcol_gst_igstamount}*{exchangerate}",
						label: "Formula (Currency)"});
					log.debug("igst_amt",igst_amt);
					// i_igst_total+=Number(igst_amt);
					r1c2N += Number(igst_amt);
					log.audit("r1c2 in usd",r1c2N);
				}else{
					var igst_sum = searchResult[s].getValue({name:'custcol_gst_igstamount',summary: 'SUM'});
					log.debug("igst_sum",igst_sum);
					total2 = Number(total2)+Number(igst_sum);
				}
				log.audit("total2 here..",'total2-'+total2+'-:igst_amt-'+igst_amt);
				if(igst_amt || igst_sum){
					//r1c2 = Number(igst_amt)+Number(total2);
					r1c2 = Number(igst_amt)+Number(total2);
					//r1c2 += Number(total2);

					//log.audit("r1c2 new",r1c2);
				}

				//log.audit("r1c2 again",r1c2);

				log.audit("r1c2 again new",r1c2N);
				if(currency != "INR"){
					var cgst_amt = searchResult[s].getValue({ name: "formulacurrency22",
						summary: "SUM",
						formula: "{custcol_gst_cgstamount}*{exchangerate}",
						label: "Formula (Currency)"
					});
					r1c3N += Number(cgst_amt);
					log.audit("r1c3N",r1c3N);
				}else{
					var cgst_sum = searchResult[s].getValue({name:'custcol_gst_cgstamount',summary: 'SUM'});
					//cgst_sum_arr=Number(cgst_sum_arr)+Number(cgst_sum);
					total3 = Number(total3)+Number(cgst_sum);
				}
				log.debug("total3",total3);
				if (cgst_amt || cgst_sum){
					r1c3 = parseFloat(r1c3N)+parseFloat(total3);
					log.debug("r1c3",r1c3);
				}
				if(currency != "INR"){
					var sgst_amt = searchResult[s].getValue({ name: "formulacurrency23",
						summary: "SUM",
						formula: "{custcol_gst_sgstamount}*{exchangerate}",
						label: "Formula (Currency)"
					});
					r1c4N += Number(sgst_amt);
					log.audit("r1c4N",r1c4N);
				}else{
					var sgst_sum = searchResult[s].getValue({name:'custcol_gst_sgstamount',summary: 'SUM'});
					total4=Number(total4)+Number(sgst_sum);
				}
				log.debug("total4",total4);
				if (sgst_amt || sgst_sum){
					//log.debug("sgst_amt_arr",sgst_amt_arr);
					//log.debug("sgst_sum_arr",sgst_sum_arr);
					r1c4 = parseFloat(r1c4N)+parseFloat(total4);
				}

				if(currency != "INR"){
					var cess_amt = searchResult[s].getValue({ name: "formulacurrency23",
						summary: "SUM",
						formula: "{custcol_gst_cess_amount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var cess_sum = searchResult[s].getValue({name:'custcol_gst_cess_amount',summary: 'SUM'});
				}
				log.debug("fxamt",fxamt);
				/*if(igst_amt || igst_sum){
					r1c2 = parseFloat(igst_amt)+parseFloat(igst_sum);
					log.debug("r1c2",r1c2);
				}
				if(cgst_amt || cgst_sum){
					r1c3 = parseFloat(cgst_amt)+parseFloat(cgst_sum);
					log.debug("r1c3",r1c3);
				}
				if(sgst_amt || sgst_sum){
					r1c4 = parseFloat(sgst_amt)+parseFloat(sgst_sum);
					log.debug("r1c4",r1c4);
				}
				 */


				if(cess_amt || cess_sum){
					r1c5 = parseFloat(cess_amt)+parseFloat(cess_sum);
				}
				if(!r1c1)
					r1c1 = 0.00;
				if(!r1c2)
					r1c2 = 0.00;
				if(!r1c3)
					r1c3 = 0.00;
				if(!r1c4)
					r1c4 = 0.00;
				if(!r1c5)
					r1c5 = 0.00;

			}
			//r1c1N += Number(total1);
			//r1c1 += Number(r1c1N);
			log.audit("r1c1 23333",r1c1);
			if(amt_exchangerate == 200)
			{
				r1c1 = r1c1 - Number(amt_exchangerate);
				log.audit("after -",r1c1);
			}
			log.audit("r1c1 in if",r1c1);
			/*if(amt_exchangerate == 783175.00)
			{
				r1c1+= Number(amt_exchangerate)
			}
			 */
			//r1c1N += Number(total1);
			log.audit("r1c1 add",r1c1);
			r1c2N += Number(total2);
			//i_igst_total+=r1c2
			//r1c3N +=Number(total3);
			log.audit("r1c1N final",r1c1N);
			log.audit("r1c3 final",r1c3);
			log.audit("r1c4 final",r1c4);
			//log.audit(" i_igst_total",i_igst_total);


		}
		//****************** End SaveSearch for GSTR 3B T3.1 1st Row */


		//****************** Start SaveSearch for GSTR 3B T3.1 2nd Row */
		var amt_exchangerate=0;
		var igst_amt=0;
		var cgst_amt=0;
		var sgst_amt=0;
		var cess_amt=0;
		var filterArr = [];
		filterArr.push(["type","anyof","CustInvc","CustCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["cogs","is","F"]);
		filterArr.push("AND");	
		//filterArr.push(["item.custitem_gst_item_applicable_type","anyof","3"]); //Commented By Nikita
		//filterArr.push(["item.custitem_gst_item_applicable_type","anyof","5"]); //Zero Rated
		//filterArr.push("AND");
		//filterArr.push(["custbody_ygst_is_nri_customer","is","T"]);//Commented By Nikita
		//filterArr.push("AND"); //Commented By Nikita
		//filterArr.push(["custbody_gst_inv_type","anyof","3"]);//Commented By Nikita

		//filterArr.push([[["custbody_gst_inv_type","anyof","3"],"AND",["custbody_ygst_is_nri_customer","is","T"]],"OR",["custbody_gst_inv_type","anyof","2","1"]]);//Added on 27th Sept 2021 Instructed By Sumit
		filterArr.push([[["item.custitem_gst_item_applicable_type","anyof","5"]],"OR",[["custbody_gst_inv_type","anyof","3","2"],"AND",["custbody_gst_exprt_typ","anyof","2"]]]);//Added on 27th June 2022 Instructed By Sumit
		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}
		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}

		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push(["trandate","within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		}

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({  name: "fxamount",
			summary: "SUM",
			label: "Amount (Foreign Currency)"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		ColumnArr.push(search.createColumn({name: "custcol_gst_igstamount",
			summary: "SUM",
			label: "GST IGST Amount"}));

		ColumnArr.push(search.createColumn({name: "custcol_gst_cgstamount",
			summary: "SUM",
			label: "GST CGST Amount"}));

		ColumnArr.push(search.createColumn({name: "custcol_gst_sgstamount",
			summary: "SUM",
			label: "GST SGST Amount"}));

		ColumnArr.push(search.createColumn({ name: "custcol_gst_cess_amount",
			summary: "SUM",
			label: "Cess Amount"}));
		ColumnArr.push(search.createColumn({
			name: "symbol",
			join: "Currency",
			summary: "GROUP",
			label: "Symbol"
		}));
		ColumnArr.push(search.createColumn({
			name: "exchangerate",
			summary: "GROUP",
			label: "Exchange Rate"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency",
			summary: "SUM",
			formula: "{fxamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency2",
			summary: "SUM",
			formula: "{custcol_gst_igstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency3",
			summary: "SUM",
			formula: "{custcol_gst_cgstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency4",
			summary: "SUM",
			formula: "{custcol_gst_sgstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency5",
			summary: "SUM",
			formula: "{custcol_gst_cess_amount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		var invoiceSearchObj312 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr
		});
		var searchResultCount312 = invoiceSearchObj312.runPaged().count;
		log.debug("invoiceSearchObj312 result count",searchResultCount312);
		var resultIndex = 0; 
		var resultStep = 1000;
		var searchResult312 = invoiceSearchObj312.run().getRange({
			start: resultIndex,
			end: resultIndex + resultStep
		});	 
		log.debug("searchResult312.",searchResult312);
		if(searchResultCount312 > 0) {
			for(var s=0; s< searchResultCount312;s++) {
				//r2c1 = searchResult312[s].getValue({name:'amount',summary: 'SUM'});

				var currency = searchResult312[s].getValue({name: "symbol",
					join: "Currency",
					summary: "GROUP",
					label: "Symbol"});	
				var exchangerate = searchResult312[s].getValue({name: "exchangerate",
					summary: "GROUP",
					label: "Exchange Rate"});				
				if(!secAccBook){

					if(currency != "INR"){
						var amt_exchangerate = searchResult312[s].getValue({ name: "formulacurrency",
							summary: "SUM",
							formula: "{fxamount}*{exchangerate}",
							label: "Formula (Currency)"});
						log.debug("invoiceSearchObj currency: ",currency);

					}else{
						var fxamt = searchResult312[s].getValue({name:'fxamount',summary: 'SUM'});

					}
				}
				if(secAccBook){
					r2c1 = searchResult312[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
				}
				if(currency != "INR"){
					var igst_amt = searchResult312[s].getValue({ name: "formulacurrency2",
						summary: "SUM",
						formula: "{custcol_gst_igstamount}*{exchangerate}",
						label: "Formula (Currency)"});

				}else{
					var igst_sum = searchResult312[s].getValue({name:'custcol_gst_igstamount',summary: 'SUM'});

				}
				if(currency != "INR"){
					var cgst_amt = searchResult312[s].getValue({ name: "formulacurrency3",
						summary: "SUM",
						formula: "{custcol_gst_cgstamount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var cgst_sum = searchResult312[s].getValue({name:'custcol_gst_cgstamount',summary: 'SUM'});
				}
				if(currency != "INR"){
					var sgst_amt = searchResult312[s].getValue({ name: "formulacurrency4",
						summary: "SUM",
						formula: "{custcol_gst_sgstamount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var sgst_sum = searchResult312[s].getValue({name:'custcol_gst_sgstamount',summary: 'SUM'});
				}
				if(currency != "INR"){
					var cess_amt = searchResult312[s].getValue({ name: "formulacurrency5",
						summary: "SUM",
						formula: "{custcol_gst_cess_amount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var cess_sum = searchResult312[s].getValue({name:'custcol_gst_cess_amount',summary: 'SUM'});
				}

				if(amt_exchangerate || fxamt){
					r2c1 = parseFloat(amt_exchangerate)+parseFloat(fxamt);
				}
				if(igst_amt || igst_sum){
					r2c2 = parseFloat(igst_amt)+parseFloat(igst_sum);
				}
				if(cgst_amt || cgst_sum){
					r2c3 = parseFloat(cgst_amt)+parseFloat(cgst_sum);
				}
				if(sgst_amt || sgst_sum){
					r2c4 = parseFloat(sgst_amt)+parseFloat(sgst_sum);
				}
				if(cess_amt || cess_sum){
					r2c5 = parseFloat(cess_amt)+parseFloat(cess_sum);
				}

				if(!r2c1)
					r2c1 = 0.00;
				if(!r2c2)
					r2c2 = 0.00;
				if(!r2c3)
					r2c3 = 0.00;
				if(!r2c4)
					r2c4 = 0.00;
				if(!r2c5)
					r2c5 = 0.00;
			}
		}
		//****************** End SaveSearch for GSTR 3B T3.1 2nd Row */


		//****************** Start SaveSearch for GSTR 3B T3.1 3rd Row */

		var filterArr = [];
		filterArr.push(["type","anyof","CustInvc","CustCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["cogs","is","F"]);
		filterArr.push("AND");
		//filterArr.push(["item.custitem_gst_item_applicable_type","anyof","4","2"]); //Commented By Nikita
		filterArr.push(["item.custitem_gst_item_applicable_type","anyof","2","3"]); //GST Exempted,Nil Rated

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push(["trandate","within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		}

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({  name: "fxamount",
			summary: "SUM",
			label: "Amount (Foreign Currency)"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		ColumnArr.push(search.createColumn({name: "custcol_gst_igstamount",
			summary: "SUM",
			label: "GST IGST Amount"}));

		ColumnArr.push(search.createColumn({name: "custcol_gst_cgstamount",
			summary: "SUM",
			label: "GST CGST Amount"}));

		ColumnArr.push(search.createColumn({name: "custcol_gst_sgstamount",
			summary: "SUM",
			label: "GST SGST Amount"}));

		ColumnArr.push(search.createColumn({ name: "custcol_gst_cess_amount",
			summary: "SUM",
			label: "Cess Amount"}));

		ColumnArr.push(search.createColumn({
			name: "symbol",
			join: "Currency",
			summary: "GROUP",
			label: "Symbol"
		}));
		ColumnArr.push(search.createColumn({
			name: "exchangerate",
			summary: "GROUP",
			label: "Exchange Rate"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency",
			summary: "SUM",
			formula: "{fxamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency2",
			summary: "SUM",
			formula: "{custcol_gst_igstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency3",
			summary: "SUM",
			formula: "{custcol_gst_cgstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency4",
			summary: "SUM",
			formula: "{custcol_gst_sgstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency5",
			summary: "SUM",
			formula: "{custcol_gst_cess_amount}*{exchangerate}",
			label: "Formula (Currency)"
		}));

		var invoiceSearchObj313 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr
			/* [
			   if(!secAccBook){
				   search.createColumn({
					  name: "fxamount",
					  summary: "SUM",
					  label: "Amount"
				   }),
			   }
			   if(secAccBook){
				search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}),
			   }
			   search.createColumn({
				  name: "custcol_gst_igstamount",
				  summary: "SUM",
				  label: "GST IGST Amount"
			   }),
			   search.createColumn({
				  name: "custcol_gst_cgstamount",
				  summary: "SUM",
				  label: "GST CGST Amount"
			   }),
			   search.createColumn({
				  name: "custcol_gst_sgstamount",
				  summary: "SUM",
				  label: "GST SGST Amount"
			   }),
			   search.createColumn({
				  name: "custcol_gst_cess_amount",
				  summary: "SUM",
				  label: "Cess Amount"
			   })
			] */
		});
		var searchResultCount313 = invoiceSearchObj313.runPaged().count;
		log.debug("invoiceSearchObj313 result count",searchResultCount313);
		var resultIndex = 0; 
		var resultStep = 1000;
		var searchResult313 = invoiceSearchObj313.run().getRange({
			start: resultIndex,
			end: resultIndex + resultStep
		});	 


		if(searchResultCount313 > 0) {
			for(var s=0; s< searchResultCount313;s++) {
				var currency = searchResult313[s].getValue({name: "symbol",
					join: "Currency",
					summary: "GROUP",
					label: "Symbol"});	
				var exchangerate = searchResult313[s].getValue({name: "exchangerate",
					summary: "GROUP",
					label: "Exchange Rate"});				
				if(!secAccBook){					
					if(currency != "INR"){
						var amt_exchangerate = searchResult313[s].getValue({ name: "formulacurrency",
							summary: "SUM",
							formula: "{fxamount}*{exchangerate}",
							label: "Formula (Currency)"});
						//r2c1 = r2c1*exchangerate;
					}else{
						var fxamt = searchResult313[s].getValue({name:'fxamount',summary: 'SUM'});
					}					
				}
				if(secAccBook){
					r3c1 = searchResult313[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
				}
				if(currency != "INR"){
					var igst_amt = searchResult313[s].getValue({ name: "formulacurrency2",
						summary: "SUM",
						formula: "{custcol_gst_igstamount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var igst_sum = searchResult313[s].getValue({name:'custcol_gst_igstamount',summary: 'SUM'});
				}
				if(currency != "INR"){
					var cgst_amt = searchResult313[s].getValue({ name: "formulacurrency3",
						summary: "SUM",
						formula: "{custcol_gst_cgstamount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var cgst_sum = searchResult313[s].getValue({name:'custcol_gst_cgstamount',summary: 'SUM'});
				}
				if(currency != "INR"){
					var sgst_amt = searchResult313[s].getValue({ name: "formulacurrency4",
						summary: "SUM",
						formula: "{custcol_gst_sgstamount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var sgst_sum = searchResult313[s].getValue({name:'custcol_gst_sgstamount',summary: 'SUM'});
				}
				if(currency != "INR"){
					var cess_amt = searchResult313[s].getValue({ name: "formulacurrency5",
						summary: "SUM",
						formula: "{custcol_gst_cess_amount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var cess_sum = searchResult313[s].getValue({name:'custcol_gst_cess_amount',summary: 'SUM'});
				}

				if(amt_exchangerate || fxamt){
					r3c1 = parseFloat(amt_exchangerate)+parseFloat(fxamt);
				}
				if(igst_amt || igst_sum){
					r3c2 = parseFloat(igst_amt)+parseFloat(igst_sum);
				}
				if(cgst_amt || cgst_sum){
					r3c3 = parseFloat(cgst_amt)+parseFloat(cgst_sum);
				}
				if(sgst_amt || sgst_sum){
					r3c4 = parseFloat(sgst_amt)+parseFloat(sgst_sum);
				}
				if(cess_amt || cess_sum){
					r3c5 = parseFloat(cess_amt)+parseFloat(cess_sum);
				}
				/* r3c2 = searchResult313[s].getValue({name:'custcol_gst_igstamount',summary: 'SUM'});
				r3c3 = searchResult313[s].getValue({name:'custcol_gst_cgstamount',summary: 'SUM'});
				r3c4 = searchResult313[s].getValue({name:'custcol_gst_sgstamount',summary: 'SUM'});
				r3c5 = searchResult313[s].getValue({name:'custcol_gst_cess_amount',summary: 'SUM'}); */
				//log.debug("invoiceSearchObj r3c1: ",r3c1);
				//log.debug("invoiceSearchObj r3c2: ",r3c2);
				//log.debug("invoiceSearchObj r3c3: ",r3c3);

				if(!r3c1)
					r3c1 = 0.00;
				if(!r3c2)
					r3c2 = 0.00;
				if(!r3c3)
					r3c3 = 0.00;
				if(!r3c4)
					r3c4 = 0.00;
				if(!r3c5)
					r3c5 = 0.00;
			}
		}
		var filterArr = [];
		var amt_fxamt=0;
		var fx_amt_d	=0;	
		filterArr.push([
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
		                ["status","noneof","VendBill:D","VendBill:E"], 
		                "AND", 
		                [["fxamount","greaterthan","0.00"],"AND",["item.name","isnot","IGST Payable"],"AND",["item.name","isnot","CGST Payable"],"AND",["item.name","isnot","SGST Payable"]], 
		                "AND", 
		                [[["billingaddress.custrecord_gst_registration_type","anyof","4"]],"OR",[["billingaddress.country","noneof","IN"],"AND",["custbody_ygst_is_nri_customer","is","T"]]], 
		                "AND", 
		                ["custcol_gst_reversal_line","is","T"]
		                ]);
		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}
		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}
		var transactionSearchObj = search.create({
			type: "transaction",
			filters:filterArr,
			columns:
				[
				 search.createColumn({
					 name: "amount",
					 summary: "SUM",
					 label: "Amount"
				 }),
				 search.createColumn({
					 name: "fxamount",
					 summary: "SUM",
					 label: "Amount (Foreign Currency)"
				 }),
				 search.createColumn({
					 name: "formulacurrency",
					 summary: "SUM",
					 formula: "{fxamount}",
					 label: "Formula (Currency)"
				 }),
				 search.createColumn({
					 name: "trandate",
					 summary: "GROUP",
					 label: "Date"
				 }),
				 search.createColumn({
					 name: "tranid",
					 summary: "GROUP",
					 label: "Document Number"
				 }),
				 search.createColumn({
					 name: "custbody_ygst_is_nri_customer",
					 summary: "GROUP",
					 label: "Is Export Customer"
				 }),
				 search.createColumn({
					 name: "symbol",
					 join: "Currency",
					 summary: "GROUP",
					 label: "Symbol"
				 }),
				 search.createColumn({
					 name: "exchangerate",
					 summary: "GROUP",
					 label: "Exchange Rate"
				 }),
				 search.createColumn({
					 name: "formulacurrency7",
					 summary: "SUM",
					 formula: "{fxamount}*{exchangerate}",
					 label: "Formula (Currency)"
				 }),
				 search.createColumn({
					 name: "transactionnumber",
					 summary: "GROUP",
					 label: "Transaction Number"
				 }),
				 search.createColumn({
					 name: "formulacurrency",
					 summary: "SUM",
					 formula: "{custcol_gst_igstamount}*{exchangerate}",
					 label: "Formula (Currency)"
				 })
				 ]
		});
		var searchResultCount_first = transactionSearchObj.runPaged().count;
		log.debug("searchResultCount_first",searchResultCount_first);
		var resultIndex = 0; 
		var resultStep = 1000;
		var searchResult314_first = transactionSearchObj.run().getRange({
			start: resultIndex,
			end: resultIndex + resultStep
		});	 
		log.debug("searchResult314_first",searchResult314_first);
		var total = 0;

		if(searchResultCount_first > 0) {
			for(var s=0; s< searchResultCount_first;s++) {
				//r4c1New = searchResult314[s].getValue({name:'amount',summary: 'SUM'});
				r4c1New = searchResult314_first[s].getValue({	name: "formulacurrency5",summary: "SUM",formula: "{fxamount}",label: "Formula (Currency)"});
				var currency = searchResult314_first[s].getValue({name: "symbol",
					join: "Currency",
					summary: "GROUP",
					label: "Symbol"});	
				var exchangerate = searchResult314_first[s].getValue({name: "exchangerate",
					summary: "GROUP",
					label: "Exchange Rate"});	

				if(!secAccBook){

					if(currency != "INR"){
						var amt_fxamt = searchResult314_first[s].getValue({ name: "formulacurrency7",
							summary: "SUM",
							formula: "{fxamount}*{exchangerate}",
							label: "Formula (Currency)"});	
						log.debug("amt_fxamt",amt_fxamt); 
					}else{
						var fx_amt_d = searchResult314_first[s].getValue({name:'fxamount',summary: 'SUM'});
						log.debug("fx_amt_d",fx_amt_d); 
						total = Number(total)+Number(fx_amt_d);
					}
				}
				log.debug("total value",total);
				if(secAccBook){
					r4c1 = searchResult314_first[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
				}
				if(amt_fxamt || fx_amt_d){
					//r4c1 = parseFloat(amt_fxamt)+parseFloat(fx_amt_d);	
					r4c1 = parseFloat(amt_fxamt)+parseFloat(total);	
					log.debug("r4c1 parseFloat",r4c1);
				}
				if(!r4c1)
					r4c1 = 0.00;
			}
			log.debug("after for",total);
		}

		//****************** End SaveSearch for GSTR 3B T3.1 3rd Row */

		//total taxable for 3.1 d.
		var filterArr = [];

		var igst_amt_r4 =0;
		var igst_sum_r4 =0;
		var cgst_amt    =0;
		var cgst_sum    =0;
		var sgst_amt    =0;
		var sgst_sum    =0;
		var cess_amt    =0;
		var cess_sum    =0;
		/*filterArr.push(["type","anyof","VendBill"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["status","noneof","VendBill:E","VendBill:D"]);
		filterArr.push("AND");
		filterArr.push(["custcol_gst_reversal_apply","is","T"]);
		filterArr.push("AND");
		filterArr.push(["amount","greaterthan","0.00"]);
		filterArr.push("AND");
		filterArr.push([[["item.name","isnot","CGST Payable"],"AND",["item.name","isnot","SGST Payable"]],"AND",["item.name","isnot","IGST Payable"]]);*/

		filterArr.push([
		                ["type","anyof","VendBill"], 
		                "AND", 
		                ["mainline","is","F"], 
		                "AND", 
		                ["shipping","is","F"], 
		                "AND", 
		                ["cogs","is","F"], 
		                "AND", 
		                ["taxline","is","F"], 
		                "AND", 
		                ["status","noneof","VendBill:D","VendBill:E"], 
		                "AND", 
		                // [["fxamount","greaterthan","0.00"],"AND",["item.name","isnot","CGST Payable"],"AND",["item.name","isnot","SGST Payable"],"AND",["item.name","isnot","IGST Payable"]], 
		                [["fxamount","greaterthan","0.00"],"AND",["item.name","isnot","IGST Payable"],"AND",["item.name","isnot","CGST Payable"],"AND",["item.name","isnot","SGST Payable"]],
		                "AND", 
		                [[["billingaddress.custrecord_gst_registration_type","anyof","4"]],"OR",[["billingaddress.country","noneof","IN"],"AND",["custbody_ygst_is_nri_customer","is","T"]]], 
		                "AND", 
		                ["custcol_gst_reversal_apply","is","T"]

		                ]);
		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}
		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */



		//****************** Start SaveSearch for GSTR 3B T3.1 4th Row */

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({name: "amount",
			summary: "SUM",
			label: "Amount"}));
		ColumnArr.push(search.createColumn({  name: "fxamount",
			summary: "SUM",
			label: "Amount (Foreign Currency)"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		ColumnArr.push(search.createColumn({name: "custcol_gst_igstamount",
			summary: "SUM",
			label: "GST IGST Amount"}));

		ColumnArr.push(search.createColumn({name: "custcol_gst_cgstamount",
			summary: "SUM",
			label: "GST CGST Amount"}));

		ColumnArr.push(search.createColumn({name: "custcol_gst_sgstamount",
			summary: "SUM",
			label: "GST SGST Amount"}));

		ColumnArr.push(search.createColumn({ name: "custcol_gst_cess_amount",
			summary: "SUM",
			label: "Cess Amount"}));
		ColumnArr.push(search.createColumn({name: "formulacurrency5",
			summary: "SUM",
			formula: "{fxamount}",
			label: "Formula (Currency)"}));
		ColumnArr.push(search.createColumn({
			name: "symbol",
			join: "Currency",
			summary: "GROUP",
			label: "Symbol"
		}));
		ColumnArr.push( search.createColumn({
			name: "exchangerate",
			summary: "GROUP",
			label: "Exchange Rate"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency6",
			summary: "SUM",
			formula: "{fxamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency7",
			summary: "SUM",
			formula: "{custcol_gst_igstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency8",
			summary: "SUM",
			formula: "{custcol_gst_cgstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency9",
			summary: "SUM",
			formula: "{custcol_gst_sgstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency10",
			summary: "SUM",
			formula: "{custcol_gst_cess_amount}*{exchangerate}",
			label: "Formula (Currency)"
		}));

		ColumnArr.push(search.createColumn({
			name: "formulacurrency",
			summary: "SUM",
			formula: "CASE WHEN {item} = 'IGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END ",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency",
			summary: "SUM",
			formula: "CASE WHEN {item} = 'CGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency",
			summary: "SUM",
			formula: "CASE WHEN {item} = 'SGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END",
			label: "Formula (Currency)"
		}));


		var vendorbillSearchObj314 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr

		});
		var vbSearchResultCount314 = vendorbillSearchObj314.runPaged().count;
		log.debug("vbSearchResultCount314 result count",vbSearchResultCount314);


		var resultIndex = 0; 
		var resultStep = 1000;
		var searchResult314 = vendorbillSearchObj314.run().getRange({
			start: resultIndex,
			end: resultIndex + resultStep
		});	 
		log.debug("searchResult314",searchResult314);

		if(vbSearchResultCount314 > 0) {
			for(var s=0; s< vbSearchResultCount314;s++) {
				//r4c1New = searchResult314[s].getValue({name:'amount',summary: 'SUM'});
				r4c1New = searchResult314[s].getValue({	name: "formulacurrency5",summary: "SUM",formula: "{fxamount}",label: "Formula (Currency)"});
				var currency = searchResult314[s].getValue({name: "symbol",
					join: "Currency",
					summary: "GROUP",
					label: "Symbol"});	
				var exchangerate = searchResult314[s].getValue({name: "exchangerate",
					summary: "GROUP",
					label: "Exchange Rate"});	

				/* if(!secAccBook){

					if(currency != "INR"){
						var amt_fxamt = searchResult314[s].getValue({ name: "formulacurrency6",
						 summary: "SUM",
						 formula: "{fxamount}*{exchangerate}",
						 label: "Formula (Currency)"});												
					}else{
						var fx_amt_d = searchResult314[s].getValue({name:'fxamount',summary: 'SUM'});
					}
				}
				if(secAccBook){
					r4c1 = searchResult314[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
				} */

				// Start - Changes made by Pralhad Solanke on 10 March 2023 as Requested by Aashish Gunjal
				/* if(currency != "INR"){
					var igst_amt_r4 = searchResult314[s].getValue({name: "formulacurrency7",
						 summary: "SUM",
						 formula: "{custcol_gst_igstamount}*{exchangerate}",
						 label: "Formula (Currency)"});
				}else{
					var igst_sum_r4 = searchResult314[s].getValue({name:'custcol_gst_igstamount',summary: 'SUM',label: "GST IGST Amount"});
				} */


				//r4c2 = searchResult314[s].getValue({name:'custcol_gst_igstamount',summary: 'SUM',label: "GST IGST Amount"});


				/*	if(currency != "INR"){
					var cgst_amt = searchResult314[s].getValue({ name: "formulacurrency8",
						 summary: "SUM",
						 formula: "{custcol_gst_cgstamount}*{exchangerate}",
						 label: "Formula (Currency)"});
				}else{
				    var cgst_sum = searchResult314[s].getValue({name:'custcol_gst_cgstamount',summary: 'SUM'});
				}*/


				/*	if(currency != "INR"){
					var sgst_amt = searchResult314[s].getValue({ name: "formulacurrency9",
						 summary: "SUM",
						 formula: "{custcol_gst_sgstamount}*{exchangerate}",
						 label: "Formula (Currency)"});
				}else{
					var sgst_sum = searchResult314[s].getValue({name:'custcol_gst_sgstamount',summary: 'SUM'});
				}*/
				// End - Changes made by Pralhad Solanke on 10 March 2023 as Requested by Aashish Gunjal
				if(currency != "INR"){
					var cess_amt = searchResult314[s].getValue({ name: "formulacurrency10",
						summary: "SUM",
						formula: "{custcol_gst_cess_amount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var cess_sum = searchResult314[s].getValue({name:'custcol_gst_cess_amount',summary: 'SUM'});
				}


				/* r4c3 = searchResult314[s].getValue({name: "custcol_gst_cgstamount",
				  summary: "SUM",
				  label: "GST CGST Amount"});
				r4c4 = searchResult314[s].getValue({name:'custcol_gst_sgstamount',summary: 'SUM'});
				r4c5 = searchResult314[s].getValue({name:'custcol_gst_cess_amount',summary: 'SUM'}); */

				/* if(amt_fxamt || fx_amt_d){
					r4c1 = parseFloat(amt_fxamt)+parseFloat(fx_amt_d);					
				} */

				// Start - Changes made by Pralhad Solanke on 10 March 2023 as Requested by Aashish Gunjal
				/* if(igst_amt_r4 || igst_sum_r4){
					r4c2 = parseFloat(igst_amt_r4)+parseFloat(igst_sum_r4);		
				}
				if(cgst_amt || cgst_sum){
					r4c3 = parseFloat(cgst_amt)+parseFloat(cgst_sum);
				}
				if(sgst_amt || sgst_sum){
					r4c4 = parseFloat(sgst_amt)+parseFloat(sgst_sum);
				}*/

				r4c2 = searchResult314[s].getValue({
					name: "formulacurrency",
					summary: "SUM",
					formula: "CASE WHEN {item} = 'IGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END ",
					label: "Formula (Currency)"
				}),
				r4c3 =   searchResult314[s].getValue({
					name: "formulacurrency",
					summary: "SUM",
					formula: "CASE WHEN {item} = 'CGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END",
					label: "Formula (Currency)"
				}),
				r4c4 = searchResult314[s].getValue({
					name: "formulacurrency",
					summary: "SUM",
					formula: "CASE WHEN {item} = 'SGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END",
					label: "Formula (Currency)"
				})

				// End - Changes made by Pralhad Solanke on 10 March 2023 as Requested by Aashish Gunjal
				if(cess_amt || cess_sum){
					r4c5 = parseFloat(cess_amt)+parseFloat(cess_sum);
				}			

				log.debug("r4c2",r4c2);
				log.debug("r4c3",r4c3);
				log.debug("r4c4",r4c4);
				log.debug("r4c5",r4c5);

				/* if(!r4c1)
				r4c1 = 0.00; */
				if(!r4c2)
					r4c2 = 0.00;
				if(!r4c3)
					r4c3 = 0.00;
				if(!r4c4)
					r4c4 = 0.00;
				if(!r4c5)
					r4c5 = 0.00;
			}
		}
		//****************** End SaveSearch for GSTR 3B T3.1 4th Row */


		//****************** Start SaveSearch for GSTR 3B T3.1 5th Row */

		var filterArr = [];
		filterArr.push(["type","anyof","CustInvc","CustCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["cogs","is","F"]);
		filterArr.push("AND");
		//filterArr.push(["item.custitem_gst_item_applicable_type","anyof","5"]);
		filterArr.push(["item.custitem_gst_item_applicable_type","anyof","4"]); // Non-GST

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push(["trandate","within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		}

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({  name: "fxamount",
			summary: "SUM",
			label: "Amount (Foreign Currency)"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		ColumnArr.push(search.createColumn({name: "custcol_gst_igstamount",
			summary: "SUM",
			label: "GST IGST Amount"}));

		ColumnArr.push(search.createColumn({name: "custcol_gst_cgstamount",
			summary: "SUM",
			label: "GST CGST Amount"}));

		ColumnArr.push(search.createColumn({name: "custcol_gst_sgstamount",
			summary: "SUM",
			label: "GST SGST Amount"}));

		ColumnArr.push(search.createColumn({ name: "custcol_gst_cess_amount",
			summary: "SUM",
			label: "Cess Amount"}));
		ColumnArr.push(search.createColumn({
			name: "symbol",
			join: "Currency",
			summary: "GROUP",
			label: "Symbol"
		}));
		ColumnArr.push(search.createColumn({
			name: "exchangerate",
			summary: "GROUP",
			label: "Exchange Rate"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency",
			summary: "SUM",
			formula: "{fxamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency1",
			summary: "SUM",
			formula: "{custcol_gst_igstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency2",
			summary: "SUM",
			formula: "{custcol_gst_cgstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency3",
			summary: "SUM",
			formula: "{custcol_gst_sgstamount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		ColumnArr.push(search.createColumn({
			name: "formulacurrency4",
			summary: "SUM",
			formula: "{custcol_gst_cess_amount}*{exchangerate}",
			label: "Formula (Currency)"
		}));
		var invoiceSearchObj315 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr
			/* [
			   search.createColumn({
				  name: "fxamount",
				  summary: "SUM",
				  label: "Amount"
			   }),
			   if(secAccBook){
			    search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}),
			   }
			   search.createColumn({
				  name: "custcol_gst_igstamount",
				  summary: "SUM",
				  label: "GST IGST Amount"
			   }),
			   search.createColumn({
				  name: "custcol_gst_cgstamount",
				  summary: "SUM",
				  label: "GST CGST Amount"
			   }),
			   search.createColumn({
				  name: "custcol_gst_sgstamount",
				  summary: "SUM",
				  label: "GST SGST Amount"
			   }),
			   search.createColumn({
				  name: "custcol_gst_cess_amount",
				  summary: "SUM",
				  label: "Cess Amount"
			   })
			] */
		});
		var searchResultCount315 = invoiceSearchObj315.runPaged().count;
		log.debug("invoiceSearchObj315 result count",searchResultCount315);
		var resultIndex = 0; 
		var resultStep = 1000;
		var searchResult315 = invoiceSearchObj315.run().getRange({
			start: resultIndex,
			end: resultIndex + resultStep
		});	 


		if(searchResultCount315 > 0) {
			for(var s=0; s< searchResultCount315;s++) {
				var currency = searchResult315[s].getValue({name: "symbol",
					join: "Currency",
					summary: "GROUP",
					label: "Symbol"});	
				var exchangerate = searchResult315[s].getValue({name: "exchangerate",
					summary: "GROUP",
					label: "Exchange Rate"});				
				if(!secAccBook){

					if(currency != "INR"){
						var amt_exchangerate = searchResult315[s].getValue({ name: "formulacurrency",
							summary: "SUM",
							formula: "{fxamount}*{exchangerate}",
							label: "Formula (Currency)"});
						//r2c1 = r2c1*exchangerate;
					}else{
						var fxamt = searchResult315[s].getValue({name:'fxamount',summary: 'SUM'});
					}
				}

				if(secAccBook){
					r5c1 = searchResult315[s].getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
				}
				if(currency != "INR"){
					var igst_amt = searchResult315[s].getValue({ name: "formulacurrency",
						summary: "SUM",
						formula: "{custcol_gst_igstamount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var igst_sum = searchResult315[s].getValue({name:'custcol_gst_igstamount',summary: 'SUM'});
				}
				if(currency != "INR"){
					var cgst_amt = searchResult315[s].getValue({ name: "formulacurrency",
						summary: "SUM",
						formula: "{custcol_gst_cgstamount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var cgst_sum = searchResult315[s].getValue({name:'custcol_gst_cgstamount',summary: 'SUM'});
				}
				if(currency != "INR"){
					var sgst_amt = searchResult315[s].getValue({ name: "formulacurrency",
						summary: "SUM",
						formula: "{custcol_gst_sgstamount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var sgst_sum = searchResult315[s].getValue({name:'custcol_gst_sgstamount',summary: 'SUM'});
				}
				if(currency != "INR"){
					var cess_amt = searchResult315[s].getValue({ name: "formulacurrency",
						summary: "SUM",
						formula: "{custcol_gst_cess_amount}*{exchangerate}",
						label: "Formula (Currency)"});
				}else{
					var cess_sum = searchResult315[s].getValue({name:'custcol_gst_cess_amount',summary: 'SUM'});
				}

				if(amt_exchangerate || fxamt){
					r5c1 = parseFloat(amt_exchangerate)+parseFloat(fxamt);
				}
				if(igst_amt || igst_sum){
					r5c2 = parseFloat(igst_amt)+parseFloat(igst_sum);
				}
				if(cgst_amt || cgst_sum){
					r5c3 = parseFloat(cgst_amt)+parseFloat(cgst_sum);
				}
				if(sgst_amt || sgst_sum){
					r5c4 = parseFloat(sgst_amt)+parseFloat(sgst_sum);
				}
				if(cess_amt || cess_sum){
					r5c5 = parseFloat(cess_amt)+parseFloat(cess_sum);
				}
				/* r5c2 = searchResult315[s].getValue({name:'custcol_gst_igstamount',summary: 'SUM'});
				r5c3 = searchResult315[s].getValue({name:'custcol_gst_cgstamount',summary: 'SUM'});
				r5c4 = searchResult315[s].getValue({name:'custcol_gst_sgstamount',summary: 'SUM'});
				r5c5 = searchResult315[s].getValue({name:'custcol_gst_cess_amount',summary: 'SUM'}); */
				//log.debug("invoiceSearchObj r5c1: ",r5c1);
				//log.debug("invoiceSearchObj r5c2: ",r5c2);
				//log.debug("invoiceSearchObj r5c3: ",r5c3);

				if(!r5c1)
					r5c1 = 0;
				if(!r5c2)
					r5c2 = 0;
				if(!r5c3)
					r5c3 = 0;
				if(!r5c4)
					r5c4 = 0;
				if(!r5c5)
					r5c5 = 0;
			}
		}
		//****************** End SaveSearch for GSTR 3B T3.1 5th Row */

		//log.audit("igstArr",igstArr);

		//*************************End SaveSearch Creation Block .................... */

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(a) Outward Taxable supplies(other than zero rated, nil rated and exempted)</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c1+'</td>';	
		//htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c1N+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c2N+'</td>';	
		//htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c2+'</td>';	
		//htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+i_igst_total+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c3+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c4+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c5+'</td>';	
		htmlObj1 +='</tr>';	
		var htmlStr1="";
		htmlStr1 +='<Row>' +
		'<Cell><Data ss:Type="String">(a) Outward Taxable supplies(other than zero rated, nil rated and exempted)</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r1c1+'</Data></Cell>' +
		//'<Cell><Data ss:Type="String">'+r1c1N+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r1c2N+'</Data></Cell>' +
		//	   '<Cell><Data ss:Type="String">'+r1c2+'</Data></Cell>' +
		// '<Cell><Data ss:Type="String">'+i_igst_total+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r1c3+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r1c4+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r1c5+'</Data></Cell>' +
		'</Row>';

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(b) Outward Taxable supplies(zero rated)</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r2c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r2c2+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r2c3+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r2c4+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r2c5+'</td>';	
		htmlObj1 +='</tr>';	

		htmlStr1 +='<Row>' +
		'<Cell><Data ss:Type="String">(b) Outward Taxable supplies(zero rated)</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r2c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r2c2+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r2c3+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r2c4+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r2c5+'</Data></Cell>' +
		'</Row>';

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(c) Other Outward Taxable  supplies (Nil rated, exempted)</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r3c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r3c2+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r3c3+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r3c4+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r3c5+'</td>';	
		htmlObj1 +='</tr>';	

		htmlStr1 +='<Row>' +
		'<Cell><Data ss:Type="String">(c) Other Outward Taxable  supplies (Nil rated, exempted)</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r3c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r3c2+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r3c3+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r3c4+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r3c5+'</Data></Cell>' +
		'</Row>';

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(d) Inward supplies(liable to reverse charge) </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r4c1+'</td>';	
		//htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r4c1New+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r4c2+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r4c3+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r4c4+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r4c5+'</td>';	
		htmlObj1 +='</tr>';	


		htmlStr1 +='<Row>' +
		'<Cell><Data ss:Type="String">(d) Inward supplies(liable to reverse charge)</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r4c1+'</Data></Cell>' +
		//'<Cell><Data ss:Type="String">'+r4c1New+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r4c2+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r4c3+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r4c4+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r4c5+'</Data></Cell>' +
		'</Row>';



		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(e) Non-GST Outward supplies</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c2+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c3+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c4+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c5+'</td>';	
		htmlObj1 +='</tr>';	

		htmlStr1 +='<Row>' +
		'<Cell><Data ss:Type="String">(e) Non-GST Outward supplies</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r5c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r5c2+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r5c3+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r5c4+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r5c5+'</Data></Cell>' +
		'</Row>';



		r6c1 = (Number(r1c1) + Number(r2c1) + Number(r3c1) + Number(r4c1) + Number(r5c1)).toFixed(2);
		r6c2 = (Number(r1c2) + Number(r2c2) + Number(r3c2) + Number(r4c2) + Number(r5c2)).toFixed(2);
		r6c3 = (Number(r1c3) + Number(r2c3) + Number(r3c3) + Number(r4c3) + Number(r5c3)).toFixed(2);
		r6c4 = (Number(r1c4) + Number(r2c4) + Number(r3c4) + Number(r4c4) + Number(r5c4)).toFixed(2);
		r6c5 = (Number(r1c5) + Number(r2c5) + Number(r3c5) + Number(r4c5) + Number(r5c5)).toFixed(2);

		log.debug("after...");
		log.debug("r6c4",r6c4);
		log.debug("r1c4",r1c4);
		log.debug("r2c4",r2c4);
		log.debug("r3c4",r3c4);
		log.debug("r4c4",r4c4);
		log.debug("r5c4",r5c4);


		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"><b>Total</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r6c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r6c2+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r6c3+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r6c4+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r6c5+'</td>';	
		htmlObj1 +='</tr>';	

		htmlStr1 +='<Row>' +
		'<Cell><Data ss:Type="String">Total</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r6c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r6c2+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r6c3+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r6c4+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r6c5+'</Data></Cell>' +
		'</Row>';

		htmlObj1 +='</tbody>';	


		htmlObj1 += '</table>';
		htmlObj1 += '<br>';

		//htmlFileR31.defaultValue = htmlObj1;
		var finalString31  = htmlObj1 + ":||:" + htmlStr1;
		return finalString31;
		/*if(searchCount != 0)
		{
		}*/
		//else		

	}

	function setValuesTable4(monthId,yearId,gstIn,gstCustomerId,subsidiaryId,dateIntId,secAccBook)
	{

		var fromDate = '';
		var toDate = '';
		if(monthId && yearId)
		{			
			/*monthId = Number(monthId) + 1;
			log.debug({title: " monthId In : ", details: monthId});
			var firstDateObj	= new Date(yearId, monthId, 1); 
			var firstDay		= firstDateObj.getDate();
			log.debug({title: " firstDay : ", details: firstDay});
			var lastDateObj		= new Date(yearId, monthId, 0); 
			var lastDay			= lastDateObj.getDate();
			log.debug({title: " lastDay : ", details: lastDay});*/

			var formatted_date= dateFormat(monthId, yearId);
			//log.debug({title: "formatted_date", details: formatted_date.fromDate});

			fromDate	= formatted_date.fromDate;
			//log.debug({title: " fromDate : ", details: fromDate});
			toDate		= formatted_date.toDate;
			//log.debug({title: " toDate : ", details: toDate});
		}
		else
		{			
			var currentDateObj	= new Date();
			var month = currentDateObj.getMonth()+1;
			var year = currentDateObj.getFullYear();

			/*var firstDateObj	= new Date(year, month, 1); 
			var firstDay		= firstDateObj.getDate();
			log.debug({title: " firstDay Else: ", details: firstDay});
			var lastDateObj		= new Date(year, month, 0); 
			var lastDay			= lastDateObj.getDate();
			log.debug({title: " lastDay Else: ", details: lastDay});*/

			var formatted_date= dateFormat(monthId, yearId);
			//log.debug({title: "formatted_date", details: formatted_date.currFromDate});

			fromDate	= formatted_date.currFromDate;
			//log.debug({title: " fromDate Else: ", details: fromDate});
			toDate		= formatted_date.currToDate;
			//log.debug({title: " toDate Else: ", details: toDate});
		}

		//*************************** Save Search Creation Block Started................ */
		var r1c1 = 0.00;
		var r1c5 = 0.00;
		var r2c1 = 0.00;
		var r2c5 = 0.00;
		var r3c1 = 0.00;
		var r3c2 = 0.00;
		var r3c3 = 0.00;
		var r3c4 = 0.00;
		var r5c1 = 0.00;
		var r5c2 = 0.00;
		var r5c3 = 0.00;
		var r5c4 = 0.00;
		var totalCol1 = 0.00;
		var totalCol2 = 0.00;
		//***************************** Start SaveSearch For Row1 Columns.......................... */
		var filterArr = [];
		var igst_amt=0;
		var igst_sum =0;
		var cess_amt=0;
		var cess_sum=0;
		filterArr.push(["type","anyof","VendBill","VendCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["cogs","is","F"]);
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","2"]);
		filterArr.push("AND");
		//filterArr.push(["vendor.country","noneof","IN"]);
		filterArr.push(["billingaddress.country","noneof","IN"]);
		filterArr.push("AND");
		filterArr.push([["expensecategory.custrecord_type_of_gos","noneof","@NONE@","2"],"OR",["item.custitem_type_of_gos","noneof","@NONE@","2"]]);
		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	
		//filterArr.push(["item.custitem_type_of_gos","noneof","2"]);// Non-GST		
		//filterArr.push("AND");
		//filterArr.push(["item.type","anyof","InvtPart"]);
		//filterArr.push("AND");
		//filterArr.push(["expensecategory.custrecord_type_of_gos","noneof","2"]);
		filterArr.push("AND");
		filterArr.push(["status","noneof","VendBill:D","VendBill:E"]);

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) 
		{
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		//For Bill it is not applicable.
		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var vendorbillSearchObjt4r1col = search.create({
			type: "transaction",
			filters:filterArr,
			columns:
				[
				 search.createColumn({
					 name: "custcol_gst_igstamount",
					 summary: "SUM",
					 label: "GST IGST Amount"
				 }),
				 search.createColumn({
					 name: "custbody_gst_cess_amount_total",
					 summary: "SUM",
					 label: "Cess Amount Total"
				 }),
				 search.createColumn({
					 name: "symbol",
					 join: "Currency",
					 summary: "GROUP",
					 label: "Symbol"
				 }),
				 search.createColumn({
					 name: "exchangerate",
					 summary: "GROUP",
					 label: "Exchange Rate"
				 }),
				 search.createColumn({
					 name: "formulacurrency41",
					 summary: "SUM",
					 formula: "{custcol_gst_igstamount}*{exchangerate}",
					 label: "Formula (Currency)"
				 }),
				 search.createColumn({
					 name: "formulacurrency42",
					 summary: "SUM",
					 formula: "{custcol_gst_cess_amount}*{exchangerate}",
					 label: "Formula (Currency)"
				 })
				 ]
		});
		var searchResultCount = vendorbillSearchObjt4r1col.runPaged().count;
		log.debug("vendorbillSearchObjt4r1col result count",searchResultCount);
		//vendorbillSearchObjt4r1col.run().each(function(result){
		var resultIndex = 0; 
		var resultStep = 1000;
		var searchResultr1c1 = vendorbillSearchObjt4r1col.run().getRange({
			start: resultIndex,
			end: resultIndex + resultStep
		});	 


		if(searchResultCount > 0) {
			for(var s=0; s< searchResultCount;s++) {

				var currency = searchResultr1c1[s].getValue({name: "symbol",join: "Currency",summary: "GROUP",label: "Symbol"});
				log.debug("currency",currency);
				if(currency != "INR"){
					var igst_amt = searchResultr1c1[s].getValue({ name: "formulacurrency41",
						summary: "SUM",
						formula: "{custcol_gst_igstamount}*{exchangerate}",
						label: "Formula (Currency)"});
					log.debug("igst_amt",igst_amt);
				}else{
					var igst_sum = searchResultr1c1[s].getValue({name: 'custcol_gst_igstamount', summary: 'SUM'});
					log.debug("igst_sum",igst_sum);
				}

				if(currency != "INR"){
					var cess_amt = searchResultr1c1[s].getValue({ name: "formulacurrency42",
						summary: "SUM",
						formula: "{custcol_gst_cess_amount}*{exchangerate}",
						label: "Formula (Currency)"});
					log.debug("cess_amt",cess_amt);
				}else{
					var cess_sum = searchResultr1c1[s].getValue({name: 'custbody_gst_cess_amount_total', summary: 'SUM'});
					log.debug("cess_sum",cess_sum);
				}

				if(igst_amt || igst_sum){
					r1c1 = parseFloat(igst_amt)+parseFloat(igst_sum);
					log.debug("r1c1",r1c1);
				}

				if(cess_amt || cess_sum){
					r1c5 = parseFloat(cess_amt)+parseFloat(cess_sum);
					log.debug("r1c5",r1c5);
				}
				//r1c1 = result.getValue({name: 'custcol_gst_igstamount', summary: 'SUM'});
				//r1c5 = result.getValue({name: 'custbody_gst_cess_amount_total', summary: 'SUM'});
				if(!r1c1)
					r1c1 = 0.00;
				if(!r1c5)
					r1c5 = 0.00;
			}
		}
		// });

		//***************************** End SaveSearch For Row1 Columns.......................... */

		//***************************** Start SaveSearch For Row2 Columns.......................... */

		var igst_amt=0;		
		var cess_amt=0;
		var igst_sum=0;
		var cess_sum=0;
		var filterArr = [];
		filterArr.push(["type","anyof","VendBill","VendCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","2"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.country","noneof","IN"]);
		filterArr.push("AND");
		//filterArr.push([["expensecategory.custrecord_type_of_gos","noneof","@NONE@","1"],"OR",["item.custitem_type_of_gos","noneof","@NONE@","1"]]);
		filterArr.push([["item.custitem_type_of_gos","anyof","2"],"OR",["expensecategory.custrecord_type_of_gos","anyof","2"]]);
		filterArr.push("AND");
		filterArr.push(["item.name","doesnotcontain","IGST Payable"]);
		//filterArr.push(["item.custitem_type_of_gos","noneof","1"]);
		//filterArr.push("AND");
		//filterArr.push(["item.type","anyof","InvtPart"]);
		//filterArr.push("AND");
		//filterArr.push(["expensecategory.custrecord_type_of_gos","noneof","1"]);
		filterArr.push("AND");
		filterArr.push(["status","noneof","VendBill:D","VendBill:E"]);
		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	
		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}

		if(fromDate && toDate) 
		{
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

//		For Bill it is not applicable.		
		/* 		if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var vendorbillSearchObjt4r2col = search.create({
			type: "transaction",
			filters:filterArr,
			columns:
				[
				 search.createColumn({
					 name: "custcol_gst_igstamount",
					 summary: "SUM",
					 label: "GST IGST Amount"
				 }),
				 search.createColumn({
					 name: "custbody_gst_cess_amount_total",
					 summary: "SUM",
					 label: "Cess Amount Total"
				 }),
				 search.createColumn({
					 name: "symbol",
					 join: "Currency",
					 summary: "GROUP",
					 label: "Symbol"
				 }),
				 search.createColumn({
					 name: "exchangerate",
					 summary: "GROUP",
					 label: "Exchange Rate"
				 }),
				 search.createColumn({
					 name: "formulacurrency41",
					 summary: "SUM",
					 formula: "{custcol_gst_igstamount}*{exchangerate}",
					 label: "Formula (Currency)"
				 }),
				 search.createColumn({
					 name: "formulacurrency42",
					 summary: "SUM",
					 formula: "{custcol_gst_cess_amount}*{exchangerate}",
					 label: "Formula (Currency)"
				 })
				 ]
		});

		var searchResultcount1 = vendorbillSearchObjt4r2col.runPaged().count;
		log.debug("vendorbillSearchObjt4r2col result count",searchResultcount1);
		var resultIndex = 0; 
		var resultStep = 1000;
		var searchResult3151 = vendorbillSearchObjt4r2col.run().getRange({
			start: resultIndex,
			end: resultIndex + resultStep
		});	 


		if(searchResultcount1 > 0) {
			for(var s=0; s< searchResultcount1;s++) {

				var currency = searchResult3151[s].getValue({name: "symbol",join: "Currency",summary: "GROUP",label: "Symbol"});
				log.debug("currency",currency);
				if(currency != "INR"){
					var igst_amt = searchResult3151[s].getValue({ name: "formulacurrency41",
						summary: "SUM",
						formula: "{custcol_gst_igstamount}*{exchangerate}",
						label: "Formula (Currency)"});
					log.debug("igst_amt",igst_amt);
				}else{
					var igst_sum = searchResult3151[s].getValue({name: 'custcol_gst_igstamount', summary: 'SUM'});
					log.debug("igst_sum",igst_sum);
				}

				if(currency != "INR"){
					var cess_amt = searchResult3151[s].getValue({ name: "formulacurrency42",
						summary: "SUM",
						formula: "{custcol_gst_cess_amount}*{exchangerate}",
						label: "Formula (Currency)"});
					log.debug("cess_amt",cess_amt);
				}else{
					var cess_sum = searchResult3151[s].getValue({name: 'custbody_gst_cess_amount_total', summary: 'SUM'});
					log.debug("cess_sum",cess_sum);
				}
				if(igst_amt || igst_sum){
					r2c1 = parseFloat(igst_amt)+parseFloat(igst_sum);
					log.debug("r2c1",r2c1);
				}

				if(cess_amt || cess_sum){
					r2c5 = parseFloat(cess_amt)+parseFloat(cess_sum);
					log.debug("r2c5",r2c5);
				}	
				//r2c1 = result.getValue({name: 'custcol_gst_igstamount', summary: 'SUM'});
				//r2c5 = result.getValue({name: 'custbody_gst_cess_amount_total', summary: 'SUM'});
				//return true;
			}
		}

		//***************************** End SaveSearch For Row2 Columns.......................... */

		//***************************** Start SaveSearch For Row3 Column1.......................... */
		var filterArr = [];
		filterArr.push(["type","anyof","VendBill","VendCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","2"]);
		filterArr.push("AND");
		filterArr.push(["custcol_gst_reversal_apply","is","T"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.country","anyof","IN"]);
		filterArr.push("AND");
		filterArr.push([[["item.name","isnot","CGST Payable"],"AND",["item.name","isnot","SGST Payable"]],"AND",["item.name","isnot","IGST Payable"]]);
		filterArr.push("AND");
		filterArr.push(["fxamount","greaterthan","0.00"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.custrecord_gst_registration_type","anyof","4"]);
		filterArr.push("AND");
		filterArr.push(["status","noneof","VendBill:D","VendBill:E"]);

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	
		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}

		if(fromDate && toDate) 
		{
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		//For Bill it is not applicable.
		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var vendorbillSearchObjt4r3c1 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:
				[
				 search.createColumn({
					 name: "custcol_gst_igstamount",
					 summary: "SUM",
					 label: "GST IGST Amount"
				 }),
				  search.createColumn({
				         name: "formulacurrency",
				         summary: "SUM",
				         formula: "CASE WHEN {item} = 'IGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END ",
				         label: "Formula (Currency)"
				      })
				 ]
		});
		var searchResultCount = vendorbillSearchObjt4r3c1.runPaged().count;
		log.debug("vendorbillSearchObjt4r3c1 result count",searchResultCount);
		vendorbillSearchObjt4r3c1.run().each(function(result){
			//r3c1 = result.getValue({name: 'custcol_gst_igstamount', summary: 'SUM'});
			r3c1 = result.getValue({name: 'formulacurrency', 
				summary: 'SUM', 
				formula: "CASE WHEN {item} = 'IGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END ",
				label: "Formula (Currency)"
					});
			return true;
		});

		//***************************** End SaveSearch For Row3 Column1.......................... */

		//***************************** Start SaveSearch For Row3 Column2,3,4.......................... */
		var filterArr = [];
		filterArr.push(["type","anyof","VendBill","VendCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["cogs","is","F"]);
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","1"]); //intra
		filterArr.push("AND");
		filterArr.push(["custcol_gst_reversal_apply","is","T"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.country","anyof","IN"]);
		filterArr.push("AND");
		filterArr.push([[["item.name","isnot","CGST Payable"],"AND",["item.name","isnot","SGST Payable"]],"AND",["item.name","isnot","IGST Payable"]]);
		filterArr.push("AND");
		filterArr.push(["fxamount","greaterthan","0.00"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.custrecord_gst_registration_type","anyof","4"]);
		filterArr.push("AND");
		filterArr.push(["status","noneof","VendBill:D","VendBill:E"]);

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	
		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}

		if(fromDate && toDate) 
		{
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		//For Bill it is not applicable.
		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var vendorbillSearchObjt4r3c2 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:
				[
				 search.createColumn({
					 name: "custcol_gst_cgstamount",
					 summary: "SUM",
					 label: "GST CGST Amount"
				 }),
				 search.createColumn({
					 name: "custcol_gst_sgstamount",
					 summary: "SUM",
					 label: "GST SGST Amount"
				 }),
				 search.createColumn({
					 name: "custcol_gst_cess_amount",
					 summary: "SUM",
					 label: "Cess Amount"
				 }),
				 search.createColumn({
			         name: "formulacurrency",
			         summary: "SUM",
			         formula: "CASE WHEN {item} = 'CGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END",
			         label: "Formula (Currency)"
			      }),
			      search.createColumn({
			         name: "formulacurrency",
			         summary: "SUM",
			         formula: "CASE WHEN {item} = 'SGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END",
			         label: "Formula (Currency)"
			      })
				 ]
		});
		var searchResultCount = vendorbillSearchObjt4r3c2.runPaged().count;
		log.debug("vendorbillSearchObjt4r3c2 result count",searchResultCount);
		vendorbillSearchObjt4r3c2.run().each(function(result){
			//r3c2 = result.getValue({name: 'custcol_gst_cgstamount', summary: 'SUM'});
			//r3c3 = result.getValue({name: 'custcol_gst_sgstamount', summary: 'SUM'});
			
			r3c2 = result.getValue({name: 'formulacurrency', summary: 'SUM',
				formula: "CASE WHEN {item} = 'SGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END",label: "Formula (Currency)"});
			r3c3 = result.getValue({name: 'formulacurrency', summary: 'SUM',
				formula: "CASE WHEN {item} = 'SGST Purchase' THEN {amount}/{exchangerate} ELSE 0 END",label: "Formula (Currency)"});
			
			r3c4 = result.getValue({name: 'custcol_gst_cess_amount', summary: 'SUM'});
			return true;
		});

		//***************************** End SaveSearch For Row3 Column 2,3,4.......................... */

		//***************************** Start SaveSearch For Row5 Column 1.......................... */

		var filterArr = [];
		filterArr.push(["type","anyof","VendBill","VendCred"]);//modified on 28th Oct
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["cogs","is","F"]);
		filterArr.push("AND");
		//filterArr.push(["custbody_gst_gsttype","anyof","2","1"]);
		filterArr.push(["custbody_gst_gsttype","anyof","2"]);
		filterArr.push("AND");
		filterArr.push(["custcol_gst_reversal_apply","is","F"]);//modified 
		filterArr.push("AND");
		filterArr.push(["billingaddress.country","anyof","IN"]);
		filterArr.push("AND"); 
		//filterArr.push(["billingaddress.custrecord_gst_registration_type","noneof","3","@NONE@","4"]);
		filterArr.push(["billingaddress.custrecord_gst_registration_type","noneof","@NONE@","3"]);
		filterArr.push("AND");
		filterArr.push(["item.name","isnot","IGST Payable"]); 
		//filterArr.push(["item.name","doesnotcontain","IGST Payable"]);
		//filterArr.push("AND");
		//filterArr.push(["item.name","doesnotcontain","CGST Payable"]);
		//filterArr.push("AND");
		//filterArr.push(["item.name","doesnotcontain","SGST Payable"]);
		filterArr.push("AND");
		filterArr.push(["status","noneof","VendBill:D","VendBill:E"]);
		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}

		if(fromDate && toDate) 
		{
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		/*if(subsidiaryId)
		{
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}
		 */

		//For Bill it is not applicable.
		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var transactionSearchObjT4r5c1 = search.create({
			type: "transaction",
			filters: filterArr,
			columns:
				[			   
				 search.createColumn({
					 name: "custcol_gst_igstamount",
					 summary: "SUM",
					 label: "GST IGST Amount"
				 })
				 ]
		});
		var searchResultCount = transactionSearchObjT4r5c1.runPaged().count;
		log.debug("transactionSearchObjT4r5c1 result count",searchResultCount);
		transactionSearchObjT4r5c1.run().each(function(result)
				{			
			r5c1 = result.getValue({name: 'custcol_gst_igstamount', summary: 'SUM'});
			log.audit("P Test Log r5c1==",r5c1);
			return true;
				});

		//***************************** End SaveSearch For Row5 Column 1.......................... */

		//***************************** Start SaveSearch For Row5 Column 2 & 3.......................... */

		var filterArr = [];
		filterArr.push(["type","anyof","VendBill","VendCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["cogs","is","F"]);
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","1"]);
		//added criteria on 5th Aug by Nikita M.
		filterArr.push("AND");
		filterArr.push(["billingaddress.custrecord_gst_registration_type","noneof","@NONE@","3","4"]); 
		filterArr.push("AND");
		filterArr.push(["custcol_gst_reversal_apply","is","F"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.country","anyof","IN"]);
		filterArr.push("AND");
		filterArr.push(["item.name","isnot","SGST Payable","CGST Payable"]);
		filterArr.push("AND");
		filterArr.push(["status","noneof","VendBill:D","VendBill:E"]);

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	
		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}

		if(fromDate && toDate) 
		{
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		//For Bill it is not applicable.
		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var transactionSearchObjT4r5c23 = search.create({
			type: "transaction",
			filters: filterArr,
			columns:
				[
				 search.createColumn({
					 name: "custcol_gst_cgstamount",
					 summary: "SUM",
					 label: "GST CGST Amount"
				 }),
				 search.createColumn({
					 name: "custcol_gst_sgstamount",
					 summary: "SUM",
					 label: "GST SGST Amount"
				 }),			   
				 ]
		});
		var searchResultCount = transactionSearchObjT4r5c23.runPaged().count;
		log.debug("transactionSearchObjT4r5c23 result count",searchResultCount);
		transactionSearchObjT4r5c23.run().each(function(result)
				{			 
			r5c2 = result.getValue({name: 'custcol_gst_cgstamount', summary: 'SUM'});
			r5c3 = result.getValue({name: 'custcol_gst_sgstamount', summary: 'SUM'});			
			return true;
				});

		//***************************** End SaveSearch For Row5 Column 2 & 3.......................... */

		//***************************** Start SaveSearch For Row5 Column 4.......................... */

		var filterArr = [];
		filterArr.push(["type","anyof","PurchOrd","VendBill","VendCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["custcol_gst_reversal_apply","is","F"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.country","anyof","IN"]);

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) 
		{
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		//For Bill it is not applicable.
		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var transactionSearchObjT4r5c4 = search.create({
			type: "transaction",
			filters: filterArr,
			columns:
				[			   
				 search.createColumn({
					 name: "custcol_gst_cess_amount",
					 summary: "SUM",
					 label: "Cess Amount"
				 }),			   
				 ]
		});
		var searchResultCount = transactionSearchObjT4r5c4.runPaged().count;
		log.debug("transactionSearchObjT4r5c4 result count",searchResultCount);
		transactionSearchObjT4r5c4.run().each(function(result)
				{			
			r5c4 = result.getValue({name: 'custcol_gst_cess_amount', summary: 'SUM'});			
			return true;
				});

		var T4Dr1c1 = (Number(r1c1) + Number(r2c1) + Number(r3c1)).toFixed(2);
		var T4Dr1c2 = Number(r3c2).toFixed(2);
		var T4Dr1c3 = Number(r3c3).toFixed(2);
		var T4Dr1c4 = (Number(r1c5) + Number(r2c5) + Number(r3c4)).toFixed(2);

		//***************************** End SaveSearch For Row5 Column 4.......................... */

		//*************************** End Save Search Creation Block................ */

		var htmlStr2 ='';
		var htmlObj1 = '';
		htmlObj1 += '<br>';
		htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
		htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
		htmlObj1 +='<tr>';
		htmlObj1 +='<th colspan="6" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><center><b>4. Eligible ITC </b></center></th>';
		htmlObj1 +='</tr>';

		htmlObj1 +='<tr>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Details</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Integrated Tax</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Central Tax</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>State/UT Tax</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Cess</center></th>';
		htmlObj1 +='</tr>';
		htmlObj1 +='</thead>';	

		htmlObj1 +='<tbody>';	

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"><b>(A) ITC Available (Whether in full or part)</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';		
		htmlObj1 +='</tr>';	

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(A) ITC Available (Whether in full or part)</Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'</Row>';


		if(!r1c1)
			r1c1 = 0;
		if(!r1c5)
			r1c5 = 0;
		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(1) Import of goods </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c5+'</td>';	
		htmlObj1 +='</tr>';	

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(1) Import of goods </Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r1c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r1c5+'</Data></Cell>' +
		'</Row>';


		if(!r2c1)
			r2c1 = 0;
		if(!r2c5)
			r2c5 = 0;
		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(2) Import of services</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r2c1.toFixed(2)+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r2c5+'</td>';		
		htmlObj1 +='</tr>';	

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String"> (2) Import of services</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r2c1.toFixed(2)+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r2c5+'</Data></Cell>' +
		'</Row>';

		if(!r3c1)
			r3c1 = 0;
		if(!r3c2)
			r3c2 = 0;
		if(!r3c3)
			r3c3 = 0;
		if(!r3c4)
			r3c4 = 0;

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(3) Inward supplies liable to reverse charge </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r3c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r3c2+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r3c3+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r3c4+'</td>';		
		htmlObj1 +='</tr>';	

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String"> (3) Inward supplies liable to reverse charge</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r3c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r3c2+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r3c3+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r3c4+'</Data></Cell>' +
		'</Row>';



		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(4) Inward supplies from ISD</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';		
		htmlObj1 +='</tr>';	

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(4) Inward supplies from ISD</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'</Row>';

		if(!r5c1)
			r5c1 = 0;
		if(!r5c2)
			r5c2 = 0;
		if(!r5c3)
			r5c3 = 0;
		if(!r5c4)
			r5c4 = 0;
		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(5) All other ITC</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c2+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c3+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c4+'</td>';	
		htmlObj1 +='</tr>';	

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(5) All other ITC</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r5c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r5c2+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r5c3+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r5c4+'</Data></Cell>' +
		'</Row>';


		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"><b>(B) ITC Reversed</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';		
		htmlObj1 +='</tr>';	

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(B) ITC Reversed</Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'</Row>';



		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(1) As per Rule 42 & 43 of SGST/CGST rules </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='</tr>';	

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(1) As per Rule 42 & 43 of SGST/CGST rules </Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'</Row>';


		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(2) Others</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';		
		htmlObj1 +='</tr>';


		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(2) Others </Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'</Row>';

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> <b>(C) Net ITC Available (A)-(B) </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';	
		htmlObj1 +='</tr>';

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(C) Net ITC Available (A)-(B)</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'<Cell><Data ss:Type="String">0.00</Data></Cell>' +
		'</Row>';



		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"><b>(D) Ineligible ITC</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> </td>';		
		htmlObj1 +='</tr>';	

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(D) Ineligible ITC</Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'<Cell><Data ss:Type="String"></Data></Cell>' +
		'</Row>';

		if(T4Dr1c1 < 0.1)
			T4Dr1c1 = 0;
		if(T4Dr1c2 < 0.1)
			T4Dr1c2 = 0;
		if(T4Dr1c3 < 0.1)
			T4Dr1c3 = 0;
		if(T4Dr1c4 < 0.1)
			T4Dr1c4 = 0;

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(1) As per section 17(5) of CGST/SGST Act </td>';	
		/* htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+T4Dr1c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+T4Dr1c2+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+T4Dr1c3+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+T4Dr1c4+'</td>';	
		 */
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+0+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+0+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+0+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+0+'</td>';	
		htmlObj1 +='</tr>';	

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(1) As per section 17(5) of CGST//SGST Act </Data></Cell>' +
		/* '<Cell><Data ss:Type="String">'+T4Dr1c1+'</Data></Cell>' +
				   '<Cell><Data ss:Type="String">'+T4Dr1c2+'</Data></Cell>' +
				   '<Cell><Data ss:Type="String">'+T4Dr1c3+'</Data></Cell>' +
				   '<Cell><Data ss:Type="String">'+T4Dr1c4+'</Data></Cell>' + */
		'<Cell><Data ss:Type="String">'+0+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+0+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+0+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+0+'</Data></Cell>' +
		'</Row>';

		if(!r5c1)
			r5c1 = 0;
		if(!r5c2)
			r5c2 = 0;
		if(!r5c3)
			r5c3 = 0;
		if(!r5c4)
			r5c4 = 0;

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;">(2) Others</td>';	
		/* 		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c2+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c3+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c4+'</td>';	 */
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+0+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+0+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+0+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+0+'</td>';				
		htmlObj1 +='</tr>';

		htmlStr2 +='<Row>' +
		'<Cell><Data ss:Type="String">(2) Others </Data></Cell>' +
		/*  '<Cell><Data ss:Type="String">'+r5c1+'</Data></Cell>' +
				   '<Cell><Data ss:Type="String">'+r5c2+'</Data></Cell>' +
				   '<Cell><Data ss:Type="String">'+r5c3+'</Data></Cell>' +
				   '<Cell><Data ss:Type="String">'+r5c4+'</Data></Cell>' + */
		'<Cell><Data ss:Type="String">'+0+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+0+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+0+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+0+'</Data></Cell>' +
		'</Row>';

		htmlObj1 +='</tbody>';			
		htmlObj1 += '</table>';
		htmlObj1 += '<br/>';

		//htmlFileR4.defaultValue = htmlObj1;
		//return htmlObj1;
		var finalString32  = htmlObj1 + ":||:" + htmlStr2;
		return finalString32;

	}


	function setValuesTable5(monthId,yearId,gstIn,gstCustomerId,subsidiaryId,dateIntId,secAccBook)
	{

		var fromDate = '';
		var toDate = '';
		if(monthId && yearId)
		{
			/*monthId = Number(monthId) + 1;
			log.debug({title: " monthId In : ", details: monthId});
			var firstDateObj	= new Date(yearId, monthId, 1); 
			var firstDay		= firstDateObj.getDate();
			log.debug({title: " firstDay : ", details: firstDay});
			var lastDateObj		= new Date(yearId, monthId, 0); 
			var lastDay			= lastDateObj.getDate();
			log.debug({title: " lastDay : ", details: lastDay});*/
			var formatted_date= dateFormat(monthId, yearId);
			//log.debug({title: "formatted_date", details: formatted_date.fromDate});

			fromDate 	= formatted_date.fromDate;;
			//log.debug({title: " fromDate : ", details: fromDate});
			toDate 		= formatted_date.toDate;
			//log.debug({title: " toDate : ", details: toDate});
		}
		else
		{
			/*var currentDateObj	= new Date();
			var month = currentDateObj.getMonth()+1;
			var year = currentDateObj.getFullYear();

			var firstDateObj	= new Date(year, month, 1); 
			var firstDay		= firstDateObj.getDate();
			log.debug({title: " firstDay Else: ", details: firstDay});
			var lastDateObj		= new Date(year, month, 0); 
			var lastDay			= lastDateObj.getDate();
			log.debug({title: " lastDay Else: ", details: lastDay});*/
			var formatted_date= dateFormat(monthId, yearId);
			//log.debug({title: "formatted_date", details: formatted_date.fromDate});

			fromDate	= formatted_date.currFromDate;
			//log.debug({title: " fromDate Else: ", details: fromDate});
			toDate		= formatted_date.currToDate;
			//log.debug({title: " toDate Else: ", details: toDate});
		}


		//*************************** Save Search Creation Block Started................ */
		var r1c1 = 0.00;
		var r1c2 = 0.00;
		var r2c1 = 0.00;
		var r2c2 = 0.00;
		var totalCol1 = 0.00;
		var totalCol2 = 0.00;
//		***************************** Start SaveSearch For Row1 Column1.......................... */

		var filterArr = [];
		filterArr.push(["type","anyof","VendBill","VendCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["item.custitem_gst_item_applicable_type","anyof","2","3"]);
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","2"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.custrecord_gst_registration_type","anyof","1"]);
		filterArr.push("AND");
		filterArr.push(["item.name","doesnotcontain","IGST Payable"]);

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		//For Bill it is not applicable.
		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({  name: "fxamount",
			summary: "SUM",
			label: "Amount (Foreign Currency)"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}

		var vendorbillSearchObjr1c1 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr
			/* 			[
			  if(secAccBook){
			   search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}),
			  }
			   search.createColumn({
				  name: "fxamount",
				  summary: "SUM",
				  label: "Amount"
			   })
			] */
		});
		var searchResultCount = vendorbillSearchObjr1c1.runPaged().count;
		log.debug("vendorbillSearchObjr1c1 result count",searchResultCount);
		vendorbillSearchObjr1c1.run().each(function(result){
			if(!secAccBook){
				r1c1 = result.getValue({name: 'fxamount', summary: 'SUM'});
			}
			if(secAccBook){
				r1c1 = result.getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
			}
			//log.debug({title: "Sidd search r1c1", details: r1c1});
			return true;
		});

		//***************************** End SaveSearch For Row1 Column1.......................... */

		//***************************** Start SaveSearch For Row1 Column2.......................... */
		var filterArr = [];
		filterArr.push(["type","anyof","VendBill","VendCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["item.custitem_gst_item_applicable_type","anyof","2","3"]);
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","1"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.custrecord_gst_registration_type","anyof","1"]);//GST Composition Taxable

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	
		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		//For Bill it is not applicable.
		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({  name: "fxamount",
			summary: "SUM",
			label: "Amount (Foreign Currency)"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		var vendorbillSearchObjr1c2 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr
			/* [
				if(secAccBook){
			    search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}),
				}
			   search.createColumn({
				  name: "fxamount",
				  summary: "SUM",
				  label: "Amount"
			   })
			] */
		});
		vendorbillSearchObjr1c2.run().each(function(result){
			if(!secAccBook){
				r1c2 = result.getValue({name: 'fxamount', summary: 'SUM'});
			}
			if(secAccBook){
				r1c2 = result.getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
			}
			return true;
		});

//		***************************** End SaveSearch For Row1 Column2.......................... */
//		***************************** Start SaveSearch For Row2 Column1.......................... */

		var filterArr = [];
		filterArr.push(["type","anyof","VendBill","VendCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["item.custitem_gst_item_applicable_type","anyof","4"]);
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","2"]);

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		//For Bill it is not applicable.
		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({  name: "fxamount",
			summary: "SUM",
			label: "Amount (Foreign Currency)"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		var vendorbillSearchObjr2c1 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr
			/* [
			   if(secAccBook){
			   search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}),
			   }
			   search.createColumn({
				  name: "fxamount",
				  summary: "SUM",
				  label: "Amount"
			   })
			] */
		});
		var searchResultCount = vendorbillSearchObjr2c1.runPaged().count;
		log.debug("vendorbillSearchObjr2c1 result count",searchResultCount);
		vendorbillSearchObjr2c1.run().each(function(result){
			if(!secAccBook){
				r2c1 = result.getValue({name: 'fxamount', summary: 'SUM'});
			}
			if(secAccBook){
				r2c1 = result.getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
			}
			log.debug("r2c1 ",r2c1);
			return true;
		});
//		***************************** End SaveSearch For Row2 Column1.......................... */

//		***************************** Start SaveSearch For Row2 Column2.......................... */

		var filterArr = [];
		filterArr.push(["type","anyof","VendBill","VendCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["item.custitem_gst_item_applicable_type","anyof","4"]); //	Non-GST
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","1"]);

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push([dateIntId,"within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		//For Bill it is not applicable.
		/* if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		} */

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({  name: "fxamount",
			summary: "SUM",
			label: "Amount (Foreign Currency)"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		var vendorbillSearchObjr2c2 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr
			/* [
	   if(secAccBook){
	   search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}),
	   }
	   search.createColumn({
		  name: "fxamount",
		  summary: "SUM",
		  label: "Amount"
	   })
	] */
		});
		var searchResultCount = vendorbillSearchObjr2c2.runPaged().count;
		log.debug("vendorbillSearchObjr2c2 result count",searchResultCount);
		vendorbillSearchObjr2c2.run().each(function(result){
			if(!secAccBook){
				r2c2 = result.getValue({name: 'fxamount', summary: 'SUM'});
			}
			if(secAccBook){
				r2c2 = result.getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}"});
			}
			return true;
		});

		if(!r1c1)
			r1c1 = 0.00;

		if(!r1c2)
			r1c2 = 0.00;

		if(!r2c1)
			r2c1 = 0.00;

		if(!r2c2)
			r2c2 = 0.00;

//		***************************** End SaveSearch For Row2 Column2.......................... */
//		*************************** Save Search Creation Block End................ */
		var htmlStr3 ='';
		var htmlObj1 = '';
		htmlObj1 += '<br>';
		htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
		htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
		htmlObj1 +='<tr>';
		htmlObj1 +='<th colspan="6" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><center><b>5. Values of exempt, Nil-rated and non-GST inward supplies </b></center></th>';
		htmlObj1 +='</tr>';


		htmlObj1 +='<tr>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Nature of supplies</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Inter-State supplies</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Intra-state supplies</center></th>';
		htmlObj1 +='</tr>';
		htmlObj1 +='</thead>';	

		htmlObj1 +='<tbody>';			

		if(!r1c1)
			r1c1 = 0;
		if(!r1c2)
			r1c2 = 0;
		if(!r2c1)
			r2c1 = 0;
		if(!r2c2)
			r2c2 = 0;

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> From a supplier under composition scheme, Exempt  and Nil rated supply </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r1c2+'</td>';	
		htmlObj1 +='</tr>';	

		htmlStr3 +='<Row>' +
		'<Cell><Data ss:Type="String">From a supplier under composition scheme, Exempt  and Nil rated supply </Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r1c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r1c2+'</Data></Cell>' +
		'</Row>';


		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> Non GST supply </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r2c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r2c2+'</td>';	
		htmlObj1 +='</tr>';	

		htmlStr3 +='<Row>' +
		'<Cell><Data ss:Type="String"> Non GST supply </Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r2c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+r2c2+'</Data></Cell>' +
		'</Row>';


		totalCol1 = (Number(r1c1) + Number(r2c1)).toFixed(2);
		totalCol2 = (Number(r1c2) + Number(r2c2)).toFixed(2);

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> <center> <b> Total <center></td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+totalCol1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+totalCol2+'</td>';	
		htmlObj1 +='</tr>';

		htmlStr3 +='<Row>' +
		'<Cell><Data ss:Type="String">Total </Data></Cell>' +
		'<Cell><Data ss:Type="String">'+totalCol1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+totalCol2+'</Data></Cell>' +
		'</Row>';

		htmlObj1 +='</tbody>';			
		htmlObj1 += '</table>';
		htmlObj1 += '<br>';		

		//htmlFileR5.defaultValue = htmlObj1;
		var finalString33  = htmlObj1 + ":||:" + htmlStr3;
		return finalString33;

	}

	function setValuesTable51(monthId,yearId,gstIn,gstCustomerId,subsidiaryId,dateIntId,secAccBook)
	{

		var fromDate = '';
		var toDate = '';

		var nextFromDate = '';
		var nextToDate = '';
		if(monthId && yearId)
		{
			/*monthId = Number(monthId) + 1;
			log.debug({title: " monthId In : ", details: monthId});
			var firstDateObj	= new Date(yearId, monthId, 1); 
			var firstDay		= firstDateObj.getDate();
			log.debug({title: " firstDay : ", details: firstDay});
			var lastDateObj		= new Date(yearId, monthId, 0); 
			var lastDay			= lastDateObj.getDate();
			log.debug({title: " lastDay : ", details: lastDay});*/
			var formatted_date= dateFormat(monthId, yearId);
			//log.debug({title: "formatted_date", details: formatted_date.currFromDate});

			fromDate 	= formatted_date.fromDate;
			//log.debug({title: " fromDate : ", details: fromDate});
			toDate 		= formatted_date.toDate;
			//log.debug({title: " toDate : ", details: toDate});
			nextMonthId = Number(monthId) +1; 
			if(nextMonthId == Number(12))//added by Nikita S as if "dec"  is slected table is hiding
			{
				//nextMonthId = (Number(monthId)+1)%12 + 1; //added by Nikita S 
				nextMonthId = 1;
			}
			log.debug("nextMonthId",nextMonthId);
			var formatted_date1 = dateFormat(nextMonthId, yearId);
			nextFromDate 	= formatted_date1.nextFromDate;
			nextToDate 	= formatted_date1.nextToDate;
			log.debug({title: " next fromDate : ", details: nextFromDate});
			log.debug({title: " next toDate : ", details: nextToDate});
		}
		else
		{
			/*var currentDateObj	= new Date();
			var month = currentDateObj.getMonth()+1;
			var year = currentDateObj.getFullYear();

			var firstDateObj	= new Date(year, month, 1); 
			var firstDay		= firstDateObj.getDate();
			log.debug({title: " firstDay Else: ", details: firstDay});
			var lastDateObj		= new Date(year, month, 0); 
			var lastDay			= lastDateObj.getDate();
			log.debug({title: " lastDay Else: ", details: lastDay});*/
			var formatted_date= dateFormat(monthId, yearId);
			//log.debug({title: "formatted_date", details: formatted_date.currFromDate});

			fromDate 	= formatted_date.currFromDate;
			//log.debug({title: " fromDate Else: ", details: fromDate});
			toDate 		= formatted_date.currToDate;
			//log.debug({title: " toDate Else: ", details: toDate});
		}
		//saved search for interest block started:

		var r5c1Interest = 0;
		var r5c2Interest = 0;
		var r5c3Interest = 0;
		var interestCB;
		var description;

		var filterArr = [];
		filterArr.push(["type","anyof","Journal"]);
		filterArr.push("AND");
		filterArr.push(["custcol_yil_interest","is","T"]);
		filterArr.push("AND");
		filterArr.push(["approvalstatus","anyof","2"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		//filterArr.push("AND");
		//filterArr.push(["trandate","within",nextFromDate,nextToDate]);

		if(nextFromDate && nextToDate) {
			filterArr.push("AND");
			filterArr.push(["trandate","within",nextFromDate,nextToDate]);
		}


		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({name: "account",summary: "GROUP",label: "Account"}));
		ColumnArr.push(search.createColumn({name: "fxamount",summary: "SUM",label: "Amount (Foreign Currency)"}));
		ColumnArr.push(search.createColumn({name: "debitfxamount",summary: "SUM",label: "Amount (Debit) (Foreign Currency)"}));
		ColumnArr.push(search.createColumn({name: "creditfxamount",summary: "SUM",label: "Amount (Credit) (Foreign Currency)"}));
		ColumnArr.push(search.createColumn({name: "description",join: "account",summary: "GROUP",label: "Description"}));
		ColumnArr.push(search.createColumn({ name: "custcol_yil_interest",summary: "GROUP",label: "Interest on GST"}));

		var journalentrySearchObj = search.create({
			type: "journalentry",
			filters:filterArr,
			columns:ColumnArr
		});

		/* 		var journalentrySearchObj = search.create({
		type: "journalentry",
		filters:
		[
			["type","anyof","Journal"], 
				"AND", 
			["subsidiary","anyof",subsidiaryId],
			//["subsidiary","anyof","5","20"], 
				"AND", 
			["approvalstatus","anyof","2"], 
				"AND", 
			["taxline","is","F"], 
				"AND", 
			["custcol_yil_interest","is","T"],
			   "AND",
			["trandate","within",nextFromDate,nextToDate]
		],
		columns:
		[
			search.createColumn({
			name: "account",
			summary: "GROUP",
			label: "Account"
		}),
			search.createColumn({
			name: "fxamount",
			summary: "SUM",
			label: "Amount (Foreign Currency)"
		}),
			search.createColumn({
			name: "debitfxamount",
			summary: "SUM",
			label: "Amount (Debit) (Foreign Currency)"
		}),
			search.createColumn({
			name: "creditfxamount",
			summary: "SUM",
			label: "Amount (Credit) (Foreign Currency)"
		}),
			search.createColumn({
			name: "description",
			join: "account",
			summary: "GROUP",
			label: "Description"
		}),

		search.createColumn({
         name: "custcol_yil_interest",
         summary: "GROUP",
         label: "Interest on GST"
      })
   ]
  }); */
		var searchResultCount = journalentrySearchObj.runPaged().count;
		log.debug("journalentrySearchObj interest result count",searchResultCount);
		journalentrySearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			interestCB = result.getValue({name:'custcol_yil_interest',summary:'GROUP'});
			description = result.getValue({name:'description',join: "account", summary:'GROUP'});
			log.debug("description",description);
			var descriptionStr = description.toString();
			//if(interestCB == true && descriptionStr.indexOf("IGST"))
			//   if((interestCB == true) && (description.includes("IGST") || description.includes("igst")))
			if((interestCB == true) && (descriptionStr.indexOf("IGST") != -1 || descriptionStr.indexOf("igst") != -1))
			{
				r5c1Interest = result.getValue({name: 'fxamount', summary: 'SUM'});
				log.debug("r5c1Interest",r5c1Interest);
				r5c1Interest = Math.abs(r5c1Interest);
				log.debug("again r5c1Interest",r5c1Interest);
			}
			else if((interestCB == true) && (descriptionStr.indexOf("CGST") != -1 || descriptionStr.indexOf("cgst") != -1))
			{
				r5c2Interest = result.getValue({name: 'fxamount', summary: 'SUM'});
				log.debug("r5c2Interest",r5c2Interest);
				r5c2Interest = Math.abs(r5c2Interest);
				log.debug("again r5c2Interest",r5c2Interest);
			}
			else if((interestCB == true) && (descriptionStr.indexOf("SGST") != -1 || descriptionStr.indexOf("sgst") != -1))
			{
				r5c3Interest = result.getValue({name: 'fxamount', summary: 'SUM'});
				log.debug("r5c3Interest",r5c3Interest);
				r5c3Interest = Math.abs(r5c3Interest);
				log.debug("again r5c3Interest",r5c3Interest);
			}
			return true;
		});

		//saved search for late fee:

		var r5c1lateFee= 0;
		var r5c2lateFee = 0;
		var r5c3lateFee = 0;
		var lateFeeCB;
		var description;

		var filterArr = [];
		filterArr.push(["type","anyof","Journal"]);
		filterArr.push("AND");
		filterArr.push(["custcol_yil_late_fees","is","T"]);
		filterArr.push("AND");
		filterArr.push(["approvalstatus","anyof","2"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		//filterArr.push("AND");
		//filterArr.push(["trandate","within",nextFromDate,nextToDate]);


		if(nextFromDate && nextToDate) {
			filterArr.push("AND");
			filterArr.push(["trandate","within",nextFromDate,nextToDate]);
		} 


		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({name: "account",summary: "GROUP",label: "Account"}));
		ColumnArr.push(search.createColumn({name: "fxamount",summary: "SUM",label: "Amount (Foreign Currency)"}));
		ColumnArr.push(search.createColumn({name: "debitfxamount",summary: "SUM",label: "Amount (Debit) (Foreign Currency)"}));
		ColumnArr.push(search.createColumn({name: "creditfxamount",summary: "SUM",label: "Amount (Credit) (Foreign Currency)"}));
		ColumnArr.push(search.createColumn({name: "description",join: "account",summary: "GROUP",label: "Description"}));
		ColumnArr.push(search.createColumn({name: "custcol_yil_late_fees",summary: "GROUP",label: "Late Fee on GST"}));

		var journalentrySearchObj = search.create({
			type: "journalentry",
			filters:filterArr,
			columns:ColumnArr
		});
		/* 	var journalentrySearchObj = search.create({
   type: "journalentry",
   filters:
   [
      ["type","anyof","Journal"], 
      "AND", 
      ["custcol_yil_late_fees","is","T"], 
      "AND", 
    //  ["subsidiary","anyof","5","20"], 
	 ["subsidiary","anyof",subsidiaryId],
      "AND", 
      ["approvalstatus","anyof","2"], 
      "AND", 
      ["taxline","is","F"],
	  "AND",
	["trandate","within",nextFromDate,nextToDate]
   ],
   columns:
   [
      search.createColumn({
         name: "account",
         summary: "GROUP",
         label: "Account"
      }),
      search.createColumn({
         name: "fxamount",
         summary: "SUM",
         label: "Amount (Foreign Currency)"
      }),
      search.createColumn({
         name: "debitfxamount",
         summary: "SUM",
         label: "Amount (Debit) (Foreign Currency)"
      }),
      search.createColumn({
         name: "creditfxamount",
         summary: "SUM",
         label: "Amount (Credit) (Foreign Currency)"
      }),
      search.createColumn({
         name: "description",
         join: "account",
         summary: "GROUP",
         label: "Description"
      }),

	  search.createColumn({
         name: "custcol_yil_late_fees",
         summary: "GROUP",
         label: "Late Fee on GST"
      })
   ]
}); */
		var searchResultCount = journalentrySearchObj.runPaged().count;
		log.debug("journalentrySearchObj result count",searchResultCount);
		journalentrySearchObj.run().each(function(result){
			// .run().each has a limit of 4,000 results
			lateFeeCB = result.getValue({name:'custcol_yil_late_fees',summary:'GROUP'});
			description = result.getValue({name:'description',join: "account", summary:'GROUP'});
			log.debug("description",description);
			var descriptionStr = description.toString();
			//if(interestCB == true && descriptionStr.indexOf("IGST"))
			if((lateFeeCB == true) && (descriptionStr.indexOf("IGST") != -1 || descriptionStr.indexOf("igst") != -1))
			{
				r5c1lateFee = result.getValue({name: 'fxamount', summary: 'SUM'});
				log.debug("r5c1lateFee",r5c1lateFee);
				r5c1lateFee = Math.abs(r5c1lateFee);
				log.debug("again r5c1lateFee",r5c1lateFee);
			}
			else if((lateFeeCB == true) && (descriptionStr.indexOf("CGST") != -1 || descriptionStr.indexOf("cgst") != -1))
			{
				r5c2lateFee = result.getValue({name: 'fxamount', summary: 'SUM'});
				log.debug("r5c2lateFee",r5c2lateFee);
				r5c2lateFee = Math.abs(r5c2lateFee);
				log.debug("again r5c2lateFee",r5c2lateFee);
			}
			else if((lateFeeCB == true) && (descriptionStr.indexOf("SGST") != -1 || descriptionStr.indexOf("sgst") != -1))
			{
				r5c3lateFee = result.getValue({name: 'fxamount', summary: 'SUM'});
				log.debug("r5c3lateFee",r5c3lateFee);
				r5c3lateFee = Math.abs(r5c3lateFee);
				log.debug("again r5c3lateFee",r5c3lateFee);
			}
			return true;
		});




		var htmlStr4 ='';
		var htmlObj1 = '';
		htmlObj1 += '<br>';
		htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
		htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
		htmlObj1 +='<tr>';
		htmlObj1 +='<th colspan="6" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><center><b>5.1 Interest & late fee payable </b></center></th>';
		htmlObj1 +='</tr>';
		htmlObj1 +='</thead>';
		htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
		htmlObj1 +='<tr>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Description</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Integrated Tax</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Central Tax</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>State/UT Tax</center></th>';
		htmlObj1 +='<th style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Cess</center></th>';
		htmlObj1 +='</tr>';
		htmlObj1 +='</thead>';	

		htmlObj1 +='<tbody>';			

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> Interest </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c1Interest+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c2Interest+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c3Interest+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';
		htmlObj1 +='</tr>';	

		htmlObj1 +='<tr>';	
		htmlObj1 +='<td style="border: 1px solid #000000;"> Late Fee </td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c1lateFee+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c2lateFee+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+r5c3lateFee+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">0</td>';
		htmlObj1 +='</tr>';	
		htmlObj1 +='</tbody>';			
		htmlObj1 += '</table>';
		htmlObj1 += '<br>';		

		htmlStr4 +='<Row>' +
		'<Cell><Data ss:Type="String">Interest </Data></Cell>' +
		'<Cell><Data ss:Type="String">0</Data>'+r5c1Interest+'</Cell>' +
		'<Cell><Data ss:Type="String">0</Data>'+r5c2Interest+'</Cell>' +
		'<Cell><Data ss:Type="String">0</Data>'+r5c3Interest+'</Cell>' +
		'<Cell><Data ss:Type="String">0</Data></Cell>' +
		'</Row>';	
		htmlStr4 +='<Row>' +
		'<Cell><Data ss:Type="String">Late Fee </Data></Cell>' +
		'<Cell><Data ss:Type="String">0</Data>'+r5c1lateFee+'</Cell>' +
		'<Cell><Data ss:Type="String">0</Data>'+r5c2lateFee+'</Cell>' +
		'<Cell><Data ss:Type="String">0</Data>'+r5c3lateFee+'</Cell>' +
		'<Cell><Data ss:Type="String">0</Data></Cell>' +
		'</Row>';	

		var finalString34  = htmlObj1 + ":||:" + htmlStr4;
		return finalString34;		
	}

	function setValuesTable32(monthId,yearId,gstIn,gstCustomerId,subsidiaryId,dateIntId,secAccBook)
	{
		var fromDate = '';
		var toDate = '';
		if(monthId && yearId)
		{
			/*monthId = Number(monthId) + 1;
			log.debug({title: " monthId In : ", details: monthId});
			var firstDateObj	= new Date(yearId, monthId, 1); 
			var firstDay		= firstDateObj.getDate();
			log.debug({title: " firstDay : ", details: firstDay});
			var lastDateObj		= new Date(yearId, monthId, 0); 
			var lastDay			= lastDateObj.getDate();
			log.debug({title: " lastDay : ", details: lastDay});*/
			var formatted_date= dateFormat(monthId, yearId);
			//log.debug({title: "formatted_date", details: formatted_date.fromDate});

			fromDate	= formatted_date.fromDate;
			//log.debug({title: " fromDate : ", details: fromDate});
			toDate 		= formatted_date.toDate;
			//log.debug({title: " toDate : ", details: toDate});
		}
		else
		{
			/*var currentDateObj	= new Date();
			var month = currentDateObj.getMonth()+1;
			var year = currentDateObj.getFullYear();

			var firstDateObj	= new Date(year, month, 1); 
			var firstDay		= firstDateObj.getDate();
			log.debug({title: " firstDay Else: ", details: firstDay});
			var lastDateObj		= new Date(year, month, 0); 
			var lastDay			= lastDateObj.getDate();
			log.debug({title: " lastDay Else: ", details: lastDay});*/
			var formatted_date= dateFormat(monthId, yearId);
			//log.debug({title: "formatted_date", details: formatted_date.fromDate});

			fromDate	= formatted_date.currFromDate;
			//log.debug({title: " fromDate Else: ", details: fromDate});
			toDate 		= formatted_date.currToDate;
			//log.debug({title: " toDate Else: ", details: toDate});
		}


		var posArr = [];
		var posLblArr = [];
		var emptyVal = 0.00;
		var placeOfSupply = '';
		var s1c1 = 0.00;
		var s1c2 = 0.00;
		var s2c1 = 0.00;
		var s2c2 = 0.00;
		var s3c1 = 0.00;
		var s3c2 = 0.00;

		var s1c1Arr = [];
		var s1c2Arr = [];
		var s2c1Arr = [];
		var s2c2Arr = [];
		var s3c1Arr = [];
		var s3c2Arr = [];

		//****************Start Saved Searches Block................ ***************** */
		// ****************Start 1st & 2nd Column Save search for GSTR 3B32....... ****************
		var filterArr = [];
		filterArr.push(["type","anyof","CustInvc","CustCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["custbody_gst_customerregno","isempty",""]);
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","2"]);

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push(["trandate","within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		}

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({name: "formulatext",
			summary: "GROUP",
			formula: "{custbody_gst_place_of_supply.custrecord_gst_state_code}||'-'||{custbody_gst_place_of_supply}",
			label: "Formula (Text)"}));
		ColumnArr.push(search.createColumn({name: "custbody_gst_place_of_supply",
			summary: "GROUP"}));
		ColumnArr.push(search.createColumn({ name: "fxamount",
			summary: "SUM",
			label: "Amount"}));

		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		ColumnArr.push(search.createColumn({name: "custcol_gst_igstamount",
			summary: "SUM",
			label: "GST IGST Amount"}));


		var invoiceSearchObj32C1C2 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr
			/* [
			   search.createColumn({
				  name: "formulatext",
				  summary: "GROUP",
				  formula: "{custbody_gst_place_of_supply.custrecord_gst_state_code}||'-'||{custbody_gst_place_of_supply}",
				  label: "Formula (Text)"
			   }),
			   search.createColumn({
				name: "custbody_gst_place_of_supply",
				summary: "GROUP"
			 }),			   
			   search.createColumn({
				  name: "fxamount",
				  summary: "SUM",
				  label: "Amount"
			   }),
			   if(secAccBook){
			    search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}),
			   }
			   search.createColumn({
				name: "custcol_gst_igstamount",
				summary: "SUM",
				label: "GST IGST Amount"
			 })
			] */
		});
		var searchResultCountC1C2 = invoiceSearchObj32C1C2.runPaged().count;
		log.debug("invoiceSearchObj32C1C2 result count",searchResultCountC1C2);		 		 

		// ****************End 1st & 2nd Column Save search for GSTR 3B32....... ****************


		// ****************Start 3rd & 4th Column Save search for GSTR 3B32....... ****************

		var filterArr = [];
		filterArr.push(["type","anyof","CustInvc","CustCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.custrecord_gst_registration_type","anyof","1"]);//GST Composition Taxable
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","2"]);

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}

		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push(["trandate","within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		}

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({name: "formulatext",
			summary: "GROUP",
			formula: "{custbody_gst_place_of_supply.custrecord_gst_state_code}||'-'||{custbody_gst_place_of_supply}",
			label: "Formula (Text)"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		ColumnArr.push(search.createColumn({name: "custbody_gst_place_of_supply",
			summary: "GROUP"}));
		ColumnArr.push(search.createColumn({ name: "fxamount",
			summary: "SUM",
			label: "Amount"}));


		ColumnArr.push(search.createColumn({name: "custcol_gst_igstamount",
			summary: "SUM",
			label: "GST IGST Amount"}));

		var invoiceSearchObjC3C4 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr
			/* [
				search.createColumn({
					name: "formulatext",
					summary: "GROUP",
					formula: "{custbody_gst_place_of_supply.custrecord_gst_state_code}||'-'||{custbody_gst_place_of_supply}",
					label: "Formula (Text)"
				 }),
				 if(secAccBook){
				 search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}),
				 }
				 search.createColumn({
					name: "custbody_gst_place_of_supply",
					summary: "GROUP"
				 }),
			   search.createColumn({
				  name: "fxamount",
				  summary: "SUM",
				  label: "Amount"
			   }),
			   search.createColumn({
				  name: "custcol_gst_igstamount",
				  summary: "SUM",
				  label: "GST IGST Amount"
			   })
			] */
		});	

		// ****************End 3rd & 4th Column Save search for GSTR 3B32....... ****************


		// ****************Start 5th & 6th Column Save search for GSTR 3B32....... ****************

		var filterArr = [];
		filterArr.push(["type","anyof","CustInvc","CustCred"]);
		filterArr.push("AND");
		filterArr.push(["mainline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["taxline","is","F"]);
		filterArr.push("AND");
		filterArr.push(["shipping","is","F"]);
		filterArr.push("AND");
		filterArr.push(["billingaddress.custrecord_gst_registration_type","anyof","3"]);//UIN Holder
		filterArr.push("AND");
		filterArr.push(["custbody_gst_gsttype","anyof","2"]);

		if(subsidiaryId) {
			filterArr.push("AND");
			filterArr.push(["subsidiary","anyof",subsidiaryId]);
		}	

		if(secAccBook) {
			filterArr.push("AND");
			filterArr.push(["accountingtransaction.accountingbook","anyof", secAccBook]);
		}
		if(fromDate && toDate) {
			filterArr.push("AND");
			filterArr.push(["trandate","within",fromDate,toDate]);
		}
		if(gstIn)
		{
			filterArr.push("AND");
			filterArr.push(["custbody_gst_locationregno","is",gstIn]);
		}

		if(gstCustomerId) 
		{
			filterArr.push("AND");
			filterArr.push(["customermain.internalid","anyof",gstCustomerId]);
		}

		var ColumnArr =[];
		ColumnArr.push(search.createColumn({name: "formulatext",
			summary: "GROUP",
			formula: "{custbody_gst_place_of_supply.custrecord_gst_state_code}||'-'||{custbody_gst_place_of_supply}",
			label: "Formula (Text)"}));
		ColumnArr.push(search.createColumn({name: "custbody_gst_place_of_supply",
			summary: "GROUP"}));
		if(secAccBook){
			ColumnArr.push(search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}));
		}
		ColumnArr.push(search.createColumn({name: "custcol_gst_igstamount",
			summary: "SUM",
			label: "GST IGST Amount"}));

		ColumnArr.push(search.createColumn({ name: "fxamount",
			summary: "SUM",
			label: "Amount"}));



		var invoiceSearchObjC5C6 = search.create({
			type: "transaction",
			filters:filterArr,
			columns:ColumnArr
			/* [
				search.createColumn({
					name: "formulatext",
					summary: "GROUP",
					formula: "{custbody_gst_place_of_supply.custrecord_gst_state_code}||'-'||{custbody_gst_place_of_supply}",
					label: "Formula (Text)"
				 }),
				search.createColumn({
					name: "custbody_gst_place_of_supply",
					summary: "GROUP"
				 }),
	             if(secAccBook){
				  search.createColumn({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"}),
				 }
			   search.createColumn({
				  name: "custcol_gst_igstamount",
				  summary: "SUM",
				  label: "GST IGST Amount"
			   }),
			    search.createColumn({
				  name: "fxamount",
				  summary: "SUM",
				  label: "Amount"
			   }), 
			] */
		});

		var invoiceSearchObj32C1C2Result = invoiceSearchObj32C1C2.run();
		log.debug("invoiceSearchObj32C1C2Result",invoiceSearchObj32C1C2.runPaged().count)

		invoiceSearchObj32C1C2Result.each(function(result){
			//Commented by Nikita S
			/* 			var posText= result.getValue(invoiceSearchObj32C1C2Result.columns[0]);
			var posId = result.getValue(invoiceSearchObj32C1C2Result.columns[1]);
			log.debug({title: "posText : ", details: posText});
			log.debug({title: "posId : ", details: posId});
			if(secAccBook){
				var sumOfAMount = result.getValue(invoiceSearchObj32C1C2Result.columns[2]);
				//log.debug({title: "sumOfAMount : ", details: sumOfAMount});
			}
			var sumOfGstAmount = result.getValue(invoiceSearchObj32C1C2Result.columns[3]);
			//log.debug({title: "sumOfGstAmount : ", details: sumOfGstAmount});
			if(!secAccBook){
				var sumOfAMount = result.getValue(invoiceSearchObj32C1C2Result.columns[4]);
				//log.debug({title: "sumOfAMount : ", details: sumOfAMount});
			} */

			//Added by Nikita S
			var posText= result.getValue({name: "formulatext",summary: "GROUP",
				formula: "{custbody_gst_place_of_supply.custrecord_gst_state_code}||'-'||{custbody_gst_place_of_supply}",
				label: "Formula (Text)"});
			var posId = result.getValue({name: "custbody_gst_place_of_supply",summary: "GROUP"});
			log.debug({title: "posText : ", details: posText});
			log.debug({title: "posId : ", details: posId});
			if(secAccBook){
				var sumOfAMount = result.getValue({name: "formulacurrency",summary: "SUM",formula: "{accountingtransaction.exchangerate}*{fxamount}",label: "Amount (Foreign Currency)"});
				//log.debug({title: "sumOfAMount : ", details: sumOfAMount});
			}
			var sumOfGstAmount = result.getValue({name: "custcol_gst_igstamount",summary: "SUM",label: "GST IGST Amount"});
			//log.debug({title: "sumOfGstAmount : ", details: sumOfGstAmount});
			if(!secAccBook){
				var sumOfAMount = result.getValue({ name: "fxamount",summary: "SUM",label: "Amount"});
				//log.debug({title: "sumOfAMount : ", details: sumOfAMount});
			}

			if(posId) 
			{
				posArr.push(posId);
				posLblArr.push(posText);
				s1c1Arr.push(sumOfAMount);
				s1c2Arr.push(sumOfGstAmount);
				s2c1Arr.push(emptyVal);
				s2c2Arr.push(emptyVal);
				s3c1Arr.push(emptyVal);
				s3c2Arr.push(emptyVal); 

			}			
			return true;
		});

		var invoiceSearchObj32C3C4Result =invoiceSearchObjC3C4.run();
		log.debug({title: "Updated Log invoiceSearchObj32C3C4Result", details: invoiceSearchObjC3C4.runPaged().count});
		invoiceSearchObj32C3C4Result.each(function(result){
			/*var posText= result.getValue(invoiceSearchObj32C3C4Result.columns[0]);
		 var posId = result.getValue(invoiceSearchObj32C3C4Result.columns[1]);*/
			var posText= result.getValue({name: "formulatext",
				summary: "GROUP",
				formula: "{custbody_gst_place_of_supply.custrecord_gst_state_code}||'-'||{custbody_gst_place_of_supply}",
				label: "Formula (Text)"});
			var posId = result.getValue({name: "custbody_gst_place_of_supply",summary: "GROUP"});


			var indx = posArr.indexOf(posId);
			//log.debug("indx",indx);
			if(indx>=0)
			{
				s2c1Arr[indx] = result.getValue(invoiceSearchObj32C3C4Result.columns[2]);
				s2c2Arr[indx] = result.getValue(invoiceSearchObj32C3C4Result.columns[3]);
				return true;
			}
			else
			{
				posArr.push(posId);
				posLblArr.push(posText);				
				s1c1Arr.push(emptyVal);
				s1c2Arr.push(emptyVal);
				s3c1Arr.push(emptyVal);
				s3c2Arr.push(emptyVal); 

				s2c1Arr.push(result.getValue(invoiceSearchObj32C3C4Result.columns[2]))
				s2c2Arr.push(result.getValue(invoiceSearchObj32C3C4Result.columns[3]));

			}	
		});

		var invoiceSearchObj32C5C6Result =invoiceSearchObjC5C6.run();

		invoiceSearchObj32C5C6Result.each(function(result){
			/*  var posText= result.getValue({name:invoiceSearchObj32C5C6Result.columns[0]});
		 var posId = result.getValue({name:invoiceSearchObj32C5C6Result.columns[1]}); */
			var posText= result.getValue({name: "formulatext",
				summary: "GROUP",
				formula: "{custbody_gst_place_of_supply.custrecord_gst_state_code}||'-'||{custbody_gst_place_of_supply}",
				label: "Formula (Text)"});
			var posId = result.getValue({name: "custbody_gst_place_of_supply",summary: "GROUP"});

			//log.debug("posId",posId)
			var index = posArr.indexOf(posId);
			//log.debug("index",index)
			if(index>=0)
			{
				s3c1Arr[index] = result.getValue(invoiceSearchObj32C5C6Result.columns[2]);
				s3c2Arr[index] = result.getValue(invoiceSearchObj32C5C6Result.columns[3]); 

				return true;
			}
			else
			{
				posArr.push(posId);
				posLblArr.push(posText);				
				s1c1Arr.push(emptyVal);
				s1c2Arr.push(emptyVal);
				s2c1Arr.push(emptyVal);
				s2c2Arr.push(emptyVal); 

				s3c1Arr.push(result.getValue(invoiceSearchObj32C5C6Result.columns[2]));
				s3c2Arr.push(result.getValue(invoiceSearchObj32C5C6Result.columns[3]));

			}
		});

		// ****************End 5th & 6th Column Save search for GSTR 3B32....... ****************

		//****************End Saved Searches Block................ ***************** */

		var gstAmount = 0.00;
		var gstPlaceOfSupply = '';
		var htmlStr32 ='';
		var htmlObj1 = '';
		htmlObj1 += '<br>';
		htmlObj1 +='<table class="minimalistBlack" style="border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;">';
		htmlObj1 +='<thead style ="background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;">';
		htmlObj1 +='<tr>';
		htmlObj1 +='<th colspan="7" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><center><b>3.2  Of the supplies shown in 3.1 (a), details of inter-state supplies made to unregistered persons, composition taxable person and UIN holders</b></center></th>';
		htmlObj1 +='</tr>';		

		htmlObj1 +='<tr>';
		htmlObj1 +='<th align="center" style="border: 1px solid #000000; padding: 5px 4px;"></th>';
		htmlObj1 +='<th colspan="2" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Unregistered</center></th>';
		htmlObj1 +='<th colspan="4" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Registered</center></th>';
		htmlObj1 +='</tr>';

		htmlObj1 +='<tr>';
		htmlObj1 +='<th rowspan = "2" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><center><b>Place of Supply(State/UT)</center></th>';
		htmlObj1 +='<th colspan="2" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><b>Supplies made to Unregistered Persons</th>';
		htmlObj1 +='<th colspan="2" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><b>Supplies made to Composition Taxable Persons</th>';
		htmlObj1 +='<th colspan="2" align="center" style="border: 1px solid #000000; padding: 5px 4px;"><b>Supplies made to UIN holders</th>';
		htmlObj1 +='</tr>';		

		htmlObj1 +='<tr>';
		htmlObj1 +='<th align="center" style="border: 1px solid #000000; padding: 5px 4px;"><b>Total Taxable value</th>';
		htmlObj1 +='<th align="center" style="border: 1px solid #000000; padding: 5px 4px;"><b>Amount of Integrated Tax</th>';
		htmlObj1 +='<th align="center" style="border: 1px solid #000000; padding: 5px 4px;"><b>Total Taxable value</th>';
		htmlObj1 +='<th align="center" style="border: 1px solid #000000; padding: 5px 4px;"><b>Amount of Integrated Tax</th>';
		htmlObj1 +='<th align="center" style="border: 1px solid #000000; padding: 5px 4px;"><b>Total Taxable value</th>';
		htmlObj1 +='<th align="center" style="border: 1px solid #000000; padding: 5px 4px;"><b>Amount of Integrated Tax</th>';
		htmlObj1 +='</tr>';				
		htmlObj1 +='</thead>';	

		log.debug("s2c1Arr",s2c1Arr);
		log.debug("s2c2Arr",s2c2Arr);
		for(var p=0;p<posArr.length;p++)
		{			
			if(!s1c1Arr[p])
				s1c1Arr[p] = 0;
			if(!s1c2Arr[p])
				s1c2Arr[p] = 0;
			if(!s2c1Arr[p])
				s2c1Arr[p] = 0; 
			if(!s2c2Arr[p])
				s2c2Arr[p] = 0;
			if(!s3c1Arr[p])
				s3c1Arr[p] = 0;
			if(!s3c2Arr[p])
				s3c2Arr[p] = 0;

			htmlObj1 +='<tr>';
			htmlObj1 +='<td style="border: 1px solid #000000;">'+posLblArr[p]+'</td>';			
			htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s1c1Arr[p]+'</td>';	
			htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s1c2Arr[p]+'</td>';	
			htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s2c1Arr[p]+'</td>';	
			htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s2c2Arr[p]+'</td>';
			htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s3c1Arr[p]+'</td>';	
			htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s3c2Arr[p]+'</td>';	
			htmlObj1 +='</tr>';

			htmlStr32 +='<Row>' + 
			'<Cell><Data ss:Type="String">'+posLblArr[p]+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+s1c1Arr[p]+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+s1c2Arr[p]+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+s2c1Arr[p]+'</Data></Cell>' +		
			'<Cell><Data ss:Type="String">'+s2c2Arr[p]+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+s3c1Arr[p]+'</Data></Cell>' +
			'<Cell><Data ss:Type="String">'+s3c2Arr[p]+'</Data></Cell>' +
			'</Row>';	
			s1c1 += Number(s1c1Arr[p]);
			s1c2 += Number(s1c2Arr[p]);
			s2c1 += Number(s2c1Arr[p]);
			s2c2 += Number(s2c2Arr[p]);			
			s3c1 += Number(s3c1Arr[p]);
			s3c2 += Number(s3c2Arr[p]);
		}

		s1c1 = s1c1.toFixed(2);
		s1c2 = s1c2.toFixed(2);
		s2c1 = s2c1.toFixed(2);
		s2c2 = s2c2.toFixed(2);			
		s3c1 = s3c1.toFixed(2);
		s3c2 = s3c2.toFixed(2);


		if(!s1c1)
			s1c1 = 0;
		if(!s1c2)
			s1c2 = 0;
		if(!s2c1)
			s2c1 = 0;
		if(!s2c2)
			s2c2 = 0;
		if(!s3c1)
			s3c1 = 0;
		if(!s3c2)
			s3c2 = 0;
		htmlObj1 +='<tr>';
		htmlObj1 +='<td style="border: 1px solid #000000;"><center><b>Total</center></td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s1c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s1c2+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s2c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s2c2+'</td>';
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s3c1+'</td>';	
		htmlObj1 +='<td style="border: 1px solid #000000;text-align:right;">'+s3c2+'</td>';	
		htmlObj1 +='</tr>';

		htmlStr32 +='<Row>' + 
		'<Cell><Data ss:Type="String">Total</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+s1c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+s1c2+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+s2c1+'</Data></Cell>' +		
		'<Cell><Data ss:Type="String">'+s2c2+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+s3c1+'</Data></Cell>' +
		'<Cell><Data ss:Type="String">'+s3c2+'</Data></Cell>' +
		'</Row>';

		htmlObj1 += '</table>';

		var finalString34  = htmlObj1 + ":||:" + htmlStr32;
		return finalString34;
	}

	/*function hash_function_sha1(base_string, key)
	{
		log.debug('hash_function_sha1 call ...');
		return crypto.HmacSHA1(base_string, key).toString(crypto.enc.Base64);
	}*/

	function dateFormat(monthId, yearId)
	{
		//log.debug({title: "Starting monthId ", details: monthId});
		//log.debug({title: "Starting yearId ", details: yearId});
		var configRecObj	= config.load({type: config.Type.USER_PREFERENCES});
		var dateFormatValue	= configRecObj.getValue({fieldId: 'DATEFORMAT'});

		var m	 			= [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
		var mm 				= [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		var months			= monthId;
		var years			= yearId;
		months = Number(months)+Number(1);
		if(months && years) {
			//var formateddate	= format.parse({value: monthObj, type: format.Type.DATE});
			//log.debug({title: "formateddate", details:formateddate });
			//var months 		= formateddate.getMonth()+1;
			//var years			= formateddate.getFullYear();
			//log.debug({title: "months", details:months });
			//log.debug({title: "months", details:months});
			//log.debug({title: "years", details:years });
			var firstDateObj	= new Date(years, months, 1); 
			var firstDay		= firstDateObj.getDate();
			var lastDateObj		= new Date(years, months, 0); 
			var lastDay			= lastDateObj.getDate();

			var firstDateNextObj	= new Date(years, months+1, 1); 
			var firstNextDay		= firstDateNextObj.getDate();
			var firstNextMonth		= firstDateNextObj.getMonth();
			log.debug("firstNextMonth",firstNextMonth);
			log.debug("firstNextDay",firstNextDay);
			var lastDateNextObj		= new Date(years, months+1, 0); 
			var lastNextDay			= lastDateNextObj.getDate();
			var lastNextMonth		= lastDateNextObj.getMonth()+1;
			//log.debug("lastNextMonth",lastNextMonth);
			log.debug("lastNextDay",lastNextDay);

			var monsText		= m[months-1];
			var monthsText		= mm[months-1];
			//log.debug({title: "Months In Text monsText", details: monsText});
			//log.debug({title: "Months In Text monthsText", details: monthsText});
			//log.debug({title: "dateFormatValue", details: dateFormatValue});

			//_returnCorrectDate(dateObj, dateFormatValue);

			if(dateFormatValue == "M/D/YYYY" || dateFormatValue == "MM/DD/YYYY") {
				var fromDate	= months+"/"+firstDay+"/"+years;
				var toDate		= months+"/"+lastDay+"/"+years;
				//log.debug({title: "fromDate", details: fromDate});
				//log.debug({title: "toDate", details: toDate});
				var nextFromDate	= months+"/"+firstNextDay+"/"+years;
				var nextToDate		= months+"/"+lastDay+"/"+years;
			}
			else if(dateFormatValue == "D/M/YYYY") {
				var fromDate	= firstDay+"/"+months+"/"+years;
				var toDate		= lastDay+"/"+months+"/"+years;

				var nextFromDate	= firstNextDay+"/"+months+"/"+years;
				var nextToDate		= lastDay+"/"+months+"/"+years;
			}
			else if(dateFormatValue == "D-Mon-YYYY") {
				var fromDate	= firstDay+"-"+monsText+"-"+years;
				var toDate		= lastDay+"-"+monsText+"-"+years;

				var nextFromDate	= firstNextDay +"-"+monsText+"-"+years;
				var nextToDate		= lastDay +"-"+monsText+"-"+years;
			}
			else if(dateFormatValue == "D.M.YYYY") {
				var fromDate	= firstDay+"."+months+"."+years;
				var toDate		= lastDay+"."+months+"."+years;

				var nextFromDate	= firstNextDay+"."+months+"."+years;
				var nextToDate		= lastDay+"."+months+"."+years;
			}
			else if(dateFormatValue == "D-MONTH-YYYY" || dateFormatValue == "DD-MONTH-YYYY") {
				var fromDate	= firstDay+"-"+monthsText+"-"+years;
				var toDate		= lastDay+"-"+monthsText+"-"+years;

				var nextFromDate	= firstNextDay+"-"+monthsText+"-"+years;
				var nextToDate		= lastDay+"-"+monthsText+"-"+years;
			}
			else if(dateFormatValue == "D MONTH, YYYY" || dateFormatValue == "DD MONTH, YYYY") {
				var fromDate	= firstDay+" "+monthsText+", "+years;
				var toDate		= lastDay+" "+monthsText+", "+years;

				var nextFromDate	= months+" "+firstNextDay+", "+years;
				var nextToDate		= months+" "+lastDay+", "+years;
			}
			else if(dateFormatValue == "YYYY/M/D" || dateFormatValue == "YYYY/MM/DD") {
				var fromDate	= years+"/"+months+"/"+firstDay;
				var toDate		= years+"/"+months+"/"+lastDay;

				var nextFromDate	= months+"/"+firstNextDay+"/"+years;
				var nextToDate		= months+"/"+lastDay+"/"+years;
			}
			else if(dateFormatValue == "YYYY-M-D" || dateFormatValue == "YYYY-MM-DD") {
				var fromDate	= years+"-"+months+"-"+firstDay;
				var toDate		= years+"-"+months+"-"+lastDay;

				var nextFromDate	= years+"-"+months+"-"+firstNextDay;
				var nextToDate		=     years+"-"+months+"-"+lastDay;
			}
			else if(dateFormatValue == "DD/MM/YYYY") {
				var fromDate	= firstDay+"/"+months+"/"+years;
				var toDate		= lastDay+"/"+months+"/"+years;

				var nextFromDate = firstNextDay +"/"+months+"/"+years;
				var nextToDate		 =lastDay +"/"+months+"/"+years;
			}
			else if(dateFormatValue == "DD-Mon-YYYY") {
				var fromDate	= firstDay+"-"+monsText+"-"+years;
				var toDate		= lastDay+"-"+monsText+"-"+years;

				var nextFromDate = firstNextDay +"-"+monsText+"-"+years;
				//var nextToDate		 =lastNextDay +"-"+monsText+"-"+years;
				var nextToDate		 = lastDay +"-"+monsText+"-"+years;

				log.debug("nextToDate here",nextToDate);
			}
			else if(dateFormatValue == "DD.MM.YYYY") {
				var fromDate	= firstDay+"."+months+"."+years;
				var toDate		= lastDay+"."+months+"."+years;

				var nextFromDate = firstNextDay +"."+months+"."+years;
				var nextToDate		 =lastDay +"."+months+"."+years;
			}
			else if(dateFormatValue == "DD-MONTH-YYYY") {
				var fromDate	= firstDay+"."+months+"."+years;
				var toDate		= lastDay+"."+months+"."+years;

				var nextFromDate = firstNextDay +"."+months+"."+years;
				var nextToDate		 =lastDay +"."+months+"."+years;
			}

			/*	var now = new Date();
			var current = new Date(now.getFullYear(), now.getMonth()+1, 1);
			log.debug("current",current);
			var newDate = format.format({value: current, type: format.Type.DATE});
			log.debug("newDate",newDate);
			 */

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
		var jsonObj	= { "fromDate":fromDate, "toDate":toDate, "currFromDate":currFromDate, "currToDate":currToDate, "nextFromDate": nextFromDate, "nextToDate":nextToDate };
		//x = myObj["name"];
		return jsonObj;
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

	function getUnique(_array){
		var obj = {};
		var uniqueArray = [];
		for (var i = 0; i < _array.length; i++) {
			if (obj[_array[i]] == undefined)
				// add the array elements to object , where the element is key and the same element is value
				// keys of the object can only have unique values
			{   
				obj[_array[i]] = i;
				// add the keys of the object to a new array as elements of the array
				uniqueArray.push(_array[i]);
			}
		}
		return uniqueArray; 
	} 

	return {
		onRequest : onRequest
	}
		});
