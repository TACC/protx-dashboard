import IntervalColorScale from '../shared/colorsUtils';
import { colorbrewerClassYlOrBr } from '../data/colors';

describe('IntervalColorScale', () => {
  it('handle for single integer class', () => {
    const meta = {min:1, max:1};
    const colorScale = new IntervalColorScale(meta)
    expect(colorScale.numberIntervals).toEqual(1);
    expect(colorScale.intervalLabels).toEqual(['1']);
    const value = 1;
    const binValue = Math.min(
      Math.floor(
        colorScale.numberIntervals *
        ((value - colorScale.meta.min) / (colorScale.meta.max - colorScale.meta.min))
      ),
      colorScale.numberIntervals - 1
    );
    expect(colorScale.getColor(1)).toEqual(colorbrewerClassYlOrBr[1][0]);
  });
  it('handle 2 integer classes', () => {
    const meta = {min:1, max:2};
    const colorScale = new IntervalColorScale(meta)
    expect(colorScale.numberIntervals).toEqual(2);
    expect(colorScale.intervalLabels).toEqual(['1', '2']);
    expect(colorScale.getColor(1)).toEqual(colorbrewerClassYlOrBr[2][0]);
    expect(colorScale.getColor(2)).toEqual(colorbrewerClassYlOrBr[2][1]);
  });
  it('handle 3 integer classes', () => {
    const meta = {min:1, max:3};
    const colorScale = new IntervalColorScale(meta);
    expect(colorScale.numberIntervals).toEqual(3);
    expect(colorScale.intervalLabels).toEqual(['1', '2', '3']);
    expect(colorScale.getColor(1)).toEqual(colorbrewerClassYlOrBr[3][0]);
    expect(colorScale.getColor(2)).toEqual(colorbrewerClassYlOrBr[3][1]);
    expect(colorScale.getColor(3)).toEqual(colorbrewerClassYlOrBr[3][2]);
  });
  it('handle 4 integer classes', () => {
    const meta = {min:1, max:4};
    const colorScale = new IntervalColorScale(meta);
    expect(colorScale.numberIntervals).toEqual(4);
    expect(colorScale.intervalLabels).toEqual(['1', '2', '3', '4']);
    expect(colorScale.getColor(1)).toEqual(colorbrewerClassYlOrBr[4][0]);
    expect(colorScale.getColor(2)).toEqual(colorbrewerClassYlOrBr[4][1]);
    expect(colorScale.getColor(3)).toEqual(colorbrewerClassYlOrBr[4][2]);
    expect(colorScale.getColor(4)).toEqual(colorbrewerClassYlOrBr[4][3]);
  });
  it('handle 5 integer classes', () => {
    const meta = {min:1, max:5};
    const colorScale = new IntervalColorScale(meta);
    expect(colorScale.numberIntervals).toEqual(5);
    expect(colorScale.intervalLabels).toEqual(['1', '2', '3', '4', '5',]);
    expect(colorScale.getColor(1)).toEqual(colorbrewerClassYlOrBr[5][0]);
    expect(colorScale.getColor(2)).toEqual(colorbrewerClassYlOrBr[5][1]);
    expect(colorScale.getColor(3)).toEqual(colorbrewerClassYlOrBr[5][2]);
    expect(colorScale.getColor(4)).toEqual(colorbrewerClassYlOrBr[5][3]);
    expect(colorScale.getColor(5)).toEqual(colorbrewerClassYlOrBr[5][4]);
  });
  it('handle 6 integer classes', () => {
    const meta = {min:1, max:6};
    const colorScale = new IntervalColorScale(meta);
    expect(colorScale.numberIntervals).toEqual(6);
    expect(colorScale.intervalLabels).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(colorScale.getColor(1)).toEqual(colorbrewerClassYlOrBr[6][0]);
    expect(colorScale.getColor(2)).toEqual(colorbrewerClassYlOrBr[6][1]);
    expect(colorScale.getColor(3)).toEqual(colorbrewerClassYlOrBr[6][2]);
    expect(colorScale.getColor(4)).toEqual(colorbrewerClassYlOrBr[6][3]);
    expect(colorScale.getColor(5)).toEqual(colorbrewerClassYlOrBr[6][4]);
    expect(colorScale.getColor(6)).toEqual(colorbrewerClassYlOrBr[6][5]);
  });
  it('handle normal 6 class range', () => {
    const meta = {min:0, max:60};
    const colorScale = new IntervalColorScale(meta);
    expect(colorScale.numberIntervals).toEqual(6);
    expect(colorScale.intervalLabels).toEqual(['0 - 10', '10 - 20', '20 - 30', '30 - 40', '40 - 50', '50 - 60']);
    expect(colorScale.getColor(0.0)).toEqual(colorbrewerClassYlOrBr[6][0]);
    expect(colorScale.getColor(9.9)).toEqual(colorbrewerClassYlOrBr[6][0]);

    expect(colorScale.getColor(10)).toEqual(colorbrewerClassYlOrBr[6][1]);
    expect(colorScale.getColor(19.9)).toEqual(colorbrewerClassYlOrBr[6][1]);

    expect(colorScale.getColor(20)).toEqual(colorbrewerClassYlOrBr[6][2]);
    expect(colorScale.getColor(30)).toEqual(colorbrewerClassYlOrBr[6][3]);
    expect(colorScale.getColor(40)).toEqual(colorbrewerClassYlOrBr[6][4]);

    expect(colorScale.getColor(50)).toEqual(colorbrewerClassYlOrBr[6][5]);
    expect(colorScale.getColor(60)).toEqual(colorbrewerClassYlOrBr[6][5]);

  });
});
