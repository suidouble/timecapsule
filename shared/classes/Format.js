// Thanks to Suiet! https://github.com/suiet/suiet/blob/63b50e4ba225b294af1018f3f98b9666738837c7/packages/expo/src/utils/format.ts

const MILLION = 1000000;
const BILLION = 1000000000;
const TRILLION = 1000000000000;


/**
 * Format currency, less than 1M -> show original, [1M, 1B)  -> x.xxxM, [1B, Infinity)  -> x.xxxB
 * @param {number | string | bigint} amount amount
 * @param {Object} options options
 * @param {number} options.decimals decimals from coin metadata
 * @param {boolean} options.withAbbr attach abbr
 * @returns {string} formated value
 */
export function formatCurrency(
    amount,
    options
  ) {
    const { decimals = 0, withAbbr = true } = options ?? {};
    // handle bigint that exceeds safe integer range
    if (typeof amount === 'bigint' && !isSafeToConvertToNumber(amount)) {
        return formatCurrencyBigInt(BigInt(amount), {
                decimals,
                withAbbr,
            });
    }

    // else, convert to number for formatting logic
    if (Number(amount) === 0) return '0';
    if (Number(amount) < 0) {
        return '-' + formatCurrency(-Number(amount), options);
    }

    const _amount = Number(amount) / 10 ** decimals;
    if (_amount > 0 && _amount < 1) {
        return formatSmallCurrency(_amount);
    }
    return format(_amount, withAbbr);
}

function format(amount, showAbbr) {
    if (showAbbr) {
        if (amount >= MILLION && amount < BILLION) return formatWithAbbr(amount, MILLION, 'M');
        if (amount >= BILLION && amount < TRILLION) return formatWithAbbr(amount, BILLION, 'B');
        if (amount >= TRILLION) return formatWithAbbr(amount, TRILLION, 'T');
    }
  
    return Intl.NumberFormat('en-US').format(amount);
}

function isSafeToConvertToNumber(bigintValue) {
    const minValue = Number.MIN_SAFE_INTEGER; // -9007199254740991
    const maxValue = Number.MAX_SAFE_INTEGER; // 9007199254740991
  
    return bigintValue >= BigInt(minValue) && bigintValue <= BigInt(maxValue);
}

// when currency is lower than 1SUI
function formatSmallCurrency(amount) {
    if (amount <= 0) return '0';
  
    const fixNum = Math.ceil(-Math.log10(amount));
  
    let minimalDigits = 0;
    for (; Number(amount) % Math.pow(10, minimalDigits) === 0; ) {
        minimalDigits = minimalDigits + 1;
    }
  
    // if both last 2 digits are 0
    if (
      Number(amount) % Math.pow(10, 10 - (fixNum + 2)) === 0 &&
      Number(amount) % Math.pow(10, 10 - (fixNum + 1)) === 0
    ) {
        return toFixed(amount, fixNum);
    }
  
    // if only last 1 digit is 0
    if (
      Number(amount) % Math.pow(10, 10 - (fixNum + 2)) === 0 &&
      Number(amount) % Math.pow(10, 10 - (fixNum + 1)) !== 0
    ) {
        return toFixed(amount, fixNum + 1);
    }
  
    return toFixed(amount, fixNum + 2);
}


function formatWithAbbr(amount, measureUnit, abbrSymbol) {
    let _amount = '';
    if (typeof amount === 'bigint') {
        _amount = String(amount / (BigInt(measureUnit) / 1000n));
    } else {
        _amount = String(Math.floor(amount / (measureUnit / 1000)));
    }

    const showAmount = _amount.padEnd(4, '0');
    const result = Intl.NumberFormat('en-US').format(Number(showAmount));
    
    return result.replace(',', '.') + abbrSymbol;
}

function toFixed(num, fixed) {
    function getFullNum(num) {
        // if not num
        if (isNaN(num)) {
            return num.toString();
        }

        // parse string no need to transform
        const str = '' + num;
        if (!/e/i.test(str)) {
            return num.toString();
        }

        return num.toFixed(18).replace(/\.?0+$/, '');
    }
  
    fixed = fixed || 0;
    fixed = Math.pow(10, fixed);
    return getFullNum(Math.floor(num * fixed) / fixed);
}

// handle bigint that exceeds number type

function formatCurrencyBigInt(
    amount,
    options
  ) {
    if (amount === 0n) return '0';
    if (amount < 0n) return '-' + formatCurrencyBigInt(-amount, options);
  
    const { decimals = 9, withAbbr = true } = options ?? {};
    const _amount = amount / 10n ** BigInt(decimals);
    return format(_amount, withAbbr);
}