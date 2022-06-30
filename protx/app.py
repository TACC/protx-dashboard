from flask import Flask, render_template
from flask_restx import Api
from protx.api import api as protx_api
from protx.decorators import onboarded_user_required
import logging
import os


logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)

app = Flask(__name__)

use_dev_client = os.getenv('USE_DEV_CLIENT') == 'true'
app.template_folder = "templates" if use_dev_client else "../protx-client/dist/"
template = "dash.html" if use_dev_client else "index.html"

api = Api(app, title="ProTx API", version="1.0", description="Protx")

api.add_namespace(protx_api, path="/protx/api")


@app.route("/protx/dash/<path:path>")
@onboarded_user_required
def index(path=None):
    return render_template(template)
