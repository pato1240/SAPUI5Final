import ResourceBundle from "sap/base/i18n/ResourceBundle"
import Controller from "sap/ui/core/mvc/Controller"
import ResourceModel from "sap/ui/model/resource/ResourceModel"

export default {
    employeeTypeText : function(this: Controller, employeeType: string) {
        const resourceBundle = (this.getOwnerComponent()?.getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;

        switch(employeeType) {
            case '0' : return resourceBundle.getText("internal");
            case '1' : return resourceBundle.getText("selfEmployed");
            case '2' : return resourceBundle.getText("manager");
            default: return employeeType;
        }

    }
}