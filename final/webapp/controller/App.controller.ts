import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./BaseController";

/**
 * @namespace com.logali.final.controller
 */
export default class App extends BaseController {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.form();
        this.tiles();
    }

    private form() : void {
        const model = new JSONModel([]);
        this.setModel(model, "form");
    }

    private tiles(): void {
        const oTiles: object = {
            "TileCollectionEmpleados": [
                {
                    "Title": "Crear empleado",
                    "Icon": "sap-icon://add-employee",
                    "View": "RouteCreateEmployee"
                },
                {
                    "Title": "Ver empleados",
                    "Icon": "sap-icon://employee-lookup",
                    "View": "RouteViewEmployees"
                }
            ],
            "TileCollectionPedidos": [
                {
                    "Title": "Firmar pedido",
                    "Icon": "sap-icon://signature"
                }
            ]
        };
        const tilesModel = new JSONModel(oTiles);
        this.setModel(tilesModel, "tiles");
    }
}