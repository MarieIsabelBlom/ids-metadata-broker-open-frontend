import React from "react";
import {
    SelectedFilters,
    DataSearch,
    MultiList
} from "@appbaseio/reactivesearch";
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import { propertyArray } from '../propertyArray';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { ReactiveList } from "@appbaseio/reactivesearch";
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import { Divider } from "@material-ui/core";

import { getAllResources } from '../helpers/sparql/connectors';
import { connect } from 'react-redux';
import useExpandableFilter from "../helpers/useExpandableFilter";
import { renderPagination, renderResultStats } from "./ConnectorBroker";

class SearchMDMResources extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            mdmSearchValue: '',
            resources: []
        };
    }

    handleSearch = value => {
        this.setState({
            mdmSearchValue: value
        }, () => {
            window.localStorage.setItem('SearchValue', this.state.mdmSearchValue);
        });
    };

    processResourceID = id => {
        let resId;
        try {
            resId = new URL(id);
        }
        catch (_) {
            return id;
        }
        return resId.pathname.split('/').pop();
    }

    componentDidMount() {
        this.setState({
            mdmSearchValue: window.localStorage.getItem('SearchValue')
        })
        getAllResources(this.props.token).then(data => {
            this.setState({ resources: data });
        });
    }

    renderMobilityResources = ({ data }) => {
        return (
            <React.Fragment>
                {
                    data.map(resource => (
                        resource.length !== 0 ?
                            <React.Fragment>
                                <Link to={'/resources/resource?id=' + encodeURIComponent(resource.resourceID)} >
                                    <Card key={resource.resourceID} style={{ border: 'none', boxShadow: "none" }}>
                                        <CardActionArea>
                                            <CardContent className="connector-content">
                                                <Typography variant="h5" component="h2">
                                                    {resource.title_en || resource.title || resource.title_de}
                                                </Typography>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    {resource.description_en || resource.description || resource.description_de}
                                                </Typography>
                                                <Typography variant="body1">
                                                    {resource.publisher ? "Publisher: " + resource.publisher : ""
                                                    }
                                                </Typography>
                                                <Typography variant="body1">
                                                    {resource.sovereign ? "Sovereign: " + resource.sovereign : ""
                                                    }
                                                </Typography>
                                                <Typography variant="body2">
                                                    {resource.labelStandardLicense ? "Standard License: " + resource.labelStandardLicense.map(val => val.split("_").join(" "))
                                                        : ""
                                                    }
                                                </Typography>


                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                    <Divider />
                                </Link>
                            </React.Fragment>
                            : ""
                    ))
                }
            </React.Fragment >
        );
    }

    renderResultStats(stats) {
        return <p className="results">{stats.numberOfResults} Results</p>
    }

    render() {
        let tenant = process.env.REACT_APP_TENANT || 'mobids';
        tenant = tenant.toLowerCase();
        let search = <React.Fragment>
            <DataSearch
                componentId="search"
                dataField={['title', 'title_en', 'title_de', 'description', 'description_de', 'description_en']}
                URLParams={true}
                queryFormat="or"
                autosuggest={true}
                        showClear={true}

                onValueChange={
                    function (value) {
                        if (propsFromApp.location.pathname.indexOf('resources') === -1) {
                            propsFromApp.history.push("/resources");
                        }
                    }
                }
                value={this.state.value}
                onChange={this.handleSearch}

            />
            <SelectedFilters />
        </React.Fragment>

        let filterSection = <Grid item lg={3} md={3} xs={12}>
            <Card className="filter-container">
                <React.Fragment>
                    <MultiList
                        componentId="Keywords"
                        dataField="keyword.keyword"
                        style={{
                            margin: 20
                        }}
                        showSearch={false}
                        title="Keyword"
                        URLParams={true}
                        className="expandable expanded"
                    />
                    <Divider />
                    <MultiList
                        componentId="Publishers"
                        dataField="publisher.keyword"
                        style={{
                            margin: 20
                        }}
                        showSearch={false}
                        title="Publisher"
                        URLParams={true}
                        className="expandable"
                    />
                    <Divider />
                    <MultiList
                        componentId="Category"
                        dataField="mobids:DataCategory.keyword"
                        style={{
                            margin: 20
                        }}
                        showSearch={false}
                        title="MobiDS Category"
                        URLParams={true}
                        className="expandable"
                    />

                    <Divider />
                    <MultiList
                        componentId="SubCategory"
                        dataField="mobids:DataCategoryDetail.keyword"
                        style={{
                            margin: 20
                        }}
                        showSearch={false}
                        title="MobiDS Category Details"
                        URLParams={true}
                    />
                    <Divider />

                    <MultiList
                        componentId="NutsLocation"
                        dataField="mobids:nutsLocation.keyword"
                        style={{
                            margin: 20
                        }}
                        showSearch={false}
                        title="NUTS Code"
                        URLParams={true}
                        className="expandable"
                    />



                </React.Fragment>
            </Card>
        </Grid>

        let propsFromApp = this.props;
        return (
            <div className="connectors-list">
                {/* Helper component to use the useExpandableFilter hook in this class component */}
                {tenant == 'mobids' ? <HookHelper /> : ''}
                <React.Fragment>
                    {tenant != 'mobids' ? search : ''}
                    <Grid container>
                        {/* Filter section on the left-side onnly for mobids */}
                        {tenant == 'mobids' ? filterSection : ''}

                        {/* List of resources in the /query page */}
                        <Grid item lg={tenant == 'mobids' ? 6 : 9} md={9} xs={12}>
                            {tenant == 'mobids' ? search : ''}

                            <div className="conn-list">
                                {(process.env.REACT_APP_USE_SPARQL === 'true') && (
                                    this.renderMobilityResources({ data: this.state.resources })
                                )}
                                {(process.env.REACT_APP_USE_SPARQL === 'false') && (
                                    <ReactiveList
                                        componentId="result"
                                        dataField="title.keyword"
                                        pagination={true}
                                        URLParams={true}
                                        react={{
                                            and: ["search", "Keywords", "Publishers", "Category", "SubCategory", "NutsLocation"]
                                        }}
                                        render={this.renderMobilityResources}
                                        renderResultStats={renderResultStats}
                                        renderPagination={renderPagination}
                                        size={5}
                                        style={{
                                            margin: 0
                                        }}
                                    />
                                )}
                            </div>
                        </Grid>

                        {tenant != 'mobids' ? filterSection : ''}
                    </Grid>
                </React.Fragment>
            </div >
        )
    }
}

const mapStateToProps = state => ({
    token: state.auth.token
})

const HookHelper = () => {
    useExpandableFilter()

    return null // component does not render anything
}

export default connect(mapStateToProps)(SearchMDMResources)