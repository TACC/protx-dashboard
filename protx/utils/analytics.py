"""
    Plotly Python Figure Generation
    Developed by Juliana Duncan.

    Extracted directly from functional cells in example Jupyter notebooks
"""

import sqlite3
import json
from pandas import read_sql_query
import plotly.graph_objects as go


_low_risk_label = "Low <br>Risk"
_medium_risk_label = "Medium <br>Risk"
_high_risk_label = "High <br>Risk"


# colors should eventually match colors in 4 classes in frontend (specificaly data/colors.js
# but see https://jira.tacc.utexas.edu/browse/COOKS-329 for details but currently in css overrides
# in ProtxColors.css
_low_risk_color = "#ffffd4"
_medium_risk_color = "#eff5d6"
_high_risk_color = "#8fcca1"
_histogram_color = "#26547a"


def read_sqlite(dbfile):
    with sqlite3.connect(dbfile) as dbcon:
        tables = list(read_sql_query("SELECT name FROM sqlite_master WHERE type='table';", dbcon)['name'])
        out = {tbl: read_sql_query(f"SELECT * from {tbl}", dbcon) for tbl in tables}
    return out


def get_distribution_prediction_plot(data, geoid=None):
    """ Get plot of for distribution of risk and levels for high, medium, low risk based on column pred_per_100k column

    The pred_per_100k columns represents what our models predicted as the number of cases per 100K people

    """

    mean = data['predictions'].pred_per_100k.mean()
    std = data['predictions'].pred_per_100k.std()

    fig = go.Figure()
    fig.add_vline(x=mean+std, line_width=3, line_dash="dash", line_color="black")
    fig.add_vline(x=mean-std, line_width=3, line_dash="dash", line_color="black")

    if geoid:
        match = data['predictions'].loc[data['predictions'].GEOID == int(geoid)]
        if not match.empty:
            # if we have a match in the data set we are able to draw the line
            fig.add_vline(x=match.iloc[0]['pred_per_100k'],
                          line_width=3,
                          line_color="red")

    fig.add_histogram(x=data['predictions']['pred_per_100k'],
                      xbins=go.histogram.XBins(size=50)
                      )

    fig.update_layout(
        title={
            'text': "Definition of Risk Levels",
            'y': 0.9,
            'x': 0.5,
            'xanchor': 'center',
            'yanchor': 'top'},
        xaxis_title="Predicted Number of Cases per 100K persons",
        yaxis_title="Frequency",
        font=dict(size=15, color="Black", family="Roboto")
    )
    fig.update_xaxes(range=[0, data['predictions'].pred_per_100k.max()+50])
    fig.add_annotation(x=30,
                       y=30,
                       text=_low_risk_label,
                       showarrow=False,
                       font={'size': 20, 'color': _low_risk_color, 'family': 'Roboto'})
    fig.add_annotation(x=mean-0*std, y=30,
                       text=_medium_risk_label,
                       showarrow=False,
                       font={'size': 20, 'color': _medium_risk_color, 'family': 'Roboto'})
    fig.add_annotation(x=mean+2*std, y=30,
                       text=_high_risk_label,
                       showarrow=False,
                       font={'size': 20, 'color': _high_risk_color, 'family': 'Roboto'})
    fig.update_traces(marker_color=_histogram_color)
    return json.loads(fig.to_json())
