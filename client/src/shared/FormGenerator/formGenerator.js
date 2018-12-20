import React, {Component} from 'react';

//Library used by the generator
import Ajax from '../ajax.js';
import Translate from '../translate.js';

//Helper Object
import FormConfig from './formConfig.js';
import FormStatus from './formStatus.js';
import InputSchema from './inputSchema.js';

//Components used for the form generation
import {Form, Modal, Grid} from 'semantic-ui-react';
import FormError from './FormError/formError.js';
import TextEditor from './TextEditor/textEditor.js';
import TextInput from './TextInput/textInput.js';
import ToggleInput from './ToggleInput/toggleInput.js';
import SelectInput from './SelectInput/selectInput.js';
import FileInput from './FileInput/fileInput.js';

class FormGenerator extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            FormConfig : Object.assign({}, this.props.FormConfig),
            FormStatus : Object.assign({}, this.props.FormStatus),
            Inputs : this.props.Inputs,
            TextEditor : (this.props.TextEditor !== undefined)? this.props.TextEditor: undefined
        };
    }

    /**
     * Method that handle the submission of the form based on the inputs and configuration
     * inputs : Inputs used in the form
     * formConfig : Configuration used to determine wich action to take for submitting the form
     */
    HandleSubmit = async() =>
    {
        //debugging purpose

        await this.UpdateStateKey("FormStatus", {loading: true});

        let formData = await this.HandleFormData();
        console.log(formData);
        let request = await this.HandleRequest(formData);

        this.HandleRequestResponse(request);
    }

    /**
     * Method that extract the value out of the inputs in order to process the information in a database
     * inputs : Inputs to retrieve the data form
    */
    HandleFormData = () =>
    {
        let formData = {};
        //Extracts all the inputs data from the form
        this.state.Inputs.map((input, index) => {
            if(input.value !== "")
                formData = Object.assign({}, formData, {[input.name] : input.value});

            return formData;
        });
        //Extract the data from the form editor. We dont verify that the html key has
        //a value because it is linked to the value key. if value key has a value then
        //we can assume html key has a value haswell
        let textEditor = this.state.TextEditor;
        if(textEditor !== undefined)
        {
            if(textEditor.value !== "")
                formData = Object.assign({},
                    formData,
                    {
                        [textEditor.name] : textEditor.value,
                        [textEditor.name + "Html"] : textEditor.html
                    });
        }
        return formData;
    }

    /**
     * Method responsible for making the request to a database
     * formData : Data to trough the request
     * fomConfig : Used to determine wich type of request to send
    */
    HandleRequest = async(formData) =>
    {
        let request;
        let url = this.state.FormConfig.url;
        let id = this.state.FormConfig.elementId;
        switch (this.state.FormConfig.httpRequest.toUpperCase()){
            case "POST" : request = await Ajax.PostData(url, formData); break;
            case "PUT"  : request = await Ajax.PutData(url + id , formData); break;
            case "DELETE" : request = await Ajax.DeleteData(url + id); break;
            default: throw new Error("The http request type must be specified under the FormConfig Object");
        }
        return request;
    }

    /**
     * Method that handle the response from the server.
     * request : Request that was sent back from the server
     */
    HandleRequestResponse = async(request) =>
    {
        //ERROR WITH UNDEFINED REQUEST OBJECT

        if(!request.success){
            let errors = [];

            Object.keys(request.data.errors).map((key, index) =>
            {
                let requestAlias = request.data.errors[key];
                return  errors.push(
                            Translate.ModelKey(requestAlias.path) + " " +
                            Translate.ModelError(requestAlias.kind, requestAlias.properties)
                );
            });

            this.UpdateStateKey("FormStatus" , {loading : false, errors : errors});
        }
        else{
            await this.UpdateStateKey("FormStatus" , {loading: false});
            this.HandeClose();
        }
    }

    /**
     * Method used to handle the change in a quill text editor
     * textEditor : React ref to the text editor. Mendatory in order to retrieve the information
     * inputName : Name of the text editor that triggered the change
     */
    HandleChangeInTextEditor = (TextEditor, inputName) =>
    {

        if(TextEditor.current === null)
            throw new TypeError("Null, Reference to a text editor must be passed as a parameter");

        const editor = TextEditor.current.getEditor();
        const editorFull = TextEditor.current.makeUnprivilegedEditor(editor);

        let targetObject ={
            name: inputName,
            value: editorFull.getText(),
            html: editorFull.getHTML()
        }

        this.UpdateStateKey("TextEditor" , targetObject);
    }

    /**
     * Method used to handle the change made in a form input
     * target : The input object that triggered the event
     */
    HandleChange = async(target) =>
    {
        let inputName = target.name;
        let inputValue = (target.value != null) ? target.value: target.checked;
        this.UpdateStateInputs(inputName, {value : inputValue});
    }

    /**
     * Method used to handle the opening of the modal
     */
    HandleOpen = () =>
    {
        this.UpdateStateKey("FormStatus" , {open : true});
    }

    /**
     * Method used to handle the closing of the modal
     */
    HandeClose = async() =>
    {
        await this.UpdateStateKey("FormStatus" , {open : false});
        this.ClearForm();
    }

    /**
     * Method that clears all the data inside the inputs of the form
     */
    ClearForm = async() =>
    {
        if(this.state.TextEditor !== undefined)
            await this.UpdateStateKey("TextEditor", {value : "" , html : ""});

        let Inputs = Array.from(this.state.Inputs);
        if(Inputs.length !== 0){
            Inputs.map((input, index) => {

                input.value =   (input.type === "toggle")? false:
                                (input.type === "uploader")? []: "";

                return this.HandleChange(input);
            });
        }

        if(this.state.FormStatus !== undefined)
            await this.UpdateStateKey("FormStatus" , {errors : []});
    }

    /**
     * Method that update a key inside the state Object
     * stateKey: Name of the key to update
     * stateObj : New state value for the specified key
     */
    UpdateStateKey = (stateKey, stateObj) =>
    {
        this.setState({[stateKey.valueOf()] : Object.assign({}, this.state[stateKey.valueOf()], stateObj)});
    }

    /**
     * Method that update the inputs inside the state object
     * inputName : Name of the input to update
     * inputValueObj : New state value for the specified input name
     */
    UpdateStateInputs = (inputName, inputValueObj) =>
    {
        console.log(inputName);
        console.log(inputValueObj);

        let index = this.state.Inputs.findIndex(input => input.name === inputName);
        let Inputs = Array.from(this.state.Inputs);
        Inputs[index] = Object.assign({}, Inputs[index], inputValueObj);
        this.setState({Inputs : Inputs});
    }

    /***************************************************************/
    /******************Generator Methods for the Form***************/
    /***************************************************************/

    Generate = () =>
    {
        if(this.state.FormConfig.modal){
            return this.CreateModalForm();
        }
        else
            return this.CreatePlainForm();
    }

    CreatePlainForm = () =>
    {
        return(
            <Form loading={this.state.FormStatus.loading}>
                {this.GenerateForm()}
                <button style={{float: "left"}} onClick={this.HandeClose} className="btn btn-danger">
                    Annuler
                </button>
                <button onClick={() => {this.HandleSubmit()}} className="btn btn-primary">
                    Ajouter
                </button>
            </Form>
        )
    }

    CreateModalForm = () =>
    {
        return(
        <Modal
        size={this.state.FormConfig.size}
        open={this.state.FormStatus.open}
        onClose={this.HandeClose}
        trigger={
        <div onClick={this.HandleOpen} className="cardContainer">
            <div className="cardOverlay">
                <div className="cardOverlayBtn">
                    <i className="icon plus"></i>
                    <h4>Ajouter</h4>
                </div>
            </div>
        </div>
        }>
        <Modal.Header>{this.state.FormConfig.title}</Modal.Header>
            <Modal.Content>
                <Form loading={this.state.FormStatus.loading}>
                    {this.GenerateForm()}
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <button style={{float: "left"}} onClick={this.HandeClose} className="btn btn-danger">
                    Annuler
                </button>
                <button onClick={() => {this.HandleSubmit()}} className="btn btn-primary">
                    Ajouter
                </button>
            </Modal.Actions>
        </Modal>
        )
    }

    /**
     * Method that generate the form components
     * formSchema : Schema used to generate the form. See the documentation for more information.
     */
    GenerateForm = () =>
    {
        if(this.state.Inputs === undefined)
            throw new TypeError("The Form Schema must contain a definition for the inputs to display");


        //Generate a from without a text edtior
        if(this.state.TextEditor === undefined){
            return(
            <Grid>
                <Grid.Column width={16}>
                    <FormError errorHandler={this.state.FormStatus} />
                    {this.GenerateFormInputs()}
                </Grid.Column>
            </Grid>)
        }
        //Generate a form with a text editor
        else{
            return(
            <Grid>
                <Grid.Column width={8}>
                    <FormError errorHandler={this.state.FormStatus} />
                    {this.GenerateFormInputs()}
                </Grid.Column>
                <Grid.Column width={8}>
                    <TextEditor input={this.state.TextEditor} handleChange={this.HandleChangeInTextEditor}/>
                </Grid.Column>
            </Grid>)
        }
    }

    /**
     * Method that generate the form inputs
     */
    GenerateFormInputs = () =>
    {
        let groups = this.GenerateFormGroups(this.state.FormInputs);
        return  Object.keys(groups).map((key, index) =>{
                return(
                    <Form.Group key={index}>
                        {this.GenerateFormFields(groups[key])}
                    </Form.Group>
                )
        });
    }

    /**
     * Method that grouped all the inputs together based on their group key attribute.
     */
    GenerateFormGroups = () =>
    {
        let groups = {};
        let negativeCount = 0;
        this.state.Inputs.map((input, index) =>{

            if(input.group === undefined){
                input.group = negativeCount;
                negativeCount--;
            }

            if(groups[input.group] === undefined)
                groups[input.group] = [];

            return groups[input.group].push(input);
        });
        return groups;
    }

    /**
     * Method that generate the appropriate input type based on their key type attribute. Add your own component here
     */
    GenerateFormFields = (groupedInputs) =>
    {
        return groupedInputs.map((input, index) => {
            switch(input.type.toLowerCase()){
                case "text": return(
                                    <TextInput
                                    key={index}
                                    inputs={this.state.Inputs}
                                    input={input}
                                    handleChange={this.HandleChange}/>
                                    )
                case "toggle": return (
                                    <ToggleInput
                                    key={index}
                                    inputs={this.state.Inputs}
                                    input={input}
                                    handleChange={this.HandleChange}/>
                                    )
                case "uploader": return(
                                    <FileInput
                                    key={index}
                                    inputs={this.state.Inputs}
                                    input={input}
                                    updateStateInputs={this.UpdateStateInputs} />
                                    )
                case "select": return(
                                    <SelectInput
                                    key={index}
                                    inputs={this.state.Inputs}
                                    input={input}
                                    handleChange={this.HandleChange}/>
                                    )
                case "texteditor" : return(
                                    <TextEditor
                                    key={index}
                                    inputs={this.state.Inputs}
                                    input={input}
                                    handleChange={this.HandleChangeInTextEditor}/>
                                    )
                default:
                    throw new Error("Input Type must be specified.");
            }
        });
    }

    render()
    {
    if(this.state !== undefined)
        return this.Generate();
    }
}

export {FormGenerator, FormConfig, FormStatus, InputSchema};