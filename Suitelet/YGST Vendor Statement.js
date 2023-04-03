/******************************************************
*File Name: 		CT_SUT_Vendor_Statement
*Company : 		Yantra Inc.
*Date Created: 	27/11/2020
*Date Modified:
*Created By:      Kunal Mahajan
*Description: 		This script is used to show all the vendor details to print Vendor Statement.
*******************************************************/


/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
var UIMODULE,RUNTIME,RECORD,REDIRECT,SEARCH,XML,CONFIG,RENDER;
define(['N/ui/serverWidget','N/runtime','N/record','N/redirect','N/search','N/xml','N/config','N/render'],

function(obj_ui,obj_runtime,obj_record,obj_redirect,obj_search,obj_xml,obj_config,obj_render) 
{
   
	UIMODULE = obj_ui;
	RUNTIME = obj_runtime;
	RECORD = obj_record;
	REDIRECT = obj_redirect;
	SEARCH = obj_search;
	XML = obj_xml;
	CONFIG = obj_config;
	RENDER = obj_render;
	
    function onRequest(context) 
    {
    	var request  = context.request;
		var response = context.response;
		var objXML = '';
		
		if(request.method == 'GET')
    	{
    		try
    		{
    			var form = UIMODULE.createForm({ title: 'Print Vendor Statement' });
    			//form.clientScriptFileId = 8344;
    			var scriptObj 				= RUNTIME.getCurrentScript();
    			var clientScriptPath		= scriptObj.getParameter({name: 'custscript_ygst_cli_script_path_vendstat'});
    			form.clientScriptModulePath = ''+clientScriptPath+'';
    			
    			var vendor_name = form.addField({ id: 'vendorname', type: UIMODULE.FieldType.SELECT, label: 'Vendor',source:'vendor'});
    			vendor_name.isMandatory=true;
    			var o_frm_date_range = form.addField({id : 'startdate',type : UIMODULE.FieldType.DATE,label : 'From Date'});
    			o_frm_date_range.updateBreakType({ breakType: 'startcol' });
    			o_frm_date_range.isMandatory=true;
    			var o_to_date_range = form.addField({id : 'enddate',type : UIMODULE.FieldType.DATE,label : 'To Date'});
    			o_to_date_range.isMandatory=true;
    			
    			form.addButton({ id : 'custpage_print_pdf_btn',label : 'Print in PDF Format', functionName: 'vendor_statement_pdf'});
    			//form.addButton({ id : 'custpage_email_csv_btn',label : 'Email in CSV Format', functionName: cancel_path});
    			  			
    			context.response.writePage(form);
    		}//try
    		catch(error)
    		{
    			log.debug('Inside Catch','Catch error = '+error);
    		}
    	}//end if(request.method == 'GET')
		if(request.method == 'POST')
		{
			log.debug('Print Crieteria POST');
			
			var params = new Array();
			params['vendorname'] = request.parameters.vendorname;
			params['startdate'] = request.parameters.startdate;
			params['enddate'] = request.parameters.enddate;
			
			//==== REDIRECT TO NEXT URL ======
			REDIRECT.toSuitelet({ scriptId:'customscript_ygst_vendor_statement_temp', deploymentId: 'customdeploy_ygst_vendor_statement_temp', parameters: params});
		}	
		else
		{
		    //===WRITE A RESPONSE ======
			var pageNotFound = '<html><body>404-Page Not Found</body></html>';
			context.response.writePage(pageNotFound);
		} // END else
    	
    }

    return {
        onRequest: onRequest
    };
    
});
