import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Filter from './Filter';
import Searches from './Searches';
import { getPopularSearches, popularSearchesFull, exportCSVFile } from '../utils';
import { setSearchState } from '../../../modules/actions/app';
import Loader from '../../shared/Loader/Spinner';
import { getUrlParams } from '../../../../utils/helper';
import { setFilterValue } from '../../../modules/actions';

const headers = {
	key: 'Search Terms',
	count: 'Total Queries',
	// clicks: 'Clicks',
	// clickposition: 'Click Position',
	// conversionrate: 'Conversion Rate',
};
class PopularSearches extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFetching: false,
			popularSearches: [],
		};
	}

	componentDidMount() {
		const urlParams = getUrlParams(window.location.search);
		const { filterId, selectFilterValue, filters } = this.props;
		if (
			urlParams.from &&
			urlParams.to &&
			filters.from !== urlParams.from &&
			filters.to !== urlParams.to
		) {
			selectFilterValue(filterId, 'from', urlParams.from);
			selectFilterValue(filterId, 'to', urlParams.to);
			return;
		}
		this.fetchPopularSearches();
	}

	componentDidUpdate(prevProps) {
		const { filters } = this.props;
		if (filters && JSON.stringify(prevProps.filters) !== JSON.stringify(filters)) {
			this.fetchPopularSearches();
		}
	}

	fetchPopularSearches = () => {
		const { appName, filters } = this.props;
		this.setState({
			isFetching: true,
		});
		getPopularSearches(appName, undefined, undefined, filters)
			.then((res) => {
				this.setState({
					popularSearches: res,
					isFetching: false,
				});
			})
			.catch(() => {
				this.setState({
					isFetching: false,
				});
			});
	};

	handleReplaySearch = (searchState) => {
		const {
			saveState, history, appName, handleReplayClick,
		} = this.props;
		saveState(searchState);
		if (handleReplayClick) {
			handleReplayClick(appName);
		} else {
			history.push(`/app/${appName}/search-preview`);
		}
	};

	handleQueryRule = (item) => {
		const { appName, history } = this.props;
		if (item.key !== '<empty_query>') {
			history.push(`/app/${appName}/query-rules?searchTerm=${item.key}&operator=is`);
		} else {
			history.push(`/app/${appName}/query-rules`);
		}
	}

	render() {
		const { isFetching, popularSearches } = this.state;
		const {
			plan,
			displayReplaySearch,
			displayQueryRule,
			filterId,
			location: { pathname }
		} = this.props;
		const showQueryRule = pathname.includes('cluster') ? false : displayQueryRule;
		if (isFetching) {
			return <Loader />;
		}
		return (
			<React.Fragment>
				{filterId && <Filter filterId={filterId} />}
				<Searches
					tableProps={{
						scroll: { x: 700 },
					}}
					showViewOption={false}
					columns={popularSearchesFull(plan, displayReplaySearch, showQueryRule)}
					dataSource={popularSearches.map(item => ({
						...item,
						handleReplaySearch: this.handleReplaySearch,
						handleQueryRule: this.handleQueryRule,
					}))}
					title="Popular Searches"
					onClickDownload={() => {
						exportCSVFile(
							headers,
							popularSearches.map(item => ({
								key: item.key,
								count: item.count,
								clicks: item.clicks || '-',
								clickposition: item.clickposition || '-',
								conversionrate: item.conversionrate || '-',
							})),
							'popular_searches',
						);
					}}
					pagination={{
						pageSize: 10,
					}}
				/>
			</React.Fragment>
		);
	}
}
PopularSearches.defaultProps = {
	handleReplayClick: undefined,
	displayReplaySearch: false,
	displayQueryRule: false,
	filterId: undefined,
	filters: undefined,
};
PopularSearches.propTypes = {
	plan: PropTypes.string.isRequired,
	filterId: PropTypes.string,
	filters: PropTypes.object,
	appName: PropTypes.string.isRequired,
	displayReplaySearch: PropTypes.bool,
	displayQueryRule: PropTypes.bool,
	saveState: PropTypes.func.isRequired,
	handleReplayClick: PropTypes.func,
	history: PropTypes.object.isRequired,
};
const mapStateToProps = (state, props) => ({
	plan: 'growth',
	appName: get(state, '$getCurrentApp.name'),
	filters: get(state, `$getSelectedFilters.${props.filterId}`, {}),
});

const mapDispatchToProps = (dispatch) => ({
	saveState: (state) => dispatch(setSearchState(state)),
	selectFilterValue: (filterId, filterKey, filterValue) =>
		dispatch(setFilterValue(filterId, filterKey, filterValue)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(withRouter(PopularSearches));
