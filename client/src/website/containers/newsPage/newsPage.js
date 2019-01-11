//Initial Declaratinon and importation
import React, { Component } from 'react';
import Translate from '../../../shared/translate.js';
import Ajax from '../../../shared/ajax.js';

//Css Modules Importation
import CSSModules from 'react-css-modules';
import styles from "./newsPage.module.css";

//Components Imports
import ImgGalleryColumn from '../../components/imgGalleryColumn/imgGalleryColumn.js';
import PageHeader from '../../components/pageHeader/pageHeader.js';
import PageFooter from '../../components/pageFooter/pageFooter.js';
import PageContent from '../../components/pageContent/pageContent.js';
import FileGallery from '../../components/fileGallery/fileGallery.js';
import NewsColumn from '../../components/newsColumn/newsColumn.js';

class NewsPage extends Component {

    constructor(props) {
        super(props);
        this.state = { previousLocation: "" };
    }

    componentDidMount() {
        this.GetNews();
    }

    GetNews = async() => {
        if (this.state.previousLocation !== this.props.location.pathname) {
            let request = await Ajax.GetData(`/api/news/${this.props.match.params.id}`);
            await this.setState({ news: request.data, previousLocation: this.props.location.pathname });
        }
    }

    componentDidUpdate() {
        this.GetNews();
    }

    DisplayFiles = () => {
        if (this.state.news.Files.length > 0)
            return <div styleName="newsFile">
                        <FileGallery files={null} />
                     </div>
    }

    DisplayGallery = () => {

        if (this.state.news.Images.length > 1)
            return <div styleName="newsImgGallery">
                    <ImgGalleryColumn images={this.state.news.Images}/>
                </div>
    }

    render() {
        if (this.state.news !== undefined) {
            return <div styleName="news">
                        <div styleName="newsBanner" style={{backgroundImage : `url('${this.state.news.Images[0]}')`}}></div>
                        <div styleName="newsBody">
                            <div styleName="newsContent">
                                <PageHeader
                                    category={(this.state.news.Category.Title)}
                                    title={this.state.news.Title}
                                    date={this.state.news.DatePublished}
                                    />
                                <PageContent content={this.state.news.Description} />
                            </div>
                            {this.DisplayFiles()}
                            {this.DisplayGallery()}
                            <div styleName="latestNews">
                                <NewsColumn news={this.state.news.latestNews}/>
                            </div>
                        </div>
                        <PageFooter />
                    </div>
        }
    }
}

export default CSSModules(NewsPage, styles, { allowMultiple: true, handleNotFoundStyleName: "log" });
