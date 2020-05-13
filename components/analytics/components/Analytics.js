import React from 'react';
import { Spin, Icon, Card } from 'antd';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import Filter from './Filter';
import Flex from '../../shared/Flex';
import { popularFiltersCol, popularResultsCol, popularSearchesCol, noResultsFull } from '../utils';
import { getFilteredResults } from '../../../utils/heplers';
import { mediaKey } from '../../../utils/media';
import Searches from './Searches';
import SearchVolumeChart from '../../shared/Chart/SearchVolume';
import SearchLatency from './SearchLatency';
import Summary from './Summary';
import GeoDistribution from './GeoDistribution';
import RequestDistribution from './RequestDistribution';

const results = css`
	width: 100%;
	margin-top: 20px;
	${mediaKey.small} {
		flex-direction: column;
	}
`;
const searchCls = css`
	flex: 50%;
	margin-right: 10px;
	${mediaKey.small} {
		margin-right: 0;
	}
`;
const noResultsCls = css`
	flex: 50%;
	margin-left: 10px;
	${mediaKey.small} {
		margin-left: 0;
		margin-top: 20px;
	}
`;

const Analytics = ({
	noResults,
	popularSearches,
	searchVolume,
	popularFilters,
	popularResults,
	plan,
	loading,
	onClickViewAll,
	displayReplaySearch,
	handleReplaySearch,
	filterId,
}) => {
	if (loading) {
		const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
		return <Spin indicator={antIcon} />;
	}

	return (
		<React.Fragment>
			{filterId && <Filter filterId={filterId} />}
			<Card
				extra={
					<a href="https://docs.appbase.io/docs/analytics/Overview/">
						Read More about these stats
					</a>
				}
				css="margin-bottom: 20px"
				title="Summary"
			>
				<Summary filterId={filterId} />
			</Card>
			<SearchVolumeChart height={300} data={searchVolume} />
			<Flex css={results}>
				<div css={searchCls}>
					<Searches
						href="popular-searches"
						dataSource={getFilteredResults(popularSearches).map(item => ({
							...item,
							handleReplaySearch,
						}))}
						columns={popularSearchesCol(plan, displayReplaySearch)}
						title="Popular Searches"
						css="height: 100%"
						onClickViewAll={(onClickViewAll && onClickViewAll.popularSearches) || null}
					/>
				</div>
				<div css={noResultsCls}>
					<Searches
						href="no-results-searches"
						dataSource={getFilteredResults(noResults).map(item => ({
							...item,
							handleReplaySearch,
						}))}
						columns={noResultsFull(plan, displayReplaySearch)}
						title="No Result Searches"
						css="height: 100%"
						onClickViewAll={(onClickViewAll && onClickViewAll.noResultsSearch) || null}
					/>
				</div>
			</Flex>
			{plan === 'growth' && (
				<React.Fragment>
					<Flex css={results}>
						<div css={searchCls}>
							<Searches
								dataSource={getFilteredResults(popularResults).map(item => ({
									...item,
									handleReplaySearch,
								}))}
								columns={popularResultsCol(plan, displayReplaySearch)}
								title="Popular Results"
								href="popular-results"
								css="height: 100%"
								onClickViewAll={
									(onClickViewAll && onClickViewAll.popularResults) || null
								}
								breakWord
							/>
						</div>
						<div css={noResultsCls}>
							<Searches
								dataSource={getFilteredResults(popularFilters).map(item => ({
									...item,
									handleReplaySearch,
								}))}
								columns={popularFiltersCol(plan, displayReplaySearch)}
								title="Popular Filters"
								href="popular-filters"
								css="height: 100%"
								onClickViewAll={
									(onClickViewAll && onClickViewAll.popularFilters) || null
								}
								breakWord
							/>
						</div>
					</Flex>
					<Flex flexDirection="column" css="width: 100%;margin-top: 20px">
						<GeoDistribution filterId={filterId} displayFilter={false} />
					</Flex>
					<Flex flexDirection="column" css="width: 100%;margin-top: 20px">
						<SearchLatency filterId={filterId} displayFilter={false} />
					</Flex>
					<Flex flexDirection="column" css="width: 100%;margin-top: 20px">
						<RequestDistribution filterId={filterId} displayFilter={false} />
					</Flex>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};
Analytics.defaultProps = {
	loading: false,
	noResults: [],
	popularSearches: [],
	searchVolume: [],
	popularResults: [],
	popularFilters: [],
	onClickViewAll: null,
	displayReplaySearch: false,
	filterId: undefined,
};
Analytics.propTypes = {
	onClickViewAll: PropTypes.shape({
		popularFilters: PropTypes.func,
		popularResults: PropTypes.func,
		popularSearches: PropTypes.func,
		noResultsSearch: PropTypes.func,
	}),
	filterId: PropTypes.string,
	loading: PropTypes.bool,
	displayReplaySearch: PropTypes.bool,
	noResults: PropTypes.array,
	popularSearches: PropTypes.array,
	plan: PropTypes.string.isRequired,
	handleReplaySearch: PropTypes.func.isRequired,
	searchVolume: PropTypes.array,
	popularResults: PropTypes.array,
	popularFilters: PropTypes.array,
};

export default Analytics;
