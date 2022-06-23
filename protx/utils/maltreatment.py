import sqlite3
import json
import pandas as pd
import plotly.graph_objects as go
import logging

logger = logging.getLogger(__name__)

db_name = '/protx-data/cooks.db'

maltrt_palette = {
    'Abandonment': '#001e2e',
    'Emotional abuse': '#003b5c',
    'Labor trafficking': '#545859',
    'Medical neglect': '#007a53',
    'Neglectful supervision': '#41748d',
    'Physical abuse': '#a9c47f',
    'Physical neglect': '#b9d3dc',
    'Refusal to accept parental responsibility': '#d4ec8e',
    'Sexual abuse': '#CCCC99',
    'Sex trafficking': '#eaf6c7'
}

"""
TODO: Lookup the {focal_value} string value using the geoid value instead of passing the selectedArea string value from
 the client. The {focal_value}is used as the DISPLAY_TEXT in the query.
"""

maltrt_query = '''
select d.VALUE, d.GEOID, d.GEOTYPE, d.MALTREATMENT_NAME, d.YEAR, d.UNITS as count_or_pct,
    g.DISPLAY_TEXT as geo_display, u.UNITS as units, u.DISPLAY_TEXT as units_display,
    u.DISPLAY_TEXT_PLOT as units_display_plot
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
    # query user input (return all units, regardless of user selection)
    # query template defined in global namespace
    maltrt_query_fmt = maltrt_query.format(**user_selection)
    maltrt_data = pd.read_sql_query(maltrt_query_fmt, db_conn)

    # extract years in dataset
    years = sorted(maltrt_data['YEAR'].unique())

    # extract maltrt types in dataset
    mt_ = maltrt_data[['units_display', 'units_display_plot']].drop_duplicates().sort_values(['units_display'])
    mt = [i for i in zip(mt_['units_display'], mt_['units_display_plot'])]  # iterable to list is necessary

    coords = [(i, j) for i in years for j in mt]

    maltrt_wide = maltrt_data.pivot_table(columns=['YEAR', 'units_display'], values='VALUE', aggfunc=sum)

    return {'coords': coords, 'data': maltrt_wide, 'colors': palette, 'units': user_selection['units']}


def maltrt_stacked_bar(maltrt_data_dict):
    data_coords = maltrt_data_dict['coords']
    data = maltrt_data_dict['data']
    palette = maltrt_data_dict['colors']

    fig_data = []
    for c in data_coords:
        try:
            multiindex = (c[0], c[1][0])  # year, non-formatted name
            maltrt_count = data[multiindex]
        except KeyError:
            maltrt_count = [0]

        fig_data.append(
            go.Bar(
                name=c[1][1],
                x=[str(c[0])],
                y=maltrt_count,
                marker_color=palette[c[1][0]]
            )
        )

    fig = go.Figure(data=fig_data)
    fig.update_layout(barmode='stack')
    if maltrt_data_dict['units'] == 'percent':
        fig.update_yaxes(title_text="Percent of Total Incidents")
    elif maltrt_data_dict['units'] == 'rate_per_100k_under17':
        fig.update_yaxes(title_text="Incident Rate per 100k Children")
    elif maltrt_data_dict['units'] == 'count':
        fig.update_yaxes(title_text="Incident Count")

    # to deduplicate the legend, from https://stackoverflow.com/questions/26939121/how-to-avoid-duplicate-legend-labels-in-plotly-or-pass-custom-legend-labels
    names = set()
    fig.for_each_trace(
        lambda trace:
            trace.update(showlegend=False)
            if (trace.name in names) else names.add(trace.name))

    fig.update_layout(
        yaxis=dict(
            titlefont=dict(size=18),
            tickfont=dict(size=16)
        ),
        legend=dict(
            font=dict(size=16),
            traceorder='normal'
        ),
        xaxis=dict(tickfont=dict(size=16))
    )

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
    plot_figure = maltrt_stacked_bar(maltrt_data)
    return json.loads(plot_figure.to_json())
