"""
    Plotly Python Figure Data Generation - Custom Methods
    Designed by Kelly Pierce.

    Extracted directly from functional cells in example Jupyter notebooks:
- https://github.com/TACC/protx-db/blob/main/notebooks/Simple_and_Detailed_Demo.ipynb
"""
from plotly.subplots import make_subplots
from plotly.colors import n_colors
import plotly.graph_objects as go


def wrap_text(text):
    if len(text) > 25:
        text_template = '{}{}{}'
        split_disp = text.split(' ')
        new_disp = split_disp[0]
        newline_count = 0
        for word in split_disp[1:]:
            if (len(new_disp) >= 25) & (newline_count == 0):
                separator = '<br>'
                newline_count = 1
            else:
                separator = ' '
            new_disp = text_template.format(new_disp, separator, word)

        return new_disp

    else:
        return text


def timeseries_lineplot(line_data):

    ########################
    # SET PLOT AESTHETICS ##
    ########################

    # only county and tract supported; rename to .db file later
    pluralize = {'county': 'counties', 'tract': 'census tracts'}
    fmt_units = pluralize[line_data['fig_aes']['geotype']]

    # number of years to cover.
    years = [i for i in range(2011, 2021)]

    # measure to use
    center = line_data['fig_aes']['center']
    if center == 'median':
        data = [line_data['years'][y]['median'] for y in years]
    else:
        data = [line_data['years'][y]['mean'] for y in years]
    variable = line_data['fig_aes']['label_units']
    legend_name = wrap_text(f'{variable}, statewide {center}')

    # make a plot with all the panels
    fig = make_subplots(rows=1, cols=1, x_title='')

    ############################
    # MAKE PLOT FOR 2011-2019 ##
    ############################

    fig.add_trace(
        go.Scatter(
            y=data,
            x=years,
            name=legend_name,
            showlegend=True,
            mode='lines+markers',
            marker_size=10,
            marker_line_width=3,
            marker_line_color='black',
            marker_color='gray',
            marker_symbol='circle',
            line=dict(color='black', width=1)
        )
    )

    ##########################
    # FOCAL AREA HIGHLIGHTS ##
    ##########################

    if line_data['fig_aes']['focal_display'] != None:
        disp_legend = True
    else:
        disp_legend = False

    fig.add_trace(
        go.Scatter(
            y=[line_data['years'][y]['focal_value'] for y in years],
            x=years,
            name=line_data['fig_aes']['focal_display'],
            showlegend=disp_legend,
            mode='lines+markers',
            marker_size=10,
            marker_line_width=3,
            marker_line_color='black',
            marker_color='gray',
            marker_symbol='diamond',
            line=dict(color='black', width=1)
        ),
        row=1, col=1)

    ##################
    # UPDATE LAYOUT ##
    ##################

    fig.update_yaxes(
        title_text=line_data['fig_aes']['label_units'],
        visible=True,
        row=1, col=1,
        rangemode="tozero"
    )
    fig.update_traces(connectgaps=True)
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

    return(fig)


def timeseries_histogram(hist_data):

    #########################
    ## SET PLOT AESTHETICS ##
    #########################

    # only county and tract supported; rename to .db file later
    pluralize = {'county': 'counties', 'tract': 'census tracts'}
    fmt_units = pluralize[hist_data['fig_aes']['geotype']]

    # number of years to cover.
    years = [i for i in range(2011, 2021)]

    # make a plot with all the panels
    fig = make_subplots(
        rows=1, cols=len(years),
        x_title=f'Number of {fmt_units}',
        subplot_titles=[str(i) for i in years])

    ######################################
    ## MAKE SUBPLOTS FOR YEARS IN RANGE ##
    ######################################

    colnum = 1
    colors = n_colors('rgb(5, 200, 200)', 'rgb(200, 10, 10)', len(years), colortype='rgb')
    for year, color in zip(years, colors):
        data = hist_data['years'][year]

        ###################################
        ## CONDITIONAL LEGEND FORMATTING ##
        ###################################

        # only generate legend for mean and median value lines on first plot
        if colnum == 1:
            show_legend = True

            # only show legend for focal area highlight for column 1, if the value is present
            if hist_data['fig_aes']['focal_display']:
                show_highlight = True
            else:
                show_highlight = False
        else:
            show_legend = False
            show_highlight = False

        ##########
        ## BARS ##
        ##########

        fig.add_trace(
            go.Bar(
                y=hist_data['fig_aes']['bar_centers'],
                x=data['bars'],
                orientation='h',
                showlegend=False,
                marker_color=color,
                opacity=0.4
            ),
            row=1, col=colnum
        )

        #####################
        ## MEAN AND MEDIAN ##
        #####################

        fig.add_trace(
            go.Scatter(
                x=hist_data['fig_aes']['xrange'],
                y=[data['mean'] for i in range(2)],
                name='mean',
                showlegend=show_legend,
                mode='lines',
                line=dict(color='gray', width=3, dash='dash')
            ),
            row=1, col=colnum)

        fig.add_trace(
            go.Scatter(
                x=hist_data['fig_aes']['xrange'],
                y=[data['median'] for i in range(2)],
                name='median',
                showlegend=show_legend,
                mode='lines',
                line=dict(color='gray', width=3, dash='dot')
            ),
            row=1, col=colnum)

        ###########################
        ## FOCAL AREA HIGHLIGHTS ##
        ###########################

        # for thresholded histograms, make sure the focal value is assigned to the
        # largest bar (otherwise it will be plotted outside the y-axis range)
        focal_position = min(
            data['focal_value'],
            hist_data['fig_aes']['yrange'][1]
        )

        fig.add_trace(
            go.Scatter(
                x=hist_data['fig_aes']['xrange'],
                y=[focal_position for i in range(2)],
                name=hist_data['fig_aes']['focal_display'],
                showlegend=show_highlight,
                mode='lines',
                line=dict(color='black', width=3)
            ),
            row=1, col=colnum)

        # after all the bars are drawn, move on to the next year (column)
        colnum += 1

    ###################
    ## UPDATE LAYOUT ##
    ###################

    fig.update_layout(bargap=0.0)

    for col, title in enumerate(years):
        fig.update_yaxes(visible=False, row=1, col=col+1, range=hist_data['fig_aes']['yrange'])

    fig.update_yaxes(
        title_text=hist_data['fig_aes']['label_units'],
        visible=True,
        row=1, col=1,
        tickvals=hist_data['fig_aes']['bar_centers'],  # same for all plots, so use the last value returned in graph generation loop
        ticktext=hist_data['fig_aes']['bar_labels'],  # same for all plots, so use the last value returned in graph generation loop
    )
    fig.update_yaxes(
        range=hist_data['fig_aes']['yrange'],
        tickfont=dict(size=16)
    )

    fig.update_xaxes(
        range=hist_data['fig_aes']['xrange'],
        tickfont=dict(size=16)
    )

    return(fig)
