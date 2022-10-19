import { colorbrewerClassYlOrBr } from '../data/colors';

/** Interval color scale

 Translate values to color and provide information about range of colors (and there intervals) based
 upon information about a variable (min, max, type, special formatting properties etc).

 */
class IntervalColorScale {
  constructor(meta) {
    this._meta = meta;
    let singleValueClasses = false;

    if (
      meta.min === meta.max ||
      (Number.isInteger(meta.min) && Number.isInteger(meta.max))
    ) {
      const numberPossibleClasses = meta.max - meta.min + 1;
      if (numberPossibleClasses <= 6) {
        singleValueClasses = true;
      }
      this.numberIntervals = Math.min(numberPossibleClasses, 6);
    } else {
      this.numberIntervals = 6;
    }
    this.colors = colorbrewerClassYlOrBr[this.numberIntervals];

    const intervalValues = [];
    if (singleValueClasses) {
      for (let i = 0; i < this.numberIntervals; i += 1) {
        intervalValues.push(this._meta.min + i);
      }
      intervalValues.push(this._meta.max);
    } else {
      intervalValues.push(this._meta.min);
      for (let i = 1; i < this.numberIntervals; i += 1) {
        intervalValues.push(
          this._meta.min +
            (i * (this._meta.max - this._meta.min)) / this.numberIntervals
        );
      }
      intervalValues.push(this._meta.max);
    }

    this.intervalLabels = [];
    const scaleRoundingValue = 0;
    for (let i = 0; i < this.numberIntervals; i += 1) {
      const startValue = intervalValues[i].toFixed(scaleRoundingValue);
      const nextValue = intervalValues[i + 1].toFixed(scaleRoundingValue);
      const label = singleValueClasses
        ? `${startValue}`
        : `${startValue} - ${nextValue}`;
      this.intervalLabels.push(label);
    }
  }

  getColor(value) {
    const binValue =
      this.numberIntervals === 1
        ? 0
        : Math.min(
            Math.floor(
              this.numberIntervals *
                ((value - this._meta.min) / (this._meta.max - this._meta.min))
            ),
            this.numberIntervals - 1
          );
    return this.colors[binValue];
  }
}

/** Category color scale

 Translate categorys to color.

 categories contain both a key and label
 `nullCategory` is what is shown if null value is provided

 */
class CategoryColorScale {
  constructor(categories, nullCategory) {
    this._nullCategory = nullCategory;
    this._categories = categories;
    this.numberIntervals = categories.length;

    // todo rename to just labels
    this.intervalLabels = categories.map(c => c.label);

    if( nullCategory ) {
      this.numberIntervals += 1;
      // add null
      this.intervalLabels.unshift(nullCategory);
    }

    if(this.numberIntervals > 6 || this.numberIntervals < 1) {
      throw new Error("Unsupported number of categories")
    }

    this.colors = colorbrewerClassYlOrBr[this.numberIntervals];
  }

  getColor(value) {
    if (!value) {
      if (this._nullCategory) {
        return this.colors[0]
      } else {
        return null;
      }
    } else {
      const categoryIndex = this._categories.findIndex((c) => c.key === value);
      if (categoryIndex === -1) {
        throw new Error("Unsupported category")
      }
      const colorIndex = this._nullCategory ? categoryIndex + 1 : categoryIndex;
      return this.colors[colorIndex];
    }
  }
}


export {
  IntervalColorScale,
  CategoryColorScale
};
