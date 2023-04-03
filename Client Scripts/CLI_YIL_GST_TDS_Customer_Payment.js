/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */ 
/**
 * Function to be executed after page is initialized.
 *
 * @param {Object} scriptContext
 * @param {Record} scriptContext.currentRecord - Current form record
 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
 *
 * @since 2015.2
 */
define(['N/record', 'N/search','N/currentRecord'],
		/**
		 * @param {record} record
		 * @param {search} search
		 */
		function(record, search,currentRecord) {	

	function fieldChanged(context)
	{		
		var rec = currentRecord.get();
		var fieldName = context.fieldId;

		if(fieldName == 'custbody_tds_section')
		{
			var tdsTaxSection= rec.getValue({fieldId: "custbody_tds_section"});
			var ObjTDSTaxCode = rec.getField({fieldId: "custbody_tds_taxcode"});		
			if(tdsTaxSection){							
				ObjTDSTaxCode.isMandatory=true;
			}
			else{
				ObjTDSTaxCode.isMandatory=false;
			}
			
		}

	}

	function saveRecord(context)
	{
		
		var rec = currentRecord.get();
		
		var tdsTaxSection= rec.getValue({fieldId: "custbody_tds_section"});
		if(tdsTaxSection){
			var tdsTaxCode = rec.getValue({fieldId: "custbody_tds_taxcode"});	
			if(!tdsTaxCode){
				alert("Please enter value for TDS Tax Code");
				return false;
			}
			else{
				return true;
			}			
		}

		return true;
	}

	function _logValidation(value) {
		if (value != null && value != '' && value != undefined && value.toString() != 'NaN' && value != NaN) {
			return true;
		} else {
			return false;
		}
	}
	return {
		fieldChanged:fieldChanged,
		saveRecord: saveRecord
	};

});
