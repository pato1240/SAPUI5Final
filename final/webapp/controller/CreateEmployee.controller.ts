import MessageBox from "sap/m/MessageBox";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import Button, { Button$PressEvent } from "sap/m/Button";
import DatePicker from "sap/m/DatePicker";
import NavContainer from "sap/m/NavContainer";
import Page from "sap/m/Page";
import Utils from "../utils/Utils";
import Decimal from "sap/ui/model/odata/type/Decimal";
import UploadSet, { UploadSet$AfterItemAddedEvent, UploadSet$AfterItemRemovedEvent, UploadSet$UploadCompletedEvent } from "sap/m/upload/UploadSet";
import UploadSetItem from "sap/m/upload/UploadSetItem";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Item from "sap/ui/core/Item";
import Text from "sap/m/Text";
import Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import Input from "sap/m/Input";


/**
 * @namespace com.logali.final.controller
 */
export default class CreateEmployee extends BaseController {
    /*eslint-disable @typescript-eslint/no-empty-function*/
          
    public onInit(): void {

    }

    public onGoToStep2(event: Button$PressEvent): void {
        const wizard = this.byId("createEmployeeWizard") as Wizard;
        wizard.setCurrentStep(this.byId("EmployeeDataStep2") as WizardStep);

        const buttonEmployeeSelected = event.getSource() as Button;
        const employeeType = (buttonEmployeeSelected.getText());
        const formModel = this.getModel("form") as JSONModel;

        switch (employeeType) {
            case "Interno":
                formModel.setProperty("/Type", "0")
                formModel.setProperty("/SliderMin", 12000);
                formModel.setProperty("/SliderMax", 80000);
                formModel.setProperty("/SliderValue", 24000);
            break;

            case "Autónomo":
                formModel.setProperty("/Type", "1")
                formModel.setProperty("/SliderMin", 100);
                formModel.setProperty("/SliderMax", 2000);
                formModel.setProperty("/SliderValue", 400);
            break;

            case "Gerente":
                formModel.setProperty("/Type", "2")
                formModel.setProperty("/SliderMin", 50000);
                formModel.setProperty("/SliderMax", 200000);
                formModel.setProperty("/SliderValue", 70000);
            break;
        }
    }

    public onValidateStep2() : void {
        const wizard = this.byId("createEmployeeWizard") as Wizard;
        const nameValue =  (this.byId("name") as Input).getValue();
        const lasNameValue = (this.byId("lastName") as Input).getValue();
        const dniValue = (this.byId("dni") as Input).getValue();
        const dniValidation = this.dniValidation(dniValue);
        const dateValue = (this.byId("date") as DatePicker).getValue();
        const dateValidation = (this.byId("date") as DatePicker).isValidValue();

        const formModel = this.getModel("form") as JSONModel;
        const formData = formModel.getData() as any;

        if(!nameValue){
            formModel.setProperty("/NameValueState", "Error");
            wizard.setCurrentStep(this.byId("EmployeeDataStep2") as WizardStep);
        }else{
            formModel.setProperty("/NameValueState", "None");
        }

        if(!lasNameValue){
            formModel.setProperty("/LastNameValueState", "Error");
            wizard.setCurrentStep(this.byId("EmployeeDataStep2") as WizardStep);
        }else{
            formModel.setProperty("/LastNameValueState", "None");
        }

        if(!dateValue || !dateValidation ){
            formModel.setProperty("/DateValueState", "Error");
            wizard.setCurrentStep(this.byId("EmployeeDataStep2") as WizardStep);
        }else{
            formModel.setProperty("/DateValueState", "None");
        }

        if(formData.Type === '1' && dniValue){
            //Autonomo
            formModel.setProperty("/DniValueState", "None");
            if(nameValue && lasNameValue && dateValue && dateValidation && dniValue){
                    wizard.validateStep(this.byId("EmployeeDataStep2") as WizardStep)
                } else {
                    wizard.invalidateStep(this.byId("EmployeeDataStep2") as WizardStep)
                }
        }else{
            //No autonomo
            if(nameValue && lasNameValue && dateValue && dateValidation && dniValidation){
                wizard.validateStep(this.byId("EmployeeDataStep2") as WizardStep)
            } else {
                wizard.invalidateStep(this.byId("EmployeeDataStep2") as WizardStep)
            }
        }

    }

