from flask import Flask, render_template
from flask_restx import Api
from protx.api import api as protx_api
import logging
import os

app = Flask(__name__)

logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)

template_folder = "templates" if os.getenv('USE_DEV_CLIENT') else "/app/protx-client/dist/"
api = Api(app, title="ProTx API", version="1.0", description="Protx")

api.add_namespace(protx_api, path="/protx/api")


@app.route("/protx/dash/<path:path>")
def index(path=None):
    return render_template("dash.html" if os.getenv('USE_DEV_CLIENT') else "index.html")
