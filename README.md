# PRO-TX Dashboard

PRO-TX Dashboard 

The development environment configured here is configured similar to the deployed dashboard [Core Portal Deployments](https://github.com/TACC/Core-Portal-Deployments) and uses related CEP software ( [Camino](https://github.com/TACC/Camino), [Core CMS](https://github.com/TACC/Core-CMS), and [Core Portal](https://github.com/TACC/Core-Portal))


## Development setup

### Configure settings

Create `conf/cms/secrets.py` and `conf/portal/settings_secret.py` 

### Start devlopment environment:

    docker-compose up 
    docker exec portal_django python3 manage.py migrate
    docker exec portal_django python3 manage.py collectstatic --noinput
    docker exec portal_cms python3 manage.py migrate
    docker exec portal_cms python3 manage.py collectstatic --noinput

### Note on devlopment environment:

CEP is not completely configured and is missing steps for ES etc
