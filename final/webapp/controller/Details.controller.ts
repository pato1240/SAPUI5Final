import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import View from "sap/ui/core/mvc/View";
import BaseController from "./BaseController";
import NavContainer from "sap/m/NavContainer";
import Page from "sap/m/Page";
import Utils from "../utils/Utils";
import { Button$PressEvent } from "sap/m/Button";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import Dialog from "sap/m/Dialog";

/**
 * @namespace com.logali.final.controller
 */
export default class Details extends BaseController {

    private dialog: Dialog

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        const router = this.getRouter();    
        router.getRoute("RouteDetails")?.attachPatternMatched(this.onObjectMatched.bind(this));
    }

    private onObjectMatched (event: Route$PatternMatchedEvent): void {
        this.navTo("detailsPage");
        const arg = event.getParameter("arguments")as any;
        const index = arg.index;
        const view = this.getView() as View;
        const $this = this;

        view?.bindElement({
            path: '/Employees/' + (parseInt(index)-1),
            model: 'employees',
            events: {
                change: function() {
                    $this.read();
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
        console.log("voy a borrar");
        const employeeId = "0000" ;
        const sapId = "valeria.roortiz@gmail.com" ;
        const utils = new Utils(this);

        let object = {
            url: "/User(EmployeeId='"+employeeId+"',SapId='"+sapId+"')"
        };
        console.log(object);
        await utils.crud('delete', new JSONModel(object));
    }

    private async read(): Promise<void> {
        const utils = new Utils(this);
        const sapId = utils.getSapId();
        // const employeeID

        const object = {
            url: "/Users",
            filters: [
                new Filter ("SapId", FilterOperator.EQ, sapId),
            ]
        };
        const results = await utils.read(new JSONModel(object));
        console.log(results);
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