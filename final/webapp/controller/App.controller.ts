import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";

/**
 * @namespace com.logali.final.controller
 */
export default class App extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.form();
    }

    private form() : void {
        const model = new JSONModel([]);
        this.setModel(model, "form");
    }
}