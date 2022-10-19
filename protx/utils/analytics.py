"""
    Plotly Python Figure Generation
    Developed by Juliana Duncan.

    Extracted directly from functional cells in example Jupyter notebooks
"""

import sqlite3
from pandas import read_sql_query
import plotly.graph_objects as go


def read_sqlite(dbfile):
    with sqlite3.connect(dbfile) as dbcon:
        tables = list(read_sql_query("SELECT name FROM sqlite_master WHERE type='table';", dbcon)['name'])
        out = {tbl: read_sql_query(f"SELECT * from {tbl}", dbcon) for tbl in tables}
    return out


def get_distribution_risk_plot(data):
    """ Get plot of for distribution of risk and levels for high, medium, low risk based on column 'risk'
    """
    fig = go.Figure()
    fig.add_vrect(x0=1, x1=4, line_width=0, fillcolor="red", opacity=0.05)
    fig.add_vrect(x0=-1, x1=1, line_width=0, fillcolor="yellow", opacity=0.05)
    fig.add_vrect(x0=-4, x1=-1, line_width=0, fillcolor="green", opacity=0.05)
    fig.add_vline(x=1, line_width=3, line_dash="dash", line_color="black")
    fig.add_vline(x=-1, line_width=3, line_dash="dash", line_color="black")

    fig.add_histogram(x=data['predictions']['risk'], nbinsx=20)

    fig.update_layout(
        title={
            'text': "Definition of Risk Levels",
            'y': 0.9,
            'x': 0.5,
            'xanchor': 'center',
            'yanchor': 'top'},
        xaxis_title="Relative Risk",
        yaxis_title="Frequency")

    fig.add_annotation(x=-3, y=30,
                       text="Low Risk",
                       showarrow=False,
                       font={'size': 16, 'color': 'green'})
    fig.add_annotation(x=-0, y=30,
                       text="Medium Risk ",
                       showarrow=False,
                       font={'size': 16, 'color': 'yellow'})
    fig.add_annotation(x=3, y=30,
                       text="High Risk",
                       showarrow=False,
                       font={'size': 16, 'color': 'red'})
    return fig.to_json()


def get_distribution_prediction_plot_(data):
    """ Get plot of for distribution of risk and levels for high, medium, low risk based on column pred_per_100k column

    The pred_per_100k columns represents what our models predicted as the number of cases per 100K people

    """

    # compute thresholds
    mean = data['predictions'].pred_per_100k.mean()
    std = data['predictions'].pred_per_100k.std()

    # instantiate figure
    fig = go.Figure()
    fig.add_vrect(x0=mean+std,
                  x1=data['predictions'].pred_per_100k.max()+50,
                  line_width=0, fillcolor="red", opacity=0.05)
    fig.add_vrect(x0=mean-std,
                  x1=mean+std,
                  line_width=0, fillcolor="yellow", opacity=0.05)
    fig.add_vrect(x0=data['predictions'].pred_per_100k.min()-50,
                  x1=mean-std,
                  line_width=0, fillcolor="green", opacity=0.05)
    fig.add_vline(x=mean+std, line_width=3, line_dash="dash", line_color="black")
    fig.add_vline(x=mean-std, line_width=3, line_dash="dash", line_color="black")

    fig.add_histogram(x=data['predictions']['pred_per_100k'], nbinsx=20)

    fig.update_layout(
        title={
            'text': "Definition of Risk Levels",
            'y': 0.9,
            'x': 0.5,
            'xanchor': 'center',
            'yanchor': 'top'},
        xaxis_title="Predicted Number of Cases per 100K persons",
        yaxis_title="Frequency")
    fig.update_xaxes(range=[0, data['predictions'].pred_per_100k.max()+50])
    fig.add_annotation(x=30,
                       y=30,
                       text="Low Risk",
                       showarrow=False,
                       font={'size': 16, 'color': 'green'})
    fig.add_annotation(x=mean-0*std, y=30,
                       text="Medium Risk ",
                       showarrow=False,
                       font={'size': 16, 'color': 'yellow'})
    fig.add_annotation(x=mean+2*std, y=30,
                       text="High Risk",
                       showarrow=False,
                       font={'size': 16, 'color': 'red'})
    return fig.to_json()
