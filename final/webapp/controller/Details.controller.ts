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
import Context from "sap/ui/model/Context";
import Decimal from "sap/ui/model/odata/type/Decimal";
import Float from "sap/ui/model/type/Float";
import Timeline, { Timeline$SelectEvent } from "sap/suite/ui/commons/Timeline";
import Binding from "sap/ui/model/Binding";
import TimelineItem from "sap/suite/ui/commons/TimelineItem";
import IconTabBar, { IconTabBar$SelectEvent } from "sap/m/IconTabBar";
import IconTabFilter from "sap/m/IconTabFilter";

/**
 * @namespace com.logali.final.controller
 */
export default class Details extends BaseController {
    /*eslint-disable @typescript-eslint/no-empty-function*/
    
    private dialog: Dialog

    public onInit(): void {
        const router = this.getRouter();    
        router.getRoute("RouteDetails")?.attachPatternMatched(this.onObjectMatched.bind(this));
        this.loadModels();
    }

    private loadModels(){
        const detailsModel = new JSONModel([]);
        const salaryModel = new JSONModel([]);
        this.setModel(detailsModel, "employeeDetailsForm");
        this.setModel(salaryModel,"salaries")
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
            url:"/Users",
            urlDelete: "/Users(EmployeeId='"+employeeId+"',SapId='"+sapId+"')",
            filters: [
                new Filter ("SapId", FilterOperator.EQ, sapId),
            ]
        };

        const results = await utils.crud('delete', new JSONModel(object));
        this.showEmployees(results);
        this.navTo("entrancePage");
    }

    public showEmployees(results : ODataListBinding | void ) : void {
        const array = results as any;
        const formModel = this.getModel("form") as JSONModel;
        formModel.setData(array.results);
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

        const objectSalaries = {
            url: "/Salaries",
            filters: [
                new Filter ("EmployeeId", FilterOperator.EQ, employeeID)
            ]
        };

        const results = await utils.read(new JSONModel(object));
        const salaries = await utils.read(new JSONModel(objectSalaries));

        this.setToNewModel(results, this.getModel("employeeDetailsForm") as JSONModel);
        this.setToNewModel(salaries, this.getModel("salaries") as JSONModel)
        this.bindingTimeline();
        
    }

    private setToNewModel(results: ODataListBinding | void, model: JSONModel): any{
        const array = results as any;
        const aData =  model as JSONModel;
        aData.setData(array.results);
    }

    private bindingTimeline(): void {
        const aSalaryData = (this.getModel("salaries") as JSONModel).getData() as any;
        const oTimeline = this.byId("timeline") as Timeline;
        // oTimeline.reset();
        // oTimeline.removeAllContent();

        aSalaryData.forEach((num: number, index: number) => {
            var oTimelineItem = new TimelineItem({
                userName:aSalaryData[index].Amount,
                dateTime: aSalaryData[index].CreationDate,
                text: aSalaryData[index].Comments,
                icon: "sap-icon://circle-task"
            });
            oTimeline.addContent(oTimelineItem);
        });

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

    public async onSavePromotion(event: Button$PressEvent): Promise<void> {
        const utils = new Utils(this);
        const button = event.getSource() as Button;
        const employeeForm = button.getBindingContext("employeeDetailsForm") as Context;
        const decimalType = new Decimal({}, {
            precision: 17,
            scale:2
        });

        const object = {
            url: '/Salaries',
            data: {
                // SalaryId:"1",
                SapId: employeeForm.getProperty("SapId"),
                EmployeeId: employeeForm.getProperty("EmployeeId"),
                CreationDate: employeeForm.getProperty("DatePromotion"),
                Amount: decimalType.parseValue(employeeForm.getProperty("SalaryPromotion"),"float"),
                Comments: employeeForm.getProperty("CommentPromotion")
            }
        }
        await utils.crud('create', new JSONModel(object));
    }
    
}