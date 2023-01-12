import React from 'react';

import { useQuery } from 'react-query';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import styles from './CommunityCharacteristics.module.scss';
import { LoadingSpinner } from '_common/index';
import Cookies from 'js-cookie';
import MainPlot from '../charts/MainPlot';

const getData = async (geography, geoid) => {
  const url = `/protx/api/demographics-community-characteristics-chart/${geography}/${geoid}/`;
  const request = await fetch(url, {
    headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
    credentials: 'same-origin',
  });
  return request.json();
};

const CommunityCharacteristicsChart = ({
  geography,
  selectedGeographicFeature,
}) => {
  const { data, isFetching, isError } = useQuery(
    ['community-characteristics', geography, selectedGeographicFeature],
    () => getData(geography, selectedGeographicFeature)
  );

  if (isFetching) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return <SectionMessage type="error">Something went wrong</SectionMessage>;
  }

  return <MainPlot plotState={data.result} />;
};
CommunityCharacteristicsChart.propTypes = {
  selectedGeographicFeature: PropTypes.string.isRequired,
  geographyLabel: PropTypes.string.isRequired,
};

const CommunityCharacteristics = ({
  isOpen,
  toggle,
  geography,
  selectedGeographicFeature,
  geographyLabel,
}) => {
  return (
    <Modal size="xl" isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle} charCode="&#xe912;">
        Community Characteristics for {geographyLabel}
      </ModalHeader>
      <ModalBody>
        <div className={styles['modal-body-container']}>
          <CommunityCharacteristicsChart
            geography={geography}
            selectedGeographicFeature={selectedGeographicFeature}
          />
        </div>
      </ModalBody>
    </Modal>
  );
};

CommunityCharacteristics.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  geography: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
  geographyLabel: PropTypes.string.isRequired,
};

export default CommunityCharacteristics;
