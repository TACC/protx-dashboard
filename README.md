# PRO-TX Dashboard

PRO-TX Dashboard 

The development environment configured here is configured similar to the deployed dashboard [Core Portal Deployments](https://github.com/TACC/Core-Portal-Deployments) and uses related CEP software ( [Camino](https://github.com/TACC/Camino), [Core CMS](https://github.com/TACC/Core-CMS), and [Core Portal](https://github.com/TACC/Core-Portal))


## Development setup

### Configure settings

* Create `conf/portal/settings_secret.py` by using the same CEP developer settings [stored in UT Stache](https://stache.utexas.edu/entry/bedc97190d3a907cb44488785440595c) that are used in other CEPv2 development projects.


### Configure databases

Place `resources.db` and `cooks.db` in `~/protx-data/`

### Build development environment:

`docker-compose build`

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

### Configure pages/iframe

Get access to Django CMS, run `docker exec -it core_portal_cms /bin/bash` and then:

```
python3 manage.py createsuperuser
```

In Django CMS admin (i.e. https://cep.dev/admin/`), you need to create three pages (using three snippets).


The iframe snippets that have the following markup:

```
<p><span style="color: #ffffff;"><iframe frameborder="0" height="1600" width="100%" src="https://cep.dev/protx/dash/demographics"></iframe></span></p>
```

```
<p><span style="color: #ffffff;"><iframe frameborder="0" height="1600" width="100%" src="https://cep.dev/protx/dash/maltreatment"></iframe></span></p>
```

```
<p><span style="color: #ffffff;"><iframe frameborder="0" height="1600" width="100%" src="https://cep.dev/protx/dash/analytics"></iframe></span></p>
```

To create these pages/snippets:
* Login to CMS Admin > Snippets
* Add Snippet > [Paste in that code and name it (ex. demographics)] > Save Snippet
* Navigate to CMS Admin > Pages
* Add Page (ex. demographics)
* In the new Page, add a Text element (in the structure view)
* Edit the new Text Element, select “Snippet” from the CMS dropdown options, and choose the “demographics” snippet you created.
* Save and publish the Page.
* Note: Go into the Continue Editing (Advanced Settings) and change the template from nearest ancestor to Full Width
* The page will now link to the container route.

### Start frontend

```
cd protx-client
npm ci
npm run dev
```

Then go to either `https://cep.dev/`, `https://cep.dev/workbench`, `https://cep.dev/protx/dash/maltreatment`, `https://cep.dev/protx/dash/demographics` or `https://cep.dev/protx/dash/analytics`

## Testing

### Backend testing

```
docker exec -it protx /bin/bash
```

followed by:

```
pytest -ra
```
