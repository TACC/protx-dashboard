from flask import Flask, render_template
from flask_restx import Api
from protx.api import api as protx_api
from protx.decorators import onboarded_user_required
import logging

app = Flask(__name__)

logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)

api = Api(app, title="ProTx API", version="1.0", description="Protx")

api.add_namespace(protx_api, path="/protx/api")


@app.route("/protx/dash/<path:path>")
@onboarded_user_required
def index(path=None):
    # TODO: Render alternate template for the compiled bundle.
    # https://jira.tacc.utexas.edu/browse/COOKS-256
    return render_template("dash.html")

# TODO settings
