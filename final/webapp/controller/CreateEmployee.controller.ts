import MessageBox from "sap/m/MessageBox";
import BaseController from "./BaseController";
import WizardStep, { WizardStep$ActivateEvent, WizardStep$CompleteEvent } from "sap/m/WizardStep";
import Wizard, { Wizard$CompleteEvent } from "sap/m/Wizard";
import JSONModel from "sap/ui/model/json/JSONModel";
import Button, { Button$PressEvent } from "sap/m/Button";
import Input, { Input$LiveChangeEvent } from "sap/m/Input";
import Fragment from "sap/ui/core/Fragment";
import DatePicker from "sap/m/DatePicker";
import Context from "sap/ui/model/Context";
import { ValueState } from "sap/ui/core/library";
import NavContainer from "sap/m/NavContainer";
import Page from "sap/m/Page";
import View from "sap/ui/core/mvc/View";
import Utils from "../utils/Utils";


/**
 * @namespace com.logali.final.controller
 */
export default class CreateEmployee extends BaseController {
    /*eslint-disable @typescript-eslint/no-empty-function*/
          
    public onInit(): void {
        
    }

    public handleWizardCancel(): void {
        const wizard = this.byId("createEmployeeWizard") as Wizard;
        const resourceBundle = this.getResourceBundle();
        const router = this.getRouter();

        MessageBox.warning(resourceBundle.getText("cancelConfirmation") || 'No text defined', {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            emphasizedAction: MessageBox.Action.YES,
            onClose: function(sAction : string) {
                if (sAction === MessageBox.Action.YES) {
                    wizard.discardProgress(wizard.getSteps()[0], true);
                    router.navTo("RouteMain");
                }
            }
        });
    }

    public onGoToStep2(event: Button$PressEvent): void {
        const wizard = this.byId("createEmployeeWizard") as Wizard;
        wizard.setCurrentStep(this.byId("EmployeeDataStep2") as WizardStep);

        const buttonEmployeeSelected = event.getSource() as Button;
        const buttonId = (buttonEmployeeSelected.getId() as String).slice(78);
        const formModel = this.getModel("form") as JSONModel;

        switch (buttonId) {
            case "buttonInternal":
                formModel.setProperty("/Type", "0")
                formModel.setProperty("/SliderMin", 12000);
                formModel.setProperty("/SliderMax", 80000);
                formModel.setProperty("/SliderValue", 24000);
            break;

            case "buttonSelfEmployed":
                formModel.setProperty("/Type", "1")
                formModel.setProperty("/SliderMin", 100);
                formModel.setProperty("/SliderMax", 2000);
                formModel.setProperty("/SliderValue", 400);
            break;

            case "buttonManager":
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

    public onWizardCompleted(): void {
        const navContainer = this.byId("wizzardNavContainer") as NavContainer;
        navContainer.to(this.byId("wizardReviewPage") as Page);
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

    private navigationToStep(stepNumber : int) : void {
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
        const formModel = this.getModel("form") as JSONModel;
        const formData = formModel.getData() as any;
        const utils = new Utils(this);

        const object = {
            url: '/Users',
            data: {
                SapId: utils.getSapId(),
                Type: formData.Type,
                FirstName: formData.Name,
                LastName: formData.LastName,
                Dni: formData.Dni,
                CreationDate: formData.Date,
                Comments: formData.Comment            
            }
        }
        console.log(object);
        await utils.crud('create', new JSONModel(object));
    }

}