import sqlite3
import json
import pandas as pd
import plotly.graph_objects as go
import logging

logger = logging.getLogger(__name__)

db_name = '/protx-data/cooks.db'

# ten-color qualitative palette from colorbrewer2
maltrt_palette = {
    'Abandonment': '#a6cee3',
    'Emotional abuse': '#1f78b4',
    'Labor trafficking': '#b2df8a',
    'Labor trafficing': '#b2df8a',
    'Medical neglect': '#33a02c',
    'Neglectful supervision': '#fb9a99',
    'Physical abuse': '#e31a1c',
    'Physical neglect': '#fdbf6f',
    'Refusal to accept parental responsibility': '#ff7f00',
    'Sexual abuse': '#cab2d6',
    'Sex trafficing': '#6a3d9a',
    'Sex trafficking': '#6a3d9a'
}


"""
TODO: Lookup the {focal_value} string value using the geoid value instead of passing the selectedArea string vaalue from
 the client. The {focal_value}is used as the DISPLAY_TEXT in the query.
"""

maltrt_query = '''
select d.VALUE, d.GEOID, d.GEOTYPE, d.MALTREATMENT_NAME, d.YEAR, d.UNITS as count_or_pct,
    g.DISPLAY_TEXT as geo_display, u.UNITS as units, u.DISPLAY_TEXT as units_display
from maltreatment d
left join display_geotype g on
    g.GEOID = d.GEOID and
    g.GEOTYPE = d.GEOTYPE and
    g.YEAR = d.YEAR
join display_data u on
    d.MALTREATMENT_NAME = u.NAME
where d.GEOTYPE = "{area}" and
    g.DISPLAY_TEXT = "{focal_area}" and
    d.MALTREATMENT_NAME in ({variables}) and
    d.units = "{units}";
'''


def query_return(user_selection, db_conn, palette=maltrt_palette):

    # don't show percents when user has selected all maltreatment types
    # todo: move this sanity check to elsewhere in processing?
    # if user_selection['units'] == 'percent':
    #     assert user_selection['variables'] == '"ABAN", "EMAB", "MDNG", "NSUP", "PHAB", "PHNG", "RAPR", "SXAB", "SXTR", "LBTR"'

    # query user input (return all units, regardless of user selection)
    # query template defined in global namespace
    maltrt_query_fmt = maltrt_query.format(**user_selection)
    maltrt_data = pd.read_sql_query(maltrt_query_fmt, db_conn)

    # extract years in dataset
    years = sorted(maltrt_data['YEAR'].unique())

    # extract maltrt types in dataset
    mt = sorted(maltrt_data['units_display'].unique(), reverse=True)

    coords = [(i, j) for i in years for j in mt]

    maltrt_wide = maltrt_data.pivot_table(columns=['YEAR', 'units_display'], values='VALUE', aggfunc=sum)

    return {'coords': coords, 'data': maltrt_wide, 'colors': palette}


def maltrt_stacked_bar(maltrt_data_dict, unit_selected):

    data_coords = maltrt_data_dict['coords']
    data = maltrt_data_dict['data']
    palette = maltrt_data_dict['colors']

    fig_data = []
    for c in data_coords:
        try:
            maltrt_count = data[c]
        except KeyError:
            maltrt_count = [0]

        fig_data.append(
            go.Bar(name=c[1], x=[str(c[0])], y=maltrt_count, marker_color=palette[c[1]])
        )

    fig = go.Figure(data=fig_data)
    fig.update_layout(barmode='stack')

    if unit_selected == 'count':
        fig.update_yaxes(title_text="Aggregated Totals")
    if unit_selected == 'percent':
        fig.update_yaxes(title_text="Percent of Total")
    if unit_selected == 'rate_per_100k_under17':
        fig.update_yaxes(title_text="Rate per 100K")

    # to deduplicate the legend, from https://stackoverflow.com/questions/26939121/how-to-avoid-duplicate-legend-labels-in-plotly-or-pass-custom-legend-labels
    names = set()
    fig.for_each_trace(
        lambda trace:
            trace.update(showlegend=False)
            if (trace.name in names) else names.add(trace.name))

    return fig


#  TODO: switch to using the geoid value instead of the selectedArea string.
def maltreatment_plot_figure(area, selectedArea, geoid, variables, unit):
    logger.info("Selected maltreatment variables are: {}".format(variables))
    user_select_data = {
        'area': area,
        'focal_area': selectedArea,  # geoid,
        'units': unit,
        'variables': ','.join(['"{}"'.format(v) for v in variables])
    }
    db_conn = sqlite3.connect(db_name)
    maltrt_data = query_return(user_select_data, db_conn)
    db_conn.close()
    plot_figure = maltrt_stacked_bar(maltrt_data, unit)
    return json.loads(plot_figure.to_json())
