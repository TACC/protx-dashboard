import pytest
import os


def missing_database_directory():
    return not os.path.exists("/protx-data")


@pytest.mark.skipif(missing_database_directory(), reason="requires database directory or to-be-done database fixtures")
def test_get_maltreatment(test_client, core_api_workbench_request):
    resp = test_client.get('/protx/api/maltreatment')
    assert resp.status_code == 200


def test_get_maltreatment_unauthed(test_client, core_api_workbench_request_unauthed):
    resp = test_client.get('/protx/api/maltreatment')
    assert resp.status_code == 403


def test_get_maltreatment_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    resp = test_client.get('/protx/api/maltreatment')
    assert resp.status_code == 403


maltreatment_plot_data = {
    "area": "county",
    "geoid": "48035",
    "selectedArea": "Bosque County",
    "unit": "percent",
    "variables": ["ABAN", "EMAB", "LBTR", "MDNG", "NSUP", "PHAB", "PHNG", "RAPR", "SXAB", "SXTR"]
}


@pytest.mark.skipif(missing_database_directory(), reason="requires database directory or to-be-done database fixtures")
def test_get_maltreatment_plot(test_client, core_api_workbench_request):

    resp = test_client.patch('/protx/api/maltreatment-plot-distribution/', json=maltreatment_plot_data)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["result"]["data"]
    assert data["result"]["layout"]


def test_get_maltreatment_plot_unauthed(test_client, core_api_workbench_request_unauthed):
    resp = test_client.patch('/protx/api/maltreatment-plot-distribution/', json=maltreatment_plot_data)
    assert resp.status_code == 403


def test_maltreatment_plot_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    resp = test_client.patch('/protx/api/maltreatment-plot-distribution/', json=maltreatment_plot_data)
    assert resp.status_code == 403


@pytest.mark.skipif(missing_database_directory(), reason="requires database directory or to-be-done database fixtures")
def test_get_demographics(test_client, core_api_workbench_request):
    resp = test_client.get('/protx/api/demographics')
    assert resp.status_code == 200


def test_get_demographics_unauthed(test_client, core_api_workbench_request_unauthed):
    resp = test_client.get('/protx/api/demographics')
    assert resp.status_code == 403


def test_get_demographics_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    resp = test_client.get('/protx/api/demographics')
    assert resp.status_code == 403


@pytest.mark.skipif(missing_database_directory(), reason="requires database directory or to-be-done database fixtures")
def test_get_demographics_plot(test_client, core_api_workbench_request):
    resp = test_client.get('/protx/api/demographics-plot-distribution/county/48257/CROWD/percent/')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["result"]["data"]
    assert data["result"]["layout"]


def test_get_demographics_plot_unauthed(test_client, core_api_workbench_request_unauthed):
    resp = test_client.get('/protx/api/demographics-plot-distribution/county/48257/CROWD/percent/')
    assert resp.status_code == 403


def test_get_demographics_plot_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    resp = test_client.get('/protx/api/demographics-plot-distribution/county/48257/CROWD/percent/')
    assert resp.status_code == 403


@pytest.mark.skipif(missing_database_directory(), reason="requires database directory or to-be-done database fixtures")
def test_get_display(test_client, core_api_workbench_request):
    resp = test_client.get('/protx/api/display')
    assert resp.status_code == 200


def test_get_display_unauthed(test_client, core_api_workbench_request_unauthed):
    resp = test_client.get('/protx/api/display')
    assert resp.status_code == 403


def test_get_display_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    resp = test_client.get('/protx/api/display')
    assert resp.status_code == 403


@pytest.mark.skipif(missing_database_directory(), reason="requires database directory or to-be-done database fixtures")
def test_get_resources(test_client, core_api_workbench_request):
    resp = test_client.get('/protx/api/resources')
    assert resp.status_code == 200


def test_get_resources_unauthed(test_client, core_api_workbench_request_unauthed):
    resp = test_client.get('/protx/api/resources')
    assert resp.status_code == 403


def test_get_resources_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    resp = test_client.get('/protx/api/resources')
    assert resp.status_code == 403


@pytest.mark.skipif(missing_database_directory(), reason="requires database directory or to-be-done database fixtures")
def test_get_resources_download(test_client, core_api_workbench_request):
    resp = test_client.get('/protx/api/download/county/48143/?naicsCode=9999')
    assert resp.status_code == 200
    assert resp.headers['Content-Disposition'].startswith("attachment; filename=\"Erath_county_resources")
    assert resp.headers['Content-Disposition'].endswith('.csv\"')
    assert resp.get_data(as_text=True).startswith("NAME,CITY,STATE,POSTAL_CODE,PHONE,WEBSITE,LATITUDE,LONGITUDE,NAICS_CODE,NAICS_DESCRIPTION")


def test_get_resources_download_unauthed(test_client, core_api_workbench_request_unauthed):
    resp = test_client.get('/protx/api/download/county/48143/?naicsCode=9999')
    assert resp.status_code == 403


def test_get_resources_download_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    resp = test_client.get('/protx/api/download/county/48143/?naicsCode=9999')
    assert resp.status_code == 403
