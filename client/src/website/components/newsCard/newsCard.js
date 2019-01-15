import React, { Component } from 'react';

import CSSModules from 'react-css-modules';
import styles from './newsCard.module.css';
import { Transition } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

class NewsCard extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.Description = React.createRef();
    }

    componentDidMount() {
        if (this.Description.current !== null) {
            this.Description.current.innerHTML = this.props.news.Description.substring(0, 300) + "...";
        }
    }

    render() {
        if (this.props.news !== undefined) {
            return <Transition
                        transitionOnMount={true}
                        duration={1000}
                        key={this.props.index}
                        animation={(this.props.index % 2 ===0)?"fade down":"fade up"}>
                        <NavLink
                            to={`/news/${this.props.news._id}`}
                            styleName='newsCard'>
                            <div styleName='newsCard'>
                                <div styleName='newsImg' style={{backgroundImage: `url('${this.props.news.Images[0]}')`}}>
                                </div>
                                <div styleName='newsInfo'>
                                    <h2 styleName="newsTitle">{this.props.news.Title}</h2>
                                    <p styleName='newsDesc' ref={this.Description}></p>
                                </div>
                                <div
                                    styleName={(this.props.index % 2 === 0)? "arrowDown" : "arrowUp"}>
                                </div>
                            </div>
                        </NavLink>
                    </Transition>
        }
    }
}

export default CSSModules(NewsCard, styles, { allowMultiple: true, handleNotFoundStyleName: "log" })
