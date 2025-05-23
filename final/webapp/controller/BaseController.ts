import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Router from "sap/ui/core/routing/Router";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import View from "sap/ui/core/mvc/View";

/**
 * @namespace com.logali.final.controller
 */

export default class BaseController extends Controller {

    public getRouter(): Router {
        return (this.getOwnerComponent() as UIComponent).getRouter();
    }

    public getModel(name: string): Model {
        return this.getView()?.getModel(name) as Model;
    }

    public setModel(model: Model, name:string): View | undefined {
        return this.getView()?.setModel(model, name);
    }

    public getResourceBundle(): ResourceBundle {
        return ((this.getOwnerComponent() as UIComponent).getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle;
    }

}