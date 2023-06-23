import sqlite3
import json
import numpy as np
import pandas as pd
from plotly.subplots import make_subplots
import plotly.graph_objects as go
from protx.utils import db
from protx.utils.plotly_figures import timeseries_lineplot
from protx.conf.styles import light_green_to_blue_color_palette
from protx.log import logger
import math


def currency(value1, value2):
    return '{:.0f}-{:.0f}'.format(round(value1 / 1000, 0), round(value2 / 1000, 0))


def not_currency(value1, value2):
    return '{:.0f}-{:.0f}'.format(value1, value2)


def hist_to_bar(vector, range_vals, bins):
    """
    vector: range of values
    range_vals: tuple of (min, max) or None
    bins: number of bins to pass to np.histogram()
    """

    try:
        assert len(vector) > 1
    except AssertionError:
        print('Data vector is empty.')
        return

    height, edges = np.histogram(vector, range=range_vals, bins=bins, density=False)

    return height, edges


def pearson_kurtosis(x):
    sigma = np.std(x)
    mean = np.mean(x)
    deviation = x - mean
    ratio = deviation / sigma
    k_vector = ratio ** 4
    k = np.mean(k_vector)

    return k


def get_bin_edges(query_return_df, label_template):
    all_data = query_return_df['VALUE'].values
    all_data = all_data[np.logical_not(np.isnan(all_data))]

    # resample data down to an annual sample size (data size is used in bin calc algorithms)
    n_draws = len(query_return_df['GEOID'].unique()) - 2

    # could perform resampling multiple times and average edges
    # but doing calc only once for efficiency
    sampled_data = list(np.random.choice(all_data, size=n_draws, replace=True))

    # make sure the min and max are always in the data or bin range will be wrong
    sampled_data.append(max(all_data))
    sampled_data.append(min(all_data))

    # Freedman Diaconis Estimator
    bin_edges = np.histogram_bin_edges(sampled_data, bins='fd')
    bar_centers = [round(((bin_edges[i - 1] + bin_edges[i]) / 2.0), 2) for i in range(1, len(bin_edges))]

    # measure kurtosis to determine binning strategy
    k = pearson_kurtosis(all_data)

    # k = 0 is close to a normal distribution; some of our data have k = 80
    if k < 10:

        label_fmt = [label_template(bin_edges[i - 1], bin_edges[i]) for i in range(1, len(bin_edges))]
        return bin_edges, bar_centers, label_fmt

    else:

        # find the 95th percentile of all data to use as binning threshold
        threshold_95 = np.quantile(all_data, 0.95)

        # subset the bin edges under the threshold
        edges_threshold = list(bin_edges[bin_edges < threshold_95])

        # add the maximum value back to the sequence
        edges_threshold.append(max(bin_edges))

        # calculate the bar centers so that the final wide bar isn't stretched
        bar_centers_threshold = bar_centers[0: len(edges_threshold) + 1]

        # update the bar labels
        label_fmt_threshold = [label_template(edges_threshold[i - 1], edges_threshold[i]) for i in range(1, len(edges_threshold))]

        return edges_threshold, bar_centers_threshold, label_fmt_threshold


"""
Demographics Demo

- Response to user selection, time series

1. User selects the "Demographics" tab.

2. User selects the following from drop down menus:
    - Area (currently fixed to counties)
    - Demographic
    - Years (currently fixed to 2019)
    - (pending: rate vs percent)

3. User selects an area from the map.
    - Must happen after drop-down selection for "area" is made.
"""

# ### Select variable across all years

yearly_data_query = '''
select d.VALUE, d.GEOID, d.GEOTYPE, d.DEMOGRAPHICS_NAME, d.YEAR,
    d.UNITS as count_or_pct, g.DISPLAY_TEXT as geo_display, u.UNITS as units,
    u.DISPLAY_TEXT as units_display, u.DISPLAY_TEXT_PLOT as units_plot
from {report_type} d
left join display_geotype g on
    g.GEOID = d.GEOID and
    g.GEOTYPE = d.GEOTYPE and
    g.YEAR = d.YEAR
join display_data u on
    d.DEMOGRAPHICS_NAME = u.NAME
where d.GEOTYPE = "{area}" and
    d.UNITS = "{unit}" and
    d.DEMOGRAPHICS_NAME = "{variable}";
'''

# ### Select annual values for a focal area

