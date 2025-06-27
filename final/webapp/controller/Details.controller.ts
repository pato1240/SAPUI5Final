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
import Time from "sap/ui/model/type/Time";
import UploadSet, { UploadSet$AfterItemRemovedEvent, UploadSet$BeforeUploadStartsEvent, UploadSet$UploadCompletedEvent } from "sap/m/upload/UploadSet";
import UploadSetItem, { UploadSetItem$OpenPressedEvent } from "sap/m/upload/UploadSetItem";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Item from "sap/ui/core/Item";
import ListBinding from "sap/ui/model/ListBinding";
import Title from "sap/m/Title";
import ObjectPageHeader from "sap/uxap/ObjectPageHeader";

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
        this.setModel(detailsModel, "employeeDetailsForm");
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
                    $this.onSearchFiles(id);
                    $this.onSalaryBinding(id);
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
        const detailsForm = button.getBindingContext("employeeDetailsForm") as Context;
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
        
        this.setToNewModel(results, this.getModel("form") as JSONModel)
        this.navTo("entrancePage");
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
        // const salaries = await utils.read(new JSONModel(objectSalaries));

        this.setToNewModel(results, this.getModel("employeeDetailsForm") as JSONModel);
        // this.setToNewModel(salaries, this.getModel("salaries") as JSONModel)
        // this.timelinetest(employeeID);
        // this.bindingTimeline();
    }

    private setToNewModel(results: ODataListBinding | void, model: JSONModel): any{
        const array = results as any;
        const aData =  model as JSONModel;
        aData.setData(array.results);
    }

    public  onBeforeUpload(event: UploadSet$BeforeUploadStartsEvent) : void {
        const item = event.getParameter("item") as UploadSetItem;
        const detailsForm =  item.getBindingContext("employeeDetailsForm") as Context;
        const utils = new Utils(this);

        const sSapId = utils.getSapId();
        const sEmployeeId = detailsForm?.getProperty("EmployeeId");
        const sDocName = item.getFileName();

        const slug = `${sSapId};${sEmployeeId};${sDocName}`;

        const model = this.getModel("zemployees") as ODataModel;
        const token = model.getSecurityToken();

        const addHeaderSlug = new Item({
            key: 'slug',
            text: slug
        });
        const addHeaderToken = new Item({
            key: 'x-csrf-token',
            text: token
        })

        item.addHeaderField(addHeaderSlug);
        item.addHeaderField(addHeaderToken);
    }

    public onUploadCompleted(event: UploadSet$UploadCompletedEvent) : void {
        const uploadSet = event.getSource();
        uploadSet.getBinding("items")?.refresh();
        this.updateHeader();
    }

    private onSearchFiles(id: string):void {
        const utils = new Utils(this);
        const oUploadSet = this.byId("uploadsetview") as UploadSet;

        oUploadSet?.bindAggregation("items", {
            path: 'zemployees>/Attachments',
            filters: [
                new Filter ("SapId", "EQ", utils.getSapId()),
                new Filter ("EmployeeId", "EQ", id),
            ],
            template: new UploadSetItem ({
                fileName: "{zemployees>DocName}",
                mediaType: "{zemployees>MimeType}",
                visibleEdit: false,
                url: "/",
                openPressed: this.onOpenPress.bind(this)
            })
        });
       this.updateHeader();
    }

    public async updateHeader(): Promise<void> {
        const resourceBundle = this.getResourceBundle();
        const utils = new Utils(this);
        const sapId = utils.getSapId();
        const router = this.getRouter(); 
        const hash = (router.getHashChanger() as any).hash;
        const match = hash.match(/\((\d+)\)/);
        const employeeId = match[1]; 
            
        const object = {
            url: "/Attachments",
            filters: [
                new Filter ("SapId", FilterOperator.EQ, sapId),
                new Filter ("EmployeeId", FilterOperator.EQ, employeeId)
            ]
        };
        const results = await utils.read(new JSONModel(object));

        const aFiles = (results as any).results;
        const oHeaderText = this.byId("headerText") as Title;
        const title = resourceBundle.getText("attachmentTitle", [aFiles.length]) as string;
        oHeaderText?.setText(title);
    } 
    
    public onOpenPress(event: UploadSetItem$OpenPressedEvent): void {
        const item = event.getParameter("item") as UploadSetItem;
        const bindingContext = item?.getBindingContext("zemployees") as Context;
        const sPath = bindingContext.getPath();
        let url = "/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value";
        item.setUrl(url);
    }

    public async onAfterItemDelete(event: UploadSet$AfterItemRemovedEvent): Promise<void> {
        const item = event.getParameter("item") as UploadSetItem;
        const bindingContext = item.getBindingContext("zemployees") as Context;
        const sPath = bindingContext.getPath();

        let object = {
                urlDelete: sPath
            }

        const utils = new Utils(this);
        await utils.crud('delete', new JSONModel(object));
        item.getBinding("items")?.refresh();
        this.updateHeader();
    }

    private onSalaryBinding(id: string): void {
        
        const oTimeline = this.byId("timeline") as Timeline;
        oTimeline.setGroupBy("");
        oTimeline.setGroupByType("None");

        oTimeline?.bindAggregation("content", {
            path: 'zemployees>/Salaries',
            filters: [
                new Filter ("EmployeeId", "EQ", id),
            ],
            template: new TimelineItem ({
                userName:"{zemployees>Amount}",
                dateTime: "{zemployees>CreationDate}",
                text: "{zemployees>Comments}",
                icon: "sap-icon://circle-task"
            })
        });

        oTimeline.setGroupBy("dateTime");
        oTimeline.setGroupByType("Year");
        oTimeline.setSortOldestFirst(false);

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