import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import View from "sap/ui/core/mvc/View";
import BaseController from "./BaseController";
import NavContainer from "sap/m/NavContainer";
import Page from "sap/m/Page";
import Utils from "../utils/Utils";

/**
 * @namespace com.logali.final.controller
 */
export default class Details extends BaseController {

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
            // events: {
            //     change: function() {
            //         $this.read();
            //     }
            // }
        });

    }

    private navTo(sPageId: string) {
        let oNavContainer = this.getView()?.byId("detailsNavContainer") as NavContainer;
        console.log(oNavContainer);
        let oPage = this.getView()?.byId(sPageId) as Page;
        oNavContainer.to(oPage);

    }    

    public onDeleteEmployee() {
        
    }
    
}