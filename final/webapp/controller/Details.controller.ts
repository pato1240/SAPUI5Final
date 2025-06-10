import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import View from "sap/ui/core/mvc/View";
import BaseController from "./BaseController";
import NavContainer from "sap/m/NavContainer";
import Page from "sap/m/Page";
import Utils from "../utils/Utils";
import Button, { Button$PressEvent } from "sap/m/Button";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import Dialog from "sap/m/Dialog";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";

/**
 * @namespace com.logali.final.controller
 */
export default class Details extends BaseController {

    private dialog: Dialog

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        const router = this.getRouter();    
        router.getRoute("RouteDetails")?.attachPatternMatched(this.onObjectMatched.bind(this));
        this.detailsForm();
    }

    private detailsForm() : void {
        const model = new JSONModel([]);
        this.setModel(model, "employeeDetailsForm");
    }

    private onObjectMatched (event: Route$PatternMatchedEvent): void {
        this.navTo("detailsPage");

        const arg = event.getParameter("arguments") as any;
        const id = arg.id;
        const view = this.getView() as View;
        const $this = this;

        view?.bindElement({
            path: 'employeeDetailsForm>/' + 0,
            model: 'employeeDetailsForm',
            events: {
                change: function() {
                    $this.read(id);
                }
            }
        });
    }

    private navTo(sPageId: string) {
        let oNavContainer = this.getView()?.byId("detailsNavContainer") as NavContainer;
        let oPage = this.getView()?.byId(sPageId) as Page;
        oNavContainer.to(oPage);
    }    

    public async onDeleteEmployee(event: Button$PressEvent): Promise<void> {
        const button  = event.getSource() as Button;
        const detailsForm = button.getBindingContext("employeeDetailsForm");
        const utils = new Utils(this);

        const employeeId = detailsForm?.getProperty("EmployeeId");
        const sapId = detailsForm?.getProperty("SapId");
        
        let object = {
            url: "/Users(EmployeeId='"+employeeId+"',SapId='"+sapId+"')"
        };
        await utils.crud('delete', new JSONModel(object));

        const router = this.getRouter();
        router.navTo("RouteDetails");

        // this.afterDelete();
    }

    private afterDelete(): void {
        const formModel = this.getModel("form") as JSONModel;
        // console.log(formModel.getData());
        formModel.refresh();
        const router = this.getRouter();
        router.navTo("RouteViewEmployees");

    }

    private async read(id: string): Promise<void> {
        const utils = new Utils(this);
        const sapId = utils.getSapId();
        const employeeID = id;

        const object = {
            url: "/Users",
            filters: [
                new Filter ("SapId", FilterOperator.EQ, sapId),
                new Filter ("EmployeeId", FilterOperator.EQ, employeeID)
            ]
        };
        const results = await utils.read(new JSONModel(object));
        // console.log(results);
        this.setModelDetails(results);
    }

    private setModelDetails(results: ODataListBinding | void){
        const array = results as any;
        const detailsModel = this.getModel("employeeDetailsForm") as JSONModel;
        // console.log(detailsModel.getData());
        detailsModel.setData(array.results);
        console.log(detailsModel.getData());
    }

    public async onOpenPromotionDialog(): Promise<void> {
        if(!this.dialog){
            this.dialog = await <Promise<Dialog>>this.loadFragment({
                name: "com.logali.final.fragment.PromoteDialog"
            });
        }
        this.dialog.open();
    }

    public onCloseDialog(): void {
        this.dialog.close();
    }

    public onSavePromotion(): void {

    }


    
}