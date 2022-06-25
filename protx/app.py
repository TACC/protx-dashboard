from flask import Flask, render_template
from flask_restx import Api
from protx.api import api as protx_api
import logging
import os

app = Flask(__name__)

logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)

use_dev_client = os.getenv('USE_DEV_CLIENT') == 'true'

template_folder = "templates" if use_dev_client else "/app/protx-client/dist/"
template = "dash.html" if use_dev_client else "index.html"

api = Api(app, title="ProTx API", version="1.0", description="Protx", template_folder=template_folder)

api.add_namespace(protx_api, path="/protx/api")


@app.route("/protx/dash/<path:path>")
def index(path=None):
    return render_template(template)
