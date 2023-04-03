/**
 * @NAPiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/encode', "N/ui/serverWidget", "N/error","N/search", "N/runtime"], function(record, encode, ui, error, search, runtime) {
	function onRequest(context)
	{
	log.debug({title:"Reached Here", details: "Reached Here"});
        
        var requestObj = context.request;

        if(requestObj.method == "GET") {
            var form	= ui.createForm({title: 'TDS PAYMENT'});
			var filterFieGrp	= form.addFieldGroup({id : 'custpage_filter_fg', label : 'Filter Field Group'});
			var entityFieGrp	= form.addFieldGroup({id : 'custpage_entity_fg', label : 'Entity Field Group'});
			
            var tdsPaymentNo	= form.addField({id: 'custpage_tds_payment_no', type: ui.FieldType.TEXT, label: 'TDS PAYMENT NO', container : 'custpage_entity_fg'});
			var tdsDate 		= form.addField({id: 'custpage_tds_date', type: ui.FieldType.DATE, label: 'TDS DATE', container : 'custpage_entity_fg'});
			var tdsPaymentFD	= form.addField({id: 'custpage_tds_payment_fd', type: ui.FieldType.DATE, label: 'TDS PERIOD FROM DATE', container : 'custpage_filter_fg'});
			var tdsPaymentTD	= form.addField({id: 'custpage_tds_payment_td', type: ui.FieldType.DATE, label: 'TDS PERIOD TO DATE', container : 'custpage_filter_fg'});
			var tdsSection		= form.addField({id: 'custpage_tds_section', type: ui.FieldType.MULTISELECT, source: "customlist_tds_section", label: 'TDS SECTION', container : 'custpage_filter_fg'});
			var bankAcc			= form.addField({id: 'custpage_bank_acc', type: ui.FieldType.SELECT, source: "account", label: 'BANK A/C', container : 'custpage_entity_fg'});
			var accBalance		= form.addField({id: 'custpage_acc_balance', type: ui.FieldType.CURRENCY, label: 'ACCOUNT BALANCE', container : 'custpage_entity_fg'});
			var tdsMemo			= form.addField({id: 'custpage_tds_memo', type: ui.FieldType.TEXT, label: 'MEMO', container : 'custpage_entity_fg'});
			var totalAmt		= form.addField({id: 'custpage_total_amt', type: ui.FieldType.CURRENCY, label: 'TOTAL AMOUNT', container : 'custpage_entity_fg'});
			var chequeNo		= form.addField({id: 'custpage_cheque_no', type: ui.FieldType.INTEGER, label: 'CHEQUE NO', container : 'custpage_entity_fg'});
			var brsCode			= form.addField({id: 'custpage_brs_code', type: ui.FieldType.TEXT, label: 'BRS CODE', container : 'custpage_entity_fg'});
			var tdsAssessee		= form.addField({id: 'custpage_tds_assessee', type: ui.FieldType.TEXT, label: 'TDS ASSESSEE', container : 'custpage_entity_fg'});
			var applyInterest	= form.addField({id: 'custpage_apply_interest', type: ui.FieldType.CHECKBOX, label: 'APPLY INTEREST', container : 'custpage_entity_fg'});
			var intAcc			= form.addField({id: 'custpage_int_acc', type: ui.FieldType.SELECT, source: "account", label: 'INTEREST ACCOUNT', container : 'custpage_entity_fg'});
			var intAmt			= form.addField({id: 'custpage_int_amt', type: ui.FieldType.CURRENCY, label: 'INTEREST AMOUNT', container : 'custpage_entity_fg'});
			var tdsChallanNo	= form.addField({id: 'custpage_tds_challan_no', type: ui.FieldType.TEXT, label: 'TDS CHALLAN NO', container : 'custpage_entity_fg'});
			var tdschallanDt	= form.addField({id: 'custpage_tds_challan_dt', type: ui.FieldType.DATE, label: 'TDS CHALLAN DATE', container : 'custpage_entity_fg'});
            accBalance.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			totalAmt.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			var appButton		= form.addButton({id : 'custpage_pay_bill', label : 'Pay TDS', functionName:'payBill()'});
			//var field_Data	= form.addField({id : 'custpage_field_data',type : ui.FieldType.SELECT,label : 'Select', source: 'customlist_yil_mcm_status_list'});
			
			var sublist				= form.addSublist({id : 'custpage_sublistid',type : ui.SublistType.INLINEEDITOR, label : 'TDS Payment Details'});
			var sub_vendorNm		= sublist.addField({id : 'custpage_sub_ven_nm', type : ui.FieldType.SELECT, source: "vendor", label : 'VENDOR NAME'});
			var sub_tdsSectionCode	= sublist.addField({id : 'custpage_sub_tds_section', type : ui.FieldType.SELECT, source: "customlist_tds_section", label : 'TDS TYPE'});
			var sub_billNo			= sublist.addField({id : 'custpage_sub_billno', type : ui.FieldType.SELECT, source: "transaction", label : 'BILL NO'});
			var sub_billDate		= sublist.addField({id : 'custpage_sub_billdate', type : ui.FieldType.TEXT, label : 'BILL DATE'});
			var sub_billAmt			= sublist.addField({id : 'custpage_sub_billamt', type : ui.FieldType.CURRENCY, label : 'BILL AMOUNT'});
			var sub_tdsRate			= sublist.addField({id : 'custpage_sub_tds_rate', type : ui.FieldType.TEXT, label : 'TDS RATE'});
			var sub_tdsAmt			= sublist.addField({id : 'custpage_sub_tds_amt', type : ui.FieldType.CURRENCY, label : 'TDS AMOUNT'});
			var subsidiary_Nm		= sublist.addField({id : 'custpage_subsidiary_nm', type : ui.FieldType.SELECT, source: "subsidiary", label : 'SUBSIDIARY'});
			var sub_bill_int_id		= sublist.addField({id : 'custpage_sub_bill_int_id', type : ui.FieldType.TEXT, label : 'RECORD ID'});
			var sub_pay				= sublist.addField({id : 'custpage_sub_pay', type : ui.FieldType.CHECKBOX, label : 'PAY'});
			sublist.addButton({id : 'custpage_sub_markall', label : 'Mark All', functionName:'markall()'});
			sublist.addButton({id : 'custpage_sub_unmarkall', label : 'Unmark All', functionName:'unmarkall()'});

			var sublist_gl_imp		= form.addSublist({id : 'custpage_sublist_gl_imp',type : ui.SublistType.INLINEEDITOR, label : 'GL Impact'});
			var sub_account			= sublist_gl_imp.addField({id : 'custpage_sub_account', type : ui.FieldType.SELECT, source: "account", label : 'Account'});
			var sub_credit			= sublist_gl_imp.addField({id : 'custpage_sub_credit', type : ui.FieldType.CURRENCY, label : 'Credit'});
			var sub_debit			= sublist_gl_imp.addField({id : 'custpage_sub_debit', type : ui.FieldType.CURRENCY, label : 'Debit'});
			
			subsidiary_Nm.updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});
			sub_bill_int_id.updateDisplayType({displayType: ui.FieldDisplayType.HIDDEN});
			
			sub_vendorNm.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			sub_tdsSectionCode.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			sub_billNo.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			sub_billDate.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			sub_billAmt.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			sub_tdsRate.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			sub_tdsAmt.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			
			sub_account.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			sub_credit.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			sub_debit.updateDisplayType({displayType: ui.FieldDisplayType.DISABLED});
			
			var scriptObj 			= runtime.getCurrentScript();
			var clientScriptPath	= scriptObj.getParameter({name: 'custscript_ygst_tds_payment_module_path'});
			log.debug({title: "clientScriptPath", details:clientScriptPath});
			form.clientScriptModulePath = ""+clientScriptPath+"";//'/SuiteScripts/GSTR1_Report_Cli.js';
			
			context.response.writePage(form);
            log.debug({title: 'Finished', details: 'Finished'});
        }
        else {
			var reqObj			= context.request;
			var form			= ui.createForm({title: ' ', hideNavBar: true});
            var msgFld			= form.addField({id: 'custpage_message', type: ui.FieldType.INLINEHTML, label: ' '});
            var defaultText 	= '';
			defaultText += '<center><br/><br/><font size="5" face="arial">Wrong Click</a></font></center>';
			msgFld.defaultValue = defaultText;
			context.response.writePage(form);
		}
    }
	
    function getDecodedValue(tempString) {
		log.debug('tempString',tempString);
        var decodedValue = encode.convert({
            string: tempString.toString(),
            inputEncoding: encode.Encoding.BASE_64_URL_SAFE,
            outputEncoding: encode.Encoding.UTF_8      
        });

        return decodedValue.toString();
    }
	
	return{
        onRequest: onRequest
    }
});
