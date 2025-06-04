import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";
import { GenericTile$PressEvent } from "sap/m/GenericTile";
import Context from "sap/ui/model/Context";
import { URLHelper } from "sap/m/library";
import { layout } from "sap/ui/commons/library";

/**
 * @namespace com.logali.final.controller
 */
export default class Main extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        // this.loadTiles();
    }

    // private loadTiles(): void {
    //     const model = new JSONModel();
    //     model.loadData("../model/Tiles.json");
    //     this.setModel(model, "tiles");
    // }

    public onPressTile(event: GenericTile$PressEvent): void {
        const bindingContext = event.getSource().getBindingContext("tilesCollection") as Context;
        const viewRoute = bindingContext.getProperty("View");

        const router = this.getRouter();
        router.navTo(viewRoute);
    }

    public handleUrlPress (): void {
        URLHelper.redirect("https://9ee7d481trial-dev-c24c313-2-approuter.cfapps.us10-001.hana.ondemand.com", false);
    }
}