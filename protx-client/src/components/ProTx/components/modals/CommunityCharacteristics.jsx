import React from 'react';

import { useQuery } from 'react-query';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import styles from './CommunityCharacteristics.module.scss';
import { LoadingSpinner, SectionMessage } from '_common/index';
import Cookies from 'js-cookie';
import MainPlot from '../charts/MainPlot';
import { FigureCaption } from '../charts/FigureCaption';

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
    return <LoadingSpinner />;
  }

  if (isError) {
    return <SectionMessage type="error">Something went wrong</SectionMessage>;
  }

  return <MainPlot plotState={data.result} />;
};

CommunityCharacteristicsChart.propTypes = {
  selectedGeographicFeature: PropTypes.string.isRequired,
  geography: PropTypes.string.isRequired,
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
          <div className={styles.chart}>
            <CommunityCharacteristicsChart
              geography={geography}
              selectedGeographicFeature={selectedGeographicFeature}
            />
          </div>
          <FigureCaption label={'Figure 1.'}>
            Community Characteristics for {geographyLabel}. The U.S. Census
            follow{' '}
            <a href="${point.WEBSITE}" className={styles.link} target="_blank">
              standards on race and ethnicity
            </a>{' '}
            set by the U.S. Office of Management and Budget (OMB) in 1997. Data
            is accumulated for Hispanic Origin and Race in two separate
            questions. Race categories in census data are White, Black or
            African American, American Indian or Alaska Native, Asian, and
            Native Hawaiian or Other Pacific Islander. An additional category is
            Some Other Race for those who do not identify as any of the previous
            5 categories. All participants who identify with two or more of the
            race categories are only included in the Two Or More Race category.
            Participants can indicate that they are of a Hispanic Origin and
            identify with any of the race categories.
          </FigureCaption>
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
