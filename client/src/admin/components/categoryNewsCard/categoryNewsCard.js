import React, {Component} from 'react';
import {default as CategoryNewsSchema} from '../../formSchema/categoryNewsSchema.js';
import {FormGenerator, FormStatus} from '../../../shared/FormGenerator/formGenerator.js';

class CategoryNewsCard extends Component{

    constructor(props)
    {
        super(props);
        this.state = {}
        this.PutConfig = CategoryNewsSchema.GetBindedPutConfig(props.category._id);
        this.PutConfig.modalOpener = this.ModalOpener;
    }

    ModalOpener = () =>
    {
        return  <div className="pagesCard">
                    <h4>{this.props.category.Title}
                    </h4>
                </div>
    }

    render()
    {
        return  <FormGenerator
                    Inputs={CategoryNewsSchema.GetBindedInputs(this.props.category)}
                    FormConfig={this.PutConfig}
                    FormStatus={new FormStatus()}
                    RefreshDataSet={this.props.RefreshDataSet}
                    />
    }
}

export default CategoryNewsCard;