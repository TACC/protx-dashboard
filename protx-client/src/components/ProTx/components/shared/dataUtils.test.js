import {
  compareSimplifiedValueType,
  getSelectedGeographyName,
  getCountyName,
} from './dataUtils';

describe('util functions: compareSimplifiedValueType ', () => {
  it("perform simplified comparison of valueType to 'percent'", () => {
    expect(
      compareSimplifiedValueType({ valueType: 'percent' }, 'percent')
    ).toEqual(true);
    // unknown types are also not percents
    expect(compareSimplifiedValueType({}, 'percent')).toEqual(false);
    expect(
      compareSimplifiedValueType({ valueType: 'count' }, 'percent')
    ).toEqual(false);
  });
  it("perform simplified comparison of valueType to a non-'percent'", () => {
    expect(
      compareSimplifiedValueType({ valueType: 'percent' }, 'count')
    ).toEqual(false);
    expect(compareSimplifiedValueType({}, 'count')).toEqual(true);
    expect(compareSimplifiedValueType({ valueType: 'count' }, 'count')).toEqual(
      true
    );
  });
});

describe('util functions: getCountyName', () => {
  it("return the correct county name given a valid FIPS county number found in the PHR_MSA_COUNTY object.'", () => {
    expect(getCountyName('453')).toEqual('Travis');
  });
  it("return 'Not Found' given an invalid FIPS county number that is not in the PHR_MSA_COUNTY object.'", () => {
    expect(getCountyName('48453')).toEqual('Not Found');
  });
});

describe('util functions: getSelectedGeographyName', () => {
  it("return the correct county name given the corresponding Geoid and a geography type of 'county'.", () => {
    expect(getSelectedGeographyName('county', '48453')).toEqual('Travis');
  });
  it("return the correct county name given the corresponding Geoid and a geography type of 'tract'.", () => {
    expect(getSelectedGeographyName('tract', '48453001603')).toEqual('Travis');
  });
  it("return the correct region name given the corresponding Geoid and a geography type of 'dfps_region'.", () => {
    expect(getSelectedGeographyName('dfps_region', '7-Austin')).toEqual(
      'Austin'
    );
  });
  it("return an empty string when provided an unexpected geography type (e.g. 'state').", () => {
    expect(getSelectedGeographyName('state', '48')).toEqual('');
  });
});