focal_query = '''
select d.VALUE, d.GEOID, d.GEOTYPE, d.DEMOGRAPHICS_NAME, d.YEAR,
    d.UNITS as count_or_pct, g.DISPLAY_TEXT as geo_display, u.UNITS as units,
    u.DISPLAY_TEXT as units_display, u.DISPLAY_TEXT_PLOT as units_plot
from {report_type} d
left join display_geotype g on
    g.GEOID = d.GEOID and
    g.GEOTYPE = d.GEOTYPE and
    g.YEAR = d.YEAR
join display_data u on
    d.DEMOGRAPHICS_NAME = u.NAME
where d.GEOTYPE = "{area}" and
    d.UNITS = "{unit}" and
    d.DEMOGRAPHICS_NAME = "{variable}" and
    d.GEOID = "{geoid}" and
    d.GEOTYPE = "{area}";
'''


def demographic_data_prep(query_return_df):
    """Return a dictionary that specifies a timeseries of histograms"""

    ########################
    # USER INPUT PARSING ## (but below shows parsing from return data)
    ########################

    # range should be min - 10%, max + 10%
    range_vals = (np.nanmin(query_return_df['VALUE']) * 0.9, np.nanmax(query_return_df['VALUE']) * 1.1)

    ###########################################################
    # RETURN DATA PROCESSING -- AESTHETICS FOR ALL SUBPLOTS ##
    ###########################################################

    # parse the units themselves; dollars use label_template "currency"
    # with the exception of median rent as a percent of household income, which uses "not_currency"
    # all others use "not_currency"
    if (query_return_df['units'].unique().item() == 'dollars') and \
            (query_return_df['DEMOGRAPHICS_NAME'] != 'MEDIAN_GROSS_RENT_PCT_HH_INCOME').unique().item():
        label_template = currency
        # division is done in formatting helper but could be pushed up to .db file
        label_units = query_return_df['units_display'].unique().item() + ' (1000s of dollars)'
        label_legend = query_return_df['units_plot'].unique().item() + ' (1000s of dollars)'
    else:
        label_template = not_currency
        label_units = query_return_df['units_display'].unique().item()
        label_legend = query_return_df['units_plot'].unique().item()
        # for line plots, PCI should use median and others should use mean
    if query_return_df['DEMOGRAPHICS_NAME'].unique().item() == 'PCI':
        center = 'median'
    else:
        center = 'mean'

    ############################################################
    # CALCULATE HISTOGRAM BIN EDGES FOR DATA ACROSS ALL YEARS ##
    ############################################################

    bin_edges, bar_centers, bar_labels = get_bin_edges(query_return_df, label_template)
    bin_width = bin_edges[1] - bin_edges[0]
    # add the width to the second-to-last element in the bin edge vector
    # this avoids inflating the max if there extra-wide final bins for skewed distributions
    hist_min = bin_edges[0]
    hist_max = bin_edges[-2] + bin_width

    ################################################
    # RESPONSE VALUE FOR DATA AND PLOT AESTHETICS ##
    ################################################

    # set up response dictionary
    data_response = {
        'fig_aes': {
            'yrange': (hist_min, hist_max),
            'simple_yrange': range_vals,
            'xrange': (0, 0),  # for horizontal boxplots, updated dynamically
            'geotype': query_return_df['GEOTYPE'].unique().item(),
            'label_units': label_units,
            'label_legend': label_legend,
            'bar_labels': None,
            'bar_centers': None,
            'focal_display': None,
            'center': center
        },
        'years': {
            i: {'focal_value': None,
                'mean': None,
                'median': None,
                'bars': [None]} for i in range(2011, 2021)}
    }

    ################################
    # CALCULATE ANNUAL HISTOGRAMS ##
    ################################

    for year in range(2010, 2021):
        data = query_return_df[query_return_df['YEAR'] == year]['VALUE'].values
        data = data[np.logical_not(np.isnan(data))]

        if len(data) > 0:
            hbar, _ = hist_to_bar(
                data,
                range_vals=range_vals,
                bins=bin_edges
            )

            ####################
            # UNIQUE BY YEAR ##
            ####################
            data_response['years'][year]['mean'] = np.mean(data)
            data_response['years'][year]['median'] = np.quantile(data, q=[0.5]).item()
            data_response['years'][year]['bars'] = hbar

            #######################################################
            # SHARED BY ALL SUBPLOTS BUT DYNAMICALLY CALCUALTED ##
            #######################################################

            # update the max xrange to the greater of (prior max, new height + 10%)
            data_response['fig_aes']['xrange'] = (0, max(data_response['fig_aes']['xrange'][1], max(hbar) * 1.1))

            ###########################
            # SHARED BY ALL SUBPLOTS ##
            ###########################

            if not data_response['fig_aes']['bar_labels']:
                data_response['fig_aes']['bar_labels'] = bar_labels
                data_response['fig_aes']['bar_centers'] = bar_centers

    return data_response


