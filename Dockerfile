FROM python:3.9-slim

LABEL maintainer="TACC-ACI-WMA <wma_prtl@tacc.utexas.edu>"

ENV POETRY_VERSION=1.4.2
ENV POETRY_HOME=/opt/poetry
ENV PATH="$POETRY_HOME/bin:$PATH"
ENV PYTHONPATH "${PYTHONPATH}:/app"

RUN apt-get update && apt-get install -y curl gdal-bin libgdal-dev gcc g++

RUN mkdir /app
WORKDIR /app/protx

RUN curl -sSL https://install.python-poetry.org | python3 -

RUN poetry config virtualenvs.create false

COPY pyproject.toml poetry.lock ./

RUN poetry install

COPY ./protx /app/protx

# TODO not needed except to make build step work (as needed in local dev)
COPY ./conf/certificates /app/conf/certificates

# Install node 16.x and build client for production/staging
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -

# Create the preference file for NodeSource repository
# (Extra step as was choosing node 18 from debian repositories instead of 16 from nodesource)
RUN echo 'Package: *' > /etc/apt/preferences.d/nodesource && \
    echo 'Pin: origin deb.nodesource.com' >> /etc/apt/preferences.d/nodesource && \
    echo 'Pin-Priority: 1001' >> /etc/apt/preferences.d/nodesource

RUN apt-get install -y nodejs

COPY ./protx-client /app/protx-client
WORKDIR /app/protx-client
RUN npm ci && npm run build

WORKDIR /app/protx
