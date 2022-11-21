"""
    Plotly Python Figure Generation
    Developed by Juliana Duncan.

    Extracted directly from functional cells in example Jupyter notebooks
"""

import sqlite3
import json
from pandas import read_sql_query
import plotly.graph_objects as go
from plotly.subplots import make_subplots


_low_risk_label = "Low <br>Risk"
_medium_risk_label = "Medium <br>Risk"
_high_risk_label = "High <br>Risk"


# colors should eventually match colors in 4 classes in frontend (specifically data/colors.js
# but see https://jira.tacc.utexas.edu/browse/COOKS-329 for details but currently in css overrides
# in ProtxColors.css
_low_risk_color = "#eff5d6"
_medium_risk_color = "#8fcca1"
_high_risk_color = "#3c7d8a"

# https://www.rapidtables.com/convert/color/hex-to-rgb.html is used to convert colors above to rgba
_low_risk_color_tr = 'rgb(239, 245, 214, 0.5)'
_medium_risk_color_tr = 'rgb(143, 204, 161, 0.5)'
_high_risk_color_tr = 'rgb(60, 125, 138, 0.5)'


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
    maxh = 100

    fig = make_subplots(specs=[[{"secondary_y": True}]])

    # box for medium risk
    fig1 = go.Scatter(x=[mean+std, mean+std, mean-std, mean-std],
                      y=[0, maxh, maxh, 0],
                      fill="toself",
                      fillcolor=_medium_risk_color_tr,
                      showlegend=False, line=go.scatter.Line(color='rgba(50,205,50,0.2)'))
    # box for high risk
    fig0 = go.Scatter(x=[mean+std, mean+std, 700, 700], y=[0, maxh, maxh, 0],
                      fill="toself",
                      fillcolor=_high_risk_color_tr,
                      showlegend=False,
                      line=go.scatter.Line(color='rgba(0,100,0,0.2)'))

    # box for low risk
    fig3 = go.Scatter(x=[mean-std, mean-std, mean-3*std, mean-3*std], y=[0, maxh, maxh, 0], fill="toself",
                      fillcolor=_low_risk_color_tr,
                      showlegend=False,
                      line=go.scatter.Line(color='rgba(144,238,144,0.2)'))

    # histogram
    fig2 = go.Histogram(x=data['predictions']['pred_per_100k'], xbins=go.histogram.XBins(size=50),
                        showlegend=False, marker_color=_histogram_color)

    fig.add_trace(fig2, secondary_y=True)
    fig.add_trace(fig1)
    fig.add_trace(fig0)
    fig.add_trace(fig3)

    fig.add_vline(x=mean+std, line_width=3, line_dash="dash", line_color="black")
    fig.add_vline(x=mean-std, line_width=3, line_dash="dash", line_color="black")

    if geoid:
        match = data['predictions'].loc[data['predictions'].GEOID == int(geoid)]
        if not match.empty:
            # if we have a match in the data set we are able to draw the line
            fig.add_vline(x=match.iloc[0]['pred_per_100k'],
                          line_width=3,
                          line_color="red")
            if match.iloc[0]['pred_per_100k'] <= 0:
                fig.add_vline(x=0,
                              line_width=3,
                              line_color="red")

    # update y-axis so they are on consisten scales
    fig.update_yaxes(rangemode='tozero', tickvals=[],
                     scaleanchor='y', scaleratio=1, constraintoward='bottom',
                     secondary_y=True)
    fig.update_yaxes(rangemode='tozero',
                     scaleanchor='y2',
                     scaleratio=1,
                     constraintoward='bottom',
                     secondary_y=False)

    # update x axis range
    fig.update_xaxes(range=[0, data['predictions'].pred_per_100k.max()+50])

    fig.add_annotation(x=30,
                       y=30,
                       text=_low_risk_label,
                       showarrow=False,
                       font={'size': 11, 'color': 'black', 'family': 'Roboto'},
                       bordercolor="black",
                       borderwidth=2,
                       borderpad=4,
                       bgcolor='white',
                       opacity=1)
    fig.add_annotation(x=mean-0*std, y=30,
                       text=_medium_risk_label,
                       showarrow=False,
                       font={'size': 11, 'color': 'black', 'family': 'Roboto'},
                       bordercolor="black",
                       borderwidth=2,
                       borderpad=4,
                       bgcolor='white',
                       opacity=1)
    fig.add_annotation(x=mean+2*std, y=30,
                       text=_high_risk_label,
                       showarrow=False,
                       font={'size': 11, 'color': 'black', 'family': 'Roboto'},
                       bordercolor="black",
                       borderwidth=2,
                       borderpad=4,
                       bgcolor='white',
                       opacity=1)

    fig.update_layout(
        xaxis={'range': [0, 700]},
        yaxis={'range': [0., 55.]},
        height=220,
        xaxis_title="<b><i>Predicted Number of Cases per 100K Persons</b><i>",
        yaxis_title="<b><i>Frequency</i></b>",
        font=dict(size=13, color="Black",  family="Roboto"),
        margin=dict(l=10, r=10, t=10, b=10)
    )
    return json.loads(fig.to_json())
