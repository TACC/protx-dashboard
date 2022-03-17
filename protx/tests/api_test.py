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
def test_get_display(test_client, core_api_workbench_request):
    resp = test_client.get('/protx/api/display')
    assert resp.status_code == 200


def test_get_display_unauthed(test_client, core_api_workbench_request_unauthed):
    resp = test_client.get('/protx/api/display')
    assert resp.status_code == 403


def test_get_display_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    resp = test_client.get('/protx/api/display')
    assert resp.status_code == 403


@pytest.mark.skipif(missing_database_directory, reason="requires database directory or to-be-done database fixtures")
def test_get_display(test_client, core_api_workbench_request):
    resp = test_client.get('/protx/api/resources')
    assert resp.status_code == 200


def test_get_resources_unauthed(test_client, core_api_workbench_request_unauthed):
    resp = test_client.get('/protx/api/resources')
    assert resp.status_code == 403


def test_get_resources_setup_complete_false(test_client, core_api_workbench_request_setup_complete_false):
    resp = test_client.get('/protx/api/resources')
    assert resp.status_code == 403
