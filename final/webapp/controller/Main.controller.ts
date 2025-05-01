import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";
import { GenericTile$PressEvent } from "sap/m/GenericTile";
import Context from "sap/ui/model/Context";

/**
 * @namespace com.logali.final.controller
 */
export default class Main extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.loadTiles();

    }

    private loadTiles(): void {
        const model = new JSONModel();
        model.loadData("../model/Tiles.json");
        this.setModel(model, "tiles");
    }

    public onPressTile(event: GenericTile$PressEvent): void {
        const bindingContext = event.getSource().getBindingContext("tilesCollection") as Context;
        const viewRoute = bindingContext.getProperty("View");

        const router = this.getRouter();
        router.navTo(viewRoute);
    }
}