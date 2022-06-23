FROM python:3.9-slim

RUN apt-get update && apt-get install -y curl

ENV POETRY_VERSION=1.1.13
ENV POETRY_HOME=/opt/poetry
ENV PATH="$POETRY_HOME/bin:$PATH"

RUN mkdir /app
WORKDIR /app/protx

RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
RUN poetry config virtualenvs.create false

COPY pyproject.toml poetry.lock ./

RUN poetry install

COPY ./protx /app/protx
ENV PYTHONPATH "${PYTHONPATH}:/app"

# TODO not needed except to make build step work (as needed in local dev)
COPY ./conf/certificates /app/conf/certificates


# Install node 16.x and build client for production/staging
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
COPY ./protx-client /app/protx-client
WORKDIR /app/protx-client
RUN npm ci && npm run build