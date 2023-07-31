import sqlite3
import json
import pandas as pd
import plotly.graph_objects as go
from protx.log import logger
from protx.conf.styles import maltreatment_palette, light_green_to_blue_color_palette
from protx.utils import db


maltrt_query = """
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
"""


def query_return(user_selection, db_conn):
    # query user input (return all units, regardless of user selection)
    # query template defined in global namespace
    maltrt_query_fmt = maltrt_query.format(**user_selection)
    maltrt_data = pd.read_sql_query(maltrt_query_fmt, db_conn)

    # extract years in dataset
    years = sorted(maltrt_data["YEAR"].unique())

    # extract maltrt types in dataset
    mt_ = (
        maltrt_data[["MALTREATMENT_NAME", "units_display"]]
        .drop_duplicates()
        .sort_values(["units_display"])
    )
    mt = [
        i for i in zip(mt_["MALTREATMENT_NAME"], mt_["units_display"])
    ]  # iterable to list is necessary

    coords = [(i, j) for i in years for j in mt]

    maltrt_wide = maltrt_data.pivot_table(
        columns=["YEAR", "MALTREATMENT_NAME"], values="VALUE", aggfunc=sum
    )

    return {
        "coords": coords,
        "data": maltrt_wide,
        "colors": maltreatment_palette,
        "units": user_selection["units"],
    }


def maltrt_stacked_bar(maltrt_data_dict):
    data_coords = maltrt_data_dict["coords"]
    data = maltrt_data_dict["data"]
    palette = maltrt_data_dict["colors"]

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
                marker_color=palette[c[1][0]],
            )
        )

    fig = go.Figure(data=fig_data)
    fig.update_layout(barmode="stack")
    if maltrt_data_dict["units"] == "percent":
        fig.update_yaxes(title_text="Percent of Total Incidents")
    elif maltrt_data_dict["units"] == "rate_per_100k_under17":
        fig.update_yaxes(title_text="Incident Rate per 100k Children")
    elif maltrt_data_dict["units"] == "count":
        fig.update_yaxes(title_text="Incident Count")

    # to deduplicate the legend, from https://stackoverflow.com/questions/26939121/how-to-avoid-duplicate-legend-labels-in-plotly-or-pass-custom-legend-labels
    names = set()
    fig.for_each_trace(
        lambda trace: trace.update(showlegend=False)
        if (trace.name in names)
        else names.add(trace.name)
    )

    fig.update_layout(
        yaxis=dict(titlefont=dict(size=18), tickfont=dict(size=16)),
        legend=dict(font=dict(size=16), traceorder="normal"),
        xaxis=dict(tickfont=dict(size=16)),
        margin=dict(l=10, r=10, t=10, b=10),
    )

    return fig


def maltreatment_plot_figure(area, geoid, variables, unit):
    logger.info("Selected maltreatment variables are: {}".format(variables))
    user_select_data = {
        "area": area,
        "geoid": geoid,
        "units": unit,
        "variables": ",".join(['"{}"'.format(v) for v in variables]),
    }
    db_conn = sqlite3.connect(db.cooks_db)
    maltrt_data = query_return(user_select_data, db_conn)
    db_conn.close()
    plot_figure = maltrt_stacked_bar(maltrt_data)
    return json.loads(plot_figure.to_json())


def get_child_mal_by_age_charts(area, geoid):
    db_conn = sqlite3.connect(db.cooks_db)

    query = """
    SELECT YEAR, {age_variables} as AGE
        from maltreatment m
    where m.GEOID = "{geoid}" and
        m.MALTREATMENT_NAME= "{maltreatment_name}" and
        m.GEOTYPE = "{area}" and
        m.UNITS = "{units}"
          GROUP BY YEAR;
    """
    age_variables = [
        "VALUE_UNDER_FIVE",
        "VALUE_FIVE_TO_NINE",
        "VALUE_TEN_TO_FOURTEEN",
        "VALUE_OVER_FOURTEEN",
    ]
    selection = {
        "units": "percent",
        "area": area,
        "geoid": geoid,
        "maltreatment_name": "ALL",
        "age_variables": ",".join([f"m.{v}" for v in age_variables]),
    }
    maltrt_age_data_frame = pd.read_sql_query(query.format(**selection), db_conn)
    age_labels = ["0-4", "5-9", "10-14", "15-17"]
    # [2:7] to only get the values for each age group from the query
    age_data = {row.YEAR: row[2:7] for row in maltrt_age_data_frame.itertuples()}

    # Normalize the data for each age group
    sum_per_year = {year: sum(age_data[year]) for year in age_data}
    normalized_age_data = {
        year: [value / sum_per_year[year] for value in age_data[year]]
        for year in age_data
    }

    data = []
    for i, age in enumerate(age_labels):
        age_group_data = [
            (normalized_age_data[year][i] * 100) for year in sorted(age_data.keys())
        ]
        trace = go.Bar(
            name=age,
            x=list(age_data.keys()),
            y=age_group_data,
            xaxis="x",
            yaxis="y",
            marker_color=light_green_to_blue_color_palette[i],
        )
        # Doesn't add trace to data passed to front end if there is no data in the DB for maltreatment by age
        # This leaves data blank for front end to catch and let user know if there shouldn't be a filled in figure for that county
        if age_group_data != []:
            data.append(trace)

    fig = go.Figure(data=data)
    fig.update_layout(
        barmode="stack",
        margin=dict(l=10, r=10, t=10, b=10),
        legend=dict(title="Age Group", font=dict(size=14)),
    )
    fig.update_xaxes(
        title=dict(text="Years", font=dict(size=16)),
        tickmode="linear",
    )
    fig.update_yaxes(
        title=dict(
            text="Percent of Cases<br>(All Maltreatment Types)", font=dict(size=16)
        )
    )
    fig.update_traces(marker=dict(line=dict(color="black", width=1)))
    return json.loads(fig.to_json())
