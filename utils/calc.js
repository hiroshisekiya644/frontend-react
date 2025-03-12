import BigNumber from 'bignumber.js'

export const add = (a, b) => new BigNumber(a).plus(new BigNumber(b)).toString()

export const subtract = (a, b) => new BigNumber(a).minus(new BigNumber(b)).toString()

export const multiply = (a, b) => new BigNumber(a).times(new BigNumber(b)).toString()

export const divide = (a, b) => {
  if (new BigNumber(b).isZero()) {
    return 'Cannot divide by zero'
  }
  return new BigNumber(a).div(new BigNumber(b)).toString()
}
