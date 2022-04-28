import { compareSimplifiedValueType } from './dataUtils';

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
