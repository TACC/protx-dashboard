import sqlite3
import json
import pandas as pd
import plotly.graph_objects as go
from protx.log import logger
from protx.conf.styles import maltreatment_palette


db_name = '/protx-data/cooks.db'


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
    d.GEOID = "{geoid}" and
    d.MALTREATMENT_NAME in ({variables}) and
    d.units = "{units}";
'''


def query_return(user_selection, db_conn):
    # query user input (return all units, regardless of user selection)
    # query template defined in global namespace
    maltrt_query_fmt = maltrt_query.format(**user_selection)
    maltrt_data = pd.read_sql_query(maltrt_query_fmt, db_conn)

    # extract years in dataset
    years = sorted(maltrt_data['YEAR'].unique())

    # extract maltrt types in dataset
    mt_ = maltrt_data[['MALTREATMENT_NAME', 'units_display']].drop_duplicates().sort_values(['units_display'])
    mt = [i for i in zip(mt_['MALTREATMENT_NAME'], mt_['units_display'])]  # iterable to list is necessary

    coords = [(i, j) for i in years for j in mt]

    maltrt_wide = maltrt_data.pivot_table(columns=['YEAR', 'MALTREATMENT_NAME'], values='VALUE', aggfunc=sum)

    return {'coords': coords, 'data': maltrt_wide, 'colors': maltreatment_palette, 'units': user_selection['units']}


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


def maltreatment_plot_figure(area, geoid, variables, unit):
    logger.info("Selected maltreatment variables are: {}".format(variables))
    user_select_data = {
        'area': area,
        'geoid': geoid,
        'units': unit,
        'variables': ','.join(['"{}"'.format(v) for v in variables])
    }
    db_conn = sqlite3.connect(db_name)
    maltrt_data = query_return(user_select_data, db_conn)
    db_conn.close()
    plot_figure = maltrt_stacked_bar(maltrt_data)
    return json.loads(plot_figure.to_json())
