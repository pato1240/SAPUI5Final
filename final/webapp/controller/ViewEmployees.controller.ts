import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";
import Input from "sap/m/Input";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import SearchField, { SearchField$ChangeEvent, SearchField$LiveChangeEvent } from "sap/m/SearchField";
import Table from "sap/m/Table";
import ListBinding from "sap/ui/model/ListBinding";
import Event from "sap/ui/base/Event";
import Utils from "../utils/Utils";
import ObjectListItem from "sap/m/ObjectListItem";
import Context from "sap/ui/model/Context";
import NavContainer from "sap/m/NavContainer";
import Page from "sap/m/Page";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import View from "sap/ui/core/mvc/View";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";

/**
 * @namespace com.logali.final.controller
 */
export default class ViewEmployees extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/

    public onInit(): void {
        const router = this.getRouter();    
        router.getRoute("RouteViewEmployees")?.attachPatternMatched(this.onObjectMatched.bind(this));
    }

    private onObjectMatched (event: Route$PatternMatchedEvent): void {
        const view = this.getView() as View;
        const $this = this;

        view?.bindElement({
            path: 'form>/',
            model: 'form',
            events: {
                change: function() {
                    $this.read();
                }
            }
        });
    }

    public onNavBack() {
        const router = this.getRouter()
        router.navTo("RouteMain");
    }

    private onSearch(event: SearchField$ChangeEvent) : void {
        let sEmployee = (event.getSource() as SearchField).getValue();

        let aFilter = [];

        if (sEmployee) {
            aFilter.push(
                new Filter({
                    filters: [
                        new Filter("FirstName", FilterOperator.Contains, sEmployee),
                        new Filter("LastName", FilterOperator.Contains, sEmployee),
                    ],
                    and: false
                })
            );
        }

        const oTable = this.byId("employeesTable") as Table;
        const items = oTable.getBinding("items") as ListBinding;
        items.filter(aFilter);

    }

    private async read(): Promise<void> {
        const utils = new Utils(this);
        const sapId = utils.getSapId();

        const object = {
            url: "/Users",
            filters: [
                new Filter ("SapId", FilterOperator.EQ, sapId),
            ]
        };
        const results = await utils.read(new JSONModel(object));
        this.showEmployees(results);
    }

    public showEmployees(results : ODataListBinding | void ) : void {
        const array = results as any;
        const formModel = this.getModel("form") as JSONModel;
        formModel.setData(array.results);
        // console.log(formModel.getData());
    }

    public onNavToDetails(event: Event){
        const item = event.getSource() as ObjectListItem;
        const bindingContext = item.getBindingContext("form") as Context;
        const id = bindingContext.getProperty("EmployeeId");

        const router = this.getRouter();
        router.navTo("RouteDetails",{
            id: id
        });
    }
}