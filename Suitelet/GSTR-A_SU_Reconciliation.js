/**
 *
 * @NAPiVersion 2.x
 * @NScriptType Suitelet
 *
 */
/*************************************************************
 * File Header
 * Script Type  : Suitelet
 * Script Name  : GSTR-A_SU_Reconciliation.js
 * File Name    : GSTR-A_SU_Reconciliation.js
 * Created On   : 22/09/2020
 * Modified On  :
 * Created By   : Shivani(Yantra Inc.)
 * Modified By  : 
 * Description  :
 *********************************************************** */
define(['N/ui/serverWidget', 'N/file', 'N/record', 'N/config', 'N/search', 'N/redirect', 'N/render', 'N/url', 'N/https', 'N/task', 'N/format', 'N/runtime', 'N/encode'],
    function(serverWidget, file, record, config, search, redirect, render, url, https, task, format, runtime, encode) {
        function onRequest(context) {
            try {
                var serverRequest = context.request;
                var method = serverRequest.method;
                var form = serverWidget.createForm({title: 'GSTR-A Reconciliation',hideNavBar: false});
                var scriptObj = runtime.getCurrentScript();
                if (context.request.method == 'GET') {
                   // form.clientScriptModulePath = 'SuiteScripts/GST_CS_Reconciliation.js';
                	var clientScriptPath		= scriptObj.getParameter({name: 'custscript_ygst_cs_scriptpath_2a_reconci'});
                	log.debug({title: "clientScriptPath", details:clientScriptPath});
                	form.clientScriptModulePath = ''+clientScriptPath+'';
                    var scriptId = context.request.parameters.script;
                    var deploymentId = context.request.parameters.deploy;
                    var fileID = context.request.parameters.fileID;
                    log.debug('fileID', fileID);
                    
                	var getAccountSubsidiary= scriptObj.getParameter({name: 'custscript_ygst_global_india_subsidiary'});
        			log.debug('getAccountSubsidiary: ',getAccountSubsidiary);
					
					//Matched Tab
                    form.addSubtab({
                        id: 'custpage_items',
                        label: 'Matched'
                    });
                    var sublist = form.addSublist({
                        id: 'custpage_sublist',
                        label: 'Matched',
                        type: serverWidget.SublistType.LIST
                    });

                    sublist.addField({
                        id: 'custpage_gstin',
                        label: 'GSTIN',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_vendor_gstin',
                        label: 'Vendor GSTIN',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_invoice_number',
                        label: 'Invoice Number',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_date',
                        label: 'Date',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_amount',
                        label: 'Amount ',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_pos',
                        label: 'Place of Supply ',
                        type: serverWidget.FieldType.TEXT
                    });

                    sublist.addField({
                        id: 'custpage_gstno',
                        label: 'GST REGISTRATION NUMBER ',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_gst_customer',
                        label: 'GST CUSTOMER GST REGISTRATION NUMBER ',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_ref_no',
                        label: 'REFERENCE NO',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_bill_date',
                        label: 'Date',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_amt',
                        label: 'Amount',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_bill_pos',
                        label: 'Place of Supply',
                        type: serverWidget.FieldType.TEXT
                    });
                    sublist.addField({
                        id: 'custpage_tran_no',
                        label: 'Transaction Number',
                        type: serverWidget.FieldType.TEXT
                    });
					sublist.addField({
                        id: 'custpage_vendor_availed',
                        label: 'Availed Date',
                        type: serverWidget.FieldType.TEXT
                    });

                    sublist.addField({
                        id: 'checkbox',
                        label: 'Reconciled',
                        type: serverWidget.FieldType.CHECKBOX
                    });
                    sublist.addField({
                        id: 'custpage_gst_availed_date',
                        label: 'GST Availed Date',
                        type: serverWidget.FieldType.DATE
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.ENTRY
                    });
                    sublist.addField({
                        id: 'custpage_id',
                        label: 'Internal id',
                        type: serverWidget.FieldType.TEXT
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
					
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
					
					log.debug("arrayItemSearch", JSON.stringify(arrayItemSearch));					
					log.debug("arrayunmatched", JSON.stringify(arrayunmatched));
                    log.debug("invnum", invnum);
                    log.debug("items", items);
                    log.debug("itemdept", itemdept);
                    log.debug("amount", amount);
                    log.debug("taxvalue", taxvalue);
                    log.debug("taxrate", taxrate);	
					
				if(arrayItemSearch.length >0){	
					for (var x = 0; x < arrayItemSearch.length; x++) {							
						//NETSUITE DATA
						if (arrayItemSearch[x].gst_no) {
							sublist.setSublistValue({id: 'custpage_gstno',line: x,value: arrayItemSearch[x].gst_no});
						}
						if (arrayItemSearch[x].cust_gst) {
							sublist.setSublistValue({id: 'custpage_gst_customer',line: x,value: arrayItemSearch[x].cust_gst});
						}
						if (arrayItemSearch[x].ref_no) {
							sublist.setSublistValue({id: 'custpage_ref_no',line: x,value: arrayItemSearch[x].ref_no});
						}
						if (arrayItemSearch[x].date) {
							sublist.setSublistValue({id: 'custpage_bill_date',line: x,value: arrayItemSearch[x].date});
						}
						if (arrayItemSearch[x].amt) {
							sublist.setSublistValue({id: 'custpage_amt',line: x,value: arrayItemSearch[x].amt});
						}
						if (arrayItemSearch[x].bill_pos) {
							sublist.setSublistValue({id: 'custpage_bill_pos',line: x,value: arrayItemSearch[x].bill_pos});
						}
						if (arrayItemSearch[x].tran_no) {
							sublist.setSublistValue({id: 'custpage_tran_no',line: x,value: arrayItemSearch[x].tran_no});
						}
						if (arrayItemSearch[x].vendor_availed){
							sublist.setSublistValue({id: 'custpage_vendor_availed',line: x,value: arrayItemSearch[x].vendor_availed});
						}								
						if (arrayItemSearch[x].internalid) {
							sublist.setSublistValue({id: 'custpage_id',line: x,value: arrayItemSearch[x].internalid});
						}
						//JSON Data
						if(arrayItemSearch[x].gstin){
							sublist.setSublistValue({id: 'custpage_gstin',line: x,value: arrayItemSearch[x].gstin});
						}
						if(arrayItemSearch[x].ctin){
							sublist.setSublistValue({id: 'custpage_vendor_gstin',line: x,value: arrayItemSearch[x].ctin});
						}
						if(arrayItemSearch[x].invnum){
							sublist.setSublistValue({id: 'custpage_invoice_number',line: x,value: arrayItemSearch[x].invnum});
						}
						if(arrayItemSearch[x].idt){
							sublist.setSublistValue({id: 'custpage_date',line: x,value: arrayItemSearch[x].idt});
						}
						if(arrayItemSearch[x].val){
							sublist.setSublistValue({id: 'custpage_amount',line: x,value: arrayItemSearch[x].val});
						}
						if(arrayItemSearch[x].pos){
							sublist.setSublistValue({id: 'custpage_pos',line: x,value: arrayItemSearch[x].pos});
						}
					}
				}
				
					log.debug("arrayunmatched", JSON.stringify(arrayunmatched));			
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
					
					//Unmatched Tab
					form.addSubtab({
                        id: 'custpage_unmatched',
                        label: 'Available in JSON but not in NetSuite'
                    });
					 var unmatchedfields = form.addField({
                        id: 'custpage_html_unmatched_fields',
                        label: 'LineunmatchedList',
                        type: serverWidget.FieldType.INLINEHTML,
                        container: 'custpage_unmatched'
                    });
					var unmatcheddata = _htmlTableReconcile(arrayunmatched);
                    log.debug('unmatcheddata', JSON.stringify(unmatcheddata));
                    unmatchedfields.defaultValue = unmatcheddata;
					
					//Reconcile Tab
                    form.addSubtab({
                        id: 'custpage_item_list',
                        label: 'Available in NetSuite but not in JSON'
                    });
                    var RSublistFields = form.addField({
                        id: 'custpage_html_sc_fields',
                        label: 'LineItemList',
                        type: serverWidget.FieldType.INLINEHTML,
                        container: 'custpage_item_list'
                    });
					var reconcfunction = _htmlTableunmatched(gstin,ctin,inv,fromDt, toDt,getAccountSubsidiary);
                    log.debug('reconcfunction', JSON.stringify(reconcfunction));
					RSublistFields.defaultValue = reconcfunction;

                    var filedata = form.addField({
                        id: 'custpage_file',
                        label: 'File',
                        type: serverWidget.FieldType.TEXT
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
                    filedata.defaultValue = fileID;
                                                                                              					 					                  					
					form.addButton({
						id : 'custpage_excel',
						label : 'EXCEL DOWNLOAD',
						functionName : 'excelsheet()'
					});

                    form.addSubmitButton({
                        label: 'RECONCILE'
                    });
                    context.response.writePage(form);
                    log.debug('**** END ***** ');
                    
                }else {
                    var request = context.request;
                    var fileID = request.parameters.custpage_file;
                    var check;
                    var avail_date;
                    var internal_id;
                    var sub_count = request.getLineCount('custpage_sublist');
                    log.debug('sub_count:', sub_count);
                    for (var a = 0; a < sub_count; a++) {
                        check = request.getSublistValue('custpage_sublist', 'checkbox', a);
                        log.debug('check', check);
                        avail_date = request.getSublistValue('custpage_sublist', 'custpage_gst_availed_date', a);
                        log.debug('avail_date', avail_date);
                        internal_id = request.getSublistValue('custpage_sublist', 'custpage_id', a);
                        log.debug('internal_id', internal_id);

                        if (check == 'T' && avail_date) {
                            var id = record.submitFields({
                                type: record.Type.VENDOR_BILL,
                                id: internal_id,
                                values: {
                                    custbody_yil_availed_date: avail_date,
                                    custbody_yil_gstr2_reconciled: true

                                },
                                options: {
                                    enableSourcing: false,
                                    ignoreMandatoryFields: true
                                }
                            });
                            log.debug("id", id);

                        }
                    }

                    redirect.toSuitelet({
                        scriptId: 'customscript_gstra_su_reconciliation',
                        deploymentId: 'customdeploy_gstra_su_reconciliation',
                        parameters: {
                            'fileID': fileID,
                        }
                    });
                    log.debug('End');
                }
		} catch (ex) {
			log.error("Error GSTR-A_SU_Reconciliation", ex);
		}
    }
							
	function _htmlTableunmatched(gstin,ctin,inv,fromDt,toDt,getAccountSubsidiary){
		try{
		var htmlobje ="";			
		log.debug("_htmlTableunmatched inv.length",inv.length);
		var configRecObj	= config.load({type: config.Type.USER_PREFERENCES});
	    var dateFormatValue	= configRecObj.getValue({fieldId: 'DATEFORMAT'});
		for (var b = 0; b < inv.length; b++) {					
					var items    = inv[b].itms;
					var invnum   = inv[b].inum;					
					var idt      = inv[b].idt;
					var val      = inv[b].val;
					var pos      = inv[b].pos;
					var itemdept = items[0].itm_det;
					var amount   = itemdept.samt;
					var taxvalue = itemdept.txval;
					var taxrate  = itemdept.rt;
					
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
						  ["type","anyof","VendBill"], 
						  "AND",
						  ["custbody_gst_locationregno","isnot",gstin], 
						  "AND",
						  ["subsidiary", "anyof",getAccountSubsidiary],
						  "AND", 
						  ["custbody_gst_customerregno","isnot",ctin], 
						  "AND", 
						  ["trandate","within",fromDt,toDt], 
						  "AND", 
						  ["mainline","is","T"], 
						  "AND", 
						  ["numbertext","isnot",invnum]
					   ],
					   columns:
					   [
						  search.createColumn({name: "custbody_gst_customerregno", label: "GST Customer GST Registration Number"}),
						  search.createColumn({name: "custbody_gst_locationregno", label: "GST Registration Number"}),
						  search.createColumn({name: "trandate", label: "Date"}),
						  search.createColumn({name: "entity", label: "Name"}),
						  search.createColumn({name: "amount", label: "Amount"}),
						  search.createColumn({name: "rate", label: "Item Rate"}),
						  search.createColumn({name: "transactionnumber", label: "Transaction Number"}),
						  search.createColumn({name: "fxrate", label: "Item Rate"}),
						  search.createColumn({name: "taxamount", label: "Amount (Tax)"}),
						  search.createColumn({name: "tranid",label: "Document Number"}),
					   ]
					});

					var searchResultCount = vendorbillSearchObj.runPaged().count;
					//log.debug("vendorbillSearchObj unmatched", JSON.stringify(vendorbillSearchObj));
					log.debug("vendorbillSearchObj unmatched result count", searchResultCount);
					var searchResult = vendorbillSearchObj.run().getRange({
						start: 0,
						end: 1000
					});
				
					htmlobje += "<table class='minimalistBlack' style='border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;'>";
					htmlobje += "<thead style ='background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;'>";
					htmlobje += "<tr>";
					htmlobje += "<th style='border: 1px solid #000000; padding: 5px 4px;'>Name</th>";
					htmlobje += "<th style='border: 1px solid #000000; padding: 5px 4px;'>Invoice Number</th>";
					htmlobje += "<th style='border: 1px solid #000000; padding: 5px 4px;'>Date</th>";
					htmlobje += "<th style='border: 1px solid #000000; padding: 5px 4px;'>GSTIN</th>";
					htmlobje += "<th style='border: 1px solid #000000; padding: 5px 4px;'>Amount</th>";
					htmlobje += "<th style='border: 1px solid #000000; padding: 5px 4px;'>Tax Amount</th>";
					htmlobje += "<th style='border: 1px solid #000000; padding: 5px 4px;'>Rate</th>";
					htmlobje += "</tr>";
					htmlobje += "</thead>";
			
					if (searchResult.length > 0) {
						htmlobje += "<tbody>";
						for (k in searchResult) {
							var name = searchResult[k].getText({
								name: "entity"
							});
							var ref_no = searchResult[k].getValue({
								name: "transactionnumber"
							});
							var invnum = searchResult[k].getValue({
								name: "tranid"
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
							
							htmlobje += "<tr>";
							htmlobje += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + name + "</td>";
							htmlobje += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + invnum + "</td>";
							htmlobje += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + date + "</td>";
							htmlobje += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + gstinvalue + "</td>";
							htmlobje += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + amount + "</td>";
							htmlobje += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + taxamt + "</td>";
							htmlobje += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + ratevalue + "</td>";
							htmlobje += "</tr>";
						}				
					htmlobje += "</tbody>";
					htmlobje += "</table>";
					return htmlobje;
					log.debug('htmlobje', JSON.stringify(htmlobje));
				}				
			}	        									 
		} catch (ex) {
			log.error("Error _htmlTableunmatched", ex);
		}			
	}

	function _htmlTableReconcile(arrayunmatched){
		try{
			var htmlobj = "";	
			htmlobj += "<table class='minimalistBlack' style='border: 1px solid #000000;width: 100%;text-align: left;  border-collapse: collapse;'>";
            htmlobj += "<thead style ='background: #CFCFCF; background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%); background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);  border-bottom: 1px solid #989898;'>";
            htmlobj += "<tr>";
            htmlobj += "<th style='border: 1px solid #000000; padding: 5px 4px;'>GSTIN</th>";
            htmlobj += "<th style='border: 1px solid #000000; padding: 5px 4px;'>CTIN</th>";
            htmlobj += "<th style='border: 1px solid #000000; padding: 5px 4px;'>Invoice Number</th>";
            htmlobj += "<th style='border: 1px solid #000000; padding: 5px 4px;'>Date</th>";
            htmlobj += "<th style='border: 1px solid #000000; padding: 5px 4px;'>Amount</th>";
            htmlobj += "<th style='border: 1px solid #000000; padding: 5px 4px;'>Place of supply</th>";
            htmlobj += "</tr>";
            htmlobj += "</thead>";
			log.debug("_htmlTableReconcile arrayunmatched.length",arrayunmatched.length);
			for (var a = 0; a < arrayunmatched.length; a++) {	
				htmlobj += "<tr>";
				if(arrayunmatched[a].gstin){
					 htmlobj += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + arrayunmatched[a].gstin + "</td>";					
				}
				if(arrayunmatched[a].ctin){
					 htmlobj += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + arrayunmatched[a].ctin + "</td>";					
				}
				if(arrayunmatched[a].invnum){
					 htmlobj += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + arrayunmatched[a].invnum + "</td>";					
				}
				if(arrayunmatched[a].idt){
					 htmlobj += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + arrayunmatched[a].idt + "</td>";					
				}
				if(arrayunmatched[a].val){
					 htmlobj += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + arrayunmatched[a].val + "</td>";					
				}else{
					 htmlobj += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + 0 + "</td>";	
				}
				if(arrayunmatched[a].pos){
					 htmlobj += "<td style='border: 1px solid #000000; padding: 5px 4px;'>" + arrayunmatched[a].pos + "</td>";									
				}
				htmlobj += "</tr>";
			}
                htmlobj += "</tbody>";
                htmlobj += "</table>";
                return htmlobj;
                log.debug('htmlobj', JSON.stringify(htmlobj));
           
		} catch (ex) {
			log.error("Error _htmlTableReconcile", ex);
		}	
	}
	function vendorbillrecords(getAccountSubsidiary){
		var vednorarray = [];
		var vendorbillSearchObj = search.create({
				type: "vendorbill",
				filters: [
					["type", "anyof", "VendBill"],
					"AND",
					["subsidiary", "anyof",getAccountSubsidiary],
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
	function getDateFormat(vbBodyFldVal,dateFormatValue){

		try{

			if(vbBodyFldVal && dateFormatValue){

				var m	 			= [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
				var mm 				= [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

				var formatedfdate = format.parse({value : vbBodyFldVal,type : format.Type.DATE});
				log.debug('formatedfdate',formatedfdate);
				
				try{
					var formateddate = format.format({value : vbBodyFldVal,type : format.Type.DATE});
					log.debug('formateddate',formateddate);
				}catch(e){}
				
				var date;
				if(formateddate.indexOf("-")>-1){
					date = vbBodyFldVal.split("-");
				}
				
				if(formateddate.indexOf(".")>-1){
					date = vbBodyFldVal.split("-");
				}
				
				if(formateddate.indexOf("/")>-1){
					date = vbBodyFldVal.split("/");
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
			log.debug('getDateFormat e',e.message);
		}
	}
	
        return {
            onRequest: onRequest
        }
    });
