#!/usr/bin/env node

const stage = process.env.STAGE || 'default';
process.env.NODE_CONFIG_ENV = stage;

import * as cdk from 'aws-cdk-lib';
import type { Config } from 'config';

const config: Config = require('config');

import { StackOne, StackTwo } from '../lib/miniproject-cdk-stack';

const app = new cdk.App();

console.log('========================================');
console.log(`Stage: ${stage}`);
console.log(`Project: ${config.get<string>('project')}`);
console.log(`Region: ${config.get<string>('region')}`);
console.log(`API Timeout: ${config.get<number>('api.timeout')}`);
console.log('========================================');

const projectName = config.get<string>('project');
const region = config.get<string>('region');
const apiTimeout = config.get<number>('api.timeout');

const stackOne = new StackOne(app, 'StackOne', {
  description: 'Stack one',
  env: { region },
  projectName,
});

const stackTwo = new StackTwo(app, 'StackTwo', {
  description: 'Stack two',
  env: { region },
  projectName,
  apiTimeout,
});