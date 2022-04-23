import Mocha from 'mocha';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import cli from 'cli-ux';
import url from 'url';
import { libs } from '@decentralchain/waves-transactions';
import configService from '../config';
import { injectTestEnvironment } from './testEnv';
import { getFileContent } from '../../utils';

export interface IRunTestOptions {
    envName?: string,
    verbose: boolean,
    variables: Record<string, string>
}

export class TestRunner {
    private mocha: Mocha;

    private static instance: TestRunner;

    constructor(mochaOptions: Mocha.MochaOptions) {
        this.mocha = new Mocha(mochaOptions);
    }

    public static getInstance(): TestRunner { // singleton
        if (!TestRunner.instance) {

            const mochaOptions = configService.config.get('mocha') as Mocha.MochaOptions;

            TestRunner.instance = new TestRunner(mochaOptions);
        }

        return TestRunner.instance;
    }

    getLibrariesSync = () => {
        const libsPath = path.join(process.cwd());
        if (fs.existsSync(libsPath)) {
            return fs.readdirSync(libsPath, 'utf8')
                .filter(name => name !== '.DS_Store')
                .map((name) => {
                    return ({name, content: fs.readFileSync(path.join(libsPath, name), 'utf8')});
                });
        }
        return [];
    };


    public addFile(path: string) {
        this.mocha.addFile(path);
    }

    public async run({envName, verbose, variables}: IRunTestOptions) {
        const config = configService.config;


        if (envName == null) {
            envName = config.get('defaultEnv');
        }

        let env = config.get('envs:' + envName);
        if (env == null) cli.error(`Failed to get environment "${envName}"\n Check your if your config contains it`);
        await this.checkNode(url.parse(env.API_BASE).href);

        const envAddress = libs.crypto.address(env.SEED, env.CHAIN_ID);

        cli.log(`Starting test with "${envName}" environment\nRoot address: ${envAddress}`);
        env = {
            file: getFileContent,
            ...env,
            ...variables
        };
        if (variables) {

        }

        injectTestEnvironment(global, {verbose, env});

        let failed = true;
        try {
            const result = this.mocha.run();

            // wait for test to finish running
            await new Promise(resolve => {
                if (result.stats && result.stats.end !== undefined) resolve();
                result.once('end', resolve);
            });
            if (result.stats && result.stats.failures === 0) {
                failed = false;
            }
        } catch (e) {
            console.error(e);
        } finally {

            if (failed) process.exit(2);
        }
    }

    async checkNode(nodeUrl?: string) {
        try {
            await axios.get('node/version', {baseURL: nodeUrl});
        } catch (e) {
            cli.error(`Failed to access node on "${nodeUrl}"\n` +
                'Make sure env.API_BASE is correct\n' +
                'In case of using local node, make sure it is up and running!');
        }
    }
}

export default TestRunner;
