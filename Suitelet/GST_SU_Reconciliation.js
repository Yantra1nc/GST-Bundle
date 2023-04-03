/**
 *
 * @NAPiVersion 2.x
 * @NScriptType Suitelet
 *
 */
/*************************************************************
 * File Header
 * Script Type  : Suitelet
 * Script Name  : GST_SU_Reconciliation.js
 * File Name    : GST_SU_Reconciliation.js
 * Created On   : 17/09/2020
 * Modified On  :
 * Created By   : Shivani(Yantra Inc.)
 * Modified By  : 
 * Description  :
 *********************************************************** */
define(['N/ui/serverWidget', 'N/file', 'N/record', 'N/config', 'N/search', 'N/redirect', 'N/render', 'N/url', 'N/https', 'N/task', 'N/format', 'N/runtime'],
    function(serverWidget, file, record, config, search, redirect, render, url, https, task, format, runtime) {

        function onRequest(context) {

            try {

                var serverRequest = context.request;
                var method = serverRequest.method;
                
                var scriptObj = runtime.getCurrentScript();
                var folderId		= scriptObj.getParameter({name: 'custscript_ygst_folderid_gstr2a_reconcil'});
            	log.debug({title: "folderId", details:folderId});
            	
                var form = serverWidget.createForm({title: 'GSTR2A Reconciliation',hideNavBar: false});

                if (context.request.method == 'GET') {

                    form.addField({
                        id: 'custpage_filedata',
                        type: serverWidget.FieldType.FILE,
                        label: 'Import File'
                    });

                    form.addSubmitButton({
                        label: 'Submit'
                    });

                    context.response.writePage(form);
                    log.debug('**** END ***** ');

                } else {
                    var fileData = serverRequest.files['custpage_filedata'];
                    log.debug("fileData", fileData);
                   // fileData.folder = 950;
                    fileData.folder =folderId;
                    var fileID = fileData.save();
					log.debug("fileID",fileID)
                    if (fileID) {                      
                        redirect.toSuitelet({
                            scriptId: 'customscript_gstra_su_reconciliation',
                            deploymentId: 'customdeploy_gstra_su_reconciliation',
                            parameters: {
							'fileID': fileID,}
                                
                        });

                    }
				}
            } catch (ex) {
                log.debug("Error", ex.message);
            }
        }
      

        return {
            onRequest: onRequest
        }
    });
