import React from 'react';
import moment from 'moment';
import Translate from '../../../shared/translate.js';

//Css module import
import CSSModules from 'react-css-modules';
import styles     from './newsCard.module.css';

//Function that displa an important tag if the news important property is set to true.
function DisplayImportantTag(item)
{
    if(item.Important)
        return <span styleName="newsImportant">Prioritaire</span>;
}

const NewsCard = (props) =>{

    if(props.news !== undefined)
    return(
    <div styleName="news">
        <div styleName="newsImg" className="img-bg" style={{backgroundImage: `url('${props.news.Images[0]}')`}}></div>
        <div styleName="newsInfo">
            <h2>{props.news.Title}</h2>
            {DisplayImportantTag(props.news)}
            <p styleName="newsCategory">{Translate.NewsCategory(props.news.Category)}</p>
            <p styleName="newsDate"><i className="clock outline icon"></i> {moment(props.DatePublished).format("dddd, Do MMMM")}</p>
        </div>
    </div>
    )
}

export default CSSModules(NewsCard, styles, {allowMultiple: true, handleNotFoundStyleName: "log"});


