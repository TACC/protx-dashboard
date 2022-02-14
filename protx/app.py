from flask import Flask
from flask_restx import Api
from protx.api import api as protx_api
import logging

app = Flask(__name__)

logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO)

api = Api(app, title="ProTx API", version="1.0", description="Protx")

api.add_namespace(protx_api, path="/protx/api")

# TODO settings
