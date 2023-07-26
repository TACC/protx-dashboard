import React from 'react';
import { useQuery } from 'react-query';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import styles from './CommunityCharacteristics.module.scss';
import { LoadingSpinner, SectionMessage } from '_common/index';
import Cookies from 'js-cookie';
import MainPlot from '../charts/MainPlot';

const getData = async (geography, geoid) => {
  const url = `/protx/api/maltreatment-age-breakdown-chart/${geography}/${geoid}/`;
  const request = await fetch(url, {
    headers: { 'X-CSRFToken': Cookies.get('csrftoken') },
    credentials: 'same-origin',
  });
  return request.json();
};

const MaltreatmentByAgeChart = ({ geography, selectedGeographicFeature }) => {
  const { data, isFetching, isError } = useQuery(
    ['age-breakdown', geography, selectedGeographicFeature],
    () => getData(geography, selectedGeographicFeature)
  );

  if (isFetching) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <SectionMessage type="error">Something went wrong</SectionMessage>;
  }
  // data.result['data'] will be  empty if there is no data in the DB for that county
  if (!data.result['data'].length) {
    return (
      <>
        <SectionMessage type="warning">
          Insuffcient sample size for this county.
        </SectionMessage>
        <MainPlot plotState={data.result} />
      </>
    );
  }
  return <MainPlot plotState={data.result} />;
};

MaltreatmentByAgeChart.propTypes = {
  selectedGeographicFeature: PropTypes.string.isRequired,
  geography: PropTypes.string.isRequired,
};

const MaltreatmentAgeBreakdown = ({
  isOpen,
  toggle,
  geography,
  selectedGeographicFeature,
  geographyLabel,
}) => {
  return (
    <Modal size="xl" isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle} charCode="&#xe912;">
        Child Maltreatment by Age Group for {geographyLabel}
      </ModalHeader>
      <ModalBody>
        <div className={styles['modal-body-container']}>
          <div className={styles.chart}>
            <MaltreatmentByAgeChart
              geography={geography}
              selectedGeographicFeature={selectedGeographicFeature}
            />
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

MaltreatmentAgeBreakdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  geography: PropTypes.string.isRequired,
  selectedGeographicFeature: PropTypes.string.isRequired,
  geographyLabel: PropTypes.string.isRequired,
};

export default MaltreatmentAgeBreakdown;
