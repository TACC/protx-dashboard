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

To run queries ahead-of-time (needed whenever databases have changed) so that they are cached and do
not exceed the timeout:
```
docker exec -it protx python3 scripts/run_queries.py --clear-cache
```

Note: CEP portal is not completely configured and is missing steps for ES etc

### Configure pages/iframe

Get access to Django CMS, run `docker exec -it core_portal_cms /bin/bash` and then:

```
python3 manage.py createsuperuser
```

In Django CMS admin (i.e. https://cep.test/admin/`), you need to create single page page (using a snippet).


The iframe snippet has the following markup:

```
<body style="margin:0px;padding:0px;overflow:hidden">
    <div style="position:relative;width:100vw;height:100vh;">
        <iframe src="https://cep.test/protx/dash/" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" width="100%" height="100%"></iframe>
    </div>
</body>
```

To create these pages/snippets:
* Login to CMS Admin > Snippets
* Add Snippet > [Paste in that code and name it "Data and Analysis"] > Save Snippet
* Navigate to CMS Admin > Pages
* Add Page (ex. "Data and Analysis" with slug of "data-analysis")
* In the new Page, add a Text element (in the structure view)
* Edit the new Text Element, select “Snippet” from the CMS dropdown options, and choose the “Data and Analysis” snippet you created.
* Save and publish the Page.
* Note: Go into the Continue Editing (Advanced Settings) and change the template from nearest ancestor to Full Width
* The page will now link to the container route.

### Start frontend

```
cd protx-client
npm ci
npm run dev
```

Then go to either `https://cep.test/`, `https://cep.test/workbench`, `https://cep.test/protx/dash/`

## Testing

### Backend testing

```
docker exec -it protx /bin/bash
```

followed by:

```
pytest -ra
```