    private dniValidation(dniValue: string): boolean | undefined {
        const formModel = this.getModel("form") as JSONModel;
        const wizard = this.byId("createEmployeeWizard") as Wizard;

        let dni = dniValue;
        let number : any;
        let letter;
        let letterList;
        let regularExp = /^\d{8}[a-zA-Z]$/;
        
        // Se comprueba que el formato es válido
        if(regularExp){
            //Número
            number = dni.substr(0,dni.length-1);
            //Letra
            letter = dni.substr(dni.length-1,1);
            number = number % 23;
            letterList="TRWAGMYFPDXBNJZSQVHLCKET";
            letterList=letterList.substring(number,number+1);

            if (letterList !== letter.toUpperCase()) {
            //Error
                formModel.setProperty("/DniValueState", "Error");
                wizard.setCurrentStep(this.byId("EmployeeDataStep2") as WizardStep);
                return false
            }else{
            //Correcto
                formModel.setProperty("/DniValueState", "None");
                return true;
            }
        }
    }

    public onEditStepOne(): void {
        this.navigationToStep(0);
    }

    public onEditStepTwo(): void {
        this.navigationToStep(1);
    }

    public onEditStepThree(): void {
        this.navigationToStep(2);
    }

    private navigationToStep(stepNumber: int) : void {
        const wizard = this.byId("createEmployeeWizard") as Wizard;
        const navContainer = this.byId("wizzardNavContainer") as NavContainer;

        let afterNavigate = function () {
            wizard.goToStep(wizard.getSteps()[stepNumber], true);
            navContainer.detachAfterNavigate(afterNavigate);
        }

        navContainer.attachAfterNavigate(afterNavigate);
        this.backToWizardContent();
    }

    public backToWizardContent(): void {
        const navContainer = this.byId("wizzardNavContainer") as NavContainer;
        navContainer.backToPage(this.byId("wizzardContentPage")?.getId() as string);
    }

    public async handleWizardSave(): Promise<void> {
        const uploadSetCreate = this.byId("uploadset") as UploadSet;
        const oHeaderText = this.byId("uploadheadercreate") as Text;
        const resourceBundle = this.getResourceBundle();
        const wizard = this.byId("createEmployeeWizard") as Wizard;
        const step1 = this.byId("EmployeeTypeStep1") as WizardStep
        const navContainer = this.byId("wizzardNavContainer") as NavContainer;
        const contentPage = this.byId("wizzardContentPage") as Page;

        const formModel = this.getModel("form") as JSONModel;
        const formData = formModel.getData() as any;
        const utils = new Utils(this);
        const sapId = utils.getSapId();

        const objectRead = {
            url: "/Users",
            // filters: [ new Filter ("SapId", FilterOperator.EQ, sapId)]
        };

        const results = await utils.read(new JSONModel(objectRead)) as any;
        const lastId = results.results[results.results.length - 1].EmployeeId;
        const newId = (Number(lastId) + 1).toString(); 

        const decimalType = new Decimal({}, {
            precision: 17,
            scale:2
        });

        const objectCreate = {
            url: '/Users',
            data: {
                EmployeeId: newId,
                SapId: sapId,
                Type: formData.Type,
                FirstName: formData.Name,
                LastName: formData.LastName,
                Dni: formData.Dni,
                CreationDate: formData.Date,
                Comments: formData.Comment,
                UserToSalary: [
                    {
                        Amount: decimalType.parseValue(formData.SliderValue,"float"),
                        Waers: "EUR",
                        Comments: formData.Comment
                    }       
                ]    
            }
        }
        await utils.crud('create', new JSONModel(objectCreate));
        this.onUploadFiles(sapId, newId);

        wizard.discardProgress(wizard.getSteps()[0], true);
        wizard.invalidateStep(step1);
        oHeaderText?.setText(resourceBundle.getText("attachmentTitleInitial"));
        navContainer.to(contentPage);
        formModel.setData([]);

        uploadSetCreate.removeAllItems();
        uploadSetCreate.bindAggregation("items",{
            path: 'form>/Attachments',
            template: new UploadSetItem({
            })
        });
    }

