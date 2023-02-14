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

In Django CMS admin (i.e. https://cep.test/admin/`), you need to create a page  that contains one custom code snippet (to embed the iframe).

#### Creating the Snippet

* Login to the `CMS Admin > Snippets`.
* Add a `New Snippet`.
* Name it `Data and Analysis`.
* Copy & paste the following markdown code into the body field:
```
<div style="margin:0; padding:0;">
    <div style="display:flex; flex-direction:column; min-height:100vh;">
        <iframe style="border:none; flex-grow:1;" src="https://cep.test/protx/dash/analytics"></iframe>
    </div>
</div>
```
* Save the Snippet.

#### Creating the Page

* Navigate to the `CMS Admin > Pages`.
* Add a `New Page`.
* Name the page `Data and Analysis`.
* Set the slug value to `data-and-analysis`.
* Choose `Save and Continue Editing` on the new page.
* Select the `Advanced Settings` button.
* Change the `TEMPLATE` to `Full Width`.
* Save the page changes.
* Select `Permissions` from the CMS hamburger menu (far right).
* Select the `Login required` checkbox.
* Under the `MENU VISIBILITY` dropdown, select `for logged in users only`.
* Save the permission changes.
* Publish the Page again to pick up the permission changes.

#### Using the Snippet in the Page

* Navigate to the newly created data-and-analysis page as CMS Admin.
* In the Structure View (CMS toolbar, top right), under the `CONTENT` section, click the plus to add a new plugin and select a `Text` element.
* Edit the newly added Text Element under the content section.
* Select “Snippet” from the `CMS plugins` dropdown menu options in the text editor window, then select the `Data and Analysis` snippet.
* Save the editor window and close it.
* Publish the Page to display the changes.
* The link in the navigation menu will now route the user to the page with the embedded protx container iframe.

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
