from flask import Flask, render_template, redirect
from flask_restx import Api
from protx.api import api as protx_api
from protx.decorators import onboarded_user_setup_complete, get_host
import os

app = Flask(__name__)

use_dev_client = os.getenv('USE_DEV_CLIENT') == 'true'
app.template_folder = "templates" if use_dev_client else "../protx-client/dist/"
template = "dash.html" if use_dev_client else "index.html"

api = Api(app, title="ProTx API", version="1.0", description="Protx")

api.add_namespace(protx_api, path="/protx/api")


@app.route("/protx/dash/")
@onboarded_user_setup_complete(redirect_path='/protx/onboarding')  # redirect not to CEP as we are in iframe
def index(path):
    return render_template(template)


@app.route("/protx/onboarding")
def onboarding():
    return render_template(template)


@app.route("/protx/verify-user")
@onboarded_user_setup_complete(redirect_path='/workbench/onboarding')
def verify_user_and_redirect():
    """Redirect to the main page of analytics

     Decorator handles the case where setupComplete is false,
     and redirects to /workbench/onboarding
    """
    return redirect(get_host() + '/analytics')
