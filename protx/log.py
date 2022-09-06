import logging
import os

logging.basicConfig(
    format='%(asctime)s :: %(levelname)s :: [%(filename)s:%(lineno)d] :: %(message)s',
    level=logging.INFO
)

logger = logging.getLogger('protx')
logger.setLevel(logging.DEBUG if os.getenv('FLASK_ENV', None) is "development" else logging.INFO)
formatter = logging.Formatter('%(asctime)s :: %(levelname)s :: [%(filename)s:%(lineno)d] :: %(message)s')
for h in logger.handlers:
    h.setFormater(formatter)