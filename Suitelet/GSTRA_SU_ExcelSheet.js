/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

/*************************************************************
 * File Header
 * Script Type: Suitelet
 * Script Name: GSTR-A_SU_ExcelSheet 
 * File Name: GSTR-A_SU_ExcelSheet .js
 * Created On: 12/08/2020
 * Modified On: 
 * Created By: Shivani Patil(Yantra Inc.)
 * Modified By: 
 * Description: 
 *********************************************************** */


define(['N/ui/serverWidget', 'N/file', 'N/record', 'N/config', 'N/search', 'N/redirect', 'N/render', 'N/url', 'N/https', 'N/task', 'N/format', 'N/runtime', 'N/encode'],
		function(serverWidget, file, record, config, search, redirect, render, url, https, task, format, runtime, encode) {

	function onRequest(context) {
		try{

			log.debug('onRequest','Suitelet called successfully..');   
			var scriptObj = runtime.getCurrentScript();
			var scriptId = context.request.parameters.script;
			var deploymentId = context.request.parameters.deploy;
			log.debug('scriptId', scriptId);
			log.debug('deploymentId', deploymentId);

			var fileID = context.request.parameters.filedata; //get parameter
			log.debug('fileID', fileID);

			var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});//custscript_ygst_global_india_subsidiary
			log.debug('getAccountSubsidiary: ',getAccountSubsidiary);
			 var folderId		= scriptObj.getParameter({name: 'custscript_ygst_folderid_gstr2a_reconcil'});
         	log.debug({title: "folderId", details:folderId});

			var vendorrecords = vendorbillrecords(getAccountSubsidiary);
			log.debug("vendorrecords",JSON.stringify(vendorrecords));

			var fileContent = file.load(fileID).getContents();
			log.debug("fileContent", fileContent);

			var Loadresult = JSON.parse(fileContent);
			log.debug("Loadresult", Loadresult);

			var monthyear = Loadresult.fp;
			var gstin = Loadresult.gstin;
			var b2b = Loadresult.b2b;
			log.debug("b2b.length",b2b.length);
			var arrayItemSearch = [];
			var arrayunmatched =[];

			for(var k = 0; k < b2b.length; k++){					
				var inv = b2b[k].inv;
				var ctin = b2b[k].ctin;					
				log.debug("ctin", ctin);
				log.debug("inv", inv);
				log.debug("inv length", inv.length);					   					   
				for (var b = 0; b < inv.length; b++) {							
					var items    = inv[b].itms;
					var invnum   = inv[b].inum;
					var idt      = inv[b].idt;
					var val      = inv[b].val;
					var pos      = inv[b].pos;
					log.debug("pos",pos);
					var itemdept = items[0].itm_det;
					var amount   = itemdept.samt;
					var taxvalue = itemdept.txval;
					var taxrate  = itemdept.rt;
					var arraydata = vendorrecords.filter(function(data) {
						if(data.ref_no == invnum && data.gst_no == gstin && data.cust_gst == ctin){
							return data;
						}
					});
					log.debug('data arraydata',arraydata);
					if(arraydata.length >0){
						arrayItemSearch.push({									
							'gst_no': arraydata[0].gst_no,
							'cust_gst': arraydata[0].cust_gst,
							'ref_no': arraydata[0].ref_no,
							'date': arraydata[0].date,
							'amt': arraydata[0].amt,
							'bill_pos': arraydata[0].bill_pos,
							'tran_no': arraydata[0].tran_no,
							'vendor_availed':arraydata[0].vendor_availed,	
							'internalid': arraydata[0].internalid,
							'gstin':gstin,
							'ctin':ctin,
							'invnum': invnum,
							'idt': idt,
							'val': val,
							'pos': pos,
						});
					}else{
						arrayunmatched.push({																											
							'gstin':gstin,
							'ctin':ctin,
							'invnum': invnum,
							'idt': idt,
							'val': val,
							'pos': pos,
						});
					}
				}
			}

			var mm = monthyear.substr(0, 2);
			var yy = monthyear.substr(2, 6);
			log.debug("mm", mm);
			log.debug("yy", yy);

			var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			var firstDateObj = new Date(yy, mm, 1);
			var firstDay = firstDateObj.getDate();
			log.debug("firstDay", firstDay);
			var lastDateObj = new Date(yy, mm, 0);
			var lastDay = lastDateObj.getDate();
			log.debug("lastDay", lastDay);

			var monsText = m[mm - 1];
			log.debug({
				title: "Months In Text ",
				details: m[mm - 1]
			});

			//var fromDt = firstDay + "/" + mm + "/" + yy;
			//var toDt = lastDay + "/" + mm + "/" + yy;
			
			var fromDt = mm + "/" + firstDay + "/" + yy;
			var toDt = mm + "/" + lastDay + "/" + yy;
			
			log.debug({title: "fromDt",details: fromDt});
			log.debug({title: "toDt",details: toDt});
			
			var configRecObj	= config.load({type: config.Type.USER_PREFERENCES});
	        var dateFormatValue	= configRecObj.getValue({fieldId: 'DATEFORMAT'});

			var xmlStr = '';
			var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
			xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
			xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
			xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
			xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
			xmlStr += 'xmlns:htmlObje="http://www.w3.org/TR/REC-html40">';

			xmlStr += '<Worksheet ss:Name="Matched">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">GSTIN</Data></Cell>'+
			'<Cell><Data ss:Type="String">Vendor GSTIN</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice Number</Data></Cell>'+
			'<Cell><Data ss:Type="String">Date</Data></Cell>'+
			'<Cell><Data ss:Type="String">Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">Place of Supply</Data></Cell>'+
			'<Cell><Data ss:Type="String">GST Registration Number</Data></Cell>'+
			'<Cell><Data ss:Type="String">GST CUSTOMER GST REGISTRATION NUMBER</Data></Cell>'+
			'<Cell><Data ss:Type="String">Reference No.</Data></Cell>'+
			'<Cell><Data ss:Type="String">Date</Data></Cell>'+
			'<Cell><Data ss:Type="String">Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">Place of Supply</Data></Cell>'+
			'<Cell><Data ss:Type="String">Transaction Number</Data></Cell>'+
			'<Cell><Data ss:Type="String">Availed Date</Data></Cell></Row>';
			if(arrayItemSearch.length >0){		
				for (var x = 0; x < arrayItemSearch.length; x++) {
					xmlStr += '<Row>'+	 '<Cell><Data ss:Type="String">'+arrayItemSearch[x].gst_no+'</Data></Cell>'+
					'<Cell><Data ss:Type="String">'+arrayItemSearch[x].cust_gst+'</Data></Cell>'+
					'<Cell><Data ss:Type="String">' +arrayItemSearch[x].ref_no+'</Data></Cell>'+								
					'<Cell><Data ss:Type="String">'+arrayItemSearch[x].date+'</Data></Cell>'+									
					'<Cell><Data ss:Type="String">' +arrayItemSearch[x].amt+'</Data></Cell>'+								
					'<Cell><Data ss:Type="String">'+arrayItemSearch[x].pos+'</Data></Cell>'+
					'<Cell><Data ss:Type="String">'+arrayItemSearch[x].gstin+'</Data></Cell>'+
					'<Cell><Data ss:Type="String">' +arrayItemSearch[x].ctin+'</Data></Cell>'+								
					'<Cell><Data ss:Type="String">'+arrayItemSearch[x].invnum+'</Data></Cell>'+									
					'<Cell><Data ss:Type="String">' +arrayItemSearch[x].idt+'</Data></Cell>'+								
					'<Cell><Data ss:Type="String">'+arrayItemSearch[x].val+'</Data></Cell>'+
					'<Cell><Data ss:Type="String">' +arrayItemSearch[x].bill_pos+'</Data></Cell>'+	
					'<Cell><Data ss:Type="String">' +arrayItemSearch[x].tran_no+'</Data></Cell>'+		
					'<Cell><Data ss:Type="String">'+arrayItemSearch[x].vendor_availed+'</Data></Cell></Row>';	
				}
			}

			xmlStr += '</Table></Worksheet>';

			xmlStr += '<Worksheet ss:Name="Available in JSON but not in NetSuite">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">GSTIN</Data></Cell>'+
			'<Cell><Data ss:Type="String">CTIN</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice Number</Data></Cell>'+
			'<Cell><Data ss:Type="String">Date</Data></Cell>'+
			'<Cell><Data ss:Type="String">Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">Place of supply</Data></Cell></Row>';				

			for (var a = 0; a < arrayunmatched.length; a++) {									
				xmlStr += '<Row>'+	 '<Cell><Data ss:Type="String">'+arrayunmatched[a].gstin+'</Data></Cell>'+									
				'<Cell><Data ss:Type="String">'+arrayunmatched[a].ctin+'</Data></Cell>'+								
				'<Cell><Data ss:Type="String">'+arrayunmatched[a].invnum+'</Data></Cell>'+									
				'<Cell><Data ss:Type="String">'+arrayunmatched[a].idt+'</Data></Cell>'+								
				'<Cell><Data ss:Type="String">'+arrayunmatched[a].val+'</Data></Cell>'+													
				'<Cell><Data ss:Type="String">'+arrayunmatched[a].pos+'</Data></Cell></Row>';																	
			}		
			xmlStr += '</Table></Worksheet>';

			xmlStr += '<Worksheet ss:Name="Available in NetSuite but not in JSON">';
			xmlStr += '<Table>'+'<Row>'+'<Cell><Data ss:Type="String">Name</Data></Cell>'+
			'<Cell><Data ss:Type="String">Invoice Number</Data></Cell>'+
			'<Cell><Data ss:Type="String">date</Data></Cell>'+
			'<Cell><Data ss:Type="String">GSTIN</Data></Cell>'+
			'<Cell><Data ss:Type="String">Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">Tax Amount</Data></Cell>'+
			'<Cell><Data ss:Type="String">Tax Rate</Data></Cell></Row>';			
            
			var formatedFromDate = getDateFormat(fromDt,dateFormatValue);
			fromDt = formatedFromDate;
			log.debug("formatedFromDate",formatedFromDate);
		
			var formatedToDate = getDateFormat(toDt,dateFormatValue);
			toDt   = formatedToDate;
			log.debug("formatedToDate",formatedToDate);
			
			var vendorbillSearchObj = search.create({
				type: "vendorbill",
				filters:
					[
						["trandate", "within", fromDt, toDt],
						"AND",
						["type", "anyof", "VendBill"],
						"AND",
						["taxline", "is", "F"],
						"AND",
						["mainline", "is", "T"]							  
						],
						columns: [
							search.createColumn({name: "trandate",label: "Date" }),
							search.createColumn({name: "entity",label: "Name"}),
							search.createColumn({name: "amount",label: "Amount"}),
							search.createColumn({name: "transactionnumber",label: "Transaction Number"}),
							search.createColumn({name: "custbody_gst_locationregno",label: "GST Registration Number"}),
							search.createColumn({name: "taxamount",label: "Amount (Tax)"}),
							search.createColumn({name: "fxrate",label: "Item Rate"})								
							]
			});
			var searchResultCount = vendorbillSearchObj.runPaged().count;
			log.debug("vendorbillSearchObj unmatched", JSON.stringify(vendorbillSearchObj));
			log.debug("vendorbillSearchObj unmatched result count", searchResultCount);
			var searchResult = vendorbillSearchObj.run().getRange({
				start: 0,
				end: 1000
			});
			if (searchResult.length > 0) {

				for (k in searchResult) {
					var name = searchResult[k].getText({
						name: "entity"
					});
					var invnum = searchResult[k].getValue({
						name: "transactionnumber"
					});
					var date = searchResult[k].getValue({
						name: "trandate"
					});
					var gstinvalue = searchResult[k].getValue({
						name: "custbody_gst_locationregno"
					});
					var amount = searchResult[k].getValue({
						name: "amount"
					});
					var taxamt = searchResult[k].getValue({
						name: "taxamount"
					});
					var ratevalue = searchResult[k].getValue({
						name: "fxrate"
					});
					xmlStr += '<Row>'+	 '<Cell><Data ss:Type="String">'+name+'</Data></Cell>'+									
					'<Cell><Data ss:Type="String">'+invnum+'</Data></Cell>'+																					
					'<Cell><Data ss:Type="String">'+date+'</Data></Cell>'+								
					'<Cell><Data ss:Type="String">'+gstinvalue+'</Data></Cell>'+	
					'<Cell><Data ss:Type="String">'+amount+'</Data></Cell>'+								
					'<Cell><Data ss:Type="String">'+taxamt+'</Data></Cell>'+						 
					'<Cell><Data ss:Type="String">'+ratevalue+'</Data></Cell></Row>';	
				}
			}
			//}

			xmlStr += '</Table></Worksheet>';
			xmlStr += '</Workbook>';
			var fileName	= "GSTR-Reconciliation.xls";
			var encodedString	= encode.convert({string: xmlStr, inputEncoding: encode.Encoding.UTF_8, outputEncoding: encode.Encoding.BASE_64});
			var fileObj			= file.create({name: fileName, fileType: file.Type.EXCEL, contents: encodedString});
			log.debug("fileObj",fileObj);
			//fileObj.folder = 950;
			fileObj.folder =folderId;
			var intFileId = fileObj.save();
			log.debug("intFileId");
			context.response.writeFile({file: fileObj});				

		}
		catch(ex){
			log.debug('onRequest ex',ex.message)
		}
	}
	function vendorbillrecords(getAccountSubsidiary){
		var vednorarray = [];
		var vendorbillSearchObj = search.create({
			type: "vendorbill",
			filters: [
				["type", "anyof", "VendBill"],
				"AND",
				["subsidiary", "anyof", getAccountSubsidiary],
				"AND",					
				["mainline", "is", "T"]
				],
				columns: [
					search.createColumn({name: "custbody_gst_locationregno",label: "GST Registration Number"}),
					search.createColumn({name: "custbody_gst_customerregno",label: "GST Customer GST Registration Number"}),
					search.createColumn({name: "refnumber",label: "Reference Number"}),
					search.createColumn({name: "trandate",label: "Date"}),								
					search.createColumn({name: "custbody_gst_place_of_supply",label: "Place of Supply"}),
					search.createColumn({name: "transactionnumber",label: "Transaction Number"}),
					search.createColumn({name: "internalid",label: "Internal ID"}),
					search.createColumn({name: "fxamount",label: "Amount (Foreign Currency)"}),
					search.createColumn({name: "tranid",label: "Document Number"}),
					search.createColumn({name: "custbody_yil_availed_date", label: "GST Availed Date"})
					]
		});

		var resultIndex = 0;
		var resultStep = 1000;
		do {
			var searchResult = vendorbillSearchObj.run().getRange({
				start: resultIndex,
				end: resultIndex + resultStep
			});
			log.debug("searchResult", searchResult.length);


			if (searchResult.length > 0) {
				for (var k in searchResult) {
					var gst_no = searchResult[k].getValue({
						name: "custbody_gst_locationregno"
					});
					var cust_gst = searchResult[k].getValue({
						name: "custbody_gst_customerregno"
					});
					var ref_no = searchResult[k].getValue({
						name: "tranid"
					});
					var date = searchResult[k].getValue({
						name: "trandate"
					});
					var amt = searchResult[k].getValue({
						name: "fxamount"
					});
					var bill_pos = searchResult[k].getValue({
						name: "custbody_gst_place_of_supply"
					});
					var tran_no = searchResult[k].getValue({
						name: "transactionnumber"
					});
					var internalid = searchResult[k].getValue({
						name: "internalid"
					});
					var vendor_availed = searchResult[k].getValue({
						name: "custbody_yil_availed_date"
					});

					vednorarray.push({									
						'gst_no': gst_no,
						'cust_gst': cust_gst,
						'ref_no': ref_no,
						'date': date,
						'amt': amt,
						'bill_pos': bill_pos,
						'tran_no': tran_no,
						'vendor_availed':vendor_availed,	
						'internalid': internalid,

					});						

				}
			}
			resultIndex = resultIndex + resultStep
		} while (searchResult.length !== 0);
		log.debug("vednorarray", vednorarray.length);			
		return vednorarray;
	}
	
	//	Dynamic Date Format
	function getDateFormat(DateFldValue,dateFormatValue){

		try{

			if(DateFldValue && dateFormatValue){

				var m	 			= [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
				var mm 				= [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

				var formatedfdate = format.parse({value : DateFldValue,type : format.Type.DATE});
				log.debug('formatedfdate',formatedfdate);
				
				try{
					var formateddate = format.format({value : DateFldValue,type : format.Type.DATE});
					log.debug('formateddate',formateddate);
				}catch(e){}
				
				var date;
				if(formateddate.indexOf("-")>-1){
					date = DateFldValue.split("-");
				}
				
				if(formateddate.indexOf(".")>-1){
					date = DateFldValue.split("-");
				}
				
				if(formateddate.indexOf("/")>-1){
					date = DateFldValue.split("/");
				}

				log.debug('date',date);
				/*log.debug('date 1',date[0]);
				log.debug('date 2',date[1]);
				log.debug('date 3',date[2]);*/


				var months 			= date[0];
				var years			= date[2];
				var firstDay		= date[1];
				var monsText		= m[months-1];
				var monthsText		= mm[months-1];

				//log.debug({title: "months", details:months });
				//log.debug({title: "years", details:years });
				//log.debug({title: "firstDay", details:firstDay });
				//log.debug({title: "monsText", details:monsText });
				//log.debug({title: "monthsText", details:monthsText });
				//log.debug({title: "dateFormatValue", details:dateFormatValue });

				if(dateFormatValue == "M/D/YYYY" || dateFormatValue == "MM/DD/YYYY") {
					var Date	= months+"/"+firstDay+"/"+years;

				}
				else if(dateFormatValue == "D/M/YYYY") {
					var Date	= firstDay+"/"+months+"/"+years;

				}
				else if(dateFormatValue == "D-Mon-YYYY") {
					var Date	= firstDay+"-"+monsText+"-"+years;
				}
				else if(dateFormatValue == "D.M.YYYY") {
					var Date	= firstDay+"."+months+"."+years;
				}
				else if(dateFormatValue == "D-MONTH-YYYY" || dateFormatValue == "DD-MONTH-YYYY") {
					var Date	= firstDay+"-"+monthsText+"-"+years;
				}
				else if(dateFormatValue == "D MONTH, YYYY" || dateFormatValue == "DD MONTH, YYYY") {
					var Date	= firstDay+" "+monthsText+", "+years;
				}
				else if(dateFormatValue == "YYYY/M/D" || dateFormatValue == "YYYY/MM/DD") {
					var Date	= years+"/"+months+"/"+firstDay;
				}
				else if(dateFormatValue == "YYYY-M-D" || dateFormatValue == "YYYY-MM-DD") {
					var Date	= years+"-"+months+"-"+firstDay;
				}
				else if(dateFormatValue == "DD/MM/YYYY") {
					var Date	= firstDay+"/"+months+"/"+years;
				}
				else if(dateFormatValue == "DD-Mon-YYYY") {
					var Date	= firstDay+"-"+monsText+"-"+years;
				}
				else if(dateFormatValue == "DD.MM.YYYY") {
					var Date	= firstDay+"."+months+"."+years;
				}
				else if(dateFormatValue == "DD-MONTH-YYYY") {
					var Date	= firstDay+"."+months+"."+years;
				}

				log.debug('Date',Date);
				return Date;
			}
		}
		catch(e){
			//log.debug('getDateFormat e',e.message);
		}
	}

	return {
		onRequest: onRequest
	};

});
