import React from 'react';
import { render } from '@testing-library/react';
import { FigureCaption } from './FigureCaption';

describe('FigureCaption component', () => {
  it('should render label text and children text', () => {
    const { getByText } = render(
      <FigureCaption label={'Figure 1.'}>{'test text'}</FigureCaption>
    );
    expect(getByText('Figure 1.')).toBeDefined();
    expect(getByText('test text')).toBeDefined();
  });
});