def update_focal_area(display_dict, focal_data):
    #############################################
    # GET DISPLAY TEXT FOR SPECIFIC GEOGRAPHY ##
    #############################################

    if focal_data['geo_display'].unique().item():
        display_name = focal_data['geo_display'].unique().item()
    else:
        display_name = focal_data['GEOID'].unique().item()

    ##########################################################
    # CONVERT VALUES TO DICTIONARY AND ADD TO DISPLAY DICT ##
    ##########################################################

    focal_dict = focal_data[['YEAR', 'VALUE']].set_index('YEAR').transpose().to_dict(orient='records')[0]
    display_dict['fig_aes']['focal_display'] = display_name
    for year in range(2011, 2021):
        try:
            focal_val = focal_dict[year]
        except KeyError:
            focal_val = None

        display_dict['years'][year]['focal_value'] = focal_val

    return display_dict


def demographic_data_query(area, unit, variable):
    db_conn = sqlite3.connect(db.cooks_db)
    selection = {'area': area, 'unit': unit, 'variable': variable, 'report_type': 'demographics'}
    query = yearly_data_query.format(**selection)
    query_result = pd.read_sql_query(query, db_conn)
    db_conn.close()
    return query_result


def demographic_focal_area_data_query(area, geoid, unit, variable):
    db_conn = sqlite3.connect(db.cooks_db)
    selection = {'area': area, 'geoid': geoid, 'unit': unit, 'variable': variable, 'report_type': 'demographics'}
    query = focal_query.format(**selection)
    query_result = pd.read_sql_query(query, db_conn)
    db_conn.close()
    return query_result


def demographics_simple_lineplot_figure(area, geoid, unit, variable):
    # Get Statewide data.
    state_data = demographic_data_query(area, unit, variable)
    # Munge statewide data.
    state_result = demographic_data_prep(state_data)

    # Get selected geography data.
    geography_data = demographic_focal_area_data_query(area, geoid, unit, variable)

    # Combine statewide and geography data results.
    plot_result = update_focal_area(
        state_result,
        geography_data
    )

    # Generate the plot figure data object.
    plot_figure = timeseries_lineplot(plot_result)
    return json.loads(plot_figure.to_json())


