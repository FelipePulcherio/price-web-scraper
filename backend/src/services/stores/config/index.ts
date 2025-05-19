const storesConfig = Object.freeze({
  filters: {
    ignoreKeywords: [
      'Bell',
      'Telus',
      'Fido',
      'Rogers',
      'Virgin',
      'Koodo',
      'Freedom',
      'Monthly',
      'Open',
      'Openbox',
      'Display',
      'Bundle',
    ] as string[],
  },

  priority: {
    storeName: [
      'BEST BUY CA',
      'LONDON DRUGS CA',
      'CANADA COMPUTERS CA',
      'VISIONS ELECTRONICS CA',
      'COSTCO CA',
    ] as string[],

    modelBrand: [
      'COSTCO CA',
      'CANADA COMPUTERS CA',
      'LONDON DRUGS CA',
      'VISIONS ELECTRONICS CA',
    ] as string[],
  },
});

export default storesConfig;
