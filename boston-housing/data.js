/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

const Papa = require('papaparse');


// Boston Housing data constants:
const BASE_URL =
    'https://storage.googleapis.com/tfjs-examples/multivariate-linear-regression/data/';

const TRAIN_FEATURES_FN = 'train-data.csv';
const TRAIN_TARGET_FN = 'train-target.csv';
const TEST_FEATURES_FN = 'test-data.csv';
const TEST_TARGET_FN = 'test-target.csv';

/**
 *
 * @param {Array<Object>} data Downloaded data.
 *
 * @returns {Promise.Array<number[]>} Resolves to data with values parsed as floats.
 */
const parseCsv = async (data) => {
  return new Promise(resolve => {
    data = data.map((row) => {
      return Object.keys(row).sort().map(key => parseFloat(row[key]));
    });
    resolve(data);
  });
};

/**
 * Downloads and returns the csv.
 *
 * @param {string} filename Name of file to be loaded.
 *
 * @returns {Promise.Array<number[]>} Resolves to parsed csv data.
 */
export const loadCsv = async (filename) => {
  return new Promise(resolve => {
    const url = `${BASE_URL}${filename}`;

    console.log(`  * Downloading data from: ${url}`);
    Papa.parse(url, {
      download: true,
      header: true,
      complete: (results) => {
        resolve(parseCsv(results['data']));
      }
    })
  });
};



/** Helper class to handle loading training and test data. */
export class BostonHousingDataset {
  constructor() {
    // Arrays to hold the data.
    this.trainFeatures = null;
    this.trainTarget = null;
    this.testFeatures = null;
    this.testTarget = null;
    // Metadata
    this.trainSize = 0;
    this.testSize = 0;
  }

  get numFeatures() {
    return this.trainFeatures[0].length;
  }

  /** Loads training and test data. */
  async loadData() {
    [this.trainFeatures, this.trainTarget, this.testFeatures, this.testTarget] =
        await Promise.all([
          loadCsv(TRAIN_FEATURES_FN), loadCsv(TRAIN_TARGET_FN),
          loadCsv(TEST_FEATURES_FN), loadCsv(TEST_TARGET_FN)
        ]);

    this.trainSize = this.trainFeatures.length;
    this.testSize = this.testFeatures.length;

    shuffle(this.trainFeatures, this.trainTarget);
    shuffle(this.testFeatures, this.testTarget);
  }
}

/**
 * Shuffles data and target (maintaining alignment) using Fisher-Yates
 * algorithm.flab
 */
function shuffle(data, target) {
  let counter = data.length;
  let temp = 0;
  let index = 0;
  while (counter > 0) {
    index = (Math.random() * counter) | 0;
    counter--;
    // data:
    temp = data[counter];
    data[counter] = data[index];
    data[index] = temp;
    // target:
    temp = target[counter];
    target[counter] = target[index];
    target[index] = temp;
  }
};
