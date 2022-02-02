FROM python:3.7-slim
COPY requirements.txt /
RUN pip install -q -r /requirements.txt
RUN pip install -q gunicorn
RUN mkdir /app
COPY ./protx /app/protx
ENV PYTHONPATH "${PYTHONPATH}:/app"
WORKDIR /app/protx