def get_age_race_pie_charts(area, geoid):
    """
    Get age/race community characteristics pie charts

    Parameters
    ----------
    area: area (i.e. 'county')
    geoid: selected area's geoid

    Returns
    -------
    plotly json

    """

    db_conn = sqlite3.connect(db.cooks_db)

    query = '''
    select d.DEMOGRAPHICS_NAME, d.VALUE, u.DISPLAY_TEXT, m.VALUE_UNDER_FIVE, m.VALUE_FIVE_TO_NINE, m.VALUE_TEN_TO_FOURTEEN, m.VALUE_OVER_FOURTEEN
    from demographics d
    left join display_data u on
        u.NAME = d.DEMOGRAPHICS_NAME
    left join maltreatment m on
        m.GEOID = d.GEOID
    where d.GEOTYPE = "{area}" and
        d.UNITS = "{units}" and
        d.GEOID = "{geoid}" and
        d.YEAR = "2020" and
        d.GEOTYPE = "{area}";
    '''
    selection = {'units': 'count', 'area': area, 'geoid': geoid}
    data_frame_result = pd.read_sql_query(query.format(**selection), db_conn)

    population = {row.DEMOGRAPHICS_NAME: row for row in data_frame_result.itertuples()}
    age_labels = ["Under 5 Years Old", "5 - 9 Years Old", "10 - 14 Years Old", "Over 14 Years Old"]

    # Create a list to store the summed values of maltreatment for each age group
    age_values = []

    # Iterate over the columns and calculate the maltreatment sum for each age group
    for column in ['VALUE_UNDER_FIVE', 'VALUE_FIVE_TO_NINE', 'VALUE_TEN_TO_FOURTEEN', 'VALUE_OVER_FOURTEEN']:
        column_sum = print(row.column for row in population.values() if getattr(row, column) is not None)
        age_values.append(column_sum)

    # list of variables is in desired order (alphabetic order and then last two at end)
    variables = ['AMERICAN_INDIAN_ALASKA_NATIVE_ALONE', 'ASIAN_ALONE',
                 'BLACK_AFRICAN_AMERICAN_ALONE', 'NATIVE_HAWAIIAN_OTHER_PACIFIC_ISLANDER_ALONE',
                 'WHITE_ALONE', 'TWO_OR_MORE_RACES', 'OTHER_RACE_ALONE', ]

    selection = {'units': 'percent', 'area': area, 'geoid': geoid, 'variables': ','.join([f'"{v}"' for v in variables])}
    data_frame_result = pd.read_sql_query(query.format(**selection), db_conn)
    race_data = {row.DEMOGRAPHICS_NAME: row for row in data_frame_result.itertuples()}
    race_labels = [race_data[v].DISPLAY_TEXT for v in variables]
    race_values = [race_data[v].VALUE for v in variables]

    race_sum = sum(race_values)
    if not math.isclose(race_sum, 100, abs_tol=.1):
        logger.warn(f"Race characteristics percentages do not sum to 100. (sum = {race_sum} ")

    # Hispanic/Latino Percent from DB and calculate Not Hispanic/Latino
    variables = ['HISPANIC_LATINO']
    selection = {'units': 'percent', 'area': area, 'geoid': geoid, 'variables': ','.join([f'"{v}"' for v in variables])}
    data_frame_result = pd.read_sql_query(query.format(**selection), db_conn)
    population = {row.DEMOGRAPHICS_NAME: row for row in data_frame_result.itertuples()}
    ethnicity_labels = [population["HISPANIC_LATINO"].DISPLAY_TEXT, "Not Hispanic/or Latino population"]
    ethnicity_values = [population["HISPANIC_LATINO"].VALUE, 100-population["HISPANIC_LATINO"].VALUE]

    fig = make_subplots(rows=2, cols=2,
                        specs=[[{"type": "bar", "colspan": 2, "b": .1}, None], [{"type": "pie"}, {"type": "pie"}]],
                        row_heights=[0.5, 0.5])
    fig.add_trace(
        go.Bar(
            name='Population',
            x=age_labels,
            y=age_values,
            yaxis='y',
            xaxis='x',
            marker=dict(
                color=light_green_to_blue_color_palette[1],
                line=dict(
                    color='black',
                    width=1)),
            showlegend=False),
        row=1, col=1)
    fig.add_trace(
            go.Pie(
                values=ethnicity_values,
                labels=ethnicity_labels,
                sort=False,
                legendgroup='Ethnicity',
                legendgrouptitle=go.pie.Legendgrouptitle(text='Ethnicity', font=dict(size=20, color="Black",  family="Roboto")),
                name="Ethnicity",
                title=dict(text='Ethnicity', position='bottom center', font=dict(size=18, color="Black",  family="Roboto")),
                marker_colors=light_green_to_blue_color_palette),
            row=2, col=1)
    fig.add_trace(
        go.Pie(
            values=race_values,
            labels=race_labels,
            sort=False,
            legendgroup='Race',
            legendgrouptitle=go.pie.Legendgrouptitle(text='Race', font=dict(size=20, color="Black",  family="Roboto")),
            name="Race",
            title=dict(text='Race', position='bottom center', font=dict(size=18, color="Black",  family="Roboto")),
            marker_colors=light_green_to_blue_color_palette),
        row=2, col=2)
    fig.update_layout(
        font=dict(size=13, color="Black",  family="Roboto"),
        margin=dict(l=10, r=10, t=15, b=15),
        height=620,
        xaxis=dict(tickangle=0,
                   tickfont=dict(size=12, color='black')),
        yaxis=dict(title=dict(text="Population (persons)",
                              font=dict(size=12))),
        legend=dict(
            yanchor="top",
            y=0.99,
            xanchor="left",
            x=1.1
        ),
    )
    fig.show()

    db_conn.close()

    return json.loads(fig.to_json())