    public handleWizardCancel(): void {
        const uploadSetCreate = this.byId("uploadset") as UploadSet;
        const oHeaderText = this.byId("uploadheadercreate") as Text;
        const wizard = this.byId("createEmployeeWizard") as Wizard;
        const step1 = this.byId("EmployeeTypeStep1") as WizardStep
        const navContainer = this.byId("wizzardNavContainer") as NavContainer;
        const contentPage = this.byId("wizzardContentPage") as Page;
        const formModel = this.getModel("form") as JSONModel;
        const resourceBundle = this.getResourceBundle();
        const router = this.getRouter();

        MessageBox.warning(resourceBundle.getText("cancelConfirmation") || 'No text defined', {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.YES,
            onClose: function(sAction : string) {
                if (sAction === MessageBox.Action.YES) {
                    wizard.discardProgress(wizard.getSteps()[0], true);
                    wizard.invalidateStep(step1);
                    uploadSetCreate.removeAllItems();
                    oHeaderText?.setText(resourceBundle.getText("attachmentTitleInitial"));
                    navContainer.to(contentPage);
                    formModel.setData([]);
                    router.navTo("RouteMain");
                }
            }
        });
    }

    public onWizardCompleted(): void {
        const navContainer = this.byId("wizzardNavContainer") as NavContainer;
        navContainer.to(this.byId("wizardReviewPage") as Page);
        this.onDisplayFiles();
    }

    public onAfterItemAdded (event: UploadSet$AfterItemAddedEvent): void {
        const item = event.getParameter("item") as UploadSetItem;
        const resourceBundle = this.getResourceBundle();
        const uploadSetCreate = this.byId("uploadset") as UploadSet;
        const aItems = uploadSetCreate.getItems();
        const oHeaderText = this.byId("uploadheadercreate") as Text;
        uploadSetCreate.unbindAggregation("items", true);
        item.setVisibleEdit(false);
        oHeaderText?.setText(resourceBundle.getText("attachmentTitle", [aItems.length + 1]));
    }

    public onAfterItemRemoved (event: UploadSet$AfterItemRemovedEvent): void {
        const item = event.getParameter("item") as UploadSetItem;
        const resourceBundle = this.getResourceBundle();
        const uploadSetCreate = this.byId("uploadset") as UploadSet;
        const aItems = uploadSetCreate.getItems();
        const oHeaderText = this.byId("uploadheadercreate") as Text;
        item.setVisibleEdit(false);
        oHeaderText?.setText(resourceBundle.getText("attachmentTitle", [aItems.length]));
    }

    private onDisplayFiles():void {
        const uploadSetCreate = this.byId("uploadset") as UploadSet;
        const aItems = uploadSetCreate.getItems() as any;
        const oUploadSetReview = this.byId("uploadsetreview") as UploadSet;
        oUploadSetReview.removeAllItems();

        aItems.forEach((oItem: UploadSetItem)=>{
            const item = new UploadSetItem({
            visibleEdit: false,
            visibleRemove: false,
            fileName: oItem.getFileName()
            });
            oUploadSetReview.addItem(item);
        });

        const resourceBundle = this.getResourceBundle();
        const oHeaderText = this.byId("uploadheaderreview") as Text;

        if(aItems.length !== 0){
            oUploadSetReview.setVisible(true);
            oHeaderText?.setText(resourceBundle.getText("uploadTitle", [aItems.length]));
        } else {
            oUploadSetReview.setVisible(false);
        }
    }

    public onUploadFiles(sapId: string, employeeId: string) {
        let oUpload = this.getView()?.byId("uploadset") as UploadSet,
            oModel = this.getView()?.getModel("zemployees") as ODataModel,
            sToken = oModel.getSecurityToken(),
            aItems = oUpload.getItems();

        aItems.forEach((oItem: UploadSetItem)=>{
            let sSapId = sapId, 
                sEmployeeId = employeeId,
                sDocName = oItem.getFileName(),
                sSlug = `${sSapId};${sEmployeeId};${sDocName}`;
            
            let addHeaderSlug = new Item({
                key: 'slug',
                text: sSlug
            });
            let addHeaderToken = new Item({
                key: 'x-csrf-token',
                text: sToken
            });

            oItem.addHeaderField(addHeaderSlug);
            oItem.addHeaderField(addHeaderToken);

            oItem.setUploadState("Ready");
            oUpload.setUploadUrl("/comlogalifinal/sap/opu/odata/sap/ZEMPLOYEES_SRV/Attachments");
            oUpload.uploadItem(oItem);
        });
    }

}