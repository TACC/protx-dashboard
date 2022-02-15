# PRO-TX Dashboard

PRO-TX Dashboard 

The development environment configured here is configured similar to the deployed dashboard [Core Portal Deployments](https://github.com/TACC/Core-Portal-Deployments) and uses related CEP software ( [Camino](https://github.com/TACC/Camino), [Core CMS](https://github.com/TACC/Core-CMS), and [Core Portal](https://github.com/TACC/Core-Portal))


## Development setup

### Configure settings

* Create `conf/portal/settings_secret.py`
* OPTIONAL: If core-django settings need to change, `cp conf/portal/settings_default.py conf/portal/settings_custom.py` and edit `conf/portal/settings_custom.py`.


### Configure databases

Place `resources.db` and `cooks.db` in `~/protx-data/`

### Start development environment:

`docker-compose up`

Followed by:
```
    docker exec core_portal_django python3 manage.py migrate
    docker exec core_portal_django python3 manage.py collectstatic --noinput
    docker exec core_portal_cms python3 manage.py migrate
    docker exec core_portal_cms python3 manage.py collectstatic --noinput
```
Note: CEP portal is not completely configured and is missing steps for ES etc

### Start frontend

TODO

Then go to `https://cep.dev/protx`, `https://cep.dev/workbench` or `https://cep.dev/`
