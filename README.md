# PRO-TX Dashboard

PRO-TX Dashboard 

The development environment configured here is configured similar to the deployed dashboard [Core Portal Deployments](https://github.com/TACC/Core-Portal-Deployments) and uses related CEP software ( [Camino](https://github.com/TACC/Camino), [Core CMS](https://github.com/TACC/Core-CMS), and [Core Portal](https://github.com/TACC/Core-Portal))


## Development setup

### Configure settings

1) Create `conf/portal/settings_secret.py`
2) OPTIONAL: If core-django settings need to change, `cp conf/portal/settings_default.py conf/portal/settings_custom.py` and edit `conf/portal/settings_custom.py`.
### Start devlopment environment:

`docker-compose up`

Followed by:
```
    docker exec core_portal_django python3 manage.py migrate
    docker exec core_portal_django python3 manage.py collectstatic --noinput
    docker exec core_portal_cms python3 manage.py migrate
    docker exec core_portal_cms python3 manage.py collectstatic --noinput
```

Install client-side dependencies and bundle code with webpack:
    cd client
    npm ci
    npm run build

Then go to `https://cep.dev/protx`, `https://cep.dev/workbench` or `https://cep.dev/`

### Note on devlopment environment:

CEP is not completely configured and is missing steps for ES etc
